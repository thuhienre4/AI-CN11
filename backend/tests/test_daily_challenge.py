from datetime import datetime

from journey import build_journey
from models import LearningEvent, LessonProgress, QuizResult, User
from test_learning_workflow import api  # noqa: F401  (pytest fixture)


def answer_all(client, headers, pick):
    today = client.get("/api/learning/challenge/today", headers=headers).json()
    answers = {str(question["id"]): pick(question) for question in today["questions"]}
    return today, client.post("/api/learning/challenge/today", headers=headers, json={"answers": answers})


def test_the_challenge_hides_answers_and_stays_the_same_all_day(api):
    client, Session, identities, headers = api
    first = client.get("/api/learning/challenge/today", headers=headers["student"])
    assert first.status_code == 200
    body = first.json()
    assert body["done"] is False and 1 <= len(body["questions"]) <= 5
    for question in body["questions"]:
        assert set(question) == {"id", "text", "lesson_id", "lesson_title", "reason", "options"}
        assert all(set(option) == {"id", "text"} for option in question["options"])
    assert client.get("/api/learning/challenge/today", headers=headers["student"]).json() == body
    assert client.get("/api/learning/challenge/today").status_code == 401


def test_the_server_grades_once_a_day_and_the_points_follow_the_score(api):
    client, Session, identities, headers = api
    with Session() as db:
        from models import QuestionOption
        right = {option.question_id: option.id for option in db.query(QuestionOption).filter_by(is_correct=True)}
    today, response = answer_all(client, headers["student"], lambda question: right[question["id"]])
    assert response.status_code == 200
    result = response.json()["result"]
    assert result["correct"] == result["total"] == len(today["questions"]) and result["score"] == 100
    assert all(item["is_correct"] and item["correct_option"] == right[item["question_id"]] for item in result["answers"])

    again = client.post("/api/learning/challenge/today", headers=headers["student"],
                        json={"answers": {str(q["id"]): right[q["id"]] for q in today["questions"]}})
    assert again.status_code == 409
    reread = client.get("/api/learning/challenge/today", headers=headers["student"]).json()
    assert reread["done"] is True and reread["result"]["score"] == 100

    journey = client.get(f"/api/learning/users/{identities['student']}/journey", headers=headers["student"]).json()
    assert journey["breakdown"]["challenges"] == 20 and journey["challenge_today"] == 100
    assert next(badge for badge in journey["badges"] if badge["id"] == "challenge_perfect")["earned"] is True


def test_answers_to_other_questions_are_refused(api):
    client, Session, identities, headers = api
    response = client.post("/api/learning/challenge/today", headers=headers["student"], json={"answers": {"999": 1}})
    assert response.status_code == 409


def test_a_browser_cannot_report_a_challenge_result_itself(api):
    client, Session, identities, headers = api
    forged = {"event_type": "challenge_completed", "score": 100, "client_event_id": "forged-challenge-1"}
    url = f"/api/learning/users/{identities['student']}/events"
    assert client.post(url, headers=headers["student"], json=forged).status_code == 422
    batch = client.post(f"{url}/batch", headers=headers["student"],
                        json=[forged, {"event_type": "lesson_viewed", "lesson_id": 110101, "client_event_id": "real-view-1"}])
    assert batch.status_code == 200 and [row["event_type"] for row in batch.json()] == ["lesson_viewed"]
    with Session() as db:
        assert db.query(LearningEvent).filter_by(event_type="challenge_completed").count() == 0


def test_questions_answered_wrongly_come_first_and_say_why(api):
    client, Session, identities, headers = api
    with Session() as db:
        db.add(QuizResult(user_id=identities["student"], question_id=1101002, selected_answer="x", is_correct=False,
                          created_at=datetime.utcnow()))
        db.add(LessonProgress(user_id=identities["student"], lesson_id=110101, progress_percent=40))
        db.commit()
    questions = client.get("/api/learning/challenge/today", headers=headers["student"]).json()["questions"]
    assert questions[0]["id"] == 1101002 and questions[0]["reason"] == "Em từng trả lời sai câu này"


def test_a_lesson_marked_done_without_its_quick_test_earns_no_lesson_points():
    marked = build_journey([{"status": "completed", "best_quiz_score": 0, "quiz_attempt_count": 0, "simulation_count": 0}],
                           [("lesson_completed", "2026-11-16")], "2026-11-16")
    assert marked["breakdown"]["lessons"] == 0
    tested = build_journey([{"status": "completed", "best_quiz_score": 50, "quiz_attempt_count": 1, "simulation_count": 0}],
                           [("lesson_completed", "2026-11-16")], "2026-11-16")
    assert tested["breakdown"]["lessons"] == 40
