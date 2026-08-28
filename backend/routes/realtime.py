from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from auth import can_manage_content, decode_token
from database import get_db
from models import User
from realtime import learning_connections


router = APIRouter(prefix="/api", tags=["Realtime"])


@router.websocket("/ws/learning")
async def learning_updates(
    websocket: WebSocket,
    token: str | None = None,
    db: Session = Depends(get_db),
):
    token_data = decode_token(token or "")
    user = (
        db.query(User).filter(User.username == token_data.username, User.is_active.is_(True)).first()
        if token_data
        else None
    )
    if not user:
        await websocket.close(code=4401, reason="Authentication is required.")
        return

    await learning_connections.connect(
        websocket,
        user_id=user.id,
        is_teacher=can_manage_content(user),
    )
    await websocket.send_json({"type": "connected", "user_id": user.id})
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        learning_connections.disconnect(websocket, user_id=user.id)
