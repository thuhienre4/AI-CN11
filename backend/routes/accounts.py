import secrets
import time
from collections import defaultdict, deque
from datetime import datetime, timedelta
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from auth import (
    ACCOUNT_PENDING,
    ACCOUNT_REJECTED,
    ACCOUNT_VERIFIED,
    is_administrator,
    require_admin_user,
    require_teacher_user,
    teacher_class_names,
)
from database import get_db
from models import AccountReview, ClassJoinCode, User

router = APIRouter(prefix="/api/accounts", tags=["Account verification"])

# No 0/O or 1/I/L: students copy the code from a board.
CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"
CODE_LENGTH = 8
MAX_BATCH_SIZE = 100
MAX_FAILED_CODES = 10
FAILED_CODE_WINDOW_SECONDS = 600
INVALID_CODE_MESSAGE = "Mã lớp không đúng hoặc đã hết hạn. Hãy hỏi lại giáo viên."

# Per process: with several workers each one counts separately.
failed_code_attempts: dict[str, deque] = defaultdict(deque)


class AccountSummary(BaseModel):
    id: int
    username: str
    full_name: str | None = None
    email: str
    role: str
    student_class: str = ""
    account_status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ReviewRequest(BaseModel):
    decision: Literal["approve", "reject"]
    note: str = Field(default="", max_length=500)
    classes: str | None = Field(default=None, max_length=50)


class ClassAssignment(BaseModel):
    classes: str = Field(min_length=1, max_length=50)


class BatchReviewRequest(BaseModel):
    user_ids: list[int] = Field(min_length=1, max_length=MAX_BATCH_SIZE)
    decision: Literal["approve", "reject"]
    note: str = Field(default="", max_length=500)


class ResetRequest(BaseModel):
    note: str = Field(min_length=1, max_length=500)


class ClassCodeRequest(BaseModel):
    class_name: str = Field(min_length=1, max_length=50)
    valid_days: int = Field(default=7, ge=1, le=30)
    max_uses: int = Field(default=50, ge=1, le=100)


class ClassCodeResponse(BaseModel):
    id: int
    code: str
    class_name: str
    max_uses: int
    used_count: int
    expires_at: datetime

    class Config:
        from_attributes = True


class ClassCodeList(BaseModel):
    classes: list[str]
    codes: list[ClassCodeResponse]


class ReviewRecord(BaseModel):
    id: int
    user_id: int
    username: str
    reviewer_id: int
    reviewer: str
    decision: str
    note: str
    classes: str
    created_at: datetime


def clean_class_list(classes: str | None) -> str:
    names = [name.strip() for name in (classes or "").split(",")]
    return ",".join(dict.fromkeys(name for name in names if name))


def can_review(reviewer: User, account: User) -> bool:
    """Administrators review everyone; a teacher only reviews students of an assigned class."""
    if is_administrator(reviewer):
        return True
    return account.role == "student" and (account.student_class or "").strip() in teacher_class_names(reviewer)


def can_manage_class(user: User, class_name: str) -> bool:
    return is_administrator(user) or class_name in teacher_class_names(user)


def record_failed_code(client_key: str) -> None:
    failed_code_attempts[client_key].append(time.monotonic())


def ensure_code_attempts_allowed(client_key: str) -> None:
    attempts = failed_code_attempts[client_key]
    while attempts and time.monotonic() - attempts[0] > FAILED_CODE_WINDOW_SECONDS:
        attempts.popleft()
    if len(attempts) >= MAX_FAILED_CODES:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Nhập sai mã lớp quá nhiều lần. Vui lòng thử lại sau ít phút.",
        )


def redeem_class_code(db: Session, raw_code: str, client_key: str) -> ClassJoinCode:
    """Use up one seat of a code; the conditional update keeps concurrent sign-ups within max_uses."""
    ensure_code_attempts_allowed(client_key)
    code = raw_code.strip().upper().replace(" ", "").replace("-", "")
    claimed = (
        db.query(ClassJoinCode)
        .filter(
            ClassJoinCode.code == code,
            ClassJoinCode.revoked_at.is_(None),
            ClassJoinCode.expires_at > datetime.utcnow(),
            ClassJoinCode.used_count < ClassJoinCode.max_uses,
        )
        .update({"used_count": ClassJoinCode.used_count + 1}, synchronize_session=False)
    )
    if not claimed:
        record_failed_code(client_key)
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=INVALID_CODE_MESSAGE)
    return db.query(ClassJoinCode).filter(ClassJoinCode.code == code).one()


def apply_decision(db: Session, account: User, reviewer: User, decision: str, note: str, classes: str) -> None:
    account.student_class = classes
    account.account_status = ACCOUNT_VERIFIED if decision == "approve" else ACCOUNT_REJECTED
    db.add(AccountReview(user_id=account.id, reviewer_id=reviewer.id, decision=decision, note=note, classes=classes))


def account_or_404(db: Session, user_id: int) -> User:
    account = db.query(User).filter(User.id == user_id).first()
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy tài khoản.")
    return account


@router.get("/pending", response_model=list[AccountSummary])
def list_pending_accounts(
    db: Session = Depends(get_db),
    reviewer: User = Depends(require_teacher_user),
):
    pending = (
        db.query(User)
        .filter(User.account_status == ACCOUNT_PENDING)
        .order_by(User.created_at)
        .all()
    )
    return [account for account in pending if can_review(reviewer, account)]


@router.post("/{user_id}/review", response_model=AccountSummary)
def review_account(
    user_id: int,
    payload: ReviewRequest,
    db: Session = Depends(get_db),
    reviewer: User = Depends(require_teacher_user),
):
    account = account_or_404(db, user_id)
    if not can_review(reviewer, account):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tài khoản này không thuộc phạm vi xác minh của bạn.")
    if account.account_status != ACCOUNT_PENDING:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Tài khoản này đã được xử lý.")

    approved = payload.decision == "approve"
    if not approved and not payload.note.strip():
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Vui lòng ghi lí do từ chối.")

    classes = account.student_class or ""
    if is_administrator(reviewer) and payload.classes is not None:
        classes = clean_class_list(payload.classes)
    if approved and account.role == "teacher" and not clean_class_list(classes):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Vui lòng gán ít nhất một lớp cho giáo viên.")

    apply_decision(db, account, reviewer, payload.decision, payload.note.strip(), classes)
    db.commit()
    db.refresh(account)
    return account


@router.post("/review-batch")
def review_accounts_in_batch(
    payload: BatchReviewRequest,
    db: Session = Depends(get_db),
    reviewer: User = Depends(require_teacher_user),
):
    """Decide for many students at once; anything out of scope is reported, never applied."""
    note = payload.note.strip()
    if payload.decision == "reject" and not note:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Vui lòng ghi lí do từ chối.")

    accounts = {item.id: item for item in db.query(User).filter(User.id.in_(payload.user_ids))}
    reviewed, skipped = [], []
    for user_id in dict.fromkeys(payload.user_ids):
        account = accounts.get(user_id)
        usable = (
            account is not None
            and account.role == "student"
            and account.account_status == ACCOUNT_PENDING
            and can_review(reviewer, account)
        )
        if not usable:
            skipped.append(user_id)
            continue
        apply_decision(db, account, reviewer, payload.decision, note, account.student_class or "")
        reviewed.append(user_id)
    db.commit()
    return {"reviewed": reviewed, "skipped": skipped}


@router.post("/{user_id}/reset", response_model=AccountSummary)
def reset_account(
    user_id: int,
    payload: ResetRequest,
    db: Session = Depends(get_db),
    reviewer: User = Depends(require_teacher_user),
):
    """Undo a decision: the account goes back to waiting, so it leaves the class or may sign in again."""
    account = account_or_404(db, user_id)
    if account.id == reviewer.id or is_administrator(account):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Không thể đặt lại tài khoản này.")
    if not can_review(reviewer, account):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tài khoản này không thuộc phạm vi xác minh của bạn.")
    if account.account_status == ACCOUNT_PENDING:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Tài khoản này đang chờ xác minh.")
    account.account_status = ACCOUNT_PENDING
    db.add(
        AccountReview(
            user_id=account.id,
            reviewer_id=reviewer.id,
            decision="reset",
            note=payload.note.strip(),
            classes=account.student_class or "",
        )
    )
    db.commit()
    db.refresh(account)
    return account


@router.get("/class-members", response_model=list[AccountSummary])
def list_class_members(
    db: Session = Depends(get_db),
    reviewer: User = Depends(require_teacher_user),
):
    query = db.query(User).filter(
        User.role == "student",
        User.account_status.in_([ACCOUNT_VERIFIED, ACCOUNT_REJECTED]),
        User.student_class != "",
    )
    if not is_administrator(reviewer):
        query = query.filter(User.student_class.in_(teacher_class_names(reviewer)))
    return query.order_by(User.student_class, User.full_name, User.username).all()


@router.get("/class-codes", response_model=ClassCodeList)
def list_class_codes(
    db: Session = Depends(get_db),
    reviewer: User = Depends(require_teacher_user),
):
    query = db.query(ClassJoinCode).filter(
        ClassJoinCode.revoked_at.is_(None),
        ClassJoinCode.expires_at > datetime.utcnow(),
    )
    classes = sorted(teacher_class_names(reviewer))
    if not is_administrator(reviewer):
        query = query.filter(ClassJoinCode.class_name.in_(classes))
    return {"classes": classes, "codes": query.order_by(ClassJoinCode.class_name).all()}


@router.post("/class-codes", response_model=ClassCodeResponse, status_code=status.HTTP_201_CREATED)
def create_class_code(
    payload: ClassCodeRequest,
    db: Session = Depends(get_db),
    reviewer: User = Depends(require_teacher_user),
):
    """Create a code for a class; a class has one live code, so this replaces the previous one."""
    class_name = payload.class_name.strip()
    if not class_name or "," in class_name:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Tên lớp không hợp lệ.")
    if not can_manage_class(reviewer, class_name):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bạn không phụ trách lớp này.")
    now = datetime.utcnow()
    db.query(ClassJoinCode).filter(
        ClassJoinCode.class_name == class_name,
        ClassJoinCode.revoked_at.is_(None),
    ).update({"revoked_at": now}, synchronize_session=False)
    code = ClassJoinCode(
        code="".join(secrets.choice(CODE_ALPHABET) for _ in range(CODE_LENGTH)),
        class_name=class_name,
        created_by_id=reviewer.id,
        max_uses=payload.max_uses,
        expires_at=now + timedelta(days=payload.valid_days),
    )
    db.add(code)
    db.commit()
    db.refresh(code)
    return code


@router.delete("/class-codes/{code_id}", status_code=status.HTTP_204_NO_CONTENT)
def revoke_class_code(
    code_id: int,
    db: Session = Depends(get_db),
    reviewer: User = Depends(require_teacher_user),
):
    code = db.query(ClassJoinCode).filter(ClassJoinCode.id == code_id).first()
    if not code or not can_manage_class(reviewer, code.class_name):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy mã lớp.")
    code.revoked_at = code.revoked_at or datetime.utcnow()
    db.commit()


@router.get("/teachers", response_model=list[AccountSummary])
def list_teachers(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin_user),
):
    return (
        db.query(User)
        .filter(User.role == "teacher", User.account_status == ACCOUNT_VERIFIED)
        .order_by(User.username)
        .all()
    )


@router.put("/{user_id}/classes", response_model=AccountSummary)
def assign_teacher_classes(
    user_id: int,
    payload: ClassAssignment,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_user),
):
    account = account_or_404(db, user_id)
    classes = clean_class_list(payload.classes)
    if account.role != "teacher":
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Chỉ gán lớp phụ trách cho tài khoản giáo viên.")
    if not classes:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Vui lòng nhập ít nhất một lớp.")
    account.student_class = classes
    db.add(AccountReview(user_id=account.id, reviewer_id=admin.id, decision="assign_classes", note="", classes=classes))
    db.commit()
    db.refresh(account)
    return account


@router.get("/reviews", response_model=list[ReviewRecord])
def list_reviews(
    limit: int = 50,
    db: Session = Depends(get_db),
    reviewer: User = Depends(require_teacher_user),
):
    """Audit trail: administrators see every decision, teachers see their own."""
    query = db.query(AccountReview)
    if not is_administrator(reviewer):
        query = query.filter(AccountReview.reviewer_id == reviewer.id)
    rows = query.order_by(AccountReview.created_at.desc()).limit(min(limit, 200)).all()
    names = {
        user.id: user.username
        for user in db.query(User).filter(
            User.id.in_({row.user_id for row in rows} | {row.reviewer_id for row in rows})
        )
    }
    return [
        ReviewRecord(
            id=row.id,
            user_id=row.user_id,
            username=names.get(row.user_id, ""),
            reviewer_id=row.reviewer_id,
            reviewer=names.get(row.reviewer_id, ""),
            decision=row.decision,
            note=row.note or "",
            classes=row.classes or "",
            created_at=row.created_at,
        )
        for row in rows
    ]
