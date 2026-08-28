from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DATABASE_URL = f"sqlite:///{(PROJECT_ROOT / 'ai_education.db').as_posix()}"


class Settings(BaseSettings):
    """Application settings and configuration."""
    model_config = SettingsConfigDict(
        env_file="backend/.env",
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

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # JWT
    secret_key: str = "your-secret-key-change-in-production"
    access_token_expire_minutes: int = 30
    algorithm: str = "HS256"

    # CORS
    cors_origins: list = ["http://localhost:3000", "http://localhost:5173"]

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
    allow_teacher_self_registration: bool = False

settings = Settings()
