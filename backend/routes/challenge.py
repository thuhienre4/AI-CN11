"""Daily challenge: five questions a day, chosen for each student and graded by the server.

The questions favour what the student needs: first those they answered wrongly and never got right since,
then lessons whose quick test is below 80, then other lessons they have started, then lessons of their grade.
Each question says why it was chosen. The choice is fixed for the day, and one submission is accepted per
day: the result is stored as a learning event the browser cannot create (see ``SERVER_ONLY_EVENTS``).
"""
import random
import re
from datetime import datetime
from typing import Dict

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from auth import get_authenticated_user
from database import get_db
from journey import CHALLENGE_EVENT, local_day
from models import LearningEvent, Lesson, LessonProgress, Question, QuizResult, User

router = APIRouter(prefix="/api/learning/challenge", tags=["Daily challenge"])

CHALLENGE_SIZE = 5
REASONS = {
    "missed": "Em từng trả lời sai câu này",
    "weak": "Bài em cần ôn thêm",
    "started": "Bài em đang học",
    "grade": "Bài trong chương trình khối của em",
}


class ChallengeAnswers(BaseModel):
    answers: Dict[int, int]  # question id -> chosen option id


def _event_id(day: str) -> str:
    return f"challenge-{day}"


def _grade_of(user: User) -> int | None:
    match = re.match(r"\s*(10|11|12)", user.student_class or "")
    return int(match.group(1)) if match else None


def _questions_for(db: Session, user: User, day: str) -> list[tuple[Question, str]]:
    """The day's questions with the reason each was chosen; the same list every time on that day."""
    questions = db.query(Question).options(joinedload(Question.options)).all()
    usable = {question.id: question for question in questions if len(question.options) >= 2}
    progress = {row.lesson_id: row for row in db.query(LessonProgress).filter(LessonProgress.user_id == user.id).all()}

    answered: dict[int, bool] = {}
    for question_id, is_correct in (
        db.query(QuizResult.question_id, QuizResult.is_correct).filter(QuizResult.user_id == user.id).all()
    ):
        answered[question_id] = answered.get(question_id, False) or bool(is_correct)

    grade = _grade_of(user)
    groups: dict[str, list[int]] = {reason: [] for reason in REASONS}
    for question_id, question in usable.items():
        row = progress.get(question.lesson_id)
        if answered.get(question_id) is False:
            groups["missed"].append(question_id)
        elif row is not None and row.quiz_attempt_count > 0 and row.best_quiz_score < 80:
            groups["weak"].append(question_id)
        elif row is not None and row.progress_percent > 0:
            groups["started"].append(question_id)
        elif grade is None or str(question.lesson_id).startswith(str(grade)):
            groups["grade"].append(question_id)

    rng = random.Random(f"{user.id}:{day}")
    chosen: list[tuple[Question, str]] = []
    for reason in REASONS:
        pool = sorted(groups[reason])
        rng.shuffle(pool)
        for question_id in pool[: CHALLENGE_SIZE - len(chosen)]:
            chosen.append((usable[question_id], reason))
        if len(chosen) == CHALLENGE_SIZE:
            break
    return chosen


def _public(question: Question, reason: str, lessons: dict[int, str], day: str, user_id: int) -> dict:
    options = sorted(question.options, key=lambda option: option.id)
    random.Random(f"{user_id}:{day}:{question.id}").shuffle(options)
    return {
        "id": question.id,
        "text": question.text,
        "lesson_id": question.lesson_id,
        "lesson_title": lessons.get(question.lesson_id, ""),
        "reason": REASONS[reason],
        "options": [{"id": option.id, "text": option.text} for option in options],
    }


def _stored(db: Session, user_id: int, day: str):
    return (
        db.query(LearningEvent)
        .filter(LearningEvent.user_id == user_id, LearningEvent.client_event_id == _event_id(day))
        .first()
    )


def _result(event: LearningEvent) -> dict:
    payload = event.payload or {}
    return {"score": event.score, "correct": payload.get("correct", 0), "total": payload.get("total", 0), "answers": payload.get("answers", [])}


@router.get("/today")
def get_today(db: Session = Depends(get_db), current_user: User = Depends(get_authenticated_user)):
    """Today's five questions, without their answers; with the result if they were already answered."""
    day = local_day(datetime.utcnow())
    chosen = _questions_for(db, current_user, day)
    lessons = {item.id: item.title for item in db.query(Lesson).filter(Lesson.id.in_({q.lesson_id for q, _ in chosen})).all()}
    stored = _stored(db, current_user.id, day)
    return {
        "day": day,
        "questions": [_public(question, reason, lessons, day, current_user.id) for question, reason in chosen],
        "done": stored is not None,
        "result": _result(stored) if stored else None,
    }


@router.post("/today")
def submit_today(
    body: ChallengeAnswers,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    """Grade today's answers once; a second submission on the same day is refused."""
    day = local_day(datetime.utcnow())
    if _stored(db, current_user.id, day) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Em đã làm thử thách hôm nay. Hẹn em ngày mai!")
    chosen = _questions_for(db, current_user, day)
    if set(body.answers) != {question.id for question, _ in chosen}:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bộ câu hỏi không khớp với thử thách hôm nay (có thể đã sang ngày mới). Hãy tải lại trang.",
        )

    answers = []
    for question, _ in chosen:
        right = next((option.id for option in question.options if option.is_correct), None)
        chosen_option = body.answers[question.id]
        answers.append({"question_id": question.id, "chosen": chosen_option, "correct_option": right,
                        "is_correct": chosen_option == right})
    correct = sum(1 for item in answers if item["is_correct"])
    event = LearningEvent(
        user_id=current_user.id,
        lesson_id=None,
        client_event_id=_event_id(day),
        event_type=CHALLENGE_EVENT,
        score=round(100 * correct / len(chosen), 1) if chosen else 0,
        payload={"correct": correct, "total": len(chosen), "answers": answers},
        occurred_at=datetime.utcnow(),
    )
    try:
        db.add(event)
        db.commit()
    except IntegrityError:  # two submissions raced; the first one stands
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Em đã làm thử thách hôm nay. Hẹn em ngày mai!")
    db.refresh(event)
    return {"day": day, "done": True, "result": _result(event)}
