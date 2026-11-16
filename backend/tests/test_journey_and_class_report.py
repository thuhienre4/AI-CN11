import csv
import io
import json
from datetime import datetime, timedelta
from pathlib import Path

import pytest

from journey import build_journey, level_floor, level_for, local_day
from models import LearningEvent, LessonProgress, QuizResult, User
from test_learning_workflow import api  # noqa: F401  (pytest fixture)

CASES = json.loads((Path(__file__).resolve().parents[1] / "data" / "journey_cases.json").read_text(encoding="utf-8"))


@pytest.mark.parametrize("case", CASES, ids=[case["name"] for case in CASES])
def test_the_journey_rules_match_the_cases_shared_with_the_interface(case):
    assert build_journey(case["lessons"], [tuple(event) for event in case["events"]], case["today"]) == case["expected"]


def test_points_come_from_finishing_and_understanding_not_from_repeating():
    once = build_journey([{"status": "completed", "best_quiz_score": 80, "quiz_attempt_count": 1, "simulation_count": 1}],
                         [("simulation_opened", "2026-11-16")], "2026-11-16")
    many = build_journey([{"status": "completed", "best_quiz_score": 80, "quiz_attempt_count": 1, "simulation_count": 99}],
                         [("simulation_opened", "2026-11-16")] * 50, "2026-11-16")
    assert once["xp"] == many["xp"] == 40 + 32 + 10 + 5
    better = build_journey([{"status": "completed", "best_quiz_score": 100, "quiz_attempt_count": 2, "simulation_count": 1}],
                           [("simulation_opened", "2026-11-16")], "2026-11-16")
    assert better["xp"] - once["xp"] == 8


def test_levels_need_more_points_each_time_and_days_follow_vietnam_time():
    assert [level_floor(level) for level in (1, 2, 3, 4)] == [0, 100, 300, 600]
    assert [level_for(xp) for xp in (0, 99, 100, 299, 300, 4500)] == [1, 1, 2, 2, 3, 10]
    assert local_day(datetime(2026, 11, 15, 17, 30)) == "2026-11-16"  # 00:30 on the 16th in Vietnam


def seed_class(Session, identities):
    """student_test and two classmates in 11A1 with some work; other_student stays in 11A2."""
    now = datetime.utcnow()
    with Session() as db:
        db.query(User).filter_by(username="teacher_test").update({"student_class": "11A1"})
        db.query(User).filter_by(username="student_test").update({"full_name": "An"})
        mate = User(username="ban_cung_lop", email="mate@example.com", password_hash="x", role="student",
                    student_class="11A1", full_name="=Bình")
        third = User(username="ban_thu_ba", email="third@example.com", password_hash="x", role="student",
                     student_class="11A1", full_name="Chi")
        db.add_all([mate, third])
        db.flush()
        db.add_all([
            LessonProgress(user_id=identities["student"], lesson_id=110101, status="completed", progress_percent=100,
                           best_quiz_score=100, quiz_attempt_count=1, simulation_count=1, time_spent_seconds=600,
                           last_accessed_at=now),
            LessonProgress(user_id=mate.id, lesson_id=110101, status="in_progress", progress_percent=40,
                           best_quiz_score=50, quiz_attempt_count=1, simulation_count=0, time_spent_seconds=120,
                           last_accessed_at=now - timedelta(days=1)),
            LessonProgress(user_id=identities["other"], lesson_id=110101, status="completed", progress_percent=100,
                           best_quiz_score=100, quiz_attempt_count=1, simulation_count=1, last_accessed_at=now),
            LearningEvent(user_id=identities["student"], lesson_id=110101, event_type="lesson_completed", occurred_at=now),
            # question 1101001: the student is right; both classmates are wrong on their first answer
            QuizResult(user_id=identities["student"], question_id=1101001, selected_answer="11010001", is_correct=True,
                       created_at=now - timedelta(minutes=5)),
            QuizResult(user_id=mate.id, question_id=1101001, selected_answer="11010002", is_correct=False,
                       created_at=now - timedelta(minutes=4)),
            QuizResult(user_id=mate.id, question_id=1101001, selected_answer="11010001", is_correct=True,
                       created_at=now - timedelta(minutes=1)),
            QuizResult(user_id=third.id, question_id=1101001, selected_answer="11010002", is_correct=False,
                       created_at=now - timedelta(minutes=3)),
        ])
        db.commit()
        return mate.id


def test_a_student_reads_their_own_journey_but_not_a_classmates(api):
    client, Session, identities, headers = api
    mate_id = seed_class(Session, identities)
    own = client.get(f"/api/learning/users/{identities['student']}/journey", headers=headers["student"])
    assert own.status_code == 200
    body = own.json()
    assert body["breakdown"] == {"lessons": 40, "quizzes": 40, "models": 10, "active_days": 5, "daily_tasks": 0, "challenges": 0}
    assert body["xp"] == 95 and body["level"] == 1 and body["next_level_xp"] == 100
    assert {badge["id"] for badge in body["badges"] if badge["earned"]} == {"first_lesson", "perfect"}
    assert client.get(f"/api/learning/users/{mate_id}/journey", headers=headers["student"]).status_code == 403
    assert client.get(f"/api/learning/users/{identities['student']}/journey").status_code == 401
    assert client.get(f"/api/learning/users/{mate_id}/journey", headers=headers["teacher"]).status_code == 200


def test_the_leaderboard_shows_only_the_students_own_class(api):
    client, Session, identities, headers = api
    seed_class(Session, identities)
    board = client.get("/api/learning/leaderboard", headers=headers["student"]).json()
    assert board["class_name"] == "11A1" and board["student_count"] == 3
    assert board["rows"][0]["name"] == "An"
    assert board["me"]["rank"] == 1 and board["me"]["xp"] == 95
    assert all(set(row) == {"rank", "name", "xp", "level", "is_me"} for row in board["rows"])
    # a class the student names is ignored: the confirmed class decides
    other = client.get("/api/learning/leaderboard?class_name=11A2", headers=headers["student"]).json()
    assert other["class_name"] == "11A1"
    assert client.get("/api/learning/leaderboard?class_name=11A2", headers=headers["teacher"]).status_code == 403
    assert client.get("/api/learning/leaderboard", headers=headers["teacher"]).json()["student_count"] == 3


def test_a_student_whose_class_is_not_confirmed_gets_no_leaderboard(api):
    client, Session, identities, headers = api
    with Session() as db:
        db.query(User).filter_by(username="student_test").update({"account_status": "pending"})
        db.commit()
    board = client.get("/api/learning/leaderboard", headers=headers["student"]).json()
    assert board["needs_class"] is True and board["rows"] == []


def test_the_class_report_covers_only_assigned_classes_and_finds_hard_questions(api):
    client, Session, identities, headers = api
    seed_class(Session, identities)
    assert client.get("/api/learning/teacher/report", headers=headers["student"]).status_code == 403
    assert client.get("/api/learning/teacher/report?class_name=11A2", headers=headers["teacher"]).status_code == 403
    report = client.get("/api/learning/teacher/report", headers=headers["teacher"]).json()
    assert report["summary"] == {"students": 3, "active_students": 2, "lessons_completed": 1, "average_completed_per_student": 0.3}
    assert report["available_classes"] == ["11A1"]
    assert {row["class_name"] for row in report["students"]} == {"11A1"}
    lesson = report["lessons"][0]
    assert (lesson["started"], lesson["completed"], lesson["completion_percent"], lesson["average_best_quiz"]) == (2, 1, 33, 75.0)
    hard = report["hard_questions"]
    # the first answer of each student counts: 2 wrong out of 3, although one of them later got it right
    assert len(hard) == 1 and (hard[0]["answers"], hard[0]["wrong"], hard[0]["wrong_percent"]) == (3, 2, 67)
    assert hard[0]["text"] == "Câu 1" and hard[0]["common_wrong_answer"]


def test_the_csv_export_opens_in_excel_and_cannot_carry_a_formula(api):
    client, Session, identities, headers = api
    seed_class(Session, identities)
    assert client.get("/api/learning/teacher/report.csv", headers=headers["student"]).status_code == 403
    response = client.get("/api/learning/teacher/report.csv", headers=headers["teacher"])
    assert response.status_code == 200 and response.headers["content-type"].startswith("text/csv")
    assert "attachment" in response.headers["content-disposition"]
    assert response.content.startswith(b"\xef\xbb\xbf")
    rows = list(csv.reader(io.StringIO(response.content.decode("utf-8-sig"))))
    assert rows[0][0] == "Họ tên" and len(rows) == 4
    names = [row[0] for row in rows[1:]]
    assert "'=Bình" in names and "An" in names
    an = next(row for row in rows[1:] if row[0] == "An")
    assert an[1:7] == ["11A1", "1", "1", "100.0", "1", "10"] and an[8:] == ["95", "1"]
