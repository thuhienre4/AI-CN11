from pathlib import Path
from uuid import uuid4
import hashlib

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from auth import get_authenticated_user, require_teacher_user
from database import get_db
from models import ReferenceMaterial, User
from schemas import ReferenceMaterialResponse

router = APIRouter(prefix="/api/materials", tags=["Reference Materials"])

UPLOAD_DIR = Path(__file__).resolve().parents[1] / "uploads" / "materials"
MAX_FILE_SIZE = 300 * 1024 * 1024
ALLOWED_EXTENSIONS = {".pdf", ".ppt", ".pptx", ".doc", ".docx"}
ALLOWED_TYPES = {
    "application/pdf",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/octet-stream",
}


def _validate_file(file: UploadFile) -> str:
    original_name = Path(file.filename or "").name
    extension = Path(original_name).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Định dạng chưa hỗ trợ. Vui lòng chọn PDF, PPT, PPTX, DOC hoặc DOCX.",
        )
    if file.content_type and file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kiểu file chưa hỗ trợ. Vui lòng chọn tài liệu PDF, PowerPoint hoặc Word.",
        )
    return extension


@router.get("", response_model=list[ReferenceMaterialResponse])
def list_materials(
    course_id: int | None = None,
    lesson_id: int | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_authenticated_user),
):
    query = db.query(ReferenceMaterial)
    if course_id is not None:
        query = query.filter(ReferenceMaterial.course_id == course_id)
    if lesson_id is not None:
        query = query.filter(ReferenceMaterial.lesson_id == lesson_id)
    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter(
            (ReferenceMaterial.title.ilike(pattern))
            | (ReferenceMaterial.description.ilike(pattern))
            | (ReferenceMaterial.file_name.ilike(pattern))
        )
    return query.order_by(ReferenceMaterial.created_at.desc()).all()


@router.post("", response_model=ReferenceMaterialResponse, status_code=status.HTTP_201_CREATED)
async def upload_material(
    file: UploadFile = File(...),
    title: str = Form(""),
    description: str = Form(""),
    course_id: int | None = Form(None),
    lesson_id: int | None = Form(None),
    uploader: str = Form("Giáo viên"),
    uploader_user_id: int | None = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher_user),
):
    extension = _validate_file(file)
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    original_name = Path(file.filename or "tai-lieu").name
    stored_file_name = f"{uuid4().hex}{extension}"
    destination = UPLOAD_DIR / stored_file_name

    size = 0
    checksum = hashlib.sha256()
    try:
      with destination.open("wb") as output:
          while True:
              chunk = await file.read(1024 * 1024)
              if not chunk:
                  break
              size += len(chunk)
              if size > MAX_FILE_SIZE:
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
    duplicate = (
        db.query(ReferenceMaterial)
        .filter(
            ReferenceMaterial.file_checksum == file_checksum,
            ReferenceMaterial.file_size == size,
        )
        .first()
    )
    if duplicate:
        destination.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Tài liệu này đã tồn tại trong kho. Hệ thống phát hiện trùng nội dung file.",
        )

    material = ReferenceMaterial(
        title=title.strip() or original_name,
        description=description.strip(),
        course_id=course_id,
        lesson_id=lesson_id,
        file_name=original_name,
        stored_file_name=stored_file_name,
        file_type=file.content_type or "",
        file_size=size,
        file_checksum=file_checksum,
        uploader=uploader.strip() or current_user.full_name or current_user.username,
        uploader_user_id=uploader_user_id or current_user.id,
    )
    db.add(material)
    db.commit()
    db.refresh(material)
    return material


@router.get("/{material_id}/download")
def download_material(
    material_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_authenticated_user),
):
    material = db.query(ReferenceMaterial).filter(ReferenceMaterial.id == material_id).first()
    if not material:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy tài liệu.")

    path = UPLOAD_DIR / material.stored_file_name
    if not path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy file trên server.")

    return FileResponse(
        path=path,
        media_type=material.file_type or "application/octet-stream",
        filename=material.file_name,
    )


@router.delete("/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_material(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher_user),
):
    material = db.query(ReferenceMaterial).filter(ReferenceMaterial.id == material_id).first()
    if not material:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy tài liệu.")

    path = UPLOAD_DIR / material.stored_file_name
    path.unlink(missing_ok=True)
    db.delete(material)
    db.commit()
    return None
