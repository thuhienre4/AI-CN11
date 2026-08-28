from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from auth import create_access_token, hash_password
from database import Base, get_db
from main import app
from models import (
    Course,
    LearningEvent,
    Lesson,
    LessonProgress,
    Question,
    QuestionOption,
    User,
)
from routes.progress import lesson_analytics


@pytest.fixture()
def api():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    with TestingSession() as db:
        student = User(
            username="student_test",
            email="student@example.test",
            password_hash=hash_password("student-pass"),
            role="student",
            student_class="11A1",
        )
        other_student = User(
            username="other_student",
            email="other@example.test",
            password_hash=hash_password("student-pass"),
            role="student",
            student_class="11A2",
        )
        teacher = User(
            username="teacher_test",
            email="teacher@example.test",
            password_hash=hash_password("teacher-pass"),
            role="teacher",
        )
        db.add_all([student, other_student, teacher])
        db.flush()
        course = Course(id=1101, title="Công nghệ cơ khí 11")
        lesson = Lesson(id=110101, course_id=course.id, title="Bài kiểm tra", order=1)
        db.add_all([course, lesson])
        db.flush()
        questions = [
            Question(id=1101001, lesson_id=lesson.id, text="Câu 1", points=1),
            Question(id=1101002, lesson_id=lesson.id, text="Câu 2", points=1),
        ]
        db.add_all(questions)
        db.flush()
        db.add_all(
            [
                QuestionOption(id=11010001, question_id=questions[0].id, text="Đúng", is_correct=True, order=1),
                QuestionOption(id=11010002, question_id=questions[0].id, text="Sai", is_correct=False, order=2),
                QuestionOption(id=11010003, question_id=questions[1].id, text="Đúng", is_correct=True, order=1),
                QuestionOption(id=11010004, question_id=questions[1].id, text="Sai", is_correct=False, order=2),
            ]
        )
        db.commit()
        identities = {
            "student": student.id,
            "other": other_student.id,
            "teacher": teacher.id,
        }

    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    headers = {
        "student": {"Authorization": f"Bearer {create_access_token({'sub': 'student_test'})}"},
        "other": {"Authorization": f"Bearer {create_access_token({'sub': 'other_student'})}"},
        "teacher": {"Authorization": f"Bearer {create_access_token({'sub': 'teacher_test'})}"},
    }
    yield client, TestingSession, identities, headers
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


def test_quiz_questions_require_auth_and_hide_correct_answers(api):
    client, _, _, headers = api
    assert client.get("/api/lessons/110101/questions").status_code == 401

    response = client.get("/api/lessons/110101/questions", headers=headers["student"])
    assert response.status_code == 200
    assert response.json()
    assert "is_correct" not in response.json()[0]["options"][0]


def test_one_quiz_session_counts_as_one_attempt_and_is_idempotent(api):
    client, Session, identities, headers = api
    start = client.post(
        f"/api/quiz/attempts?user_id={identities['student']}",
        json={"lesson_id": 110101},
        headers=headers["student"],
    )
    assert start.status_code == 201
    attempt_id = start.json()["id"]

    first = client.post(
        f"/api/quiz/submit?user_id={identities['student']}",
        json={"question_id": 1101001, "attempt_id": attempt_id, "selected_answer": "11010001", "time_spent_seconds": 12},
        headers=headers["student"],
    )
    second = client.post(
        f"/api/quiz/submit?user_id={identities['student']}",
        json={"question_id": 1101002, "attempt_id": attempt_id, "selected_answer": "11010004", "time_spent_seconds": 13},
        headers=headers["student"],
    )
    assert first.json()["is_correct"] is True
    assert second.json()["is_correct"] is False

    payload = {"client_event_id": "quiz-test-event-0001"}
    finalized = client.post(
        f"/api/quiz/attempts/{attempt_id}/finalize",
        json=payload,
        headers=headers["student"],
    )
    assert finalized.status_code == 200
    assert finalized.json()["score_percent"] == 50
    assert client.post(
        f"/api/quiz/attempts/{attempt_id}/finalize",
        json=payload,
        headers=headers["student"],
    ).status_code == 200

    with Session() as db:
        progress = db.query(LessonProgress).filter_by(user_id=identities["student"], lesson_id=110101).one()
        assert progress.quiz_attempt_count == 1
        assert db.query(LearningEvent).filter_by(client_event_id="quiz-test-event-0001").count() == 1


def test_quiz_results_are_scoped_to_the_owner(api):
    client, _, identities, headers = api
    response = client.get(
        f"/api/quiz/results/user/{identities['student']}",
        headers=headers["other"],
    )
    assert response.status_code == 403


def test_teacher_self_registration_and_nova_generation_are_restricted(api):
    client, _, _, headers = api
    registration = client.post(
        "/api/auth/register",
        json={
            "username": "unapproved_teacher",
            "email": "unapproved.teacher@example.com",
            "password": "teacher-pass",
            "full_name": "Unapproved",
            "role": "teacher",
            "student_class": "",
        },
    )
    assert registration.status_code == 403
    assert client.post(
        "/api/nova3d/four-stroke-engine",
        json={},
        headers=headers["student"],
    ).status_code == 403


def test_risk_score_explains_high_risk_learning_evidence():
    progress = SimpleNamespace(
        status="needs_review",
        quiz_attempt_count=1,
        best_quiz_score=40,
        progress_percent=50,
        view_count=1,
        simulation_count=0,
        assistant_question_count=0,
        time_spent_seconds=60,
        last_accessed_at=None,
        lesson=SimpleNamespace(course_id=1101),
    )
    analytics = lesson_analytics(progress)
    assert analytics["risk_level"] == "high"
    assert analytics["risk_score"] == 100
    assert len(analytics["risk_reasons"]) >= 3
