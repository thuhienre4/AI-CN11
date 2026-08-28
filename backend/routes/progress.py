from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from auth import can_manage_content, get_authenticated_user, require_teacher_user
from database import get_db
from models import LearningEvent, Lesson, LessonProgress, QuizResult, User
from schemas import (
    LearningDashboardResponse,
    LearningEventCreate,
    LearningEventResponse,
    LearningRecommendation,
    LessonProgressResponse,
    LessonProgressUpdate,
)
from realtime import learning_connections

router = APIRouter(prefix="/api/learning", tags=["Personalized Learning"])


def ensure_learning_data_access(target_user_id: int, current_user: User) -> None:
    if current_user.id == target_user_id or can_manage_content(current_user):
        return
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You can only access your own learning data.",
    )


def get_user_or_404(db: Session, user_id: int) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


def get_lesson_or_404(db: Session, lesson_id: int) -> Lesson:
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found",
        )
    return lesson


def get_or_create_progress(db: Session, user_id: int, lesson_id: int) -> LessonProgress:
    progress = (
        db.query(LessonProgress)
        .filter(
            LessonProgress.user_id == user_id,
            LessonProgress.lesson_id == lesson_id,
        )
        .first()
    )
    if progress:
        return progress

    progress = LessonProgress(
        user_id=user_id,
        lesson_id=lesson_id,
        status="not_started",
        progress_percent=0,
    )
    db.add(progress)
    db.flush()
    return progress


def recompute_status(progress: LessonProgress) -> None:
    if progress.progress_percent >= 100:
        progress.status = "completed"
        progress.completed_at = progress.completed_at or datetime.utcnow()
    elif progress.quiz_attempt_count > 0 and progress.best_quiz_score < 60:
        progress.status = "needs_review"
        progress.completed_at = None
    elif progress.progress_percent > 0:
        progress.status = "in_progress"
        progress.completed_at = None
    else:
        progress.status = "not_started"
        progress.completed_at = None


def apply_activity_to_progress(progress: LessonProgress, event: LearningEventCreate) -> None:
    progress.last_activity_type = event.event_type
    progress.last_accessed_at = datetime.utcnow()
    progress.time_spent_seconds += event.duration_seconds

    if event.event_type == "lesson_viewed":
        progress.view_count += 1
        progress.progress_percent = max(progress.progress_percent, 20)
    elif event.event_type == "simulation_opened":
        progress.simulation_count += 1
        progress.progress_percent = max(progress.progress_percent, 45)
    elif event.event_type == "simulation_completed":
        progress.simulation_count = max(progress.simulation_count, 1)
        progress.progress_percent = max(progress.progress_percent, 70)
    elif event.event_type == "assistant_question":
        progress.assistant_question_count += 1
        progress.progress_percent = max(progress.progress_percent, 60)
    elif event.event_type == "quiz_submitted":
        progress.quiz_attempt_count += 1
        if event.score is not None:
            progress.best_quiz_score = max(progress.best_quiz_score, event.score)
            previous_total = progress.average_quiz_score * (progress.quiz_attempt_count - 1)
            progress.average_quiz_score = round((previous_total + event.score) / progress.quiz_attempt_count, 2)
            progress.progress_percent = max(progress.progress_percent, 100 if event.score >= 70 else 75)
    elif event.event_type == "lesson_completed":
        progress.progress_percent = 100

    recompute_status(progress)


def build_recommendations(progress_rows: List[LessonProgress]) -> List[LearningRecommendation]:
    recommendations = []

    for progress in progress_rows:
      lesson_title = progress.lesson.title if progress.lesson else f"Bài {progress.lesson_id}"

      if progress.status == "needs_review":
          recommendations.append(
              LearningRecommendation(
                  lesson_id=progress.lesson_id,
                  title=lesson_title,
                  reason="Điểm kiểm tra nhanh còn dưới 60%.",
                  priority="high",
                  suggested_action="Ôn lại phần ghi nhớ, mở mô phỏng và làm lại kiểm tra nhanh.",
              )
          )
      elif progress.progress_percent > 0 and progress.progress_percent < 70:
          recommendations.append(
              LearningRecommendation(
                  lesson_id=progress.lesson_id,
                  title=lesson_title,
                  reason="Bài học đã bắt đầu nhưng chưa hoàn thành đủ hoạt động.",
                  priority="medium",
                  suggested_action="Hoàn thành mô phỏng, hỏi trợ lý học tập và làm kiểm tra nhanh.",
              )
          )

    return recommendations[:5]


def clamp_score(value: float) -> int:
    return max(0, min(100, round(value or 0)))


def days_since(date_value: datetime | None) -> int:
    if not date_value:
        return 999
    return max(0, (datetime.utcnow() - date_value).days)


def knowledge_unit_for_lesson(lesson: Lesson | None) -> str:
    if not lesson:
        return "Kiến thức Công nghệ"
    course_id = lesson.course_id
    if course_id <= 3 or 1000 <= course_id < 1100:
        return "Công nghệ 10 - Thiết kế và công nghệ"
    if course_id <= 6 or 1100 <= course_id < 1200:
        return "Công nghệ 11 - Cơ khí và chế tạo"
    return "Công nghệ 12 - Điện, điện tử và điều khiển"


def lesson_analytics(progress: LessonProgress) -> dict:
    has_quiz = progress.quiz_attempt_count > 0
    quiz_score = progress.best_quiz_score if has_quiz else 50
    activity_score = (
        min(progress.view_count, 2) * 10
        + min(progress.simulation_count, 2) * 15
        + min(progress.assistant_question_count, 3) * 8
    )
    mastery_score = clamp_score(progress.progress_percent * 0.45 + quiz_score * 0.4 + min(activity_score, 100) * 0.15)
    engagement_score = clamp_score(activity_score + min(progress.time_spent_seconds / 60, 30))
    risk_reasons = []
    risk_score = 0

    if progress.status == "needs_review" or (has_quiz and progress.best_quiz_score < 60):
        risk_score += 45
        risk_reasons.append("Điểm quiz dưới ngưỡng đạt, cần ôn lại ngay.")
    if 0 < progress.progress_percent < 70:
        risk_score += 25
        risk_reasons.append("Bài học đã bắt đầu nhưng chưa hoàn thành đủ hoạt động.")
    if progress.progress_percent > 0 and progress.simulation_count == 0:
        risk_score += 15
        risk_reasons.append("Chưa mở mô phỏng, thiếu quan sát trực quan.")
    if progress.progress_percent > 0 and days_since(progress.last_accessed_at) >= 7:
        risk_score += 15
        risk_reasons.append("Đã lâu chưa quay lại bài học này.")

    risk_score = clamp_score(risk_score)
    risk_level = "high" if risk_score >= 70 else "medium" if risk_score >= 40 else "low"
    return {
        "mastery_score": mastery_score,
        "engagement_score": engagement_score,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "risk_reasons": risk_reasons,
        "knowledge_unit": knowledge_unit_for_lesson(progress.lesson),
    }


def smart_recommendations(progress_rows: List[LessonProgress]) -> List[LearningRecommendation]:
    rows = []
    for progress in progress_rows:
        analytics = lesson_analytics(progress)
        if progress.status == "needs_review" or analytics["risk_level"] != "low" or (0 < progress.progress_percent < 80):
            rows.append(
                LearningRecommendation(
                    lesson_id=progress.lesson_id,
                    title=progress.lesson.title if progress.lesson else f"Bài {progress.lesson_id}",
                    reason=(analytics["risk_reasons"][0] if analytics["risk_reasons"] else "Bài học cần hoàn thành thêm hoạt động."),
                    priority="high" if analytics["risk_level"] == "high" else "medium",
                    suggested_action=(
                        "Ôn lại ghi nhớ, mở mô phỏng, hỏi AI phần chưa hiểu và làm lại quiz."
                        if analytics["risk_level"] == "high"
                        else "Hoàn thành mô phỏng hoặc quiz để củng cố kiến thức."
                    ),
                    mastery_score=analytics["mastery_score"],
                    risk_score=analytics["risk_score"],
                    knowledge_unit=analytics["knowledge_unit"],
                )
            )
    return sorted(rows, key=lambda item: item.risk_score or 0, reverse=True)[:6]


def smart_learning_path(progress_rows: List[LessonProgress]) -> List[LearningRecommendation]:
    path = smart_recommendations(progress_rows)[:3]
    for item in path:
        item.type = "review"
        item.label = "Ôn lại"
        item.to = f"/lessons/{item.lesson_id}/chat"
    selected = {item.lesson_id for item in path}
    for progress in [item for item in progress_rows if item.status == "not_started" and item.lesson_id not in selected][:2]:
        path.append(
            LearningRecommendation(
                lesson_id=progress.lesson_id,
                title=progress.lesson.title if progress.lesson else f"Bài {progress.lesson_id}",
                reason="Bài phù hợp để tiếp tục lộ trình.",
                priority="low",
                suggested_action="Học bài mới, mở mô phỏng và làm quiz kiểm tra nhanh.",
                mastery_score=0,
                risk_score=0,
                knowledge_unit=knowledge_unit_for_lesson(progress.lesson),
                type="next",
                label="Học tiếp",
                to=f"/lessons/{progress.lesson_id}",
            )
        )
    return path[:5]


def intervention_plan(risk_level: str) -> List[str]:
    if risk_level == "high":
        return [
            "Giao phiếu ôn tập ngắn theo đơn vị kiến thức yếu.",
            "Yêu cầu học sinh mở mô phỏng và trả lời câu hỏi quan sát.",
            "Cho làm lại quiz sau khi AI Tutor giải thích lỗi sai.",
        ]
    if risk_level == "medium":
        return [
            "Nhắc học sinh hoàn thành hoạt động còn thiếu.",
            "Gợi ý một bài luyện tập hoặc mini game đúng chủ đề.",
            "Theo dõi lại điểm quiz trong buổi học tiếp theo.",
        ]
    return [
        "Khuyến khích học sinh học tiếp bài mới.",
        "Giao nhiệm vụ vận dụng hoặc thảo luận nhóm.",
        "Dùng dữ liệu tiến bộ làm minh chứng đánh giá thường xuyên.",
    ]


def persist_learning_event(db: Session, user_id: int, event_data: LearningEventCreate) -> LearningEvent:
    if event_data.client_event_id:
        existing = (
            db.query(LearningEvent)
            .filter(LearningEvent.client_event_id == event_data.client_event_id)
            .first()
        )
        if existing:
            return existing

    if event_data.lesson_id is not None:
        get_lesson_or_404(db, event_data.lesson_id)

    event = LearningEvent(
        user_id=user_id,
        lesson_id=event_data.lesson_id,
        client_event_id=event_data.client_event_id,
        event_type=event_data.event_type,
        duration_seconds=event_data.duration_seconds,
        score=event_data.score,
        payload=event_data.payload,
        occurred_at=event_data.occurred_at or datetime.utcnow(),
    )
    db.add(event)

    if event_data.lesson_id is not None:
        progress = get_or_create_progress(db, user_id, event_data.lesson_id)
        apply_activity_to_progress(progress, event_data)
    return event


@router.post("/users/{user_id}/events", response_model=LearningEventResponse, status_code=status.HTTP_201_CREATED)
async def track_learning_event(
    user_id: int,
    event_data: LearningEventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    """Record one learning activity and update the student's lesson progress."""
    ensure_learning_data_access(user_id, current_user)
    get_user_or_404(db, user_id)

    event = persist_learning_event(db, user_id, event_data)

    db.commit()
    db.refresh(event)
    await learning_connections.publish_learning_update(
        user_id,
        {"event_type": event.event_type, "lesson_id": event.lesson_id},
    )
    return event


@router.post("/users/{user_id}/events/batch", response_model=List[LearningEventResponse])
async def track_learning_events_batch(
    user_id: int,
    events: List[LearningEventCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    """Persist an offline event queue idempotently after connectivity returns."""
    ensure_learning_data_access(user_id, current_user)
    get_user_or_404(db, user_id)
    if len(events) > 100:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="A batch can contain at most 100 learning events.",
        )

    rows = [persist_learning_event(db, user_id, event_data) for event_data in events]
    db.commit()
    for row in rows:
        db.refresh(row)
    await learning_connections.publish_learning_update(
        user_id,
        {"event_type": "batch_synced", "event_count": len(rows)},
    )
    return rows


@router.put("/users/{user_id}/lessons/{lesson_id}/progress", response_model=LessonProgressResponse)
async def update_lesson_progress(
    user_id: int,
    lesson_id: int,
    progress_data: LessonProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    """Manually update progress for a lesson."""
    ensure_learning_data_access(user_id, current_user)
    get_user_or_404(db, user_id)
    get_lesson_or_404(db, lesson_id)

    progress = get_or_create_progress(db, user_id, lesson_id)
    progress.last_accessed_at = datetime.utcnow()
    progress.time_spent_seconds += progress_data.time_spent_seconds

    if progress_data.status is not None:
        progress.status = progress_data.status
    if progress_data.progress_percent is not None:
        progress.progress_percent = progress_data.progress_percent
    if progress_data.activity_type is not None:
        progress.last_activity_type = progress_data.activity_type
    if progress_data.quiz_score is not None:
        progress.quiz_attempt_count += 1
        progress.best_quiz_score = max(progress.best_quiz_score, progress_data.quiz_score)
        previous_total = progress.average_quiz_score * (progress.quiz_attempt_count - 1)
        progress.average_quiz_score = round((previous_total + progress_data.quiz_score) / progress.quiz_attempt_count, 2)

    recompute_status(progress)
    db.commit()
    db.refresh(progress)
    return progress


@router.get("/users/{user_id}/lessons/{lesson_id}/progress", response_model=LessonProgressResponse)
async def get_lesson_progress(
    user_id: int,
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    """Get progress for one student and one lesson."""
    ensure_learning_data_access(user_id, current_user)
    get_user_or_404(db, user_id)
    get_lesson_or_404(db, lesson_id)

    progress = get_or_create_progress(db, user_id, lesson_id)
    db.commit()
    db.refresh(progress)
    return progress


@router.get("/users/{user_id}/dashboard", response_model=LearningDashboardResponse)
async def get_learning_dashboard(
    user_id: int,
    course_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    """Return personalized progress, activity and review suggestions for a student."""
    ensure_learning_data_access(user_id, current_user)
    get_user_or_404(db, user_id)

    lesson_query = db.query(Lesson)
    if course_id is not None:
        lesson_query = lesson_query.filter(Lesson.course_id == course_id)
    lessons = lesson_query.order_by(Lesson.course_id, Lesson.order).all()
    lesson_ids = [lesson.id for lesson in lessons]

    progress_rows = []
    for lesson in lessons:
        progress_rows.append(get_or_create_progress(db, user_id, lesson.id))

    db.commit()
    for progress in progress_rows:
        db.refresh(progress)

    completed_lessons = sum(1 for item in progress_rows if item.status == "completed")
    in_progress_lessons = sum(1 for item in progress_rows if item.status in ("in_progress", "needs_review"))
    average_progress = (
        round(sum(item.progress_percent for item in progress_rows) / len(progress_rows), 2)
        if progress_rows
        else 0
    )
    quiz_scores = [item.best_quiz_score for item in progress_rows if item.quiz_attempt_count > 0]
    average_quiz_score = round(sum(quiz_scores) / len(quiz_scores), 2) if quiz_scores else 0
    total_time_spent_seconds = sum(item.time_spent_seconds for item in progress_rows)
    assistant_questions = sum(item.assistant_question_count for item in progress_rows)
    active_progress_rows = [item for item in progress_rows if item.progress_percent > 0]
    analytics_rows = [lesson_analytics(item) for item in active_progress_rows]
    mastery_score = (
        round(sum(item["mastery_score"] for item in analytics_rows) / len(analytics_rows), 2)
        if analytics_rows
        else 0
    )
    engagement_score = (
        round(sum(item["engagement_score"] for item in analytics_rows) / len(analytics_rows), 2)
        if analytics_rows
        else 0
    )
    risk_score = max((item["risk_score"] for item in analytics_rows), default=0)
    risk_level = "high" if risk_score >= 70 else "medium" if risk_score >= 40 else "low"
    recommendations = smart_recommendations(progress_rows)

    event_query = db.query(LearningEvent).filter(LearningEvent.user_id == user_id)
    if lesson_ids:
        event_query = event_query.filter(LearningEvent.lesson_id.in_(lesson_ids))
    recent_events = event_query.order_by(LearningEvent.created_at.desc()).limit(10).all()

    return LearningDashboardResponse(
        user_id=user_id,
        total_lessons=len(lessons),
        completed_lessons=completed_lessons,
        in_progress_lessons=in_progress_lessons,
        average_progress=average_progress,
        average_quiz_score=average_quiz_score,
        total_time_spent_seconds=total_time_spent_seconds,
        assistant_questions=assistant_questions,
        recent_events=recent_events,
        lesson_progress=progress_rows,
        recommendations=recommendations,
        mastery_score=mastery_score,
        engagement_score=engagement_score,
        risk_score=risk_score,
        risk_level=risk_level,
        weak_alerts=[item for item in recommendations if item.priority == "high"],
        learning_path=smart_learning_path(progress_rows),
        intervention_plan=intervention_plan(risk_level),
    )


@router.get("/teacher/analytics")
async def get_teacher_learning_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher_user),
):
    """Return class-level analytics for teacher dashboards and early intervention."""
    student_query = db.query(User).filter(User.role == "student")
    if current_user.role == "teacher" and current_user.student_class:
        student_query = student_query.filter(User.student_class == current_user.student_class)
    students = student_query.all()
    lessons = db.query(Lesson).order_by(Lesson.course_id, Lesson.order).all()
    student_rows = []
    class_rows = {}
    weak_units = {}

    for student in students:
        progress_rows = [get_or_create_progress(db, student.id, lesson.id) for lesson in lessons]
        active_progress_rows = [item for item in progress_rows if item.progress_percent > 0]
        analytics_rows = [lesson_analytics(item) for item in active_progress_rows]
        mastery_score = (
            round(sum(item["mastery_score"] for item in analytics_rows) / len(analytics_rows), 2)
            if analytics_rows
            else 0
        )
        risk_score = max((item["risk_score"] for item in analytics_rows), default=0)
        risk_level = "high" if risk_score >= 70 else "medium" if risk_score >= 40 else "low"
        active_lessons = sum(1 for item in progress_rows if item.progress_percent > 0)
        student_row = {
            "student_id": student.id,
            "name": student.full_name or student.username,
            "class_name": student.student_class or "Unassigned",
            "mastery_score": mastery_score,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "active_lessons": active_lessons,
            "recommendations": smart_recommendations(progress_rows)[:3],
        }
        student_rows.append(student_row)

        class_name = student_row["class_name"]
        class_rows.setdefault(
            class_name,
            {
                "class_name": class_name,
                "student_count": 0,
                "active_students": 0,
                "average_mastery": 0,
                "high_risk_count": 0,
            },
        )
        class_rows[class_name]["student_count"] += 1
        class_rows[class_name]["active_students"] += 1 if active_lessons else 0
        class_rows[class_name]["average_mastery"] += mastery_score
        class_rows[class_name]["high_risk_count"] += 1 if risk_level == "high" else 0

        for progress in progress_rows:
            analytics = lesson_analytics(progress)
            if analytics["risk_level"] == "high":
                unit = analytics["knowledge_unit"]
                weak_units.setdefault(unit, {"unit": unit, "count": 0, "lesson_titles": []})
                weak_units[unit]["count"] += 1
                weak_units[unit]["lesson_titles"].append(progress.lesson.title if progress.lesson else f"Bài {progress.lesson_id}")

    db.commit()

    for row in class_rows.values():
        row["average_mastery"] = (
            round(row["average_mastery"] / row["student_count"], 2)
            if row["student_count"]
            else 0
        )

    return {
        "summary": {
            "total_students": len(students),
            "active_students": sum(1 for item in student_rows if item["active_lessons"] > 0),
            "high_risk_students": sum(1 for item in student_rows if item["risk_level"] == "high"),
            "medium_risk_students": sum(1 for item in student_rows if item["risk_level"] == "medium"),
        },
        "classes": list(class_rows.values()),
        "at_risk_students": sorted(student_rows, key=lambda item: item["risk_score"], reverse=True)[:10],
        "weak_units": sorted(weak_units.values(), key=lambda item: item["count"], reverse=True)[:5],
    }


@router.get("/users/{user_id}/events", response_model=List[LearningEventResponse])
async def get_learning_events(
    user_id: int,
    lesson_id: Optional[int] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    """List recent learning events for a student."""
    ensure_learning_data_access(user_id, current_user)
    get_user_or_404(db, user_id)

    query = db.query(LearningEvent).filter(LearningEvent.user_id == user_id)
    if lesson_id is not None:
        query = query.filter(LearningEvent.lesson_id == lesson_id)

    return query.order_by(LearningEvent.created_at.desc()).limit(limit).all()
