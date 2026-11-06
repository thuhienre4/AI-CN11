import pytest

from datetime import datetime, timedelta

from auth import create_access_token
from config import settings
from models import AccountReview, ClassJoinCode, User
from routes.accounts import CODE_ALPHABET, CODE_LENGTH, MAX_FAILED_CODES, failed_code_attempts
from test_learning_workflow import api  # noqa: F401  (pytest fixture)

PASSWORD = "account-pass-1"


def register(client, username, role="student", student_class="11A1", **extra):
    return client.post("/api/auth/register", json={
        "username": username, "email": f"{username}@example.com", "password": PASSWORD,
        "full_name": username, "role": role, "student_class": student_class, **extra,
    })


def bearer(username):
    return {"Authorization": f"Bearer {create_access_token({'sub': username})}"}


def update_user(Session, current_username, **fields):
    with Session() as db:
        db.query(User).filter_by(username=current_username).update(fields)
        db.commit()


@pytest.fixture(autouse=True)
def forget_failed_codes():
    failed_code_attempts.clear()


@pytest.fixture()
def school(api):
    """teacher_test teaches 11A1; head_admin is an administrator."""
    client, Session, identities, headers = api
    update_user(Session, "teacher_test", student_class="11A1")
    update_user(Session, "other_student", role="admin", username="head_admin")
    return client, Session, identities, {"teacher": headers["teacher"], "admin": bearer("head_admin")}


def review(client, user_id, headers, decision="approve", **extra):
    return client.post(f"/api/accounts/{user_id}/review", json={"decision": decision, **extra}, headers=headers)


# ---------------------------------------------------------------- teachers
def test_new_teacher_waits_for_approval_without_teacher_rights(school):
    client, _, _, _ = school
    created = register(client, "new_teacher", role="teacher")
    assert created.status_code == 201
    assert created.json()["account_status"] == "pending"
    assert client.post("/api/auth/login", json={"username": "new_teacher", "password": PASSWORD}).status_code == 200
    headers = bearer("new_teacher")
    assert client.get("/api/learning/teacher/analytics", headers=headers).status_code == 403
    assert client.get("/api/accounts/pending", headers=headers).status_code == 403
    assert client.post("/api/classroom/posts", json={"title": "A", "body": "B"}, headers=headers).status_code == 403


def test_pending_teacher_cannot_read_a_class_they_claimed(school):
    client, _, identities, _ = school
    register(client, "claiming_teacher", role="teacher", student_class="11A1")
    url = f"/api/learning/users/{identities['student']}/dashboard"
    assert client.get(url, headers=bearer("claiming_teacher")).status_code == 403


def test_admin_approves_teacher_and_assigns_classes(school):
    client, _, identities, headers = school
    teacher_id = register(client, "approved_teacher", role="teacher", student_class="").json()["id"]
    assert review(client, teacher_id, headers["admin"]).status_code == 422
    approved = review(client, teacher_id, headers["admin"], classes=" 11A1, 11A1 ,11A2")
    assert approved.status_code == 200
    assert approved.json()["account_status"] == "verified"
    assert approved.json()["student_class"] == "11A1,11A2"
    url = f"/api/learning/users/{identities['student']}/dashboard"
    assert client.get(url, headers=bearer("approved_teacher")).status_code == 200


def test_teacher_cannot_approve_another_teacher(school):
    client, _, _, headers = school
    teacher_id = register(client, "peer_teacher", role="teacher").json()["id"]
    assert review(client, teacher_id, headers["teacher"], classes="11A1").status_code == 403


def test_admin_can_reassign_classes_of_an_existing_teacher(school):
    client, Session, identities, headers = school
    with Session() as db:
        teacher_id = db.query(User).filter_by(username="teacher_test").one().id
    url = f"/api/accounts/{teacher_id}/classes"
    assert client.put(url, json={"classes": "12B1"}, headers=headers["teacher"]).status_code == 403
    assert client.put(url, json={"classes": "12B1"}, headers=headers["admin"]).json()["student_class"] == "12B1"
    assert client.put(f"/api/accounts/{identities['student']}/classes", json={"classes": "12B1"},
                      headers=headers["admin"]).status_code == 422
    listed = client.get("/api/accounts/teachers", headers=headers["admin"]).json()
    assert [item["username"] for item in listed] == ["teacher_test"]


def test_self_approval_setting_keeps_the_old_shortcut(school, monkeypatch):
    client, *_ = school
    monkeypatch.setattr(settings, "allow_teacher_self_registration", True)
    assert register(client, "instant_teacher", role="teacher").json()["account_status"] == "verified"


# ---------------------------------------------------------------- students
def test_new_student_learns_alone_but_is_outside_the_class_until_confirmed(school):
    client, _, _, headers = school
    student = register(client, "new_student").json()
    assert student["account_status"] == "pending"
    own = client.get(f"/api/learning/users/{student['id']}/dashboard", headers=bearer("new_student"))
    assert own.status_code == 200

    teacher_view = f"/api/learning/users/{student['id']}/dashboard"
    assert client.get(teacher_view, headers=headers["teacher"]).status_code == 403
    before = client.get("/api/learning/teacher/analytics", headers=headers["teacher"]).json()
    assert before["summary"]["total_students"] == 1

    assert review(client, student["id"], headers["teacher"]).status_code == 200
    assert client.get(teacher_view, headers=headers["teacher"]).status_code == 200
    after = client.get("/api/learning/teacher/analytics", headers=headers["teacher"]).json()
    assert after["summary"]["total_students"] == 2


def test_teacher_only_sees_and_reviews_students_of_assigned_classes(school):
    client, _, _, headers = school
    own_class = register(client, "own_class_student", student_class="11A1").json()["id"]
    other_class = register(client, "other_class_student", student_class="12C3").json()["id"]
    pending = client.get("/api/accounts/pending", headers=headers["teacher"]).json()
    assert [item["id"] for item in pending] == [own_class]
    assert review(client, other_class, headers["teacher"]).status_code == 403
    admin_view = client.get("/api/accounts/pending", headers=headers["admin"]).json()
    assert {item["id"] for item in admin_view} == {own_class, other_class}


def test_student_cannot_review_anyone(school):
    client, _, identities, _ = school
    target = register(client, "target_student").json()["id"]
    assert review(client, target, bearer("student_test")).status_code == 403
    assert client.get("/api/accounts/pending", headers=bearer("student_test")).status_code == 403
    assert client.get("/api/accounts/reviews", headers=bearer("student_test")).status_code == 403


def test_student_without_a_class_needs_no_confirmation(school):
    client, *_ = school
    assert register(client, "solo_student", student_class="").json()["account_status"] == "verified"


def test_student_verification_can_be_switched_off(school, monkeypatch):
    client, *_ = school
    monkeypatch.setattr(settings, "require_student_verification", False)
    assert register(client, "open_student").json()["account_status"] == "verified"


# ---------------------------------------------------------------- rejection and audit
def test_rejection_needs_a_reason_blocks_login_and_invalidates_tokens(school):
    client, _, _, headers = school
    student_id = register(client, "rejected_student").json()["id"]
    token = bearer("rejected_student")
    assert client.get("/api/auth/me", headers=token).status_code == 200
    assert review(client, student_id, headers["teacher"], decision="reject").status_code == 422
    assert review(client, student_id, headers["teacher"], decision="reject", note="Không thuộc lớp").status_code == 200
    assert client.post("/api/auth/login", json={"username": "rejected_student", "password": PASSWORD}).status_code == 403
    assert client.get("/api/auth/me", headers=token).status_code == 401


def test_rejected_account_cannot_open_a_live_socket(school):
    client, Session, _, _ = school
    register(client, "rejected_socket")
    update_user(Session, "rejected_socket", account_status="rejected")
    token = bearer("rejected_socket")["Authorization"].split()[1]
    from starlette.websockets import WebSocketDisconnect

    with pytest.raises(WebSocketDisconnect) as closed:
        with client.websocket_connect(f"/api/ws/learning?token={token}"):
            pass
    assert closed.value.code == 4401


def test_a_decision_cannot_be_made_twice(school):
    client, _, _, headers = school
    student_id = register(client, "once_student").json()["id"]
    assert review(client, student_id, headers["teacher"]).status_code == 200
    assert review(client, student_id, headers["teacher"], decision="reject", note="Đổi ý").status_code == 409


def test_every_decision_is_recorded_with_its_reviewer(school):
    client, Session, _, headers = school
    student_id = register(client, "audited_student").json()["id"]
    review(client, student_id, headers["teacher"], note="Đúng danh sách lớp")
    with Session() as db:
        entry = db.query(AccountReview).one()
        assert (entry.user_id, entry.decision, entry.note) == (student_id, "approve", "Đúng danh sách lớp")
    records = client.get("/api/accounts/reviews", headers=headers["admin"]).json()
    assert records[0]["username"] == "audited_student" and records[0]["reviewer"] == "teacher_test"


def test_teacher_only_sees_their_own_decisions(school):
    client, _, _, headers = school
    student_id = register(client, "admin_handled").json()["id"]
    review(client, student_id, headers["admin"])
    assert client.get("/api/accounts/reviews", headers=headers["teacher"]).json() == []


def test_reviewing_a_missing_account_returns_404(school):
    client, _, _, headers = school
    assert review(client, 999999, headers["admin"]).status_code == 404


def test_registration_cannot_grant_itself_a_verified_status(school):
    client, *_ = school
    response = client.post("/api/auth/register", json={
        "username": "forged_status", "email": "forged@example.com", "password": PASSWORD,
        "role": "teacher", "student_class": "11A1", "account_status": "verified",
    })
    assert response.json()["account_status"] == "pending"


# ---------------------------------------------------------------- class codes
def new_code(client, headers, class_name="11A1", **options):
    return client.post("/api/accounts/class-codes", json={"class_name": class_name, **options}, headers=headers)


def test_teacher_code_confirms_a_student_into_the_class_immediately(school):
    client, Session, _, headers = school
    created = new_code(client, headers["teacher"], max_uses=5).json()
    assert len(created["code"]) == CODE_LENGTH and set(created["code"]) <= set(CODE_ALPHABET)

    # The class comes from the code, whatever the student typed.
    student = register(client, "code_student", student_class="12Z9", class_code=created["code"].lower()).json()
    assert (student["account_status"], student["student_class"]) == ("verified", "11A1")
    url = f"/api/learning/users/{student['id']}/dashboard"
    assert client.get(url, headers=headers["teacher"]).status_code == 200
    with Session() as db:
        assert db.query(ClassJoinCode).one().used_count == 1
        entry = db.query(AccountReview).one()
        assert (entry.decision, entry.classes) == ("class_code", "11A1")


def test_teacher_cannot_create_a_code_for_another_class_but_admin_can(school):
    client, _, _, headers = school
    assert new_code(client, headers["teacher"], "12C3").status_code == 403
    assert new_code(client, headers["admin"], "12C3").status_code == 201
    assert new_code(client, bearer("student_test")).status_code == 403
    register(client, "pending_coder", role="teacher", student_class="11A1")
    assert new_code(client, bearer("pending_coder")).status_code == 403


@pytest.mark.parametrize("change", [
    {"expires_at": datetime.utcnow() - timedelta(minutes=1)},
    {"revoked_at": datetime.utcnow()},
    {"used_count": 3},
])
def test_expired_revoked_or_used_up_code_is_refused(school, change):
    client, Session, _, headers = school
    code = new_code(client, headers["teacher"], max_uses=3).json()["code"]
    with Session() as db:
        db.query(ClassJoinCode).update(change)
        db.commit()
    response = register(client, "late_student", class_code=code)
    assert response.status_code == 422
    assert client.post("/api/auth/login", json={"username": "late_student", "password": PASSWORD}).status_code == 401


def test_code_stops_at_its_limit(school):
    client, _, _, headers = school
    code = new_code(client, headers["teacher"], max_uses=1).json()["code"]
    assert register(client, "first_seat", class_code=code).status_code == 201
    assert register(client, "second_seat", class_code=code).status_code == 422


def test_new_code_replaces_the_previous_one_and_revoke_works(school):
    client, _, _, headers = school
    first = new_code(client, headers["teacher"]).json()
    second = new_code(client, headers["teacher"]).json()
    assert register(client, "old_code_user", class_code=first["code"]).status_code == 422
    listing = client.get("/api/accounts/class-codes", headers=headers["teacher"]).json()
    assert listing["classes"] == ["11A1"]
    assert [item["id"] for item in listing["codes"]] == [second["id"]]
    assert client.delete(f"/api/accounts/class-codes/{second['id']}", headers=headers["teacher"]).status_code == 204
    assert register(client, "revoked_code_user", class_code=second["code"]).status_code == 422


def test_teacher_cannot_see_or_revoke_codes_of_another_class(school):
    client, _, _, headers = school
    other = new_code(client, headers["admin"], "12C3").json()
    assert client.get("/api/accounts/class-codes", headers=headers["teacher"]).json()["codes"] == []
    assert client.delete(f"/api/accounts/class-codes/{other['id']}", headers=headers["teacher"]).status_code == 404


def test_repeated_wrong_codes_are_blocked(school):
    client, _, _, headers = school
    code = new_code(client, headers["teacher"]).json()["code"]
    for attempt in range(MAX_FAILED_CODES):
        assert register(client, f"guesser_{attempt}", class_code="WRONG234").status_code == 422
    assert register(client, "guesser_next", class_code=code).status_code == 429


def test_a_failed_sign_up_does_not_spend_a_seat(school):
    client, Session, _, headers = school
    code = new_code(client, headers["teacher"], max_uses=1).json()["code"]
    assert client.post("/api/auth/register", json={
        "username": "student_test", "email": "taken@example.com", "password": PASSWORD, "class_code": code,
    }).status_code == 400
    with Session() as db:
        assert db.query(ClassJoinCode).one().used_count == 0


def test_a_teacher_gains_nothing_from_a_class_code(school):
    client, _, _, headers = school
    code = new_code(client, headers["teacher"]).json()["code"]
    assert register(client, "code_teacher", role="teacher", class_code=code).json()["account_status"] == "pending"


# ---------------------------------------------------------------- batch review
def test_batch_approval_reports_what_it_could_not_do(school):
    client, _, identities, headers = school
    first = register(client, "batch_one").json()["id"]
    second = register(client, "batch_two").json()["id"]
    other_class = register(client, "batch_other", student_class="12C3").json()["id"]
    teacher = register(client, "batch_teacher", role="teacher").json()["id"]
    response = client.post("/api/accounts/review-batch", json={
        "user_ids": [first, second, other_class, teacher, identities["student"], 999999, first],
        "decision": "approve",
    }, headers=headers["teacher"]).json()
    assert response["reviewed"] == [first, second]
    assert response["skipped"] == [other_class, teacher, identities["student"], 999999]
    left = {item["id"] for item in client.get("/api/accounts/pending", headers=headers["admin"]).json()}
    assert left == {other_class, teacher}


def test_batch_rejection_needs_a_reason_and_size_is_limited(school):
    client, _, _, headers = school
    target = register(client, "batch_reject").json()["id"]
    url = "/api/accounts/review-batch"
    assert client.post(url, json={"user_ids": [target], "decision": "reject"},
                       headers=headers["teacher"]).status_code == 422
    assert client.post(url, json={"user_ids": list(range(101)), "decision": "approve"},
                       headers=headers["teacher"]).status_code == 422
    assert client.post(url, json={"user_ids": [target], "decision": "approve"},
                       headers=bearer("student_test")).status_code == 403


# ---------------------------------------------------------------- correcting a decision
def test_teacher_removes_a_student_confirmed_by_mistake(school):
    client, _, identities, headers = school
    url = f"/api/learning/users/{identities['student']}/dashboard"
    assert client.get(url, headers=headers["teacher"]).status_code == 200
    members = client.get("/api/accounts/class-members", headers=headers["teacher"]).json()
    assert [item["id"] for item in members] == [identities["student"]]

    reset = f"/api/accounts/{identities['student']}/reset"
    assert client.post(reset, json={"note": "Nhầm lớp"}, headers=headers["teacher"]).status_code == 200
    assert client.get(url, headers=headers["teacher"]).status_code == 403
    assert client.post(reset, json={"note": "Lần nữa"}, headers=headers["teacher"]).status_code == 409
    assert client.get("/api/accounts/class-members", headers=headers["teacher"]).json() == []


def test_rejected_student_can_be_reopened_and_sign_in_again(school):
    client, _, _, headers = school
    student = register(client, "second_chance").json()["id"]
    review(client, student, headers["teacher"], decision="reject", note="Nhầm")
    assert client.post(f"/api/accounts/{student}/reset", json={"note": "Đã kiểm tra lại"},
                       headers=headers["teacher"]).json()["account_status"] == "pending"
    assert client.post("/api/auth/login", json={"username": "second_chance", "password": PASSWORD}).status_code == 200


def test_reset_stays_within_scope_and_needs_a_reason(school):
    client, Session, identities, headers = school
    with Session() as db:
        admin_id = db.query(User).filter_by(username="head_admin").one().id
        teacher_id = db.query(User).filter_by(username="teacher_test").one().id
    student = identities["student"]
    assert client.post(f"/api/accounts/{student}/reset", json={"note": ""}, headers=headers["teacher"]).status_code == 422
    assert client.post(f"/api/accounts/{admin_id}/reset", json={"note": "x"}, headers=headers["teacher"]).status_code == 422
    assert client.post(f"/api/accounts/{teacher_id}/reset", json={"note": "x"}, headers=headers["teacher"]).status_code == 422
    assert client.post(f"/api/accounts/{student}/reset", json={"note": "x"},
                       headers=bearer("student_test")).status_code == 403
    assert client.post(f"/api/accounts/{teacher_id}/reset", json={"note": "Nghỉ dạy"}, headers=headers["admin"]).status_code == 200
    assert client.get("/api/learning/teacher/analytics", headers=headers["teacher"]).status_code == 403
