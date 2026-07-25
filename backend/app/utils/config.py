"""
Application configuration.

Reads all settings from environment variables / .env file using Pydantic Settings.
No side effects on import. Use get_settings() wherever config is needed.
"""

from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Centralised, typed application configuration.

    All values are resolved from environment variables (case-insensitive).
    A .env file in the project root is loaded automatically.
    """

    # ── Application ────────────────────────────────────────────────────────
    app_env: str = "development"

    # Parsed into a list by the validator below; set as a comma-separated
    # string in .env: ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
    allowed_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # ── Database ───────────────────────────────────────────────────────────
    database_url: str

    # ── JWT Authentication ─────────────────────────────────────────────────
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60

    # ── Ollama Local AI LLM ────────────────────────────────────────────────
    ai_provider: str = "ollama"
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.1:8b"
    ollama_timeout_seconds: int = 120

    # ── File Upload ────────────────────────────────────────────────────────
    upload_dir: str = "uploads"
    max_file_size_mb: int = 10

    # ── Taxonomy ───────────────────────────────────────────────────────────
    taxonomy_file_path: str = "taxonomy/roles.json"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Validators ─────────────────────────────────────────────────────────

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def parse_allowed_origins(cls, value: str | list[str]) -> list[str]:
        """Accept comma-separated string, JSON array string, or a pre-parsed list."""
        if isinstance(value, str):
            stripped = value.strip()
            # Handle JSON array format: ["http://...", "http://..."]
            if stripped.startswith("["):
                import json as _json
                try:
                    parsed = _json.loads(stripped)
                    if isinstance(parsed, list):
                        return [str(o).strip() for o in parsed if str(o).strip()]
                except Exception:
                    pass
            # Handle comma-separated format: http://...,http://...
            return [origin.strip() for origin in stripped.split(",") if origin.strip()]
        return value

    # ── Derived properties ─────────────────────────────────────────────────

    @property
    def max_file_size_bytes(self) -> int:
        """Maximum upload size in bytes, derived from max_file_size_mb."""
        return self.max_file_size_mb * 1024 * 1024

    @property
    def is_development(self) -> bool:
        """True when running in development mode."""
        return self.app_env.lower() == "development"


@lru_cache
def get_settings() -> Settings:
    """Return the singleton Settings instance (cached after first call).

    Import and call this function wherever config values are needed::

        from app.utils.config import get_settings
        settings = get_settings()
    """
    return Settings()
