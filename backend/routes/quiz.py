from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from auth import can_manage_content, get_authenticated_user, require_teacher_user
from database import get_db
from models import LearningEvent, LessonProgress, QuizAttempt, QuizResult, Question, User
from schemas import (
    QuizAttemptCreate,
    QuizAttemptFinalize,
    QuizAttemptResponse,
    QuizResultResponse,
    QuizResultCreate,
)
from realtime import learning_connections

router = APIRouter(prefix="/api", tags=["Quiz"])


def ensure_user_scope(target_user_id: int, current_user: User) -> None:
    if current_user.id == target_user_id or can_manage_content(current_user):
        return
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You can only access your own quiz data.",
    )


def finalize_attempt_progress(
    db: Session,
    attempt: QuizAttempt,
    client_event_id: str | None = None,
) -> QuizAttempt:
    if attempt.status == "submitted":
        return attempt

    attempt.status = "submitted"
    learning_event = LearningEvent(
        user_id=attempt.user_id,
        lesson_id=attempt.lesson_id,
        client_event_id=client_event_id,
        event_type="quiz_submitted",
        duration_seconds=attempt.time_spent_seconds,
        score=attempt.score_percent,
        payload={
            "attempt_id": attempt.id,
            "correct_answers": attempt.correct_answers,
            "total_questions": attempt.total_questions,
        },
    )
    db.add(learning_event)

    progress = (
        db.query(LessonProgress)
        .filter(
            LessonProgress.user_id == attempt.user_id,
            LessonProgress.lesson_id == attempt.lesson_id,
        )
        .first()
    )
    if not progress:
        progress = LessonProgress(user_id=attempt.user_id, lesson_id=attempt.lesson_id)
        db.add(progress)
        db.flush()

    progress.quiz_attempt_count += 1
    progress.time_spent_seconds += attempt.time_spent_seconds
    progress.last_activity_type = "quiz_submitted"
    progress.best_quiz_score = max(progress.best_quiz_score, attempt.score_percent)
    previous_total = progress.average_quiz_score * (progress.quiz_attempt_count - 1)
    progress.average_quiz_score = round(
        (previous_total + attempt.score_percent) / progress.quiz_attempt_count,
        2,
    )
    progress.progress_percent = max(progress.progress_percent, 100 if attempt.score_percent >= 70 else 75)
    progress.status = "completed" if progress.progress_percent >= 100 else "needs_review"
    return attempt


@router.post("/quiz/attempts", response_model=QuizAttemptResponse, status_code=status.HTTP_201_CREATED)
async def start_quiz_attempt(
    user_id: int,
    payload: QuizAttemptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    ensure_user_scope(user_id, current_user)
    if not db.query(User).filter(User.id == user_id).first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if not db.query(Question).filter(Question.lesson_id == payload.lesson_id).first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson quiz not found")

    attempt = QuizAttempt(user_id=user_id, lesson_id=payload.lesson_id, status="in_progress")
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    await learning_connections.publish_learning_update(
        attempt.user_id,
        {"event_type": "quiz_submitted", "lesson_id": attempt.lesson_id, "score": attempt.score_percent},
    )
    return attempt


@router.post("/quiz/attempts/{attempt_id}/finalize", response_model=QuizAttemptResponse)
async def finalize_quiz_attempt(
    attempt_id: int,
    payload: QuizAttemptFinalize,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    attempt = db.query(QuizAttempt).filter(QuizAttempt.id == attempt_id).first()
    if not attempt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz attempt not found")
    ensure_user_scope(attempt.user_id, current_user)
    finalize_attempt_progress(db, attempt, payload.client_event_id)
    db.commit()
    db.refresh(attempt)
    return attempt


@router.post("/quiz/submit", response_model=QuizResultResponse, status_code=status.HTTP_201_CREATED)
async def submit_quiz_answer(
    user_id: int,
    result_data: QuizResultCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    """Submit an answer to a quiz question."""
    ensure_user_scope(user_id, current_user)
    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Verify question exists
    question = db.query(Question).filter(Question.id == result_data.question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found",
        )

    # Check if answer is correct
    is_correct = False
    points_earned = 0.0

    if question.question_type == "multiple_choice":
        # Check if selected answer is correct
        for option in question.options:
            if option.is_correct and str(option.id) == result_data.selected_answer:
                is_correct = True
                points_earned = question.points
                break

    elif question.question_type == "true_false":
        correct_option = next((opt for opt in question.options if opt.is_correct), None)
        if correct_option and str(correct_option.id) == result_data.selected_answer:
            is_correct = True
            points_earned = question.points

    attempt = None
    standalone_attempt = not result_data.attempt_id
    if result_data.attempt_id:
        attempt = (
            db.query(QuizAttempt)
            .filter(
                QuizAttempt.id == result_data.attempt_id,
                QuizAttempt.user_id == user_id,
            )
            .first()
        )
        if not attempt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quiz attempt not found",
            )

    if not attempt:
        attempt = QuizAttempt(
            user_id=user_id,
            lesson_id=question.lesson_id,
            total_questions=0,
            correct_answers=0,
            total_points=0.0,
            points_earned=0.0,
            score_percent=0.0,
            time_spent_seconds=0,
            status="submitted",
        )
        db.add(attempt)
        db.flush()

    # Save quiz result
    quiz_result = QuizResult(
        user_id=user_id,
        attempt_id=attempt.id,
        question_id=result_data.question_id,
        selected_answer=result_data.selected_answer,
        is_correct=is_correct,
        points_earned=points_earned,
        time_spent_seconds=result_data.time_spent_seconds,
    )
    db.add(quiz_result)
    lesson_id = question.lesson_id
    total_points = question.points or 1
    score_percent = round((points_earned / total_points) * 100, 2) if total_points else 0

    attempt.total_questions += 1
    attempt.correct_answers += 1 if is_correct else 0
    attempt.total_points += total_points
    attempt.points_earned += points_earned
    attempt.time_spent_seconds += result_data.time_spent_seconds
    attempt.score_percent = (
        round((attempt.points_earned / attempt.total_points) * 100, 2)
        if attempt.total_points
        else 0
    )

    if standalone_attempt:
        attempt.status = "in_progress"
        finalize_attempt_progress(db, attempt)
    db.commit()
    db.refresh(quiz_result)

    return quiz_result


@router.get("/quiz/attempts/user/{user_id}", response_model=List[QuizAttemptResponse])
async def get_user_attempts(
    user_id: int,
    lesson_id: int | None = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    """Get quiz attempts for a user, grouped by lesson/session."""
    ensure_user_scope(user_id, current_user)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    query = db.query(QuizAttempt).filter(QuizAttempt.user_id == user_id)
    if lesson_id is not None:
        query = query.filter(QuizAttempt.lesson_id == lesson_id)

    return (
        query.order_by(QuizAttempt.submitted_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/quiz/results/user/{user_id}", response_model=List[QuizResultResponse])
async def get_user_results(
    user_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    """Get all quiz results for a user."""
    ensure_user_scope(user_id, current_user)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    results = (
        db.query(QuizResult)
        .filter(QuizResult.user_id == user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return results


@router.get("/quiz/results/question/{question_id}")
async def get_question_stats(
    question_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_teacher_user),
):
    """Get statistics for a question."""
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found",
        )

    total_attempts = db.query(QuizResult).filter(
        QuizResult.question_id == question_id
    ).count()

    correct_attempts = db.query(QuizResult).filter(
        QuizResult.question_id == question_id,
        QuizResult.is_correct == True
    ).count()

    accuracy = (correct_attempts / total_attempts * 100) if total_attempts > 0 else 0

    return {
        "question_id": question_id,
        "total_attempts": total_attempts,
        "correct_attempts": correct_attempts,
        "accuracy_percentage": round(accuracy, 2),
    }


@router.get("/quiz/results/{result_id}", response_model=QuizResultResponse)
async def get_quiz_result(
    result_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    """Get a specific quiz result."""
    result = db.query(QuizResult).filter(QuizResult.id == result_id).first()
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz result not found",
        )
    ensure_user_scope(result.user_id, current_user)
    return result
