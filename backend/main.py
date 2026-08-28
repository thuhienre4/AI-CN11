import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from starlette import status

from config import settings
from catalog_seed import seed_catalog_if_empty
from database import Base, engine
from migrations import run_startup_migrations
import models  # noqa: F401

logger = logging.getLogger("enginelab")

if settings.environment.lower() == "production" and settings.secret_key == "your-secret-key-change-in-production":
    raise RuntimeError("ENGINE_LAB_SECRET_KEY must be changed before production startup.")

# Create tables
Base.metadata.create_all(bind=engine)
run_startup_migrations(engine)
seed_catalog_if_empty()

# Initialize FastAPI app
app = FastAPI(
    title=settings.app_name,
    description="AI-powered educational platform",
    version=settings.version,
    debug=settings.debug,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Request validation failed.",
            "errors": exc.errors(),
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
from routes import auth, lessons, questions, quiz, chat, progress, materials, classroom, nova3d, realtime

app.include_router(auth.router)
app.include_router(lessons.router)
app.include_router(questions.router)
app.include_router(quiz.router)
app.include_router(chat.router)
app.include_router(progress.router)
app.include_router(materials.router)
app.include_router(classroom.router)
app.include_router(nova3d.router)
app.include_router(realtime.router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
    )
