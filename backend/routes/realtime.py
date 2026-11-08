import asyncio
import json

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session

from auth import ACCOUNT_REJECTED, decode_token, teacher_class_names
from database import get_db
from models import User
from realtime import learning_connections


router = APIRouter(prefix="/api", tags=["Realtime"])

# The token travels in the first message, never in the URL, so it does not end up in access logs or proxies.
AUTH_TIMEOUT_SECONDS = 10


def _identify(db: Session, token: str | None):
    """Return (user id, followed classes), releasing the database connection before the socket is used."""
    try:
        token_data = decode_token(token or "")
        user = (
            db.query(User).filter(User.username == token_data.username, User.is_active.is_(True)).first()
            if token_data
            else None
        )
        if not user or user.account_status == ACCOUNT_REJECTED:
            return None
        if user.role in {"admin", "moderator"}:
            return user.id, None
        return user.id, teacher_class_names(user) if user.role == "teacher" else False
    finally:
        db.close()


async def _read_token(websocket: WebSocket) -> str | None:
    """The first message must be {"type": "auth", "token": "..."}; anything else counts as no token."""
    try:
        raw = await asyncio.wait_for(websocket.receive_text(), timeout=AUTH_TIMEOUT_SECONDS)
        message = json.loads(raw)
    except (asyncio.TimeoutError, ValueError, WebSocketDisconnect):
        return None
    if not isinstance(message, dict) or message.get("type") != "auth":
        return None
    token = message.get("token")
    return token if isinstance(token, str) else None


@router.websocket("/ws/learning")
async def learning_updates(websocket: WebSocket, db: Session = Depends(get_db)):
    await websocket.accept()
    token = await _read_token(websocket)
    identity = await run_in_threadpool(_identify, db, token)
    if identity is None:
        await websocket.close(code=4401, reason="Authentication is required.")
        return

    user_id, staff_classes = identity
    learning_connections.register(websocket, user_id=user_id, staff_classes=staff_classes)
    await websocket.send_json({"type": "connected", "user_id": user_id})
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        learning_connections.disconnect(websocket, user_id=user_id)
