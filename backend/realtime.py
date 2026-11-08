from collections import defaultdict

import anyio.from_thread
from fastapi import WebSocket


class LearningConnectionManager:
    def __init__(self) -> None:
        self._user_connections: dict[int, set[WebSocket]] = defaultdict(set)
        # None means every class (administrators); otherwise the classes a teacher is assigned to.
        self._staff_connections: dict[WebSocket, set[str] | None] = {}

    def register(self, websocket: WebSocket, *, user_id: int, staff_classes=False) -> None:
        """Track an accepted socket. ``staff_classes`` is False for students, else the classes this account may follow."""
        self._user_connections[user_id].add(websocket)
        if staff_classes is not False:
            self._staff_connections[websocket] = staff_classes

    def disconnect(self, websocket: WebSocket, *, user_id: int) -> None:
        self._user_connections[user_id].discard(websocket)
        if not self._user_connections[user_id]:
            self._user_connections.pop(user_id, None)
        self._staff_connections.pop(websocket, None)

    async def publish_learning_update(self, user_id: int, payload: dict, student_class: str = "") -> None:
        message = {"type": "learning_update", "user_id": user_id, **payload}
        targets = set(self._user_connections.get(user_id, set()))
        targets.update(
            websocket
            for websocket, classes in self._staff_connections.items()
            if classes is None or student_class in classes
        )
        stale = []
        for websocket in targets:
            try:
                await websocket.send_json(message)
            except Exception:
                stale.append(websocket)
        for websocket in stale:
            self._staff_connections.pop(websocket, None)
            for connections in self._user_connections.values():
                connections.discard(websocket)

    def publish_from_thread(self, user_id: int, payload: dict, student_class: str = "") -> None:
        """Publish from a synchronous request handler running in the worker pool."""
        anyio.from_thread.run(self.publish_learning_update, user_id, payload, student_class)


learning_connections = LearningConnectionManager()
