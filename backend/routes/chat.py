from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List

from auth import can_manage_content, decode_token, get_authenticated_user
from database import get_db
from models import ChatHistory, LearningEvent, Lesson, LessonProgress, QuizResult, User
from schemas import ChatMessageResponse, ChatMessageCreate
from ai_tutor import AITutorError, generate_ai_tutor_reply
from config import settings

router = APIRouter(prefix="/api", tags=["Chat"])


def ensure_user_scope(target_user_id: int, current_user: User) -> None:
    if current_user.id == target_user_id or can_manage_content(current_user):
        return
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You can only access your own chat data.",
    )


def build_tutor_reply(message: str, lesson: Lesson | None = None) -> str:
    text = (message or "").strip().lower()
    lesson_hint = f' trong bài "{lesson.title}"' if lesson else ""

    if not text:
        return "Em hãy nhập câu hỏi về bài học, mô phỏng, bài kiểm tra hoặc quy trình thiết kế."
    if any(keyword in text for keyword in ["4 kỳ", "bốn kỳ", "4 stroke", "piston", "trục khuỷu", "xupap", "động cơ"]):
        return (
            "Động cơ bốn kỳ làm việc theo thứ tự: nạp, nén, cháy–giãn nở và thải. "
            "Em hãy quan sát hướng chuyển động của piston, trạng thái các xupap và kỳ sinh công. "
            "Ở kỳ cháy–giãn nở, khí cháy đẩy piston đi xuống và làm quay trục khuỷu."
        )
    if any(keyword in text for keyword in ["quiz", "kiểm tra", "ôn tập", "sai", "điểm"]):
        return (
            "Trước tiên em hãy ôn lại khái niệm liên quan và xác định vì sao từng phương án sai chưa phù hợp. "
            "Sau đó làm lại bài kiểm tra và so sánh kết quả mới với điểm tốt nhất trước đó."
        )
    if any(keyword in text for keyword in ["thiết kế", "cad", "bản vẽ", "hình chiếu", "hệ thống"]):
        return (
            "Em có thể dùng quy trình thiết kế kỹ thuật: xác định vấn đề và ràng buộc; đề xuất phương án; "
            "chọn giải pháp; tạo mẫu hoặc mô phỏng; thử nghiệm theo tiêu chí; sau đó cải tiến."
        )
    return (
        f"Trợ lý có thể hỗ trợ em{lesson_hint}. Hãy chia nội dung thành: khái niệm, bộ phận chính, "
        "nguyên lí hoạt động, ví dụ thực tế và lỗi thường gặp. Em muốn tìm hiểu phần nào trước?"
    )


def update_assistant_progress(
    db: Session,
    user_id: int,
    lesson_id: int | None,
    question: str,
    client_event_id: str | None = None,
) -> None:
    if client_event_id and db.query(LearningEvent).filter(LearningEvent.client_event_id == client_event_id).first():
        return
    event = LearningEvent(
        user_id=user_id,
        lesson_id=lesson_id,
        client_event_id=client_event_id,
        event_type="assistant_question",
        duration_seconds=45,
        payload={"question": question[:500]},
    )
    db.add(event)

    if lesson_id is None:
        return

    progress = (
        db.query(LessonProgress)
        .filter(LessonProgress.user_id == user_id, LessonProgress.lesson_id == lesson_id)
        .first()
    )
    if not progress:
        progress = LessonProgress(user_id=user_id, lesson_id=lesson_id)
        db.add(progress)
        db.flush()

    progress.assistant_question_count += 1
    progress.time_spent_seconds += 45
    progress.progress_percent = max(progress.progress_percent, 60)
    progress.status = "in_progress" if progress.progress_percent < 100 else "completed"
    progress.last_activity_type = "assistant_question"
    progress.last_accessed_at = datetime.utcnow()


@router.post("/chat/message", response_model=ChatMessageResponse, status_code=status.HTTP_201_CREATED)
async def create_chat_message(
    user_id: int,
    message_data: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    """Create a new chat message."""
    ensure_user_scope(user_id, current_user)
    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    lesson = None
    if message_data.lesson_id is not None:
        lesson = db.query(Lesson).filter(Lesson.id == message_data.lesson_id).first()
        if not lesson:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lesson not found",
            )

    progress = None
    if lesson is not None:
        progress = (
            db.query(LessonProgress)
            .filter(LessonProgress.user_id == user_id, LessonProgress.lesson_id == lesson.id)
            .first()
        )
    history_query = db.query(ChatHistory).filter(ChatHistory.user_id == user_id)
    if message_data.session_id:
        history_query = history_query.filter(ChatHistory.session_id == message_data.session_id)
    recent_history = list(reversed(history_query.order_by(ChatHistory.created_at.desc()).limit(6).all()))

    response_mode = "gemini"
    try:
        ai_response = await generate_ai_tutor_reply(
            message_data.user_message,
            lesson=lesson,
            user=user,
            progress=progress,
            history=recent_history,
        )
    except AITutorError:
        response_mode = "fallback"
        ai_response = build_tutor_reply(message_data.user_message, lesson)
    chat_message = ChatHistory(
        user_id=user_id,
        lesson_id=message_data.lesson_id,
        session_id=message_data.session_id,
        user_message=message_data.user_message,
        ai_response=ai_response,
        response_mode=response_mode,
    )
    db.add(chat_message)
    update_assistant_progress(
        db,
        user_id,
        message_data.lesson_id,
        message_data.user_message,
        message_data.client_event_id,
    )
    db.commit()
    db.refresh(chat_message)

    return chat_message


@router.get("/chat/status")
async def get_chat_status(current_user: User = Depends(get_authenticated_user)):
    """Report whether the real AI provider is configured without exposing secrets."""
    return {
        "enabled": settings.enable_chatbot,
        "provider": settings.ai_provider,
        "model": settings.ai_model,
        "configured": bool(settings.ai_api_key),
        "fallback_available": True,
    }


@router.get("/chat/history/{user_id}", response_model=List[ChatMessageResponse])
async def get_chat_history(
    user_id: int,
    lesson_id: int = None,
    session_id: str | None = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    """Get chat history for a user."""
    ensure_user_scope(user_id, current_user)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    query = db.query(ChatHistory).filter(ChatHistory.user_id == user_id)

    if lesson_id:
        query = query.filter(ChatHistory.lesson_id == lesson_id)
    if session_id:
        query = query.filter(ChatHistory.session_id == session_id)

    messages = query.order_by(ChatHistory.created_at.desc()).offset(skip).limit(limit).all()
    return messages


@router.get("/chat/message/{message_id}", response_model=ChatMessageResponse)
async def get_chat_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    """Get a specific chat message."""
    message = db.query(ChatHistory).filter(ChatHistory.id == message_id).first()
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found",
        )
    ensure_user_scope(message.user_id, current_user)
    return message


@router.put("/chat/message/{message_id}", response_model=ChatMessageResponse)
async def update_chat_message(
    message_id: int,
    message_data: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    """Update a chat message (e.g., add AI response)."""
    message = db.query(ChatHistory).filter(ChatHistory.id == message_id).first()
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found",
        )
    ensure_user_scope(message.user_id, current_user)

    if hasattr(message_data, "ai_response"):
        message.ai_response = message_data.ai_response

    db.commit()
    db.refresh(message)
    return message


@router.delete("/chat/message/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chat_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    """Delete a chat message."""
    message = db.query(ChatHistory).filter(ChatHistory.id == message_id).first()
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found",
        )
    ensure_user_scope(message.user_id, current_user)
    db.delete(message)
    db.commit()


# WebSocket endpoint for real-time chat (will be enhanced later)
@router.websocket("/ws/chat/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: int,
    token: str | None = None,
    db: Session = Depends(get_db),
):
    """Authenticated WebSocket channel reserved for realtime tutor updates."""
    token_data = decode_token(token or "")
    current_user = (
        db.query(User).filter(User.username == token_data.username, User.is_active.is_(True)).first()
        if token_data
        else None
    )
    if not current_user:
        await websocket.close(code=4401, reason="Authentication is required.")
        return
    if current_user.id != user_id and not can_manage_content(current_user):
        await websocket.close(code=4403, reason="You cannot access this chat channel.")
        return

    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_json({"type": "ack", "message": data})
    except WebSocketDisconnect:
        return
