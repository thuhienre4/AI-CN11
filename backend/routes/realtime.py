from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session

from auth import decode_token, teacher_class_names
from database import get_db
from models import User
from realtime import learning_connections


router = APIRouter(prefix="/api", tags=["Realtime"])


def _identify(db: Session, token: str | None):
    """Return (user id, followed classes), releasing the database connection before the socket opens."""
    try:
        token_data = decode_token(token or "")
        user = (
            db.query(User).filter(User.username == token_data.username, User.is_active.is_(True)).first()
            if token_data
            else None
        )
        if not user:
            return None
        if user.role in {"admin", "moderator"}:
            return user.id, None
        return user.id, teacher_class_names(user) if user.role == "teacher" else False
    finally:
        db.close()


@router.websocket("/ws/learning")
async def learning_updates(
    websocket: WebSocket,
    token: str | None = None,
    db: Session = Depends(get_db),
):
    identity = await run_in_threadpool(_identify, db, token)
    if identity is None:
        await websocket.close(code=4401, reason="Authentication is required.")
        return

    user_id, staff_classes = identity
    await learning_connections.connect(websocket, user_id=user_id, staff_classes=staff_classes)
    await websocket.send_json({"type": "connected", "user_id": user_id})
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        learning_connections.disconnect(websocket, user_id=user_id)
