from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from starlette.requests import HTTPConnection
from config import settings

is_sqlite = settings.database_url.startswith("sqlite")
engine_options = {
    "echo": settings.debug,
    "pool_pre_ping": True,
    "pool_size": settings.db_pool_size,
    "max_overflow": settings.db_max_overflow,
    "pool_timeout": settings.db_pool_timeout_seconds,
}
if is_sqlite:
    engine_options["connect_args"] = {"check_same_thread": False, "timeout": 30}

def configure_sqlite_transactions(sqlite_engine):
    @event.listens_for(sqlite_engine, "connect")
    def configure_connection(connection, _record):
        # SQLAlchemy must own transaction control for BEGIN IMMEDIATE below to apply.
        connection.isolation_level = None
        connection.execute("PRAGMA journal_mode=WAL")
        connection.execute("PRAGMA synchronous=NORMAL")

    @event.listens_for(sqlite_engine, "begin")
    def begin_transaction(connection):
        # A write request reads, then writes. A deferred transaction cannot upgrade once another
        # writer has committed, so writers take the lock up front and queue. Readers never block
        # each other under WAL, which is why GET handlers must not write.
        read_only = connection.get_execution_options().get("read_only_request", False)
        connection.exec_driver_sql("BEGIN" if read_only else "BEGIN IMMEDIATE")


# Create database engine
engine = create_engine(settings.database_url, **engine_options)
if is_sqlite:
    configure_sqlite_transactions(engine)
read_engine = engine.execution_options(read_only_request=True)

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Create base for models
Base = declarative_base()


def get_db(connection: HTTPConnection):
    """Get a request-scoped session; read requests and socket handshakes take no write lock."""
    db = SessionLocal(bind=read_engine if connection.scope.get("method", "GET") == "GET" else engine)
    try:
        yield db
    finally:
        db.close()
