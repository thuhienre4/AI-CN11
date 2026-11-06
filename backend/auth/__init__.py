from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, Header, HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from config import settings
from database import get_db
from models import User
from schemas import TokenData

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def decode_token(token: str) -> Optional[TokenData]:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        username: str = payload.get("sub")
        if username is None:
            return None
        return TokenData(username=username)
    except JWTError:
        return None


def get_authenticated_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication is required.",
        )

    token = authorization.split(" ", 1)[1].strip()
    token_data = decode_token(token)
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="The login session is invalid or expired.",
        )

    user = db.query(User).filter(User.username == token_data.username).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No active account was found for this token.",
        )
    return user


def can_manage_content(user: User) -> bool:
    return user.role in {"teacher", "admin", "moderator"}


def teacher_class_names(user: User) -> set[str]:
    """Classes a teacher is assigned to; ``student_class`` holds them comma-separated."""
    return {name.strip() for name in (user.student_class or "").split(",") if name.strip()}


def can_view_student(viewer: User, student: User) -> bool:
    if viewer.id == student.id or viewer.role in {"admin", "moderator"}:
        return True
    return (
        viewer.role == "teacher"
        and student.role == "student"
        and (student.student_class or "").strip() in teacher_class_names(viewer)
    )


def ensure_student_scope(db: Session, target_user_id: int, current_user: User, detail: str) -> None:
    """Allow the owner, an administrator, or a teacher assigned to the student's class."""
    if current_user.id == target_user_id or current_user.role in {"admin", "moderator"}:
        return
    student = db.query(User).filter(User.id == target_user_id).first()
    if student is None or not can_view_student(current_user, student):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


def require_teacher_user(user: User = Depends(get_authenticated_user)) -> User:
    if not can_manage_content(user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teacher or admin accounts can perform this action.",
        )
    return user


def require_user_access(target_user_id: int, user: User = Depends(get_authenticated_user)) -> User:
    if user.id == target_user_id or can_manage_content(user):
        return user
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You can only access your own learning data.",
    )
