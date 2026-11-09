"""Quiz designs kept with the teacher's account. A design may be unfinished (a draft); it only has to be
complete when a room is opened from it, which POST /api/game-rooms checks."""
import json

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.orm import Session

from auth import require_teacher_user
from database import get_db
from models import QuizDesign, User

router = APIRouter(prefix="/api/game-designs", tags=["Game designs"])

MAX_DESIGNS_PER_TEACHER = 200


class DraftQuestion(BaseModel):
    text: str = Field(default="", max_length=500)
    options: list[str] = Field(default_factory=lambda: ["", "", "", ""], max_length=4)
    correct: int = Field(default=0, ge=0, le=3)
    seconds: int = Field(default=20, ge=5, le=120)
    explanation: str = Field(default="", max_length=600)

    @field_validator("options")
    @classmethod
    def short_options(cls, options: list[str]) -> list[str]:
        if any(len(option) > 200 for option in options):
            raise ValueError("Mỗi phương án dài tối đa 200 kí tự.")
        return options


class DesignBody(BaseModel):
    title: str = Field(default="", max_length=120)
    questions: list[DraftQuestion] = Field(default_factory=list, max_length=50)


def _view(design: QuizDesign) -> dict:
    return {
        "id": design.id,
        "title": design.title,
        "questions": json.loads(design.questions or "[]"),
        "updated_at": design.updated_at.isoformat() if design.updated_at else None,
    }


def _own_design(db: Session, design_id: int, user: User) -> QuizDesign:
    design = db.query(QuizDesign).filter(QuizDesign.id == design_id, QuizDesign.owner_id == user.id).first()
    if design is None:
        # Another teacher's design looks the same as a missing one
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy thiết kế này.")
    return design


@router.get("")
def list_designs(db: Session = Depends(get_db), user: User = Depends(require_teacher_user)):
    designs = (
        db.query(QuizDesign)
        .filter(QuizDesign.owner_id == user.id)
        .order_by(QuizDesign.updated_at.desc(), QuizDesign.id.desc())
        .all()
    )
    return [_view(design) for design in designs]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_design(body: DesignBody, db: Session = Depends(get_db), user: User = Depends(require_teacher_user)):
    if db.query(QuizDesign).filter(QuizDesign.owner_id == user.id).count() >= MAX_DESIGNS_PER_TEACHER:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail=f"Mỗi giáo viên lưu tối đa {MAX_DESIGNS_PER_TEACHER} thiết kế. Hãy xóa bớt thiết kế cũ.")
    design = QuizDesign(owner_id=user.id, title=body.title.strip(),
                        questions=json.dumps([q.model_dump() for q in body.questions], ensure_ascii=False))
    db.add(design)
    db.commit()
    db.refresh(design)
    return _view(design)


@router.put("/{design_id}")
def update_design(design_id: int, body: DesignBody, db: Session = Depends(get_db), user: User = Depends(require_teacher_user)):
    design = _own_design(db, design_id, user)
    design.title = body.title.strip()
    design.questions = json.dumps([q.model_dump() for q in body.questions], ensure_ascii=False)
    db.commit()
    db.refresh(design)
    return _view(design)


@router.delete("/{design_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_design(design_id: int, db: Session = Depends(get_db), user: User = Depends(require_teacher_user)):
    db.delete(_own_design(db, design_id, user))
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
