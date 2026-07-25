"""
CareerPilot AI — FastAPI application entry point.

Responsibilities of this module:
  - Define the application lifespan (startup / shutdown hooks).
  - Assemble the FastAPI instance via create_app().
  - Register middleware (CORS).
  - Register exception handlers.
  - Mount API routers.
"""

import logging
from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.utils.config import get_settings
from app.utils.logger import configure_logging, get_logger
from app.utils.exceptions import register_exception_handlers
from app.database.connection import init_engine, dispose_engine, verify_connection


# ── Lifespan ───────────────────────────────────────────────────────────────────


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Manage startup and shutdown of shared resources."""
    settings = get_settings()

    # 1. Logging — must come before any logger usage
    configure_logging(level="DEBUG" if settings.is_development else "INFO")
    logger = get_logger(__name__)
    logger.info("CareerPilot AI starting | env=%s", settings.app_env)

    # Ollama AI Config Verification
    from app.ai.ollama_client import verify_ai_configuration
    verify_ai_configuration()

    # 2. Database engine
    init_engine()

    # 3. Connectivity check — log warning if DB is unreachable during development (decoupled mode)
    try:
        await verify_connection()
    except Exception as exc:
        logger.warning("Database connectivity check failed: %s. Running in decoupled mode.", exc)

    yield  # Application is live and serving requests

    # ── Shutdown ───────────────────────────────────────────────────────────
    await dispose_engine()
    logger.info("CareerPilot AI shutdown complete.")


# ── Application Factory ────────────────────────────────────────────────────────


def create_app() -> FastAPI:
    """Construct and configure the FastAPI application."""
    settings = get_settings()

    app = FastAPI(
        title="CareerPilot AI",
        description=(
            "AI-powered Cybersecurity Career Intelligence and "
            "Personalised Learning Platform."
        ),
        version="0.1.0",
        docs_url="/api/docs" if settings.is_development else None,
        redoc_url="/api/redoc" if settings.is_development else None,
        lifespan=lifespan,
    )

    # ── Middleware (Dynamic CORS for local dev ports: 5173, 5174, 3000, etc.) ────
    origins = list(settings.allowed_origins)
    default_dev_origins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:3000",
    ]
    for dev_o in default_dev_origins:
        if dev_o not in origins:
            origins.append(dev_o)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?" if settings.is_development else None,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Exception Handlers ─────────────────────────────────────────────────
    register_exception_handlers(app)

    # ── API Routers ────────────────────────────────────────────────────────
    from app.api.router import api_router
    app.include_router(api_router)

    return app


# ── Module-level app instance (used by Uvicorn) ────────────────────────────────
app: FastAPI = create_app()
