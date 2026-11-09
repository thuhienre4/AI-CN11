from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DATABASE_URL = f"sqlite:///{(PROJECT_ROOT / 'ai_education.db').as_posix()}"


class Settings(BaseSettings):
    """Application settings and configuration."""
    model_config = SettingsConfigDict(
        env_file=PROJECT_ROOT / "backend" / ".env",
        env_prefix="ENGINE_LAB_",
        case_sensitive=False,
        extra="ignore",
    )

    # Basic App Settings
    app_name: str = "AI Education System"
    debug: bool = False
    version: str = "0.1.0"
    environment: str = "development"

    # Database
    database_url: str = DEFAULT_DATABASE_URL
    db_pool_size: int = 20
    db_max_overflow: int = 20
    db_pool_timeout_seconds: float = 30.0
    # Must exceed db_pool_size + db_max_overflow: a request only returns its connection when a worker
    # thread runs its cleanup, so workers all waiting for a connection would deadlock until timeout.
    worker_threads: int = 120

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # JWT
    secret_key: str = "your-secret-key-change-in-production"
    access_token_expire_minutes: int = 30
    algorithm: str = "HS256"

    # CORS
    cors_origins: list = ["http://localhost:3000", "http://localhost:5173", "https://thuhienre4.github.io"]

    # AI Service0
    ai_provider: str = "gemini"
    ai_model: str = "gemini-2.5-flash"
    ai_api_key: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("ENGINE_LAB_AI_API_KEY", "GEMINI_API_KEY"),
    )
    ai_base_url: Optional[str] = None
    ai_timeout_seconds: float = 30.0
    ai_max_output_tokens: int = 800

    # Nova3D GraphFlow Service
    nova3d_base_url: str = "https://nova3d.xyz/api"
    nova3d_auth_token: Optional[str] = None
    nova3d_provider: str = "gemini"
    nova3d_llm: str = "gemini"
    nova3d_provider_api_key: Optional[str] = None

    # Features
    enable_3d_simulation: bool = True
    enable_chatbot: bool = True
    enable_gamification: bool = True
    allow_teacher_self_registration: bool = False  # True skips administrator approval
    require_student_verification: bool = True

    # Storage of uploaded files. On a host whose disk is wiped at each deploy (Railway), point this at a volume.
    upload_dir: Optional[str] = None

    # Number of reverse proxies in front of the app that append to X-Forwarded-For (Railway: 1).
    # 0 uses the socket address. Only the entries those proxies added are trusted, never what the client sent.
    trusted_proxy_hops: int = 0

    # First administrator, created at startup when no administrator exists yet (see bootstrap.py).
    bootstrap_admin_username: Optional[str] = None
    bootstrap_admin_email: Optional[str] = None
    bootstrap_admin_password: Optional[str] = None

    @property
    def uploads_root(self) -> Path:
        return Path(self.upload_dir) if self.upload_dir else PROJECT_ROOT / "backend" / "uploads"

DEFAULT_SECRET_KEY = "your-secret-key-change-in-production"
MIN_SECRET_LENGTH = 32


def secret_key_problem(config: Settings, environ: dict) -> str | None:
    """Why the signing key may not be used on this host. Anyone who knows the key can mint a token for any account,
    so a hosted server (production, or anything Railway runs) refuses the shipped default and short keys."""
    hosted = config.environment.lower() == "production" or bool(environ.get("RAILWAY_ENVIRONMENT"))
    if not hosted:
        return None
    if config.secret_key == DEFAULT_SECRET_KEY:
        return "ENGINE_LAB_SECRET_KEY must be set before the server runs on a host."
    if len(config.secret_key) < MIN_SECRET_LENGTH:
        return f"ENGINE_LAB_SECRET_KEY must have at least {MIN_SECRET_LENGTH} characters."
    return None


settings = Settings()
