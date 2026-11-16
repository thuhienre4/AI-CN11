"""Learning journey of a student, class leaderboard, and the teacher's class report with its CSV export."""
import csv
import io
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from auth import (
    ACCOUNT_VERIFIED,
    confirmed_class,
    ensure_student_scope,
    get_authenticated_user,
    is_administrator,
    require_teacher_user,
    teacher_class_names,
)
from database import get_db
from journey import build_journey, local_day
from models import LearningEvent, Lesson, LessonProgress, Question, QuestionOption, QuizResult, User

router = APIRouter(prefix="/api/learning", tags=["Learning journey and class report"])

LEADERBOARD_SIZE = 10
HARD_QUESTION_MIN_ANSWERS = 3
HARD_QUESTION_LIMIT = 10


def _lesson_rows(progress_rows) -> list[dict]:
    return [
        {
            "status": row.status,
            "best_quiz_score": row.best_quiz_score,
            "quiz_attempt_count": row.quiz_attempt_count,
            "simulation_count": row.simulation_count,
        }
        for row in progress_rows
    ]


def _journeys(db: Session, user_ids: list[int]) -> dict[int, dict]:
    """Journey of each user, with two queries for the whole group."""
    if not user_ids:
        return {}
    progress_by_user: dict[int, list] = {user_id: [] for user_id in user_ids}
    for row in db.query(LessonProgress).filter(LessonProgress.user_id.in_(user_ids)).all():
        progress_by_user[row.user_id].append(row)
    events_by_user: dict[int, list] = {user_id: [] for user_id in user_ids}
    event_rows = (
        db.query(LearningEvent.user_id, LearningEvent.event_type, LearningEvent.occurred_at, LearningEvent.created_at,
                 LearningEvent.score)
        .filter(LearningEvent.user_id.in_(user_ids))
        .all()
    )
    for user_id, event_type, occurred_at, created_at, score in event_rows:
        events_by_user[user_id].append((event_type, local_day(occurred_at or created_at), score))
    today = local_day(datetime.utcnow())
    return {
        user_id: build_journey(_lesson_rows(progress_by_user[user_id]), events_by_user[user_id], today)
        for user_id in user_ids
    }


def _class_students(db: Session, class_names: Optional[set[str]]) -> list[User]:
    query = db.query(User).filter(User.role == "student", User.account_status == ACCOUNT_VERIFIED)
    if class_names is not None:
        query = query.filter(User.student_class.in_(class_names))
    return query.order_by(User.student_class, User.full_name, User.username).all()


def _teacher_scope(current_user: User, class_name: Optional[str]) -> Optional[set[str]]:
    """Classes this report may cover: the teacher's own, narrowed to one if asked; None means every class (admin)."""
    wanted = (class_name or "").strip()
    if is_administrator(current_user):
        return {wanted} if wanted else None
    own = teacher_class_names(current_user)
    if wanted:
        if wanted not in own:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Lớp này không thuộc phân công của bạn.")
        return {wanted}
    return own


@router.get("/users/{user_id}/journey")
def get_journey(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    """Experience points, level, badges, today's tasks and streak of one student."""
    ensure_student_scope(db, user_id, current_user, "You can only access your own learning data.")
    if db.query(User.id).filter(User.id == user_id).first() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return _journeys(db, [user_id])[user_id]


@router.get("/leaderboard")
def get_leaderboard(
    class_name: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    """Ranking by experience points inside one class. A student sees only the class a teacher confirmed."""
    if current_user.role == "student":
        own_class = confirmed_class(current_user)
        if not own_class:
            return {"class_name": "", "rows": [], "me": None, "student_count": 0, "needs_class": True}
        scope = {own_class}
    else:
        if not (is_administrator(current_user) or teacher_class_names(current_user)):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only teacher or admin accounts can perform this action.")
        scope = _teacher_scope(current_user, class_name)
        if scope is None or len(scope) != 1:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Hãy chọn một lớp.")

    students = _class_students(db, scope)
    journeys = _journeys(db, [student.id for student in students])
    ranked = sorted(
        students,
        key=lambda student: (-journeys[student.id]["xp"], (student.full_name or student.username).lower()),
    )
    rows = []
    for index, student in enumerate(ranked):
        journey = journeys[student.id]
        # Equal points share a rank
        rank = index + 1 if index == 0 or journey["xp"] != journeys[ranked[index - 1].id]["xp"] else rows[-1]["rank"]
        rows.append(
            {
                "rank": rank,
                "name": student.full_name or student.username,
                "xp": journey["xp"],
                "level": journey["level"],
                "is_me": student.id == current_user.id,
            }
        )
    return {
        "class_name": next(iter(scope)),
        "student_count": len(rows),
        "rows": rows[:LEADERBOARD_SIZE],
        "me": next((row for row in rows if row["is_me"]), None),
        "needs_class": False,
    }


def _hard_questions(db: Session, student_ids: list[int]) -> list[dict]:
    """Questions most often answered wrongly, counting each student's first answer to a question."""
    if not student_ids:
        return []
    first_answers: dict[tuple[int, int], QuizResult] = {}
    results = (
        db.query(QuizResult)
        .filter(QuizResult.user_id.in_(student_ids))
        .order_by(QuizResult.created_at, QuizResult.id)
        .all()
    )
    for result in results:
        first_answers.setdefault((result.user_id, result.question_id), result)
    by_question: dict[int, dict] = {}
    for (_, question_id), result in first_answers.items():
        entry = by_question.setdefault(question_id, {"answers": 0, "wrong": 0, "wrong_choices": {}})
        entry["answers"] += 1
        if not result.is_correct:
            entry["wrong"] += 1
            choice = result.selected_answer or ""
            entry["wrong_choices"][choice] = entry["wrong_choices"].get(choice, 0) + 1
    candidates = {
        question_id: entry
        for question_id, entry in by_question.items()
        if entry["answers"] >= HARD_QUESTION_MIN_ANSWERS and entry["wrong"] > 0
    }
    if not candidates:
        return []
    questions = {item.id: item for item in db.query(Question).filter(Question.id.in_(candidates)).all()}
    lessons = {
        item.id: item.title
        for item in db.query(Lesson).filter(Lesson.id.in_({question.lesson_id for question in questions.values()})).all()
    }
    options = {
        str(item.id): item.text
        for item in db.query(QuestionOption).filter(QuestionOption.question_id.in_(candidates)).all()
    }
    rows = []
    for question_id, entry in candidates.items():
        question = questions.get(question_id)
        if question is None:
            continue
        common = max(entry["wrong_choices"].items(), key=lambda item: item[1])[0] if entry["wrong_choices"] else ""
        rows.append(
            {
                "question_id": question_id,
                "lesson_id": question.lesson_id,
                "lesson_title": lessons.get(question.lesson_id, ""),
                "text": question.text,
                "answers": entry["answers"],
                "wrong": entry["wrong"],
                "wrong_percent": round(100 * entry["wrong"] / entry["answers"]),
                "common_wrong_answer": options.get(common, ""),
            }
        )
    rows.sort(key=lambda row: (-row["wrong_percent"], -row["answers"], row["question_id"]))
    return rows[:HARD_QUESTION_LIMIT]


def build_class_report(db: Session, scope: Optional[set[str]]) -> dict:
    students = _class_students(db, scope)
    student_ids = [student.id for student in students]
    journeys = _journeys(db, student_ids)
    progress_by_student: dict[int, list] = {student_id: [] for student_id in student_ids}
    lesson_stats: dict[int, dict] = {}
    if student_ids:
        started = (
            db.query(LessonProgress)
            .filter(LessonProgress.user_id.in_(student_ids), LessonProgress.progress_percent > 0)
            .all()
        )
        for row in started:
            progress_by_student[row.user_id].append(row)
            stat = lesson_stats.setdefault(row.lesson_id, {"started": 0, "completed": 0, "scores": []})
            stat["started"] += 1
            stat["completed"] += 1 if row.status == "completed" else 0
            if row.quiz_attempt_count > 0:
                stat["scores"].append(row.best_quiz_score)

    student_rows = []
    for student in students:
        rows = progress_by_student[student.id]
        scores = [row.best_quiz_score for row in rows if row.quiz_attempt_count > 0]
        last = max((row.last_accessed_at for row in rows if row.last_accessed_at), default=None)
        student_rows.append(
            {
                "student_id": student.id,
                "name": student.full_name or student.username,
                "class_name": student.student_class or "",
                "lessons_started": len(rows),
                "lessons_completed": sum(1 for row in rows if row.status == "completed"),
                "average_best_quiz": round(sum(scores) / len(scores), 1) if scores else None,
                "quiz_attempts": sum(row.quiz_attempt_count for row in rows),
                "minutes": round(sum(row.time_spent_seconds for row in rows) / 60),
                "last_activity_at": last.isoformat() + "Z" if last else None,
                "xp": journeys[student.id]["xp"],
                "level": journeys[student.id]["level"],
            }
        )

    titles = (
        {item.id: item.title for item in db.query(Lesson).filter(Lesson.id.in_(lesson_stats)).all()} if lesson_stats else {}
    )
    lesson_rows = [
        {
            "lesson_id": lesson_id,
            "title": titles.get(lesson_id, f"Bài {lesson_id}"),
            "started": stat["started"],
            "completed": stat["completed"],
            "completion_percent": round(100 * stat["completed"] / len(students)) if students else 0,
            "average_best_quiz": round(sum(stat["scores"]) / len(stat["scores"]), 1) if stat["scores"] else None,
        }
        for lesson_id, stat in sorted(lesson_stats.items())
    ]
    active = sum(1 for row in student_rows if row["lessons_started"] > 0)
    return {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "classes": sorted({row["class_name"] for row in student_rows if row["class_name"]}),
        "summary": {
            "students": len(students),
            "active_students": active,
            "lessons_completed": sum(row["lessons_completed"] for row in student_rows),
            "average_completed_per_student": round(sum(row["lessons_completed"] for row in student_rows) / len(students), 1)
            if students
            else 0,
        },
        "students": student_rows,
        "lessons": lesson_rows,
        "hard_questions": _hard_questions(db, student_ids),
    }


@router.get("/teacher/report")
def get_class_report(
    class_name: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher_user),
):
    """Per-student results, completion per lesson and the questions most often answered wrongly."""
    report = build_class_report(db, _teacher_scope(current_user, class_name))
    report["available_classes"] = (
        sorted(teacher_class_names(current_user)) if not is_administrator(current_user) else report["classes"]
    )
    return report


def _csv_cell(value) -> str:
    """Text a spreadsheet will not run as a formula."""
    text = "" if value is None else str(value)
    return "'" + text if text[:1] in ("=", "+", "-", "@") else text


@router.get("/teacher/report.csv")
def download_class_report(
    class_name: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher_user),
):
    """The per-student table of the class report as a CSV file that opens in Excel."""
    report = build_class_report(db, _teacher_scope(current_user, class_name))
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(
        ["Họ tên", "Lớp", "Bài đã bắt đầu", "Bài đã hoàn thành", "Điểm kiểm tra nhanh cao nhất (trung bình)",
         "Số lượt kiểm tra", "Thời gian học (phút)", "Hoạt động gần nhất (UTC)", "Điểm kinh nghiệm", "Cấp độ"]
    )
    for row in report["students"]:
        writer.writerow(
            [
                _csv_cell(row["name"]),
                _csv_cell(row["class_name"]),
                row["lessons_started"],
                row["lessons_completed"],
                "" if row["average_best_quiz"] is None else row["average_best_quiz"],
                row["quiz_attempts"],
                row["minutes"],
                (row["last_activity_at"] or "")[:16].replace("T", " "),
                row["xp"],
                row["level"],
            ]
        )
    # The byte-order mark makes Excel read Vietnamese text as UTF-8
    body = "﻿" + buffer.getvalue()
    filename = f"bao-cao-lop-{datetime.utcnow().date().isoformat()}.csv"
    return Response(
        content=body.encode("utf-8"),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"', "Cache-Control": "no-store"},
    )
