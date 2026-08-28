from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import Question, Lesson, QuestionOption
from schemas import QuestionResponse, QuestionCreate, QuizQuestionResponse
from auth import get_authenticated_user, require_teacher_user

router = APIRouter(prefix="/api", tags=["Questions"])


@router.post("/questions", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
async def create_question(
    question_data: QuestionCreate,
    db: Session = Depends(get_db),
    _current_user=Depends(require_teacher_user),
):
    """Create a new question."""
    # Verify lesson exists
    lesson = db.query(Lesson).filter(Lesson.id == question_data.lesson_id).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found",
        )

    new_question = Question(
        lesson_id=question_data.lesson_id,
        text=question_data.text,
        question_type=question_data.question_type,
        difficulty=question_data.difficulty,
        points=question_data.points,
    )
    db.add(new_question)
    db.commit()

    # Add options if provided
    if question_data.options:
        for idx, option in enumerate(question_data.options):
            new_option = QuestionOption(
                question_id=new_question.id,
                text=option.text,
                is_correct=option.is_correct,
                order=idx,
            )
            db.add(new_option)
        db.commit()

    db.refresh(new_question)
    return new_question


@router.get("/lessons/{lesson_id}/questions", response_model=List[QuizQuestionResponse])
async def list_questions(
    lesson_id: int,
    db: Session = Depends(get_db),
    _current_user=Depends(get_authenticated_user),
):
    """List all questions for a lesson."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found",
        )

    questions = db.query(Question).filter(Question.lesson_id == lesson_id).all()
    return questions


@router.get("/questions/{question_id}", response_model=QuestionResponse)
async def get_question(
    question_id: int,
    db: Session = Depends(get_db),
    _current_user=Depends(require_teacher_user),
):
    """Get a question by ID."""
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found",
        )
    return question


@router.put("/questions/{question_id}", response_model=QuestionResponse)
async def update_question(
    question_id: int,
    question_data: QuestionCreate,
    db: Session = Depends(get_db),
    _current_user=Depends(require_teacher_user),
):
    """Update a question."""
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found",
        )

    question.text = question_data.text
    question.question_type = question_data.question_type
    question.difficulty = question_data.difficulty
    question.points = question_data.points

    # Update options
    if question_data.options is not None:
        # Delete old options
        db.query(QuestionOption).filter(QuestionOption.question_id == question_id).delete()

        # Add new options
        for idx, option in enumerate(question_data.options):
            new_option = QuestionOption(
                question_id=question_id,
                text=option.text,
                is_correct=option.is_correct,
                order=idx,
            )
            db.add(new_option)

    db.commit()
    db.refresh(question)
    return question


@router.delete("/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    _current_user=Depends(require_teacher_user),
):
    """Delete a question."""
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found",
        )
    db.delete(question)
    db.commit()
