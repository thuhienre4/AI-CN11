from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from auth import (
    ACCOUNT_PENDING,
    ACCOUNT_REJECTED,
    ACCOUNT_VERIFIED,
    create_access_token,
    get_authenticated_user,
    hash_password,
    verify_password,
)
from config import settings
from database import get_db
from models import AccountReview, User
from routes.accounts import redeem_class_code
from schemas import Token, UserCreate, UserLogin, UserResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def initial_account_status(user_data: UserCreate) -> str:
    if user_data.role.value == "teacher":
        return ACCOUNT_VERIFIED if settings.allow_teacher_self_registration else ACCOUNT_PENDING
    needs_class_check = settings.require_student_verification and user_data.student_class.strip()
    return ACCOUNT_PENDING if needs_class_check else ACCOUNT_VERIFIED


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, request: Request, db: Session = Depends(get_db)):
    """Register a new user."""
    password_hash = hash_password(user_data.password)  # slow on purpose: keep it outside the transaction
    existing_user = db.query(User).filter(
        (User.username == user_data.username) | (User.email == user_data.email)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered",
        )

    if user_data.role.value in {"admin", "moderator"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin and moderator accounts must be created by an administrator.",
        )

    join_code = None
    if user_data.class_code and user_data.class_code.strip() and user_data.role.value == "student":
        client_key = request.client.host if request.client else "unknown"
        join_code = redeem_class_code(db, user_data.class_code, client_key)

    new_user = User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        password_hash=password_hash,
        role=user_data.role.value,
        student_class=join_code.class_name if join_code else user_data.student_class.strip(),
        account_status=ACCOUNT_VERIFIED if join_code else initial_account_status(user_data),
    )

    db.add(new_user)
    if join_code:
        db.flush()
        db.add(
            AccountReview(
                user_id=new_user.id,
                reviewer_id=join_code.created_by_id,
                decision="class_code",
                note="",
                classes=join_code.class_name,
            )
        )
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token."""
    username_or_email = credentials.username.strip()
    user = db.query(User).filter(
        (User.username == username_or_email) | (User.email == username_or_email)
    ).first()

    if user:
        db.expunge(user)  # keeps the loaded fields usable without reopening a transaction
    db.rollback()  # password hashing is slow on purpose: do not hold the database during it

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sai tài khoản/email hoặc mật khẩu. Nếu chưa có tài khoản, hãy đăng ký trước.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )
    if user.account_status == ACCOUNT_REJECTED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản đã bị từ chối xác minh. Vui lòng liên hệ giáo viên hoặc quản trị viên.",
        )

    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=30),
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.get("/me", response_model=UserResponse)
def get_current_user(current_user: User = Depends(get_authenticated_user)):
    """Get the authenticated user from the Bearer token."""
    return current_user
