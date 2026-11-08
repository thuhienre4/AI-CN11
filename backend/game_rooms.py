"""Live quiz rooms: a teacher opens a room with a code, students join on their own devices and answer
against the clock. Rooms live in memory for the length of a lesson; nothing here is written to the database.

The server alone knows the correct answers and the time: clients only ever receive the question text and
options, and the points of an answer are computed from the server's clock when it arrives."""

import secrets
import time
from dataclasses import dataclass, field

CODE_DIGITS = 6
MAX_PLAYERS = 60
ROOM_LIFETIME_SECONDS = 4 * 60 * 60
# An answer that left the student's device just before the end still counts
GRACE_SECONDS = 1.0
BASE_POINTS = 500
SPEED_POINTS = 500
LEADERBOARD_SIZE = 10

LOBBY, QUESTION, REVEAL, FINISHED = "lobby", "question", "reveal", "finished"


def points_for(correct: bool, elapsed: float, seconds: int) -> int:
    """500 for a right answer plus up to 500 more the faster it came; nothing for a wrong one."""
    if not correct:
        return 0
    remaining = max(0.0, min(1.0, 1 - elapsed / seconds))
    return BASE_POINTS + round(SPEED_POINTS * remaining)


@dataclass
class Player:
    user_id: int
    name: str
    score: int = 0
    streak: int = 0
    answers: dict = field(default_factory=dict)  # question index -> (choice, points)


@dataclass
class GameRoom:
    code: str
    host_id: int
    title: str
    questions: list  # dicts with text, options, correct, seconds
    created_at: float = field(default_factory=time.monotonic)
    state: str = LOBBY
    current: int = -1
    started_at: float = 0.0
    players: dict = field(default_factory=dict)

    # ------------------------------------------------------------- players
    def join(self, user_id: int, name: str) -> Player:
        if user_id in self.players:
            return self.players[user_id]
        if user_id == self.host_id:
            raise ValueError("Giáo viên điều khiển phòng không tham gia trả lời.")
        if self.state == FINISHED:
            raise ValueError("Trò chơi đã kết thúc.")
        if len(self.players) >= MAX_PLAYERS:
            raise ValueError("Phòng đã đủ người.")
        player = Player(user_id=user_id, name=name.strip()[:40] or f"Người chơi {len(self.players) + 1}")
        self.players[user_id] = player
        return player

    def lobby(self) -> dict:
        return {"type": "lobby", "title": self.title, "total": len(self.questions),
                "players": [player.name for player in self.players.values()]}

    # ------------------------------------------------------------ questions
    @property
    def question(self) -> dict:
        return self.questions[self.current]

    def next_question(self, now: float | None = None) -> dict:
        if self.state not in (LOBBY, REVEAL):
            raise ValueError("Hãy hiện đáp án của câu hiện tại trước khi chuyển câu.")
        if self.current + 1 >= len(self.questions):
            raise ValueError("Đã hết câu hỏi.")
        self.current += 1
        self.state = QUESTION
        self.started_at = time.monotonic() if now is None else now
        return self.question_message()

    def question_message(self) -> dict:
        """What every screen shows; the correct option is not part of it."""
        question = self.question
        return {"type": "question", "index": self.current, "total": len(self.questions), "text": question["text"],
                "options": question["options"], "seconds": question["seconds"]}

    def answered_count(self) -> int:
        return sum(1 for player in self.players.values() if self.current in player.answers)

    def answer(self, user_id: int, choice: int, now: float | None = None) -> bool:
        """Record a player's first answer to the open question. Returns False when it does not count."""
        player = self.players.get(user_id)
        if player is None or self.state != QUESTION or self.current in player.answers:
            return False
        question = self.question
        if type(choice) is not int or not 0 <= choice < len(question["options"]):
            return False
        elapsed = (time.monotonic() if now is None else now) - self.started_at
        if elapsed > question["seconds"] + GRACE_SECONDS:
            return False
        correct = choice == question["correct"]
        points = points_for(correct, elapsed, question["seconds"])
        player.answers[self.current] = (choice, points)
        player.score += points
        player.streak = player.streak + 1 if correct else 0
        return True

    def everyone_answered(self) -> bool:
        return bool(self.players) and self.answered_count() == len(self.players)

    # --------------------------------------------------------------- results
    def ranking(self) -> list:
        ordered = sorted(self.players.values(), key=lambda player: (-player.score, player.name))
        return [{"rank": index + 1, "name": player.name, "score": player.score, "user_id": player.user_id}
                for index, player in enumerate(ordered)]

    def reveal(self) -> dict:
        if self.state != QUESTION:
            raise ValueError("Chưa có câu hỏi đang mở.")
        self.state = REVEAL
        question = self.question
        counts = [0] * len(question["options"])
        for player in self.players.values():
            if self.current in player.answers:
                counts[player.answers[self.current][0]] += 1
        return {"type": "reveal", "index": self.current, "correct": question["correct"], "counts": counts,
                "explanation": question.get("explanation", ""),
                "leaderboard": [self._public(row) for row in self.ranking()[:LEADERBOARD_SIZE]],
                "last": self.current + 1 >= len(self.questions)}

    def finish(self) -> dict:
        self.state = FINISHED
        return {"type": "finished", "leaderboard": [self._public(row) for row in self.ranking()[:LEADERBOARD_SIZE]],
                "players": len(self.players)}

    def player_result(self, user_id: int) -> dict:
        """The private part of a reveal: what this one student got."""
        player = self.players[user_id]
        choice, points = player.answers.get(self.current, (None, 0))
        rank = next(row["rank"] for row in self.ranking() if row["user_id"] == user_id)
        return {"type": "your_result", "choice": choice, "points": points, "score": player.score,
                "streak": player.streak, "rank": rank, "players": len(self.players)}

    @staticmethod
    def _public(row: dict) -> dict:
        return {key: row[key] for key in ("rank", "name", "score")}


class GameRoomRegistry:
    def __init__(self) -> None:
        self._rooms: dict[str, GameRoom] = {}

    def create(self, host_id: int, title: str, questions: list) -> GameRoom:
        self.forget_old()
        code = self._new_code()
        room = GameRoom(code=code, host_id=host_id, title=title, questions=questions)
        self._rooms[code] = room
        return room

    def get(self, code: str) -> GameRoom | None:
        room = self._rooms.get(code)
        if room and time.monotonic() - room.created_at > ROOM_LIFETIME_SECONDS:
            self._rooms.pop(code, None)
            return None
        return room

    def forget_old(self) -> None:
        now = time.monotonic()
        for code in [code for code, room in self._rooms.items() if now - room.created_at > ROOM_LIFETIME_SECONDS]:
            self._rooms.pop(code, None)

    def clear(self) -> None:
        self._rooms.clear()

    def _new_code(self) -> str:
        while True:
            code = "".join(secrets.choice("0123456789") for _ in range(CODE_DIGITS))
            if code not in self._rooms and not code.startswith("0"):
                return code


game_rooms = GameRoomRegistry()
