import logging
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session

from auth import (
    ACCOUNT_PENDING,
    ACCOUNT_REJECTED,
    ACCOUNT_VERIFIED,
    get_authenticated_user,
    hash_password,
    token_for,
    verify_password,
)
from auth.passwords import login_guard, password_problem
from config import settings
from database import get_db
from models import (
    AccountReview,
    AssignmentSubmission,
    ChatHistory,
    LearningEvent,
    LessonProgress,
    QuizAttempt,
    QuizDesign,
    QuizResult,
    User,
)
from routes.accounts import redeem_class_code
from schemas import AccountDeletion, PasswordChange, Token, UserCreate, UserLogin, UserResponse

logger = logging.getLogger("enginelab")

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def initial_account_status(user_data: UserCreate) -> str:
    if user_data.role.value == "teacher":
        return ACCOUNT_VERIFIED if settings.allow_teacher_self_registration else ACCOUNT_PENDING
    needs_class_check = settings.require_student_verification and user_data.student_class.strip()
    return ACCOUNT_PENDING if needs_class_check else ACCOUNT_VERIFIED



def client_address(request: Request) -> str:
    """Address used to rate-limit class-code guesses. Behind N trusted proxies, the N-th address from the right
    of X-Forwarded-For is the one the outermost proxy saw; entries further left come from the client and can be forged."""
    hops = settings.trusted_proxy_hops
    if hops > 0:
        chain = [part.strip() for part in request.headers.get("x-forwarded-for", "").split(",") if part.strip()]
        if len(chain) >= hops:
            return chain[-hops]
    return request.client.host if request.client else "unknown"

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
        client_key = client_address(request)
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


def _too_many_attempts(seconds: int) -> HTTPException:
    minutes = max(1, round(seconds / 60))
    return HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail=f"Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau khoảng {minutes} phút.",
        headers={"Retry-After": str(seconds)},
    )


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, request: Request, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token."""
    username_or_email = credentials.username.strip()
    address = client_address(request)
    wait = login_guard.wait_seconds(username_or_email, address)
    if wait:
        raise _too_many_attempts(wait)
    user = db.query(User).filter(
        (User.username == username_or_email) | (User.email == username_or_email)
    ).first()

    if user:
        db.expunge(user)  # keeps the loaded fields usable without reopening a transaction
    db.rollback()  # password hashing is slow on purpose: do not hold the database during it

    if not user or not verify_password(credentials.password, user.password_hash):
        login_guard.failed(username_or_email, address)
        logger.warning("Failed login for %r from %s", username_or_email[:100], address)
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

    login_guard.succeeded(username_or_email)
    access_token = token_for(user, expires_delta=timedelta(minutes=settings.access_token_expire_minutes))

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.get("/me", response_model=UserResponse)
def get_current_user(current_user: User = Depends(get_authenticated_user)):
    """Get the authenticated user from the Bearer token."""
    return current_user


# ------------------------------------------------------------------ account security and personal data
def _fresh_token(db: Session, user: User) -> dict:
    """Move the account to a new token version, so every token issued before stops working."""
    user.token_version = (user.token_version or 0) + 1
    db.commit()
    db.refresh(user)
    return {"access_token": token_for(user), "token_type": "bearer"}


@router.post("/change-password")
async def change_password(payload: PasswordChange, db: Session = Depends(get_db), user: User = Depends(get_authenticated_user)):
    """Change the password and sign out every other device. Returns a new token for this one."""
    if not await run_in_threadpool(verify_password, payload.current_password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Mật khẩu hiện tại không đúng.")
    problem = password_problem(payload.new_password, user.username)
    if problem:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=problem)
    if payload.new_password == payload.current_password:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Mật khẩu mới cần khác mật khẩu hiện tại.")
    user.password_hash = await run_in_threadpool(hash_password, payload.new_password)
    return _fresh_token(db, user)


@router.post("/logout-all")
def logout_everywhere(db: Session = Depends(get_db), user: User = Depends(get_authenticated_user)):
    """Sign out on every device, for a lost phone or a shared computer. Returns a new token for this one."""
    return _fresh_token(db, user)


def _row(item) -> dict:
    values = {}
    for column in item.__table__.columns:
        if column.name in {"password_hash", "token_version"}:
            continue
        value = getattr(item, column.name)
        values[column.name] = value.isoformat() if isinstance(value, datetime) else value
    return values


@router.get("/me/data")
def export_my_data(response: Response, db: Session = Depends(get_db), user: User = Depends(get_authenticated_user)):
    """Everything the system keeps about the signed-in person, as one JSON document."""
    response.headers["Content-Disposition"] = f'attachment; filename="enginelab-du-lieu-{user.username}.json"'
    response.headers["Cache-Control"] = "no-store"

    def rows(model, column):
        return [_row(item) for item in db.query(model).filter(column == user.id).all()]

    return {
        "exported_at": datetime.utcnow().isoformat() + "Z",
        "account": _row(user),
        "lesson_progress": rows(LessonProgress, LessonProgress.user_id),
        "quiz_attempts": rows(QuizAttempt, QuizAttempt.user_id),
        "quiz_answers": rows(QuizResult, QuizResult.user_id),
        "learning_events": rows(LearningEvent, LearningEvent.user_id),
        "assistant_chats": rows(ChatHistory, ChatHistory.user_id),
        "assignment_submissions": rows(AssignmentSubmission, AssignmentSubmission.student_user_id),
        "account_reviews": rows(AccountReview, AccountReview.user_id),
        "quiz_designs": rows(QuizDesign, QuizDesign.owner_id),
    }


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_account(payload: AccountDeletion, db: Session = Depends(get_db), user: User = Depends(get_authenticated_user)):
    """A student deletes the account and all learning data. Staff accounts are closed by an administrator,
    because their decisions and materials are part of other people's records."""
    if user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản giáo viên và quản trị viên cần quản trị viên đóng, vì gắn với dữ liệu của lớp.",
        )
    if not await run_in_threadpool(verify_password, payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Mật khẩu hiện tại không đúng.")

    from routes.classroom import SUBMISSION_DIR

    user_id = user.id
    submissions = db.query(AssignmentSubmission).filter(AssignmentSubmission.student_user_id == user_id).all()
    stored_files = [item.stored_file_name for item in submissions if item.stored_file_name]
    for item in submissions:
        db.delete(item)
    db.query(AccountReview).filter(AccountReview.user_id == user_id).delete()
    db.delete(user)  # progress, quiz attempts and answers, events and chats go with it
    db.commit()
    for name in stored_files:
        try:
            (SUBMISSION_DIR / name).unlink(missing_ok=True)
        except OSError:
            logger.warning("Could not remove submission file %s of a deleted account", name)
    logger.warning("Account %s deleted by its owner", user_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
