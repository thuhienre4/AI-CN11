from datetime import datetime
from pathlib import Path
from uuid import uuid4
import hashlib

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from auth import get_authenticated_user, require_teacher_user
from database import get_db
from models import Assignment, AssignmentSubmission, ClassroomPost, User
from schemas import (
    AssignmentCreate,
    AssignmentGradeUpdate,
    AssignmentResponse,
    AssignmentSubmissionResponse,
    ClassroomPostCreate,
    ClassroomPostResponse,
)

router = APIRouter(prefix="/api/classroom", tags=["Classroom"])

SUBMISSION_DIR = Path(__file__).resolve().parents[1] / "uploads" / "submissions"
MAX_SUBMISSION_FILE_SIZE = 300 * 1024 * 1024


def _assignment_response(assignment: Assignment) -> AssignmentResponse:
    return AssignmentResponse(
        id=assignment.id,
        title=assignment.title,
        description=assignment.description,
        course_id=assignment.course_id,
        lesson_id=assignment.lesson_id,
        status=assignment.status,
        due_at=assignment.due_at,
        created_by=assignment.created_by,
        created_by_user_id=assignment.created_by_user_id,
        created_at=assignment.created_at,
        updated_at=assignment.updated_at,
        submission_count=len(assignment.submissions or []),
    )


@router.get("/posts", response_model=list[ClassroomPostResponse])
def list_posts(
    course_id: int | None = None,
    status_filter: str | None = "published",
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_authenticated_user),
):
    query = db.query(ClassroomPost)
    if course_id is not None:
        query = query.filter(ClassroomPost.course_id == course_id)
    if status_filter:
        query = query.filter(ClassroomPost.status == status_filter)
    return query.order_by(ClassroomPost.created_at.desc()).all()


@router.post("/posts", response_model=ClassroomPostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    payload: ClassroomPostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher_user),
):
    payload.author = payload.author or current_user.full_name or current_user.username
    payload.author_user_id = payload.author_user_id or current_user.id
    post = ClassroomPost(**payload.model_dump())
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.get("/assignments", response_model=list[AssignmentResponse])
def list_assignments(
    course_id: int | None = None,
    status_filter: str | None = "published",
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_authenticated_user),
):
    query = db.query(Assignment)
    if course_id is not None:
        query = query.filter(Assignment.course_id == course_id)
    if status_filter:
        query = query.filter(Assignment.status == status_filter)
    assignments = query.order_by(Assignment.created_at.desc()).all()
    return [_assignment_response(assignment) for assignment in assignments]


@router.post("/assignments", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED)
def create_assignment(
    payload: AssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher_user),
):
    payload.created_by = payload.created_by or current_user.full_name or current_user.username
    payload.created_by_user_id = payload.created_by_user_id or current_user.id
    assignment = Assignment(**payload.model_dump())
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return _assignment_response(assignment)


@router.get("/assignments/{assignment_id}/submissions", response_model=list[AssignmentSubmissionResponse])
def list_submissions(
    assignment_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_teacher_user),
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy nhiệm vụ.")
    return (
        db.query(AssignmentSubmission)
        .filter(AssignmentSubmission.assignment_id == assignment_id)
        .order_by(AssignmentSubmission.submitted_at.desc())
        .all()
    )


@router.post(
    "/assignments/{assignment_id}/submissions",
    response_model=AssignmentSubmissionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def submit_assignment(
    assignment_id: int,
    student_name: str = Form("Học sinh"),
    student_user_id: int | None = Form(None),
    content: str = Form(""),
    file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy nhiệm vụ.")

    file_name = None
    stored_file_name = None
    file_type = ""
    file_size = 0
    file_checksum = None

    if file and file.filename:
        SUBMISSION_DIR.mkdir(parents=True, exist_ok=True)
        original_name = Path(file.filename).name
        extension = Path(original_name).suffix.lower()
        stored_file_name = f"{uuid4().hex}{extension}"
        destination = SUBMISSION_DIR / stored_file_name
        file_name = original_name
        file_type = file.content_type or ""
        checksum = hashlib.sha256()

        try:
            with destination.open("wb") as output:
                while True:
                    chunk = await file.read(1024 * 1024)
                    if not chunk:
                        break
                    file_size += len(chunk)
                    if file_size > MAX_SUBMISSION_FILE_SIZE:
                        output.close()
                        destination.unlink(missing_ok=True)
                        raise HTTPException(
                            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                            detail="File quá lớn. Giới hạn hiện tại là 300MB/file.",
                        )
                    checksum.update(chunk)
                    output.write(chunk)
        finally:
            await file.close()
        file_checksum = checksum.hexdigest()

    submission = AssignmentSubmission(
        assignment_id=assignment_id,
        student_user_id=student_user_id or current_user.id,
        student_name=student_name.strip() or "Học sinh",
        content=content.strip(),
        file_name=file_name,
        stored_file_name=stored_file_name,
        file_type=file_type,
        file_size=file_size,
        file_checksum=file_checksum,
        submitted_at=datetime.utcnow(),
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission


@router.patch("/submissions/{submission_id}/grade", response_model=AssignmentSubmissionResponse)
def grade_submission(
    submission_id: int,
    payload: AssignmentGradeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher_user),
):
    submission = db.query(AssignmentSubmission).filter(AssignmentSubmission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy bài nộp.")

    submission.score = payload.score
    submission.feedback = payload.feedback.strip()
    submission.graded_by = payload.graded_by or current_user.id
    submission.graded_at = datetime.utcnow()
    db.commit()
    db.refresh(submission)
    return submission


@router.get("/submissions/{submission_id}/download")
def download_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_teacher_user),
):
    submission = db.query(AssignmentSubmission).filter(AssignmentSubmission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy bài nộp.")
    if not submission.stored_file_name:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bài nộp không có file đính kèm.")

    path = SUBMISSION_DIR / submission.stored_file_name
    if not path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy file trên server.")

    return FileResponse(
        path=path,
        media_type=submission.file_type or "application/octet-stream",
        filename=submission.file_name or "bai-nop",
    )
