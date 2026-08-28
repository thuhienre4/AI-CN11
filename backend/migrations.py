from sqlalchemy import inspect, text


def _add_column_if_missing(connection, inspector, table_name, column_name, ddl):
    if not inspector.has_table(table_name):
        return
    existing_columns = {column["name"] for column in inspector.get_columns(table_name)}
    if column_name in existing_columns:
        return
    connection.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {ddl}"))


def run_startup_migrations(engine):
    """Small SQLite-friendly migrations for existing local installs.

    This project does not use Alembic yet. These additive migrations keep old
    local databases compatible after new LMS features add columns.
    """
    inspector = inspect(engine)
    with engine.begin() as connection:
        _add_column_if_missing(
            connection,
            inspector,
            "users",
            "student_class",
            "student_class VARCHAR(50) DEFAULT ''",
        )
        _add_column_if_missing(
            connection,
            inspector,
            "quiz_results",
            "attempt_id",
            "attempt_id INTEGER REFERENCES quiz_attempts(id)",
        )
        _add_column_if_missing(
            connection,
            inspector,
            "chat_history",
            "session_id",
            "session_id VARCHAR(64)",
        )
        _add_column_if_missing(
            connection,
            inspector,
            "chat_history",
            "response_mode",
            "response_mode VARCHAR(30) DEFAULT 'fallback'",
        )
        _add_column_if_missing(
            connection,
            inspector,
            "learning_events",
            "client_event_id",
            "client_event_id VARCHAR(80)",
        )
        _add_column_if_missing(
            connection,
            inspector,
            "learning_events",
            "occurred_at",
            "occurred_at DATETIME",
        )
        if inspector.has_table("learning_events"):
            connection.execute(
                text(
                    "CREATE UNIQUE INDEX IF NOT EXISTS ix_learning_events_client_event_id "
                    "ON learning_events (client_event_id)"
                )
            )
        _add_column_if_missing(
            connection,
            inspector,
            "reference_materials",
            "file_checksum",
            "file_checksum VARCHAR(64)",
        )
        _add_column_if_missing(
            connection,
            inspector,
            "classroom_posts",
            "status",
            "status VARCHAR(30) DEFAULT 'published'",
        )
        _add_column_if_missing(
            connection,
            inspector,
            "assignments",
            "status",
            "status VARCHAR(30) DEFAULT 'published'",
        )
        _add_column_if_missing(
            connection,
            inspector,
            "assignment_submissions",
            "file_checksum",
            "file_checksum VARCHAR(64)",
        )
        _add_column_if_missing(
            connection,
            inspector,
            "assignment_submissions",
            "score",
            "score FLOAT",
        )
        _add_column_if_missing(
            connection,
            inspector,
            "assignment_submissions",
            "feedback",
            "feedback TEXT DEFAULT ''",
        )
        _add_column_if_missing(
            connection,
            inspector,
            "assignment_submissions",
            "graded_by",
            "graded_by INTEGER REFERENCES users(id)",
        )
        _add_column_if_missing(
            connection,
            inspector,
            "assignment_submissions",
            "graded_at",
            "graded_at DATETIME",
        )
