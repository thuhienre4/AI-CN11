"""Coverage for the catalogue, question, material and Nova3D routes, which had under 40% coverage.
D16 and D17 are defects this suite uncovered (docs/verification.md).
"""
import pytest

import routes.materials as materials
import routes.nova3d as nova3d
from auth import create_access_token, hash_password
from config import settings
from models import ReferenceMaterial, User
from test_learning_workflow import api  # noqa: F401  (pytest fixture)

PDF = ("bai-giang.pdf", b"%PDF-1.4 bai giang dong co", "application/pdf")


def bearer(username):
    return {"Authorization": f"Bearer {create_access_token({'sub': username})}"}


@pytest.fixture
def staff(api):
    """The shared fixture plus a second teacher and an administrator."""
    client, Session, identities, headers = api
    with Session() as db:
        for username, role in [("teacher_two", "teacher"), ("admin_test", "admin")]:
            db.add(User(username=username, email=f"{username}@example.test", password_hash=hash_password("x-pass-123"),
                        role=role, full_name=username.replace("_", " ").title()))
        db.commit()
    headers = {**headers, "teacher_two": bearer("teacher_two"), "admin": bearer("admin_test")}
    return client, Session, identities, headers


@pytest.fixture
def upload_dir(tmp_path, monkeypatch):
    monkeypatch.setattr(materials, "UPLOAD_DIR", tmp_path)
    return tmp_path


# ---------------------------------------------------------------- courses and lessons
def test_teacher_manages_courses_and_lessons_end_to_end(api):
    client, _, _, headers = api
    teacher = headers["teacher"]
    course = client.post("/api/courses", json={"title": "Chương thử", "description": "Mô tả"}, headers=teacher)
    assert course.status_code == 201
    course_id = course.json()["id"]
    assert client.get(f"/api/courses/{course_id}").json()["title"] == "Chương thử"
    assert client.put(f"/api/courses/{course_id}", json={"title": "Chương đã sửa"}, headers=teacher).json()["title"] == "Chương đã sửa"

    lesson = client.post("/api/lessons", json={"title": "Bài thử", "course_id": course_id, "order": 1}, headers=teacher)
    assert lesson.status_code == 201
    lesson_id = lesson.json()["id"]
    assert [item["id"] for item in client.get(f"/api/courses/{course_id}/lessons").json()] == [lesson_id]
    assert client.get(f"/api/lessons/{lesson_id}").json()["course_id"] == course_id
    updated = client.put(f"/api/lessons/{lesson_id}", json={"title": "Bài đã sửa", "course_id": course_id, "order": 2}, headers=teacher)
    assert updated.status_code == 200 and updated.json()["order"] == 2

    assert client.delete(f"/api/lessons/{lesson_id}", headers=teacher).status_code == 204
    assert client.get(f"/api/lessons/{lesson_id}").status_code == 404
    assert client.delete(f"/api/courses/{course_id}", headers=teacher).status_code == 204
    assert client.get(f"/api/courses/{course_id}").status_code == 404


def test_course_list_pages_and_missing_records_answer_404(api):
    client, _, _, headers = api
    teacher = headers["teacher"]
    for index in range(3):
        client.post("/api/courses", json={"title": f"Khóa {index}"}, headers=teacher)
    assert len(client.get("/api/courses?skip=0&limit=2").json()) == 2
    assert len(client.get("/api/courses?skip=2&limit=10").json()) == 2  # fixture course + 3 new = 4
    missing = 999999
    assert client.get(f"/api/courses/{missing}").status_code == 404
    assert client.get(f"/api/courses/{missing}/lessons").status_code == 404
    assert client.put(f"/api/courses/{missing}", json={"title": "x"}, headers=teacher).status_code == 404
    assert client.delete(f"/api/courses/{missing}", headers=teacher).status_code == 404
    assert client.post("/api/lessons", json={"title": "x", "course_id": missing}, headers=teacher).status_code == 404
    assert client.put(f"/api/lessons/{missing}", json={"title": "x", "course_id": 1101}, headers=teacher).status_code == 404
    assert client.delete(f"/api/lessons/{missing}", headers=teacher).status_code == 404


def test_course_title_is_validated(api):
    client, _, _, headers = api
    assert client.post("/api/courses", json={"title": ""}, headers=headers["teacher"]).status_code == 422


# ---------------------------------------------------------------- questions
def test_teacher_question_lifecycle_and_learner_view(api):
    client, _, _, headers = api
    teacher = headers["teacher"]
    payload = {"lesson_id": 110101, "text": "Câu mới", "options": [
        {"text": "A", "is_correct": False}, {"text": "B", "is_correct": True}, {"text": "C"}, {"text": "D"}]}
    created = client.post("/api/questions", json=payload, headers=teacher)
    assert created.status_code == 201
    question_id = created.json()["id"]
    assert [o["is_correct"] for o in client.get(f"/api/questions/{question_id}", headers=teacher).json()["options"]] == [False, True, False, False]

    payload["text"] = "Câu đã sửa"
    payload["options"] = [{"text": "Đúng", "is_correct": True}, {"text": "Sai"}]
    edited = client.put(f"/api/questions/{question_id}", json=payload, headers=teacher).json()
    assert edited["text"] == "Câu đã sửa" and len(edited["options"]) == 2

    learner = client.get("/api/lessons/110101/questions", headers=headers["student"]).json()
    mine = next(q for q in learner if q["id"] == question_id)
    assert all("is_correct" not in option for option in mine["options"])
    again = next(q for q in client.get("/api/lessons/110101/questions", headers=headers["student"]).json() if q["id"] == question_id)
    assert [o["id"] for o in mine["options"]] == [o["id"] for o in again["options"]]  # stable per learner

    assert client.delete(f"/api/questions/{question_id}", headers=teacher).status_code == 204
    assert client.get(f"/api/questions/{question_id}", headers=teacher).status_code == 404


def test_questions_of_missing_records_answer_404(api):
    client, _, _, headers = api
    teacher = headers["teacher"]
    assert client.post("/api/questions", json={"lesson_id": 999999, "text": "x"}, headers=teacher).status_code == 404
    assert client.get("/api/lessons/999999/questions", headers=headers["student"]).status_code == 404
    assert client.put("/api/questions/999999", json={"lesson_id": 110101, "text": "x"}, headers=teacher).status_code == 404
    assert client.delete("/api/questions/999999", headers=teacher).status_code == 404


def test_option_order_differs_between_learners_but_not_the_options(api):
    client, _, _, headers = api
    one = {q["id"]: [o["id"] for o in q["options"]] for q in client.get("/api/lessons/110101/questions", headers=headers["student"]).json()}
    two = {q["id"]: [o["id"] for o in q["options"]] for q in client.get("/api/lessons/110101/questions", headers=headers["other"]).json()}
    assert one.keys() == two.keys()
    assert all(sorted(one[k]) == sorted(two[k]) for k in one)


# ---------------------------------------------------------------- reference materials
def test_material_upload_list_download_and_owner_delete(staff, upload_dir):
    client, _, identities, headers = staff
    uploaded = client.post("/api/materials", files={"file": PDF},
                           data={"title": "Bài giảng động cơ", "course_id": "1101", "lesson_id": "110101"},
                           headers=headers["teacher"])
    assert uploaded.status_code == 201
    material = uploaded.json()
    assert material["file_size"] == len(PDF[1]) and len(list(upload_dir.iterdir())) == 1
    assert "stored_file_name" not in material  # the name on disk is not exposed

    student = headers["student"]
    assert [m["id"] for m in client.get("/api/materials?course_id=1101", headers=student).json()] == [material["id"]]
    assert client.get("/api/materials?lesson_id=999", headers=student).json() == []
    assert len(client.get("/api/materials?search=động cơ", headers=student).json()) == 1
    downloaded = client.get(f"/api/materials/{material['id']}/download", headers=student)
    assert downloaded.status_code == 200 and downloaded.content == PDF[1]

    assert client.delete(f"/api/materials/{material['id']}", headers=headers["teacher"]).status_code == 204
    assert list(upload_dir.iterdir()) == []
    assert client.get(f"/api/materials/{material['id']}/download", headers=student).status_code == 404


def test_material_rejects_wrong_format_type_duplicates_and_students(staff, upload_dir):
    client, _, _, headers = staff
    teacher = headers["teacher"]
    assert client.post("/api/materials", files={"file": ("virus.exe", b"MZ", "application/octet-stream")}, headers=teacher).status_code == 400
    assert client.post("/api/materials", files={"file": ("anh.pdf", b"x", "image/png")}, headers=teacher).status_code == 400
    assert client.post("/api/materials", files={"file": PDF}, headers=teacher).status_code == 201
    assert client.post("/api/materials", files={"file": ("ban-sao.pdf", PDF[1], "application/pdf")}, headers=teacher).status_code == 409
    assert client.post("/api/materials", files={"file": PDF}, headers=headers["student"]).status_code == 403
    assert len(list(upload_dir.iterdir())) == 1  # rejected and duplicate files are not left on disk


def test_D16_teacher_cannot_delete_another_teachers_material_but_admin_can(staff, upload_dir):
    client, _, _, headers = staff
    material_id = client.post("/api/materials", files={"file": PDF}, headers=headers["teacher"]).json()["id"]
    assert client.delete(f"/api/materials/{material_id}", headers=headers["teacher_two"]).status_code == 403
    assert client.delete(f"/api/materials/{material_id}", headers=headers["admin"]).status_code == 204


def test_D17_uploader_is_taken_from_the_token_not_the_form(staff, upload_dir):
    client, _, identities, headers = staff
    material = client.post("/api/materials", files={"file": PDF},
                           data={"uploader": "Người khác", "uploader_user_id": str(identities["student"])},
                           headers=headers["teacher"]).json()
    assert material["uploader_user_id"] == identities["teacher"]
    assert material["uploader"] != "Người khác"


def test_material_with_missing_file_answers_404_and_unknown_ids(staff, upload_dir):
    client, Session, _, headers = staff
    with Session() as db:
        db.add(ReferenceMaterial(title="Mất file", file_name="a.pdf", stored_file_name="khong-co.pdf", file_type="application/pdf",
                                 file_size=1, file_checksum="0" * 64, uploader="x"))
        db.commit()
        material_id = db.query(ReferenceMaterial).filter_by(title="Mất file").one().id
    assert client.get(f"/api/materials/{material_id}/download", headers=headers["student"]).status_code == 404
    assert client.get("/api/materials/999999/download", headers=headers["student"]).status_code == 404
    assert client.delete("/api/materials/999999", headers=headers["teacher"]).status_code == 404


# ---------------------------------------------------------------- Nova3D
def test_nova3d_without_configuration(api, monkeypatch):
    client, _, _, headers = api
    monkeypatch.setattr(settings, "nova3d_auth_token", None)
    teacher = headers["teacher"]
    assert client.get("/api/nova3d/config", headers=headers["student"]).json()["configured"] is False
    fallback = client.post("/api/nova3d/four-stroke-engine", json={}, headers=teacher).json()
    assert fallback["configured"] is False and fallback["status"] == "fallback" and "Kì nạp" not in fallback["message"]
    assert client.get("/api/nova3d/workflows/w1/status", headers=teacher).status_code == 400
    assert client.get("/api/nova3d/workflows/w1/result", headers=teacher).status_code == 400


@pytest.fixture
def nova(monkeypatch):
    """Nova3D configured, its HTTP calls answered by a script instead of the network."""
    monkeypatch.setattr(settings, "nova3d_auth_token", "token")
    monkeypatch.setattr(settings, "nova3d_provider_api_key", "provider-key")

    async def no_wait(_seconds):
        return None

    monkeypatch.setattr(nova3d.asyncio, "sleep", no_wait)
    calls, answers = [], {}

    async def fake_request(method, path, **kwargs):
        calls.append((method, path, kwargs))
        for prefix, answer in answers.items():
            if path.startswith(prefix):
                return answer(kwargs) if callable(answer) else answer
        raise AssertionError(path)

    monkeypatch.setattr(nova3d, "_nova_request", fake_request)
    return calls, answers


def test_nova3d_reports_not_ready(api, nova):
    client, _, _, headers = api
    _, answers = nova
    answers["/workflow/readiness"] = {"ready": False, "reason": "Hết hạn mức"}
    body = client.post("/api/nova3d/four-stroke-engine", json={}, headers=headers["teacher"]).json()
    assert body["status"] == "not_ready" and body["message"] == "Hết hạn mức"


def test_nova3d_starts_and_waits_for_the_model(api, nova):
    client, _, _, headers = api
    calls, answers = nova
    answers["/workflow/readiness"] = {"ready": True}
    answers["/run/state"] = {"workflow_id": "wf-1"}
    answers["/status/"] = {"runtime": {"state": "completed"}}
    answers["/result/"] = {"sketch_to_3d_generator": [{"result": {"model": {"url": "https://cdn/x.glb"}}}]}

    started = client.post("/api/nova3d/four-stroke-engine", json={"prompt": "  động cơ  "}, headers=headers["teacher"]).json()
    assert started["status"] == "started" and started["workflow_id"] == "wf-1" and started["prompt"] == "động cơ"
    sent = next(kwargs for method, path, kwargs in calls if path.startswith("/run/state"))
    assert sent["json"]["payload"]["api_key"] == "provider-key"
    assert "provider-key" not in str(started)  # the provider key is never echoed to the browser

    done = client.post("/api/nova3d/four-stroke-engine", json={"wait_for_result": True}, headers=headers["teacher"]).json()
    assert done["status"] == "completed" and done["glb_url"] == "https://cdn/x.glb"
    status = client.get("/api/nova3d/workflows/wf-1/status", headers=headers["teacher"]).json()
    assert status["runtime"]["state"] == "completed"
    assert client.get("/api/nova3d/workflows/wf-1/result", headers=headers["teacher"]).json()["glb_url"] == "https://cdn/x.glb"


def test_nova3d_failed_run_and_missing_workflow_id(api, nova):
    client, _, _, headers = api
    _, answers = nova
    answers["/workflow/readiness"] = {"ready": True}
    answers["/run/state"] = {"workflow_id": "wf-2"}
    answers["/status/"] = {"runtime": {"state": "failed"}}
    failed = client.post("/api/nova3d/four-stroke-engine", json={"wait_for_result": True}, headers=headers["teacher"]).json()
    assert failed["status"] == "failed" and failed["glb_url"] is None

    answers["/run/state"] = {}
    assert client.post("/api/nova3d/four-stroke-engine", json={}, headers=headers["teacher"]).status_code == 502


@pytest.mark.parametrize("payload,url", [
    ({"glb_url": "https://a/1.glb"}, "https://a/1.glb"),
    ({"add_3d_part": [{"model_url": "https://a/2.glb"}]}, "https://a/2.glb"),
    ({"result": {"model_artifact": {"url": "https://a/3.glb"}}}, "https://a/3.glb"),
    ({"result": {"model": {"name": "no url"}}}, None),
])
def test_glb_url_is_found_in_every_known_shape(payload, url):
    assert nova3d._extract_glb_url(payload) == url
