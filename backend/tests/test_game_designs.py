from auth import create_access_token
from models import User
from test_learning_workflow import api  # noqa: F401  (pytest fixture)

DESIGN = {
    "title": "Ôn Bài 18",
    "questions": [
        {"text": "Kì nào hai xu páp đều đóng?", "options": ["Nạp", "Nén", "Thải", ""], "correct": 1, "seconds": 20},
    ],
}


def second_teacher(Session):
    with Session() as db:
        db.add(User(username="teacher_two", email="two@example.com", password_hash="x", role="teacher",
                    account_status="verified", student_class="11A2"))
        db.commit()
    return {"Authorization": f"Bearer {create_access_token({'sub': 'teacher_two'})}"}


def test_a_teacher_keeps_designs_with_the_account(api):
    client, _, _, headers = api
    created = client.post("/api/game-designs", json=DESIGN, headers=headers["teacher"])
    assert created.status_code == 201
    design = created.json()
    assert design["questions"][0]["options"] == ["Nạp", "Nén", "Thải", ""]

    changed = client.put(f"/api/game-designs/{design['id']}", json={**DESIGN, "title": "Ôn Bài 18 (sửa)"},
                         headers=headers["teacher"])
    assert changed.json()["title"] == "Ôn Bài 18 (sửa)"
    listed = client.get("/api/game-designs", headers=headers["teacher"]).json()
    assert [item["title"] for item in listed] == ["Ôn Bài 18 (sửa)"]

    assert client.delete(f"/api/game-designs/{design['id']}", headers=headers["teacher"]).status_code == 204
    assert client.get("/api/game-designs", headers=headers["teacher"]).json() == []


def test_an_unfinished_design_can_be_saved_as_a_draft(api):
    client, _, _, headers = api
    draft = {"title": "", "questions": [{"text": "", "options": ["", "", "", ""], "correct": 0, "seconds": 20}]}
    assert client.post("/api/game-designs", json=draft, headers=headers["teacher"]).status_code == 201


def test_badly_formed_designs_are_refused(api):
    client, _, _, headers = api
    too_long = {"title": "x" * 121, "questions": []}
    bad_time = {"title": "A", "questions": [{"text": "B", "options": ["a", "b"], "correct": 0, "seconds": 1}]}
    for body in (too_long, bad_time):
        assert client.post("/api/game-designs", json=body, headers=headers["teacher"]).status_code == 422


def test_teachers_never_see_or_change_each_others_designs(api):
    client, Session, _, headers = api
    other = second_teacher(Session)
    design_id = client.post("/api/game-designs", json=DESIGN, headers=headers["teacher"]).json()["id"]
    assert client.get("/api/game-designs", headers=other).json() == []
    assert client.put(f"/api/game-designs/{design_id}", json=DESIGN, headers=other).status_code == 404
    assert client.delete(f"/api/game-designs/{design_id}", headers=other).status_code == 404
    assert len(client.get("/api/game-designs", headers=headers["teacher"]).json()) == 1


def test_students_and_guests_cannot_use_designs(api):
    client, _, _, headers = api
    assert client.get("/api/game-designs").status_code == 401
    assert client.get("/api/game-designs", headers=headers["student"]).status_code == 403
    assert client.post("/api/game-designs", json=DESIGN, headers=headers["student"]).status_code == 403


def test_a_teachers_designs_are_part_of_their_data_download(api):
    client, Session, _, headers = api
    with Session() as db:
        db.query(User).filter_by(username="teacher_test").update({"email": "teacher@example.com"})
        db.commit()
    client.post("/api/game-designs", json=DESIGN, headers=headers["teacher"])
    exported = client.get("/api/auth/me/data", headers=headers["teacher"]).json()
    assert [item["title"] for item in exported["quiz_designs"]] == ["Ôn Bài 18"]
