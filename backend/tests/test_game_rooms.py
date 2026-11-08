import pytest
from starlette.websockets import WebSocketDisconnect

from auth import create_access_token
from game_rooms import BASE_POINTS, FINISHED, GRACE_SECONDS, MAX_PLAYERS, SPEED_POINTS, GameRoom, game_rooms, points_for
from models import User
from test_learning_workflow import api  # noqa: F401  (pytest fixture)

QUESTIONS = [
    {"text": "Kì nào hai xu páp đều đóng?", "options": ["Nạp", "Nén", "Thải", "Không kì nào"], "correct": 1, "seconds": 20},
    {"text": "Hành trình pít tông S bằng", "options": ["R", "2R", "3R"], "correct": 1, "seconds": 10},
]


@pytest.fixture(autouse=True)
def empty_rooms():
    game_rooms.clear()
    yield
    game_rooms.clear()


def token(username):
    return create_access_token({"sub": username})


def room_with_players(*names):
    room = GameRoom(code="123456", host_id=99, title="Ôn tập", questions=[dict(question) for question in QUESTIONS])
    for user_id, name in enumerate(names, start=1):
        room.join(user_id, name)
    return room


# ------------------------------------------------------------------ rules
def test_a_right_answer_scores_more_the_faster_it_comes_and_a_wrong_one_scores_nothing():
    assert points_for(True, 0, 20) == BASE_POINTS + SPEED_POINTS
    assert points_for(True, 10, 20) == BASE_POINTS + SPEED_POINTS // 2
    assert points_for(True, 25, 20) == BASE_POINTS
    assert points_for(False, 0, 20) == 0


def test_only_the_first_answer_in_time_counts():
    room = room_with_players("An", "Bình")
    room.next_question(now=100.0)
    assert room.answer(1, 1, now=102.0) is True
    assert room.answer(1, 0, now=103.0) is False  # a second answer cannot replace the first
    assert room.answer(2, 1, now=100.0 + 20 + GRACE_SECONDS + 0.1) is False  # too late
    assert room.players[1].score == points_for(True, 2.0, 20)
    assert room.players[2].score == 0


def test_answers_outside_an_open_question_or_out_of_range_are_ignored():
    room = room_with_players("An")
    assert room.answer(1, 0, now=0) is False  # still in the lobby
    room.next_question(now=0)
    assert room.answer(1, 7, now=1) is False
    assert room.answer(1, True, now=1) is False
    assert room.answer(42, 1, now=1) is False  # not a player
    room.reveal()
    assert room.answer(1, 1, now=2) is False  # answers close with the reveal


def test_reveal_counts_choices_ranks_players_and_tells_each_one_their_result():
    room = room_with_players("An", "Bình", "Chi")
    room.next_question(now=0)
    room.answer(1, 1, now=1)
    room.answer(2, 1, now=5)
    room.answer(3, 0, now=2)
    result = room.reveal()
    assert result["correct"] == 1
    assert result["counts"] == [1, 2, 0, 0]
    assert [row["name"] for row in result["leaderboard"]] == ["An", "Bình", "Chi"]
    assert all("user_id" not in row for row in result["leaderboard"])
    mine = room.player_result(3)
    assert (mine["choice"], mine["points"], mine["rank"], mine["streak"]) == (0, 0, 3, 0)


def test_the_question_sent_to_screens_never_contains_the_answer():
    room = room_with_players("An")
    message = room.next_question(now=0)
    assert "correct" not in message and "explanation" not in message
    assert message["options"] == QUESTIONS[0]["options"]


def test_questions_move_on_only_after_a_reveal_and_stop_at_the_last():
    room = room_with_players("An")
    room.next_question(now=0)
    with pytest.raises(ValueError):
        room.next_question(now=1)
    room.reveal()
    room.next_question(now=2)
    assert room.reveal()["last"] is True
    with pytest.raises(ValueError):
        room.next_question(now=3)


def test_the_host_cannot_play_and_a_full_or_finished_room_refuses_players():
    room = room_with_players()
    with pytest.raises(ValueError):
        room.join(99, "Giáo viên")
    for user_id in range(1, MAX_PLAYERS + 1):
        room.join(user_id, f"HS {user_id}")
    with pytest.raises(ValueError):
        room.join(MAX_PLAYERS + 1, "Thêm")
    room.join(1, "HS 1")  # coming back after a dropped connection keeps the same player
    room.finish()
    assert room.state == FINISHED
    late = room_with_players()
    late.finish()
    with pytest.raises(ValueError):
        late.join(5, "Muộn")


def test_room_codes_are_six_digits_and_unique():
    codes = {game_rooms.create(1, "Phòng", QUESTIONS).code for _ in range(200)}
    assert len(codes) == 200
    assert all(len(code) == 6 and code.isdigit() and code[0] != "0" for code in codes)


# -------------------------------------------------------------------- API
def test_only_a_verified_teacher_can_open_a_room(api):
    client, Session, _, headers = api
    body = {"title": "Ôn tập Bài 18", "questions": QUESTIONS}
    assert client.post("/api/game-rooms", json=body).status_code == 401
    assert client.post("/api/game-rooms", json=body, headers=headers["student"]).status_code == 403
    with Session() as db:
        db.query(User).filter_by(username="teacher_test").update({"account_status": "pending"})
        db.commit()
    assert client.post("/api/game-rooms", json=body, headers=headers["teacher"]).status_code == 403
    with Session() as db:
        db.query(User).filter_by(username="teacher_test").update({"account_status": "verified"})
        db.commit()
    created = client.post("/api/game-rooms", json=body, headers=headers["teacher"])
    assert created.status_code == 201
    assert created.json()["total"] == 2


@pytest.mark.parametrize("question", [
    {"text": "Câu", "options": ["A"], "correct": 0},
    {"text": "Câu", "options": ["A", "B"], "correct": 2},
    {"text": "Câu", "options": ["A", "A"], "correct": 0},
    {"text": "  ", "options": ["A", "B"], "correct": 0},
    {"text": "Câu", "options": ["A", "B"], "correct": 0, "seconds": 2},
])
def test_a_badly_formed_question_is_refused(api, question):
    client, _, _, headers = api
    response = client.post("/api/game-rooms", json={"title": "Lỗi", "questions": [question]}, headers=headers["teacher"])
    assert response.status_code == 422


def test_a_student_can_look_up_a_room_by_code(api):
    client, _, _, headers = api
    code = client.post("/api/game-rooms", json={"title": "Ôn tập", "questions": QUESTIONS}, headers=headers["teacher"]).json()["code"]
    summary = client.get(f"/api/game-rooms/{code}", headers=headers["student"]).json()
    assert (summary["title"], summary["total"], summary["state"], summary["is_host"]) == ("Ôn tập", 2, "lobby", False)
    assert client.get("/api/game-rooms/000000", headers=headers["student"]).status_code == 404


def receive_until(socket, kind):
    while True:
        message = socket.receive_json()
        if message["type"] == kind:
            return message


def test_a_whole_game_over_websockets(api):
    client, _, _, headers = api
    code = client.post("/api/game-rooms", json={"title": "Ôn tập", "questions": QUESTIONS}, headers=headers["teacher"]).json()["code"]
    with client.websocket_connect(f"/api/ws/game-rooms/{code}") as host, \
            client.websocket_connect(f"/api/ws/game-rooms/{code}") as student:
        host.send_json({"type": "auth", "token": token("teacher_test")})
        hosting = receive_until(host, "hosting")
        assert hosting["questions"][0]["correct"] == 1  # only the teacher's screen gets the answers

        student.send_json({"type": "auth", "token": token("student_test"), "name": "Học sinh A"})
        assert receive_until(student, "joined")["name"] == "Học sinh A"
        assert receive_until(host, "lobby")["players"] in (["Học sinh A"], [])

        host.send_json({"type": "next"})
        question = receive_until(student, "question")
        assert "correct" not in question

        student.send_json({"type": "answer", "choice": 1})
        receive_until(student, "answer_received")
        assert receive_until(host, "answers")["answered"] in (0, 1)

        host.send_json({"type": "reveal"})
        reveal = receive_until(student, "reveal")
        assert reveal["correct"] == 1 and reveal["counts"][1] == 1
        mine = receive_until(student, "your_result")
        assert mine["rank"] == 1 and mine["points"] > BASE_POINTS

        host.send_json({"type": "end"})
        final = receive_until(student, "finished")
        assert final["leaderboard"][0]["name"] == "Học sinh A"


def test_a_student_cannot_steer_the_game(api):
    client, _, _, headers = api
    code = client.post("/api/game-rooms", json={"title": "Ôn tập", "questions": QUESTIONS}, headers=headers["teacher"]).json()["code"]
    with client.websocket_connect(f"/api/ws/game-rooms/{code}") as student:
        student.send_json({"type": "auth", "token": token("student_test")})
        receive_until(student, "joined")
        student.send_json({"type": "next"})
        student.send_json({"type": "end"})
        assert game_rooms.get(code).state == "lobby"


@pytest.mark.parametrize("first_message", [None, {"type": "auth", "token": "not-a-token"}])
def test_a_room_socket_needs_a_valid_token(api, first_message):
    client, _, _, headers = api
    code = client.post("/api/game-rooms", json={"title": "Ôn tập", "questions": QUESTIONS}, headers=headers["teacher"]).json()["code"]
    with pytest.raises(WebSocketDisconnect) as closed:
        with client.websocket_connect(f"/api/ws/game-rooms/{code}") as socket:
            socket.send_json(first_message or {"type": "hello"})
            socket.receive_json()
    assert closed.value.code == 4401


def test_an_unknown_room_closes_the_socket(api):
    client, _, _, _ = api
    with pytest.raises(WebSocketDisconnect) as closed:
        with client.websocket_connect("/api/ws/game-rooms/999999") as socket:
            socket.send_json({"type": "auth", "token": token("student_test")})
            socket.receive_json()
    assert closed.value.code == 4404
