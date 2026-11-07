import json
import logging
from pathlib import Path

from sqlalchemy.orm import Session

from database import SessionLocal
from models import Course, Lesson, Question, QuestionOption


logger = logging.getLogger("enginelab.catalog")
CATALOG_PATH = Path(__file__).resolve().parent / "data" / "course_catalog.json"
TEMPLATE_STEMS = ("Nhận định nào đúng nhất về", "Sản phẩm học tập nào phù hợp nhất với cách học môn Công nghệ")


def seed_catalog(db: Session, *, force: bool = False) -> dict[str, int | bool]:
    """Seed the API database from the same catalog bundled with the frontend.

    Existing installations are left untouched unless ``force`` is explicitly
    requested. This prevents a deployment from overwriting courses edited by a
    teacher while still making a fresh demo installation useful immediately.
    """
    existing_courses = db.query(Course).count()
    if existing_courses and not force:
        return {"seeded": False, "courses": existing_courses, "lessons": db.query(Lesson).count(), "questions": db.query(Question).count()}

    if not CATALOG_PATH.exists():
        logger.warning("Catalog seed file was not found at %s", CATALOG_PATH)
        return {"seeded": False, "courses": existing_courses, "lessons": 0, "questions": 0}

    catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    if force:
        db.query(QuestionOption).delete()
        db.query(Question).delete()
        db.query(Lesson).delete()
        db.query(Course).delete()
        db.flush()

    for item in catalog.get("courses", []):
        db.add(Course(**item))

    for item in catalog.get("lessons", []):
        db.add(Lesson(**item))

    for item in catalog.get("questions", []):
        question_data = {key: value for key, value in item.items() if key != "options"}
        question = Question(**question_data)
        db.add(question)
        for option in item.get("options", []):
            db.add(QuestionOption(question_id=question.id, **option))

    db.commit()
    result = {
        "seeded": True,
        "courses": len(catalog.get("courses", [])),
        "lessons": len(catalog.get("lessons", [])),
        "questions": len(catalog.get("questions", [])),
    }
    logger.info("Seeded learning catalog: %s", result)
    return result


def upgrade_template_questions(db: Session) -> int:
    """Replace questions still holding the old generated text.

    Ids stay the same, so past results keep pointing to their question. A question a teacher has
    rewritten no longer matches the templates and is left alone.
    """
    if not CATALOG_PATH.exists():
        return 0
    catalog = {item["id"]: item for item in json.loads(CATALOG_PATH.read_text(encoding="utf-8")).get("questions", [])}
    upgraded = 0
    for question in db.query(Question).filter(Question.id.in_(list(catalog))).all():
        if not question.text.startswith(TEMPLATE_STEMS):
            continue
        item = catalog[question.id]
        question.text = item["text"]
        question.difficulty = item["difficulty"]
        question.options.clear()
        db.flush()
        for option in item["options"]:
            db.add(QuestionOption(question_id=question.id, **option))
        upgraded += 1
    db.commit()
    if upgraded:
        logger.info("Replaced %s template questions", upgraded)
    return upgraded


def seed_catalog_if_empty() -> dict[str, int | bool]:
    db = SessionLocal()
    try:
        result = seed_catalog(db)
        upgrade_template_questions(db)
        return result
    except Exception:
        db.rollback()
        logger.exception("Unable to seed the learning catalog")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print(seed_catalog_if_empty())
