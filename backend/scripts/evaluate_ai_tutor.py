"""Run the tutor evaluation set against the live model and save answers for teacher rating.

    GEMINI_API_KEY=... python scripts/evaluate_ai_tutor.py --out ai_eval_results.json

Keyword checks only screen answers. The published result must come from the teacher rubric in
data/ai_tutor_eval_set.json, because a keyword match does not show that an answer is correct.
"""
import argparse
import asyncio
import json
import sys
from collections import Counter
from pathlib import Path
from types import SimpleNamespace

BACKEND = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND))

from ai_tutor import AITutorError, generate_ai_tutor_reply  # noqa: E402
from config import settings  # noqa: E402


def screen_answer(item: dict, answer: str) -> list[str]:
    """Return the keyword checks an answer failed; an empty list means it goes on to human rating."""
    text = answer.lower()
    problems = [f"thiếu: {term}" for term in item.get("must_include_all", []) if term.lower() not in text]
    any_of = item.get("must_include_any", [])
    if any_of and not any(term.lower() in text for term in any_of):
        problems.append("thiếu một trong: " + ", ".join(any_of))
    problems += [f"không được có: {term}" for term in item.get("must_not_include", []) if term.lower() in text]
    return problems


def find_lesson(catalog: dict, title_part: str) -> SimpleNamespace:
    lesson = next(item for item in catalog["lessons"] if title_part in item["title"])
    return SimpleNamespace(**{key: lesson.get(key) for key in ("id", "title", "description", "content")})


async def run(out_path: Path) -> None:
    evaluation = json.loads((BACKEND / "data" / "ai_tutor_eval_set.json").read_text(encoding="utf-8"))
    catalog = json.loads((BACKEND / "data" / "course_catalog.json").read_text(encoding="utf-8"))
    results = []
    for item in evaluation["items"]:
        row = {"id": item["id"], "category": item["category"], "question": item["question"], "model": settings.ai_model}
        try:
            answer = await generate_ai_tutor_reply(item["question"], lesson=find_lesson(catalog, item["lesson_match"]))
            row.update(answer=answer, screening_problems=screen_answer(item, answer), teacher_rubric_scores=None)
        except AITutorError as error:
            row.update(answer=None, error=str(error), screening_problems=["không có câu trả lời"], teacher_rubric_scores=None)
        results.append(row)
    out_path.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    flagged = Counter(row["category"] for row in results if row["screening_problems"])
    print(f"{len(results)} câu; bị gắn cờ theo nhóm: {dict(flagged)}; hãy để giáo viên chấm rubric trong {out_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    if not settings.ai_api_key:
        sys.exit("Chưa có khóa Gemini (GEMINI_API_KEY): chưa thể đánh giá mô hình trực tuyến.")
    asyncio.run(run(args.out))


if __name__ == "__main__":
    main()
