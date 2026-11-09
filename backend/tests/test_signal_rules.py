from datetime import datetime, timedelta
from types import SimpleNamespace

from models import LessonProgress, User
from routes.progress import RISK_POINTS, lesson_analytics, student_level, student_signals
from test_learning_workflow import api  # noqa: F401  (pytest fixture)
from test_review_evidence import progress_state


def test_a_finished_lesson_raises_no_signal_however_long_ago_it_was_finished():
    finished = progress_state(progress_percent=100, simulation_count=0,
                              last_accessed_at=datetime.utcnow() - timedelta(days=60))
    result = lesson_analytics(finished)
    assert (result["risk_score"], result["signals"]) == (0, [])


def test_a_low_quiz_score_still_counts_on_a_finished_lesson_and_names_the_score():
    result = lesson_analytics(progress_state(progress_percent=100, simulation_count=1, quiz_attempt_count=1, best_quiz_score=40))
    assert result["signals"] == ["quiz_below_pass"]
    assert result["risk_reasons"] == ["Điểm kiểm tra nhanh cao nhất 40, dưới mức đạt 60."]


def test_each_reason_states_a_fact_without_judging_the_student():
    stale = progress_state(progress_percent=30, last_accessed_at=datetime.utcnow() - timedelta(days=9))
    reasons = lesson_analytics(stale)["risk_reasons"]
    assert "Bài đã bắt đầu, mới hoàn thành 30%." in reasons
    assert "Chưa quay lại bài này từ 9 ngày." in reasons
    assert not any("ngay" in reason or "yếu" in reason for reason in reasons)


def test_a_student_without_any_started_lesson_is_not_started_rather_than_fine():
    assert student_level([]) == (0, "none")
    assert student_level([{"risk_score": 15}, {"risk_score": 45}]) == (45, "medium")


def test_signals_are_summed_over_lessons_heaviest_first_with_example_lessons():
    rows = [progress_state(progress_percent=30, lesson=SimpleNamespace(course_id=1101, title=f"Bài {n}"), lesson_id=n)
            for n in (1, 2, 3, 4)]
    rows[0].quiz_attempt_count, rows[0].best_quiz_score = 1, 20
    summary = student_signals([lesson_analytics(row) for row in rows], rows)
    assert [item["kind"] for item in summary] == ["quiz_below_pass", "unfinished", "no_simulation"]
    assert summary[0]["lessons"] == ["Bài 1"]
    assert summary[1]["count"] == 4 and len(summary[1]["lessons"]) == 3
    assert summary[0]["points"] == RISK_POINTS["quiz_below_pass"]


def test_the_teacher_sees_signals_and_students_who_have_not_started(api):
    client, Session, identities, headers = api
    with Session() as db:
        db.query(User).filter_by(username="teacher_test").update({"student_class": "11A1"})
        db.add(User(username="hs_chua_hoc", email="chua@example.com", password_hash="x", role="student",
                    student_class="11A1", full_name="Chưa học"))
        db.add(LessonProgress(user_id=identities["student"], lesson_id=110101, progress_percent=30, simulation_count=0,
                              last_accessed_at=datetime.utcnow()))
        db.commit()
    analytics = client.get("/api/learning/teacher/analytics", headers=headers["teacher"]).json()
    assert analytics["summary"]["not_started_students"] == 1
    listed = {row["name"]: row for row in analytics["at_risk_students"]}
    assert listed["Chưa học"]["risk_level"] == "none"
    started = next(row for row in analytics["at_risk_students"] if row["risk_level"] != "none")
    assert {item["kind"] for item in started["signals"]} == {"unfinished", "no_simulation"}
    # students with signals come before those who have not started
    assert analytics["at_risk_students"][0]["risk_level"] != "none"
