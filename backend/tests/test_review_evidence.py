"""Verification requested by the journal reviewer, including regressions for defects it uncovered.

Defect identifiers (D1-D9) match docs/verification.md.
"""
import json
from datetime import datetime, timedelta
from pathlib import Path
from types import SimpleNamespace

import httpx
import pytest
from fastapi.routing import APIRoute
from fastapi.testclient import TestClient
from jose import jwt
from starlette.websockets import WebSocketDisconnect

import ai_tutor
from ai_tutor import AITutorError, generate_ai_tutor_reply
from auth import create_access_token, hash_password
from config import settings
from main import app
from models import (
    Assignment,
    AssignmentSubmission,
    ChatHistory,
    ClassroomPost,
    LearningEvent,
    LessonProgress,
    QuizAttempt,
    User,
)
from routes.chat import build_tutor_reply
from routes.progress import lesson_analytics
from test_learning_workflow import api  # noqa: F401  (pytest fixture)

CATALOG = Path(__file__).resolve().parents[1] / "data" / "course_catalog.json"
LESSON = 110101
Q1, Q2 = 1101001, 1101002
RIGHT_Q1, WRONG_Q2 = "11010001", "11010004"

# Endpoints intentionally readable without a token: the public catalogue and API info.
PUBLIC_ROUTES = {
    ("GET", "/"),
    ("GET", "/health"),
    ("GET", "/api/courses"),
    ("GET", "/api/courses/{course_id}"),
    ("GET", "/api/courses/{course_id}/lessons"),
    ("GET", "/api/lessons/{lesson_id}"),
    ("POST", "/api/auth/register"),
    ("POST", "/api/auth/login"),
}

TEACHER_ONLY = [
    ("POST", "/api/courses"),
    ("PUT", "/api/courses/1101"),
    ("DELETE", "/api/courses/1101"),
    ("POST", "/api/lessons"),
    ("PUT", "/api/lessons/110101"),
    ("DELETE", "/api/lessons/110101"),
    ("POST", "/api/questions"),
    ("GET", "/api/questions/1101001"),
    ("PUT", "/api/questions/1101001"),
    ("DELETE", "/api/questions/1101001"),
    ("GET", "/api/quiz/results/question/1101001"),
    ("GET", "/api/learning/teacher/analytics"),
    ("POST", "/api/classroom/posts"),
    ("POST", "/api/classroom/assignments"),
    ("GET", "/api/classroom/assignments/1/submissions"),
    ("PATCH", "/api/classroom/submissions/1/grade"),
    ("GET", "/api/classroom/submissions/1/download"),
    ("POST", "/api/nova3d/four-stroke-engine"),
]


def bearer(token):
    return {"Authorization": f"Bearer {token}"}


def event(identifier, **overrides):
    return {"lesson_id": LESSON, "client_event_id": identifier, "event_type": "lesson_viewed", **overrides}


def progress_state(**overrides):
    values = dict(
        status="in_progress",
        quiz_attempt_count=0,
        best_quiz_score=0,
        progress_percent=0,
        view_count=0,
        simulation_count=0,
        assistant_question_count=0,
        time_spent_seconds=0,
        last_accessed_at=datetime.utcnow(),
        lesson=SimpleNamespace(course_id=1101),
    )
    values.update(overrides)
    return SimpleNamespace(**values)


# ---------------------------------------------------------------- negative authorization
def protected_routes():
    for route in app.routes:
        if not isinstance(route, APIRoute):
            continue
        for method in route.methods - {"HEAD", "OPTIONS"}:
            if (method, route.path) not in PUBLIC_ROUTES and not route.path.startswith(("/docs", "/redoc")):
                yield method, route.path


@pytest.mark.parametrize("method,path", sorted(set(protected_routes())))
def test_protected_endpoint_rejects_anonymous_caller(api, method, path):
    client, *_ = api
    concrete = path
    for name in ("user_id", "lesson_id", "course_id", "question_id", "attempt_id", "result_id",
                 "assignment_id", "submission_id", "material_id", "post_id"):
        concrete = concrete.replace("{" + name + "}", "1")
    concrete = concrete.replace("{workflow_id}", "wf")
    assert client.request(method, concrete, json={}).status_code == 401


@pytest.mark.parametrize("method,path", TEACHER_ONLY)
def test_teacher_endpoint_rejects_student(api, method, path):
    client, _, _, headers = api
    assert client.request(method, path, json={}, headers=headers["student"]).status_code == 403


@pytest.mark.parametrize(
    "template",
    [
        "/api/learning/users/{id}/dashboard",
        "/api/learning/users/{id}/events",
        "/api/learning/users/{id}/lessons/110101/progress",
        "/api/quiz/attempts/user/{id}",
        "/api/quiz/results/user/{id}",
        "/api/chat/history/{id}",
    ],
)
def test_student_cannot_read_another_student(api, template):
    client, _, identities, headers = api
    assert client.get(template.format(id=identities["student"]), headers=headers["other"]).status_code == 403


def test_student_cannot_write_or_finalize_for_another_student(api):
    client, _, identities, headers = api
    victim = identities["student"]
    assert client.post(f"/api/learning/users/{victim}/events", json=event("attack-event-01"),
                       headers=headers["other"]).status_code == 403
    assert client.post(f"/api/learning/users/{victim}/events/batch", json=[event("attack-event-02")],
                       headers=headers["other"]).status_code == 403
    assert client.post(f"/api/quiz/attempts?user_id={victim}", json={"lesson_id": LESSON},
                       headers=headers["other"]).status_code == 403
    attempt = client.post(f"/api/quiz/attempts?user_id={victim}", json={"lesson_id": LESSON},
                          headers=headers["student"]).json()["id"]
    assert client.post(f"/api/quiz/attempts/{attempt}/finalize", json={},
                       headers=headers["other"]).status_code == 403


@pytest.mark.parametrize("kind", ["garbage", "wrong_key", "expired", "alg_none", "no_subject", "unknown_user"])
def test_invalid_tokens_are_rejected(api, kind):
    client, *_ = api
    claims = {"sub": "student_test", "exp": datetime.utcnow() + timedelta(minutes=5)}
    token = {
        "garbage": lambda: "not.a.jwt",
        "wrong_key": lambda: jwt.encode(claims, "another-secret", algorithm="HS256"),
        "expired": lambda: create_access_token({"sub": "student_test"}, timedelta(seconds=-5)),
        "alg_none": lambda: "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ0ZWFjaGVyX3Rlc3QifQ.",
        "no_subject": lambda: create_access_token({"role": "teacher"}),
        "unknown_user": lambda: create_access_token({"sub": "ghost"}),
    }[kind]()
    assert client.get("/api/auth/me", headers=bearer(token)).status_code == 401


def test_inactive_account_cannot_log_in_or_reuse_token(api):
    client, Session, _, headers = api
    with Session() as db:
        db.query(User).filter_by(username="student_test").update({"is_active": False})
        db.commit()
    assert client.get("/api/auth/me", headers=headers["student"]).status_code == 401
    login = client.post("/api/auth/login", json={"username": "student_test", "password": "student-pass"})
    assert login.status_code == 403


def test_login_rejects_wrong_password_and_admin_self_registration(api):
    client, *_ = api
    assert client.post("/api/auth/login", json={"username": "student_test", "password": "wrong"}).status_code == 401
    registration = client.post("/api/auth/register", json={
        "username": "self_admin", "email": "self.admin@example.com", "password": "admin-pass",
        "full_name": "Admin", "role": "admin", "student_class": "",
    })
    assert registration.status_code == 403


def test_password_hash_is_never_returned(api):
    client, *_ = api
    credentials = {"username": "fresh_student", "password": "fresh-pass-1"}
    registration = client.post("/api/auth/register", json={
        **credentials, "email": "fresh.student@example.com", "full_name": "Fresh", "role": "student",
        "student_class": "11A1",
    })
    login = client.post("/api/auth/login", json=credentials)
    assert registration.status_code == 201 and login.status_code == 200
    assert "password" not in registration.text and "password" not in login.text


# ---------------------------------------------------------------- WebSocket
@pytest.mark.parametrize("query", ["", "?token=invalid"])
def test_websocket_refuses_missing_or_invalid_token(api, query):
    client, *_ = api
    with pytest.raises(WebSocketDisconnect) as closed:
        with client.websocket_connect(f"/api/ws/learning{query}"):
            pass
    assert closed.value.code == 4401


def test_websocket_delivers_own_update_and_tolerates_heartbeat(api):
    client, _, identities, headers = api
    token = headers["student"]["Authorization"].split()[1]
    with client.websocket_connect(f"/api/ws/learning?token={token}") as socket:
        assert socket.receive_json() == {"type": "connected", "user_id": identities["student"]}
        socket.send_text("ping")
        assert client.post(f"/api/learning/users/{identities['student']}/events", json=event("socket-event-01"),
                           headers=headers["student"]).status_code == 201
        update = socket.receive_json()
        assert update["type"] == "learning_update" and update["lesson_id"] == LESSON


# ---------------------------------------------------------------- offline sync and idempotency
def test_retried_batch_does_not_duplicate_events_or_progress(api):
    client, Session, identities, headers = api
    url = f"/api/learning/users/{identities['student']}/events/batch"
    batch = [event("retry-event-01", duration_seconds=30),
             event("retry-event-02", event_type="simulation_opened", duration_seconds=30)]
    first = client.post(url, json=batch, headers=headers["student"])
    second = client.post(url, json=batch, headers=headers["student"])
    assert first.status_code == second.status_code == 200
    assert [row["id"] for row in first.json()] == [row["id"] for row in second.json()]
    with Session() as db:
        assert db.query(LearningEvent).count() == 2
        progress = db.query(LessonProgress).one()
        assert progress.time_spent_seconds == 60
        assert progress.view_count == 1 and progress.simulation_count == 1


def test_partially_delivered_batch_only_adds_the_missing_event(api):
    client, Session, identities, headers = api
    url = f"/api/learning/users/{identities['student']}/events/batch"
    client.post(url, json=[event("partial-event-01")], headers=headers["student"])
    client.post(url, json=[event("partial-event-01"), event("partial-event-02")], headers=headers["student"])
    with Session() as db:
        assert db.query(LearningEvent).count() == 2
        assert db.query(LessonProgress).one().view_count == 2


def test_batch_limit_and_unknown_lesson_leave_no_partial_data(api):
    client, Session, identities, headers = api
    url = f"/api/learning/users/{identities['student']}/events/batch"
    oversized = [event(f"limit-event-{index:04d}") for index in range(101)]
    assert client.post(url, json=oversized, headers=headers["student"]).status_code == 422
    mixed = [event("valid-event-01"), event("missing-lesson-01", lesson_id=999)]
    assert client.post(url, json=mixed, headers=headers["student"]).status_code == 404
    with Session() as db:
        assert db.query(LearningEvent).count() == 0


@pytest.mark.parametrize("payload", [
    {"client_event_id": "short"},
    {"client_event_id": "x" * 81},
    {"duration_seconds": -1},
    {"score": 101},
])
def test_event_validation_rejects_out_of_range_input(api, payload):
    client, _, identities, headers = api
    body = {**event("validation-event-01"), **payload}
    url = f"/api/learning/users/{identities['student']}/events"
    assert client.post(url, json=body, headers=headers["student"]).status_code == 422


def test_quiz_finalized_twice_with_new_event_id_counts_once(api):
    client, Session, identities, headers = api
    attempt = client.post(f"/api/quiz/attempts?user_id={identities['student']}", json={"lesson_id": LESSON},
                          headers=headers["student"]).json()["id"]
    for identifier in ("finalize-event-01", "finalize-event-02"):
        assert client.post(f"/api/quiz/attempts/{attempt}/finalize", json={"client_event_id": identifier},
                           headers=headers["student"]).status_code == 200
    with Session() as db:
        assert db.query(LessonProgress).one().quiz_attempt_count == 1


# ---------------------------------------------------------------- AI integration (no live model)
@pytest.fixture
def anyio_backend():
    return "asyncio"


class FakeGemini:
    """Replaces only the network transport, so request building and parsing still run."""

    def __init__(self, monkeypatch, handler):
        self.requests = []

        def wrapped(request):
            self.requests.append(request)
            return handler(request)

        real_client = httpx.AsyncClient
        monkeypatch.setattr(ai_tutor.httpx, "AsyncClient",
                            lambda **kwargs: real_client(transport=httpx.MockTransport(wrapped), **kwargs))
        monkeypatch.setattr(settings, "ai_api_key", "test-key-not-real")
        monkeypatch.setattr(settings, "ai_provider", "gemini")
        monkeypatch.setattr(settings, "enable_chatbot", True)


def gemini_answer(text):
    return httpx.Response(200, json={"candidates": [{"content": {"parts": [{"text": text}]}}]})


@pytest.mark.anyio
@pytest.mark.parametrize("response,fragment", [
    (httpx.Response(429), "HTTP 429"),
    (httpx.Response(500), "HTTP 500"),
    (httpx.Response(200, json={"promptFeedback": {"blockReason": "SAFETY"}}), "blocked"),
    (httpx.Response(200, json={"candidates": []}), "no answer"),
    (httpx.Response(200, json={"candidates": [{"content": {"parts": [{"text": "  "}]}}]}), "empty"),
    (httpx.Response(200, text="not json"), "invalid"),
])
async def test_provider_failures_become_tutor_errors(monkeypatch, response, fragment):
    FakeGemini(monkeypatch, lambda request: response)
    with pytest.raises(AITutorError, match=fragment):
        await generate_ai_tutor_reply("Hỏi")


@pytest.mark.anyio
@pytest.mark.parametrize("failure", [httpx.ConnectError, httpx.ReadTimeout])
async def test_network_failures_become_tutor_errors(monkeypatch, failure):
    def fail(request):
        raise failure("network down", request=request)

    FakeGemini(monkeypatch, fail)
    with pytest.raises(AITutorError, match="temporarily unavailable"):
        await generate_ai_tutor_reply("Hỏi")


@pytest.mark.anyio
async def test_request_carries_lesson_context_and_key_stays_in_header(monkeypatch):
    fake = FakeGemini(monkeypatch, lambda request: gemini_answer("Trả lời"))
    lesson = SimpleNamespace(title="Bài 18", description="Động cơ", content="Nạp, nén, cháy, thải")
    assert await generate_ai_tutor_reply("Hỏi", lesson=lesson) == "Trả lời"
    request = fake.requests[0]
    assert "test-key-not-real" not in str(request.url)
    assert request.headers["x-goog-api-key"] == "test-key-not-real"
    assert "Bài 18" in json.loads(request.content)["contents"][-1]["parts"][0]["text"]


def test_chat_marks_fallback_when_provider_is_down_and_gemini_when_it_answers(api, monkeypatch):
    client, Session, identities, headers = api
    url = f"/api/chat/message?user_id={identities['student']}"
    monkeypatch.setattr(settings, "ai_api_key", None)
    body = {"user_message": "Kỳ nào của động cơ 4 kỳ sinh công?", "lesson_id": LESSON}
    fallback = client.post(url, json=body, headers=headers["student"])
    assert fallback.status_code == 201
    assert fallback.json()["response_mode"] == "fallback"
    assert "cháy" in fallback.json()["ai_response"]

    FakeGemini(monkeypatch, lambda request: gemini_answer("Câu trả lời mô phỏng"))
    live = client.post(url, json=body, headers=headers["student"])
    assert live.json()["response_mode"] == "gemini"
    with Session() as db:
        assert db.query(ChatHistory).count() == 2


@pytest.mark.parametrize("message,expected", [
    ("", "nhập câu hỏi"),
    ("piston đi thế nào", "nạp, nén"),
    ("em làm sai bài kiểm tra", "ôn lại"),
    ("bản vẽ hình chiếu", "quy trình thiết kế"),
    ("thời tiết hôm nay", "khái niệm"),
])
def test_fallback_is_a_fixed_keyword_template_not_a_model(message, expected):
    assert expected in build_tutor_reply(message)


# ---------------------------------------------------------------- analytics rules
@pytest.mark.parametrize("state,score,level", [
    (dict(), 0, "low"),
    (dict(progress_percent=20), 40, "medium"),
    (dict(progress_percent=69, simulation_count=1), 25, "low"),
    (dict(progress_percent=70), 15, "low"),
    (dict(progress_percent=75, simulation_count=1, quiz_attempt_count=1, best_quiz_score=59), 45, "medium"),
    (dict(progress_percent=75, simulation_count=1, quiz_attempt_count=1, best_quiz_score=60), 0, "low"),
    (dict(progress_percent=75, quiz_attempt_count=1, best_quiz_score=40), 60, "medium"),
    (dict(progress_percent=50, quiz_attempt_count=1, best_quiz_score=40), 85, "high"),
])
def test_risk_boundaries(state, score, level):
    result = lesson_analytics(progress_state(**state))
    assert (result["risk_score"], result["risk_level"]) == (score, level)


def test_inactivity_starts_counting_at_seven_days():
    def risk(days):
        return lesson_analytics(progress_state(progress_percent=100, simulation_count=1,
                                               last_accessed_at=datetime.utcnow() - timedelta(days=days)))["risk_score"]
    assert (risk(6), risk(7)) == (0, 15)


def test_mastery_imputes_neutral_quiz_score_when_no_quiz_exists():
    assert lesson_analytics(progress_state())["mastery_score"] == 20
    assert lesson_analytics(progress_state(quiz_attempt_count=1, best_quiz_score=0))["mastery_score"] == 0


def test_scores_stay_in_range_for_extreme_counts():
    result = lesson_analytics(progress_state(progress_percent=100, quiz_attempt_count=9, best_quiz_score=100,
                                             view_count=99, simulation_count=99, assistant_question_count=99,
                                             time_spent_seconds=10**6))
    assert result["mastery_score"] <= 100 and result["engagement_score"] <= 100


# ---------------------------------------------------------------- seeded catalogue
def test_server_question_bank_matches_reported_structure():
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    lessons = {lesson["id"] for lesson in catalog["lessons"]}
    questions = catalog["questions"]
    assert (len(catalog["courses"]), len(lessons), len(questions)) == (19, 73, 146)
    assert len({question["id"] for question in questions}) == 146
    assert all(question["lesson_id"] in lessons for question in questions)
    assert all(question["question_type"] == "multiple_choice" for question in questions)
    assert all(len(question["options"]) == 3 for question in questions)
    assert all(sum(option["is_correct"] for option in question["options"]) == 1 for question in questions)


# ---------------------------------------------------------------- regressions for fixed defects
# Regression D1
def test_teacher_of_one_class_cannot_read_student_of_another_class(api):
    client, Session, identities, headers = api
    with Session() as db:
        db.query(User).filter_by(username="teacher_test").update({"student_class": "11A1"})
        db.commit()
    url = f"/api/learning/users/{identities['other']}/dashboard"
    assert client.get(url, headers=headers["teacher"]).status_code == 403


# Regression D2
def test_teacher_without_class_gets_no_school_wide_analytics(api):
    client, _, _, headers = api
    response = client.get("/api/learning/teacher/analytics", headers=headers["teacher"])
    assert response.json()["summary"]["total_students"] == 0


# Regression D3
def test_event_id_reused_by_another_user_does_not_return_their_event(api):
    client, _, identities, headers = api
    client.post(f"/api/learning/users/{identities['student']}/events",
                json=event("shared-event-01", payload={"note": "private"}), headers=headers["student"])
    response = client.post(f"/api/learning/users/{identities['other']}/events", json=event("shared-event-01"),
                           headers=headers["other"])
    assert response.status_code == 201
    assert response.json()["user_id"] == identities["other"]
    assert response.json()["payload"] is None


def test_duplicate_id_inside_one_batch_is_collapsed(api):
    client, Session, identities, headers = api
    response = client.post(f"/api/learning/users/{identities['student']}/events/batch",
                           json=[event("same-batch-01"), event("same-batch-01")], headers=headers["student"])
    assert response.status_code == 200
    with Session() as db:
        assert db.query(LearningEvent).count() == 1


# Regression D4
def test_duplicate_id_of_lesson_less_events_inside_one_batch_is_collapsed(api):
    _, _, identities, headers = api
    client = TestClient(app, raise_server_exceptions=False)
    body = [event("same-batch-02", lesson_id=None), event("same-batch-02", lesson_id=None)]
    response = client.post(f"/api/learning/users/{identities['student']}/events/batch", json=body,
                           headers=headers["student"])
    assert response.status_code == 200


# Regression D5
def test_student_cannot_self_report_quiz_score_through_events(api):
    client, Session, identities, headers = api
    client.post(f"/api/learning/users/{identities['student']}/events",
                json=event("self-score-01", event_type="quiz_submitted", score=100), headers=headers["student"])
    with Session() as db:
        assert db.query(LessonProgress).one().best_quiz_score == 0


# Regression D5
def test_student_cannot_self_report_completion_through_progress_update(api):
    client, Session, identities, headers = api
    response = client.put(f"/api/learning/users/{identities['student']}/lessons/{LESSON}/progress",
                          json={"progress_percent": 100, "quiz_score": 100}, headers=headers["student"])
    assert response.status_code == 403
    with Session() as db:
        assert db.query(LessonProgress).count() == 0


# Regression D6
def test_question_can_only_be_scored_once_per_attempt(api):
    client, Session, identities, headers = api
    attempt = client.post(f"/api/quiz/attempts?user_id={identities['student']}", json={"lesson_id": LESSON},
                          headers=headers["student"]).json()["id"]
    url = f"/api/quiz/submit?user_id={identities['student']}"
    client.post(url, json={"question_id": Q2, "attempt_id": attempt, "selected_answer": WRONG_Q2,
                           "time_spent_seconds": 1}, headers=headers["student"])
    for _ in range(3):
        client.post(url, json={"question_id": Q1, "attempt_id": attempt, "selected_answer": RIGHT_Q1,
                               "time_spent_seconds": 1}, headers=headers["student"])
    with Session() as db:
        assert db.query(QuizAttempt).one().score_percent == 50


# Regression D6
def test_finalized_attempt_rejects_more_answers(api):
    client, _, identities, headers = api
    attempt = client.post(f"/api/quiz/attempts?user_id={identities['student']}", json={"lesson_id": LESSON},
                          headers=headers["student"]).json()["id"]
    client.post(f"/api/quiz/attempts/{attempt}/finalize", json={}, headers=headers["student"])
    late = client.post(f"/api/quiz/submit?user_id={identities['student']}",
                       json={"question_id": Q1, "attempt_id": attempt, "selected_answer": RIGHT_Q1,
                             "time_spent_seconds": 1}, headers=headers["student"])
    assert late.status_code == 409


# Regression D7
def test_assignment_submission_cannot_impersonate_another_student(api):
    client, Session, identities, headers = api
    with Session() as db:
        assignment = Assignment(title="Bài tập", description="Mô tả", status="published")
        db.add(assignment)
        db.commit()
        assignment_id = assignment.id
    client.post(f"/api/classroom/assignments/{assignment_id}/submissions",
                data={"student_user_id": identities["student"], "content": "Giả mạo"}, headers=headers["other"])
    with Session() as db:
        assert db.query(AssignmentSubmission).one().student_user_id == identities["other"]


# Regression D8
def test_student_cannot_list_draft_posts(api):
    client, Session, _, headers = api
    with Session() as db:
        db.add(ClassroomPost(title="Nháp", body="Nội dung", status="draft"))
        db.commit()
    response = client.get("/api/classroom/posts?status_filter=draft", headers=headers["student"])
    assert response.json() == []


def test_student_who_only_took_a_quiz_is_not_reported_as_inactive(api):
    client, Session, identities, headers = api
    attempt = client.post(f"/api/quiz/attempts?user_id={identities['student']}", json={"lesson_id": LESSON},
                          headers=headers["student"]).json()["id"]
    client.post(f"/api/quiz/attempts/{attempt}/finalize", json={}, headers=headers["student"])
    with Session() as db:
        progress = db.query(LessonProgress).one()
        assert not any("lâu" in reason for reason in lesson_analytics(progress)["risk_reasons"])


# Regression D9
def test_quiz_status_uses_one_pass_mark(api):
    client, Session, identities, headers = api
    with Session() as db:
        attempt = QuizAttempt(user_id=identities["student"], lesson_id=LESSON, status="in_progress",
                              total_questions=3, correct_answers=2, total_points=3, points_earned=2,
                              score_percent=66.67)
        db.add(attempt)
        db.commit()
        attempt_id = attempt.id
    client.post(f"/api/quiz/attempts/{attempt_id}/finalize", json={}, headers=headers["student"])
    with Session() as db:
        assert db.query(LessonProgress).one().status != "needs_review"


# ---------------------------------------------------------------- class scope, positive cases
def assign_teacher_classes(Session, classes):
    with Session() as db:
        db.query(User).filter_by(username="teacher_test").update({"student_class": classes})
        db.commit()


def test_teacher_reads_students_of_every_assigned_class_only(api):
    client, Session, identities, headers = api
    assign_teacher_classes(Session, "11A1, 11A3")
    assert client.get(f"/api/learning/users/{identities['student']}/dashboard",
                      headers=headers["teacher"]).status_code == 200
    assert client.get(f"/api/quiz/attempts/user/{identities['other']}",
                      headers=headers["teacher"]).status_code == 403
    summary = client.get("/api/learning/teacher/analytics", headers=headers["teacher"]).json()
    assert summary["summary"]["total_students"] == 1
    assert summary["needs_class_assignment"] is False


def test_unassigned_teacher_is_told_why_analytics_are_empty(api):
    client, _, _, headers = api
    assert client.get("/api/learning/teacher/analytics", headers=headers["teacher"]).json()["needs_class_assignment"]


def test_administrator_reads_every_class(api):
    client, Session, identities, headers = api
    with Session() as db:
        db.query(User).filter_by(username="teacher_test").update({"role": "admin"})
        db.commit()
    assert client.get(f"/api/learning/users/{identities['other']}/dashboard",
                      headers=headers["teacher"]).status_code == 200


def test_staff_can_still_correct_progress_within_scope(api):
    client, Session, identities, headers = api
    assign_teacher_classes(Session, "11A1")
    url = f"/api/learning/users/{identities['student']}/lessons/{LESSON}/progress"
    assert client.put(url, json={"progress_percent": 50}, headers=headers["teacher"]).status_code == 200


def test_teacher_only_receives_live_updates_of_assigned_classes(api):
    client, Session, identities, headers = api
    assign_teacher_classes(Session, "11A1")
    token = headers["teacher"]["Authorization"].split()[1]
    with client.websocket_connect(f"/api/ws/learning?token={token}") as socket:
        socket.receive_json()
        client.post(f"/api/learning/users/{identities['other']}/events", json=event("other-class-event"),
                    headers=headers["other"])
        client.post(f"/api/learning/users/{identities['student']}/events", json=event("own-class-event-1"),
                    headers=headers["student"])
        assert socket.receive_json()["user_id"] == identities["student"]


def test_teacher_only_sees_and_grades_submissions_of_assigned_classes(api):
    client, Session, identities, headers = api
    assign_teacher_classes(Session, "11A1")
    with Session() as db:
        assignment = Assignment(title="Bài tập", description="Mô tả", status="published")
        db.add(assignment)
        db.commit()
        assignment_id = assignment.id
    url = f"/api/classroom/assignments/{assignment_id}/submissions"
    client.post(url, data={"content": "Bài của lớp khác"}, headers=headers["other"])
    client.post(url, data={"content": "Bài trong lớp"}, headers=headers["student"])
    visible = client.get(url, headers=headers["teacher"]).json()
    assert [item["student_user_id"] for item in visible] == [identities["student"]]
    with Session() as db:
        other_submission = db.query(AssignmentSubmission).filter_by(student_user_id=identities["other"]).one().id
    assert client.patch(f"/api/classroom/submissions/{other_submission}/grade", json={"score": 9, "feedback": ""},
                        headers=headers["teacher"]).status_code == 404


def test_teacher_can_list_drafts(api):
    client, Session, _, headers = api
    with Session() as db:
        db.add(ClassroomPost(title="Nháp", body="Nội dung", status="draft"))
        db.commit()
    assert len(client.get("/api/classroom/posts?status_filter=draft", headers=headers["teacher"]).json()) == 1


# ---------------------------------------------------------------- quiz integrity
def test_answer_from_another_lesson_is_rejected(api):
    client, Session, identities, headers = api
    attempt = client.post(f"/api/quiz/attempts?user_id={identities['student']}", json={"lesson_id": LESSON},
                          headers=headers["student"]).json()["id"]
    with Session() as db:
        db.query(QuizAttempt).filter_by(id=attempt).update({"lesson_id": 999})
        db.commit()
    response = client.post(f"/api/quiz/submit?user_id={identities['student']}", json={
        "question_id": Q1, "attempt_id": attempt, "selected_answer": RIGHT_Q1, "time_spent_seconds": 1,
    }, headers=headers["student"])
    assert response.status_code == 422


def test_retried_answer_returns_the_first_result(api):
    client, _, identities, headers = api
    attempt = client.post(f"/api/quiz/attempts?user_id={identities['student']}", json={"lesson_id": LESSON},
                          headers=headers["student"]).json()["id"]
    url = f"/api/quiz/submit?user_id={identities['student']}"
    answer = {"question_id": Q1, "attempt_id": attempt, "selected_answer": RIGHT_Q1, "time_spent_seconds": 1}
    first = client.post(url, json=answer, headers=headers["student"]).json()
    changed = client.post(url, json={**answer, "selected_answer": "11010002"}, headers=headers["student"]).json()
    assert changed["id"] == first["id"] and changed["is_correct"] is True


def test_finalize_tolerates_an_event_id_that_already_synced(api):
    client, Session, identities, headers = api
    client.post(f"/api/learning/users/{identities['student']}/events",
                json=event("quiz-synced-first", event_type="quiz_submitted", score=50), headers=headers["student"])
    attempt = client.post(f"/api/quiz/attempts?user_id={identities['student']}", json={"lesson_id": LESSON},
                          headers=headers["student"]).json()["id"]
    response = client.post(f"/api/quiz/attempts/{attempt}/finalize", json={"client_event_id": "quiz-synced-first"},
                           headers=headers["student"])
    assert response.status_code == 200
    with Session() as db:
        assert db.query(LessonProgress).one().quiz_attempt_count == 1


def test_option_order_is_stable_per_learner_and_differs_between_learners(api):
    client, Session, _, headers = api
    with Session() as db:
        from models import QuestionOption
        db.add_all(QuestionOption(id=11010100 + n, question_id=Q1, text=f"Nhiễu {n}", is_correct=False, order=3 + n)
                   for n in range(6))
        db.commit()

    def order(role):
        questions = client.get(f"/api/lessons/{LESSON}/questions", headers=headers[role]).json()
        return [option["id"] for question in questions if question["id"] == Q1 for option in question["options"]]

    assert order("student") == order("student")
    assert order("student") != order("other")


def test_catalog_does_not_reveal_the_answer_by_position_or_id():
    questions = json.loads(CATALOG.read_text(encoding="utf-8"))["questions"]

    def correct(question):
        return next(option for option in question["options"] if option["is_correct"])

    positions = {correct(question)["order"] for question in questions}
    id_ranks = {sorted(o["id"] for o in question["options"]).index(correct(question)["id"]) for question in questions}
    assert positions == {1, 2, 3} and id_ranks == {0, 1, 2}


# ---------------------------------------------------------------- score reporting
def test_dashboard_reports_missing_quiz_evidence_and_score_caveat(api):
    client, _, identities, headers = api
    client.post(f"/api/learning/users/{identities['student']}/events", json=event("no-quiz-event-01"),
                headers=headers["student"])
    dashboard = client.get(f"/api/learning/users/{identities['student']}/dashboard", headers=headers["student"]).json()
    assert dashboard["active_lessons"] == 1
    assert dashboard["active_lessons_without_quiz"] == 1
    assert dashboard["lesson_progress"][0]["id"] > 0
    assert "chưa được hiệu chuẩn" in dashboard["score_note"]
    assert len(dashboard["lesson_progress"]) == 1


# ---------------------------------------------------------------- evaluation tooling
def test_ai_evaluation_screening_flags_missing_and_forbidden_terms():
    from scripts.evaluate_ai_tutor import screen_answer

    item = {"must_include_all": ["nén"], "must_include_any": ["cháy", "nổ"], "must_not_include": ["trang 512 nêu"]}
    assert screen_answer(item, "Kì nén và kì cháy") == []
    assert len(screen_answer(item, "Trang 512 nêu kì thải")) == 3


def test_ai_evaluation_set_covers_every_reviewer_category():
    evaluation = json.loads((CATALOG.parent / "ai_tutor_eval_set.json").read_text(encoding="utf-8"))
    assert {"correctness", "safety", "hallucination", "privacy"} <= {item["category"] for item in evaluation["items"]}


def test_question_bank_audit_reports_the_template_weakness_until_the_bank_is_rewritten():
    from scripts.audit_question_bank import audit

    report = audit(json.loads(CATALOG.read_text(encoding="utf-8")))
    assert report["questions"] == 146 and report["options"] == 438
    assert report["by_type"] == {"multiple_choice": 146}
    assert report["distinct_distractors"] >= 4


def test_reading_a_dashboard_or_progress_never_writes(api):
    client, Session, identities, headers = api
    assert client.get(f"/api/learning/users/{identities['student']}/dashboard",
                      headers=headers["student"]).json()["lesson_progress"][0]["status"] == "not_started"
    assert client.get(f"/api/learning/users/{identities['student']}/lessons/{LESSON}/progress",
                      headers=headers["student"]).status_code == 200
    with Session() as db:
        assert db.query(LessonProgress).count() == 0
