import logging
import os

from contextlib import asynccontextmanager

import anyio.to_thread
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from starlette import status

from config import secret_key_problem, settings
from bootstrap import ensure_bootstrap_admin
from catalog_seed import seed_catalog_if_empty
from database import Base, engine
from migrations import run_startup_migrations
import models  # noqa: F401

logger = logging.getLogger("enginelab")

_secret_problem = secret_key_problem(settings, os.environ)
if _secret_problem:
    raise RuntimeError(_secret_problem)

# Create tables
Base.metadata.create_all(bind=engine)
run_startup_migrations(engine)
seed_catalog_if_empty()
ensure_bootstrap_admin()

@asynccontextmanager
async def lifespan(_app: FastAPI):
    anyio.to_thread.current_default_thread_limiter().total_tokens = settings.worker_threads
    yield


# Initialize FastAPI app
app = FastAPI(
    lifespan=lifespan,
    title=settings.app_name,
    description="AI-powered educational platform",
    version=settings.version,
    debug=settings.debug,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    # Any local port during development only; a hosted server answers just the listed origins
    allow_origin_regex=None if settings.environment.lower() == "production" else r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Cross-Origin-Opener-Policy": "same-origin",
}


@app.middleware("http")
async def security_headers(request: Request, call_next):
    """The API only returns JSON and files: forbid framing, type sniffing and leaking the URL to other sites."""
    response = await call_next(request)
    for name, value in SECURITY_HEADERS.items():
        response.headers.setdefault(name, value)
    if request.url.path.startswith("/api/"):
        # Learning data and tokens must not stay in shared caches or the browser cache
        response.headers.setdefault("Cache-Control", "no-store")
    if request.url.scheme == "https" or request.headers.get("x-forwarded-proto") == "https":
        response.headers.setdefault("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
    return response


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Request validation failed.",
            # A validator's own message carries its exception in ctx, which JSON cannot hold
            "errors": [{key: value for key, value in error.items() if key != "ctx"} for error in exc.errors()],
            "path": str(request.url.path),
        },
    )


@app.exception_handler(SQLAlchemyError)
async def database_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.exception("Database error on %s", request.url.path, exc_info=exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Database operation failed.",
            "path": str(request.url.path),
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s", request.url.path, exc_info=exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Unexpected server error.",
            "path": str(request.url.path),
        },
    )


# ============= Health Check =============
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": settings.version}


@app.get("/", tags=["Info"])
async def root():
    """Root endpoint with API info."""
    return {
        "name": settings.app_name,
        "version": settings.version,
        "docs": "/docs",
        "openapi": "/openapi.json",
    }


# ============= Import Routes =============
from routes import accounts, auth, lessons, questions, quiz, chat, progress, materials, classroom, nova3d, realtime, ai_workspace, game_designs, game_rooms

app.include_router(ai_workspace.router)

app.include_router(auth.router)
app.include_router(accounts.router)
app.include_router(lessons.router)
app.include_router(questions.router)
app.include_router(quiz.router)
app.include_router(chat.router)
app.include_router(progress.router)
app.include_router(materials.router)
app.include_router(classroom.router)
app.include_router(nova3d.router)
app.include_router(realtime.router)
app.include_router(game_rooms.router)
app.include_router(game_designs.router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
    )
