from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from auth import create_access_token, get_authenticated_user, hash_password, verify_password
from config import settings
from database import get_db
from models import User
from schemas import Token, UserCreate, UserLogin, UserResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Verified when the account does not exist so response time doesn't reveal which usernames are taken.
_DUMMY_PASSWORD_HASH = hash_password("enginelab-dummy-password-1")


def _find_user(db: Session, identifier: str) -> User | None:
    normalized = identifier.strip().lower()
    return db.query(User).filter(
        (func.lower(User.username) == normalized) | (func.lower(User.email) == normalized)
    ).first()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new student (or teacher, when self-registration is enabled)."""
    if user_data.role.value in {"admin", "moderator"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản quản trị chỉ được tạo bởi quản trị viên.",
        )
    if user_data.role.value == "teacher" and not settings.allow_teacher_self_registration:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản giáo viên cần được quản trị viên phê duyệt và tạo.",
        )

    if db.query(User).filter(func.lower(User.username) == user_data.username.lower()).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Tên đăng nhập đã được sử dụng.")

    if db.query(User).filter(func.lower(User.email) == user_data.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email đã được đăng ký.")

    new_user = User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        password_hash=hash_password(user_data.password),
        role=user_data.role.value,
        student_class=user_data.student_class,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Authenticate with username or email and return a JWT token."""
    user = _find_user(db, credentials.username)
    password_ok = verify_password(
        credentials.password, user.password_hash if user else _DUMMY_PASSWORD_HASH
    )

    if not user or not password_ok:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sai tên đăng nhập/email hoặc mật khẩu.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản đã bị khóa. Vui lòng liên hệ giáo viên hoặc quản trị viên.",
        )

    # Lifetime comes from settings.access_token_expire_minutes.
    access_token = create_access_token(data={"sub": user.username, "role": user.role})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user(current_user: User = Depends(get_authenticated_user)):
    """Get the authenticated user from the Bearer token."""
    return current_user
