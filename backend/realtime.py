from collections import defaultdict

from fastapi import WebSocket


class LearningConnectionManager:
    def __init__(self) -> None:
        self._user_connections: dict[int, set[WebSocket]] = defaultdict(set)
        self._teacher_connections: set[WebSocket] = set()

    async def connect(self, websocket: WebSocket, *, user_id: int, is_teacher: bool) -> None:
        await websocket.accept()
        self._user_connections[user_id].add(websocket)
        if is_teacher:
            self._teacher_connections.add(websocket)

    def disconnect(self, websocket: WebSocket, *, user_id: int) -> None:
        self._user_connections[user_id].discard(websocket)
        if not self._user_connections[user_id]:
            self._user_connections.pop(user_id, None)
        self._teacher_connections.discard(websocket)

    async def publish_learning_update(self, user_id: int, payload: dict) -> None:
        message = {"type": "learning_update", "user_id": user_id, **payload}
        targets = set(self._user_connections.get(user_id, set())) | set(self._teacher_connections)
        stale = []
        for websocket in targets:
            try:
                await websocket.send_json(message)
            except Exception:
                stale.append(websocket)
        for websocket in stale:
            self._teacher_connections.discard(websocket)
            for connections in self._user_connections.values():
                connections.discard(websocket)


learning_connections = LearningConnectionManager()
