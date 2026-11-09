import asyncio
import json
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, Field, field_validator, model_validator
from sqlalchemy.orm import Session

from auth import can_manage_content, get_authenticated_user, require_teacher_user, user_for_token
from database import get_db
from game_rooms import LOBBY, game_rooms
from models import User
from routes.realtime import AUTH_TIMEOUT_SECONDS


router = APIRouter(prefix="/api", tags=["Game rooms"])


class RoomQuestion(BaseModel):
    text: str = Field(min_length=1, max_length=500)
    options: list[str] = Field(min_length=2, max_length=4)
    correct: int = Field(ge=0, le=3)
    seconds: int = Field(default=20, ge=5, le=120)
    explanation: str = Field(default="", max_length=600)

    @field_validator("text", "explanation")
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip()

    @field_validator("options")
    @classmethod
    def clean_options(cls, options: list[str]) -> list[str]:
        cleaned = [option.strip() for option in options]
        if any(not option or len(option) > 200 for option in cleaned):
            raise ValueError("Mỗi phương án cần từ 1 đến 200 kí tự.")
        if len(set(cleaned)) != len(cleaned):
            raise ValueError("Các phương án không được trùng nhau.")
        return cleaned

    @model_validator(mode="after")
    def correct_is_an_option(self):
        if self.correct >= len(self.options):
            raise ValueError("Đáp án đúng phải là một trong các phương án.")
        if not self.text:
            raise ValueError("Câu hỏi không được để trống.")
        return self


class RoomCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    questions: list[RoomQuestion] = Field(min_length=1, max_length=50)


# Open sockets of each room: the teacher's screens, and one socket per student
hosts: dict[str, set[WebSocket]] = defaultdict(set)
players: dict[str, dict[int, WebSocket]] = defaultdict(dict)


@router.post("/game-rooms", status_code=status.HTTP_201_CREATED)
def create_room(payload: RoomCreate, user: User = Depends(require_teacher_user)):
    room = game_rooms.create(user.id, payload.title.strip(), [question.model_dump() for question in payload.questions])
    return {"code": room.code, "title": room.title, "total": len(room.questions)}


@router.get("/game-rooms/{code}")
def room_summary(code: str, user: User = Depends(get_authenticated_user)):
    room = game_rooms.get(code)
    if room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy phòng với mã này.")
    return {"code": room.code, "title": room.title, "total": len(room.questions), "state": room.state,
            "players": len(room.players), "is_host": room.host_id == user.id}


def _identify(db: Session, token: str | None):
    try:
        user = user_for_token(db, token)
        if user is None:
            return None
        return {"id": user.id, "name": user.full_name or user.username, "staff": can_manage_content(user)}
    finally:
        db.close()


async def _first_message(websocket: WebSocket) -> dict:
    try:
        message = json.loads(await asyncio.wait_for(websocket.receive_text(), timeout=AUTH_TIMEOUT_SECONDS))
    except (asyncio.TimeoutError, ValueError, WebSocketDisconnect):
        return {}
    return message if isinstance(message, dict) and message.get("type") == "auth" else {}


async def _send(socket: WebSocket, message: dict) -> None:
    try:
        await socket.send_json(message)
    except Exception:
        pass


async def _broadcast(code: str, message: dict) -> None:
    for socket in [*hosts[code], *players[code].values()]:
        await _send(socket, message)


async def _to_hosts(code: str, message: dict) -> None:
    for socket in list(hosts[code]):
        await _send(socket, message)


async def _reveal(code: str, room) -> None:
    await _broadcast(code, room.reveal())
    for user_id, socket in list(players[code].items()):
        await _send(socket, room.player_result(user_id))


async def _host_command(code: str, room, command: str) -> None:
    if command == "next":
        await _broadcast(code, room.next_question())
        await _to_hosts(code, {"type": "answers", "answered": 0, "players": len(room.players)})
    elif command == "reveal":
        await _reveal(code, room)
    elif command == "end":
        await _broadcast(code, room.finish())


@router.websocket("/ws/game-rooms/{code}")
async def game_room_socket(websocket: WebSocket, code: str, db: Session = Depends(get_db)):
    await websocket.accept()
    message = await _first_message(websocket)
    identity = await run_in_threadpool(_identify, db, message.get("token"))
    room = game_rooms.get(code)
    if identity is None:
        await websocket.close(code=4401, reason="Authentication is required.")
        return
    if room is None:
        await websocket.close(code=4404, reason="Room not found.")
        return

    user_id = identity["id"]
    is_host = user_id == room.host_id
    if is_host:
        hosts[code].add(websocket)
        await _send(websocket, {"type": "hosting", "code": code, "questions": room.questions, "state": room.state})
        await _send(websocket, room.lobby())
    else:
        try:
            room.join(user_id, str(message.get("name") or identity["name"]))
        except ValueError as error:
            await _send(websocket, {"type": "error", "message": str(error)})
            await websocket.close(code=4409)
            return
        previous = players[code].get(user_id)
        players[code][user_id] = websocket
        if previous is not None and previous is not websocket:
            await previous.close(code=4000)
        await _send(websocket, {"type": "joined", "name": room.players[user_id].name, "state": room.state})
        await _broadcast(code, room.lobby())
        if room.state != LOBBY and room.current >= 0:
            await _send(websocket, room.question_message())

    try:
        while True:
            try:
                incoming = json.loads(await websocket.receive_text())
            except ValueError:
                continue
            if not isinstance(incoming, dict):
                continue
            kind = incoming.get("type")
            try:
                if is_host and kind in {"next", "reveal", "end"}:
                    await _host_command(code, room, kind)
                elif not is_host and kind == "answer":
                    if room.answer(user_id, incoming.get("choice")):
                        await _send(websocket, {"type": "answer_received"})
                        await _to_hosts(code, {"type": "answers", "answered": room.answered_count(),
                                               "players": len(room.players)})
            except ValueError as error:
                await _send(websocket, {"type": "error", "message": str(error)})
    except WebSocketDisconnect:
        pass
    finally:
        if is_host:
            hosts[code].discard(websocket)
        elif players[code].get(user_id) is websocket:
            players[code].pop(user_id, None)
