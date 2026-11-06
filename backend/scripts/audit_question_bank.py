"""Describe the seeded question bank: distribution by type, grade and chapter, plus structural weaknesses.

    python scripts/audit_question_bank.py
"""
import json
import re
from collections import Counter
from pathlib import Path

CATALOG = Path(__file__).resolve().parents[1] / "data" / "course_catalog.json"


def audit(catalog: dict) -> dict:
    questions = catalog["questions"]
    lessons = {lesson["id"]: lesson for lesson in catalog["lessons"]}
    courses = {course["id"]: course for course in catalog["courses"]}

    def correct(question):
        return next(option for option in question["options"] if option["is_correct"])

    def chapter(question):
        return courses[lessons[question["lesson_id"]]["course_id"]]

    distractors = Counter(o["text"] for q in questions for o in q["options"] if not o["is_correct"])
    return {
        "questions": len(questions),
        "options": sum(len(q["options"]) for q in questions),
        "by_type": dict(Counter(q["question_type"] for q in questions)),
        "options_per_question": dict(Counter(len(q["options"]) for q in questions)),
        "by_difficulty": dict(Counter(q["difficulty"] for q in questions)),
        "by_grade": dict(Counter(f"Lớp {str(chapter(q)['id'])[:2]}" for q in questions)),
        "by_chapter": dict(Counter(f"{chapter(q)['id']} {chapter(q)['title']}" for q in questions)),
        "distinct_stem_patterns": len({re.sub(r'"[^"]*"', '"…"', q["text"]) for q in questions}),
        "distinct_distractors": len(distractors),
        "distractor_uses": sum(distractors.values()),
        "correct_position": dict(Counter(correct(q)["order"] for q in questions)),
        "correct_is_longest_option": sum(
            max(q["options"], key=lambda option: len(option["text"]))["is_correct"] for q in questions
        ),
    }


if __name__ == "__main__":
    print(json.dumps(audit(json.loads(CATALOG.read_text(encoding="utf-8"))), ensure_ascii=False, indent=2))
