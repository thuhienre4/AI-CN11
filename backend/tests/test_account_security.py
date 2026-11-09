import pytest
from starlette.websockets import WebSocketDisconnect

from auth import create_access_token, hash_password
from auth.passwords import LoginGuard, login_guard, password_problem
from config import DEFAULT_SECRET_KEY, Settings, secret_key_problem
from models import AccountReview, LearningEvent, LessonProgress, User
from test_learning_workflow import api  # noqa: F401  (pytest fixture)

PASSWORD = "student-pass"  # what the fixture sets; set before the strength rule existed


@pytest.fixture(autouse=True)
def fresh_guard():
    login_guard.clear()
    yield
    login_guard.clear()


@pytest.fixture()
def account(api):
    """The shared fixture's student uses a reserved .test address, which a login response refuses."""
    _, Session, *_ = api
    with Session() as db:
        db.query(User).filter_by(username="student_test").update({"email": "student@example.com"})
        db.commit()
    return api


def login(client, username="student_test", password=PASSWORD):
    return client.post("/api/auth/login", json={"username": username, "password": password})


def bearer(token):
    return {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------------- passwords
@pytest.mark.parametrize("password, reason", [
    ("ngan1", "ít nhất 8"),
    ("chicochu", "chữ và số"),
    ("12345678", "chữ và số"),
    ("matkhau123", "phổ biến"),
    ("annguyen2026", "tên đăng nhập"),
])
def test_weak_passwords_are_explained(password, reason):
    assert reason in password_problem(password, "annguyen")


def test_a_reasonable_password_passes():
    assert password_problem("Dongco4ki-2026", "annguyen") is None


def test_registration_refuses_a_weak_password_and_names_the_field(api):
    client, *_ = api
    response = client.post("/api/auth/register", json={
        "username": "yeu_mk", "email": "yeu@example.com", "password": "khongcoso", "full_name": "A", "role": "student",
    })
    assert response.status_code == 422
    assert response.json()["errors"][0]["loc"][-1] == "password"


# ---------------------------------------------------------------- guessing
def test_five_wrong_passwords_lock_the_account_for_a_while(api):
    client, *_ = api
    for _ in range(5):
        assert login(client, password="sai-mat-khau-1").status_code == 401
    locked = login(client)  # even the right password waits now
    assert locked.status_code == 429
    assert "thử lại sau" in locked.json()["detail"]
    assert int(locked.headers["Retry-After"]) > 0


def test_a_successful_login_clears_the_count_of_its_account():
    guard = LoginGuard(per_account=3, per_address=100)
    for _ in range(2):
        guard.failed("an", "1.2.3.4", now=0)
    guard.succeeded("an")
    guard.failed("an", "1.2.3.4", now=1)
    assert guard.wait_seconds("an", "1.2.3.4", now=2) == 0


def test_one_address_trying_many_accounts_is_slowed_down_and_the_lock_expires():
    guard = LoginGuard(per_account=5, per_address=3, window_seconds=60)
    for name in ("a", "b", "c"):
        guard.failed(name, "9.9.9.9", now=0)
    assert guard.wait_seconds("d", "9.9.9.9", now=10) > 0
    assert guard.wait_seconds("d", "8.8.8.8", now=10) == 0
    assert guard.wait_seconds("d", "9.9.9.9", now=61) == 0


# ---------------------------------------------------------------- sessions
def test_changing_the_password_signs_out_every_other_device(account):
    client, *_ = account
    old_token = login(client).json()["access_token"]
    assert client.post("/api/auth/change-password", json={"current_password": "sai-roi-1", "new_password": "Moi-2026-an"},
                       headers=bearer(old_token)).status_code == 403
    assert client.post("/api/auth/change-password", json={"current_password": PASSWORD, "new_password": "khongcoso"},
                       headers=bearer(old_token)).status_code == 422
    changed = client.post("/api/auth/change-password", json={"current_password": PASSWORD, "new_password": "Moi-2026-an"},
                          headers=bearer(old_token))
    assert changed.status_code == 200
    assert client.get("/api/auth/me", headers=bearer(old_token)).status_code == 401
    assert client.get("/api/auth/me", headers=bearer(changed.json()["access_token"])).status_code == 200
    assert login(client).status_code == 401
    assert login(client, password="Moi-2026-an").status_code == 200


def test_sign_out_everywhere_also_closes_live_sockets_opened_with_old_tokens(account):
    client, *_ = account
    old_token = login(client).json()["access_token"]
    new_token = client.post("/api/auth/logout-all", headers=bearer(old_token)).json()["access_token"]
    assert client.get("/api/auth/me", headers=bearer(old_token)).status_code == 401
    assert client.get("/api/auth/me", headers=bearer(new_token)).status_code == 200
    with pytest.raises(WebSocketDisconnect) as closed:
        with client.websocket_connect("/api/ws/learning") as socket:
            socket.send_json({"type": "auth", "token": old_token})
            socket.receive_json()
    assert closed.value.code == 4401


def test_a_token_with_a_forged_version_is_refused(api):
    client, *_ = api
    forged = create_access_token({"sub": "student_test", "ver": 7})
    assert client.get("/api/auth/me", headers=bearer(forged)).status_code == 401


# ---------------------------------------------------------------- personal data
def test_a_person_can_download_everything_kept_about_them_and_nothing_about_others(api):
    client, Session, identities, headers = api
    with Session() as db:
        db.add(LearningEvent(user_id=identities["student"], lesson_id=110101, event_type="lesson_viewed", client_event_id="mine"))
        db.add(LearningEvent(user_id=identities["other"], lesson_id=110101, event_type="lesson_viewed", client_event_id="theirs"))
        db.commit()
    response = client.get("/api/auth/me/data", headers=headers["student"])
    assert response.status_code == 200
    assert "attachment" in response.headers["content-disposition"]
    data = response.json()
    assert data["account"]["username"] == "student_test"
    assert "password_hash" not in data["account"]
    assert [event["client_event_id"] for event in data["learning_events"]] == ["mine"]


def test_a_student_can_delete_the_account_and_its_learning_data(api):
    client, Session, identities, headers = api
    student_id = identities["student"]
    with Session() as db:
        db.add(LearningEvent(user_id=student_id, lesson_id=110101, event_type="lesson_viewed", client_event_id="e1"))
        db.add(LessonProgress(user_id=student_id, lesson_id=110101, progress_percent=40))
        db.add(AccountReview(user_id=student_id, reviewer_id=identities["teacher"], decision="approve", note="", classes="11A1"))
        db.commit()
    assert client.request("DELETE", "/api/auth/me", json={"password": "sai-roi-1"}, headers=headers["student"]).status_code == 403
    assert client.request("DELETE", "/api/auth/me", json={"password": PASSWORD}, headers=headers["student"]).status_code == 204
    with Session() as db:
        assert db.query(User).filter_by(id=student_id).count() == 0
        assert db.query(LearningEvent).filter_by(user_id=student_id).count() == 0
        assert db.query(LessonProgress).filter_by(user_id=student_id).count() == 0
        assert db.query(AccountReview).filter_by(user_id=student_id).count() == 0
    assert login(client).status_code == 401


def test_staff_accounts_are_closed_by_an_administrator_not_by_themselves(api):
    client, Session, _, headers = api
    with Session() as db:
        db.query(User).filter_by(username="teacher_test").update({"password_hash": hash_password("teacher-pass")})
        db.commit()
    response = client.request("DELETE", "/api/auth/me", json={"password": "teacher-pass"}, headers=headers["teacher"])
    assert response.status_code == 403


# ---------------------------------------------------------------- server set-up
def test_a_hosted_server_refuses_the_default_or_a_short_signing_key():
    default = Settings(secret_key=DEFAULT_SECRET_KEY, environment="development")
    assert secret_key_problem(default, {}) is None  # a developer's own machine
    assert secret_key_problem(default, {"RAILWAY_ENVIRONMENT": "production"})  # Railway, even without ENVIRONMENT set
    assert secret_key_problem(Settings(secret_key="short", environment="production"), {})
    assert secret_key_problem(Settings(secret_key="x" * 48, environment="production"), {}) is None


def test_every_api_answer_carries_protective_headers(api):
    client, *_ = api
    response = client.get("/api/auth/me")
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["x-frame-options"] == "DENY"
    assert response.headers["referrer-policy"] == "no-referrer"
    assert response.headers["cache-control"] == "no-store"
