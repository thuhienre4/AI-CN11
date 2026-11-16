"""Learning journey: experience points, level, badges, daily tasks and streak.

Everything is derived from what the student has really done (lesson progress and learning events); nothing
is stored, so nothing can be granted by hand or drift from the record. Points reward finishing a lesson and
understanding it, each lesson counting once, so repeating clicks earns nothing. A lesson counts as finished
only once its quick test, graded by the server, has been taken: marking it done is the student's own word,
and a leaderboard must not rest on that alone. The daily challenge is graded by the server too.

The interface computes the same thing for the offline mode in ``frontend/src/utils/journey.js``; both are
checked against ``data/journey_cases.json``.
"""
from datetime import date, datetime, timedelta
from typing import Iterable

XP_LESSON_COMPLETED = 40
XP_QUIZ_MAX = 40  # by the best quick-test score of the lesson
XP_MODEL_OPENED = 10
XP_ACTIVE_DAY = 5
XP_DAILY_TASKS = 15  # a day on which all three daily tasks were done
XP_CHALLENGE_MAX = 20  # by the share of the day's challenge answered right
CHALLENGE_EVENT = "challenge_completed"

LOCAL_OFFSET = timedelta(hours=7)  # days are counted in Vietnam time

DAILY_TASKS = [
    ("study", "Học một bài", {"lesson_viewed", "lesson_completed"}),
    ("quiz", "Làm một bài kiểm tra nhanh", {"quiz_submitted"}),
    ("model", "Mở một mô hình 3D", {"simulation_opened"}),
]

BADGES = [
    ("first_lesson", "Bước đầu tiên", "Hoàn thành bài học đầu tiên", "completed", 1),
    ("five_lessons", "Chăm chỉ", "Hoàn thành 5 bài học", "completed", 5),
    ("twenty_lessons", "Bền bỉ", "Hoàn thành 20 bài học", "completed", 20),
    ("solid_three", "Nắm chắc", "Đạt từ 80 điểm kiểm tra nhanh ở 3 bài", "solid", 3),
    ("perfect", "Chính xác", "Đạt 100 điểm kiểm tra nhanh ở một bài", "perfect", 1),
    ("retry", "Kiên trì", "Làm lại bài kiểm tra và đạt từ 80 điểm", "retry", 1),
    ("explorer", "Khám phá", "Mở mô hình 3D ở 5 bài", "models", 5),
    ("streak_three", "Đều đặn", "Học 3 ngày liên tiếp", "best_streak", 3),
    ("streak_seven", "Thói quen tốt", "Học 7 ngày liên tiếp", "best_streak", 7),
    ("challenge_seven", "Bền chí", "Làm thử thách hằng ngày trong 7 ngày", "challenges", 7),
    ("challenge_perfect", "Tinh thông", "Trả lời đúng cả 5 câu thử thách", "challenge_perfect", 1),
]


def local_day(moment: datetime) -> str:
    """The Vietnam calendar day of a UTC timestamp, as YYYY-MM-DD."""
    return (moment + LOCAL_OFFSET).date().isoformat()


def level_floor(level: int) -> int:
    return 50 * level * (level - 1)


def level_for(xp: int) -> int:
    level = 1
    while level_floor(level + 1) <= xp:
        level += 1
    return level


def _streaks(days: set[str], today: str) -> tuple[int, int]:
    """(current, best) runs of consecutive active days; the current run may end today or yesterday."""
    if not days:
        return 0, 0
    ordered = sorted(date.fromisoformat(day) for day in days)
    best = run = 1
    for previous, current in zip(ordered, ordered[1:]):
        run = run + 1 if current - previous == timedelta(days=1) else 1
        best = max(best, run)
    last = ordered[-1]
    if date.fromisoformat(today) - last > timedelta(days=1):
        return 0, best
    current = 1
    for index in range(len(ordered) - 1, 0, -1):
        if ordered[index] - ordered[index - 1] != timedelta(days=1):
            break
        current += 1
    return current, best


def build_journey(lessons: Iterable[dict], events: Iterable[tuple], today: str) -> dict:
    """``lessons``: one dict per lesson with status, best_quiz_score, quiz_attempt_count, simulation_count.
    ``events``: (event_type, local day) or (event_type, local day, score). ``today``: local day."""
    lessons = list(lessons)
    events = [tuple(event) + (None,) * (3 - len(event)) for event in events]
    tested = [item for item in lessons if (item.get("quiz_attempt_count") or 0) > 0]
    completed = sum(1 for item in tested if item.get("status") == "completed")
    challenges = [min(100, max(0, score or 0)) for event_type, _, score in events if event_type == CHALLENGE_EVENT]
    challenge_today = next((min(100, max(0, score or 0)) for event_type, day, score in events
                            if event_type == CHALLENGE_EVENT and day == today), None)
    quiz_xp = sum(int(min(100, max(0, item.get("best_quiz_score") or 0)) * XP_QUIZ_MAX / 100 + 0.5) for item in tested)
    models = sum(1 for item in lessons if (item.get("simulation_count") or 0) > 0)

    types_by_day: dict[str, set[str]] = {}
    for event_type, day, _ in events:
        types_by_day.setdefault(day, set()).add(event_type)
    task_done = lambda types, wanted: bool(types & wanted)  # noqa: E731
    full_days = sum(1 for types in types_by_day.values() if all(task_done(types, wanted) for _, _, wanted in DAILY_TASKS))
    current_streak, best_streak = _streaks(set(types_by_day), today)

    breakdown = {
        "lessons": completed * XP_LESSON_COMPLETED,
        "quizzes": quiz_xp,
        "models": models * XP_MODEL_OPENED,
        "active_days": len(types_by_day) * XP_ACTIVE_DAY,
        "daily_tasks": full_days * XP_DAILY_TASKS,
        "challenges": sum(int(score * XP_CHALLENGE_MAX / 100 + 0.5) for score in challenges),
    }
    xp = sum(breakdown.values())
    level = level_for(xp)

    counters = {
        "completed": completed,
        "solid": sum(1 for item in tested if (item.get("best_quiz_score") or 0) >= 80),
        "perfect": sum(1 for item in tested if (item.get("best_quiz_score") or 0) >= 100),
        "retry": sum(1 for item in tested if (item.get("quiz_attempt_count") or 0) >= 2 and (item.get("best_quiz_score") or 0) >= 80),
        "models": models,
        "best_streak": best_streak,
        "challenges": len(challenges),
        "challenge_perfect": sum(1 for score in challenges if score >= 100),
    }
    today_types = types_by_day.get(today, set())
    return {
        "xp": xp,
        "level": level,
        "level_floor": level_floor(level),
        "next_level_xp": level_floor(level + 1),
        "breakdown": breakdown,
        "streak": {"current": current_streak, "best": best_streak},
        "active_days": len(types_by_day),
        "challenge_today": challenge_today,
        "daily_tasks": [
            {"id": task_id, "title": title, "done": task_done(today_types, wanted)} for task_id, title, wanted in DAILY_TASKS
        ],
        "badges": [
            {
                "id": badge_id,
                "title": title,
                "description": description,
                "earned": counters[counter] >= target,
                "current": min(counters[counter], target),
                "target": target,
            }
            for badge_id, title, description, counter, target in BADGES
        ],
    }
