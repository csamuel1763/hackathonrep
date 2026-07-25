"""
Async database engine, session factory, and FastAPI dependency.

Design decisions:
  - Engine and session factory are module-level singletons, lazily initialized.
  - init_engine() is called ONCE in the FastAPI lifespan (startup).
  - dispose_engine() is called ONCE in the FastAPI lifespan (shutdown).
  - get_db() is a per-request FastAPI dependency that yields a managed session.
  - No engine is created at import time.
"""

import logging
from collections.abc import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.utils.config import get_settings

logger = logging.getLogger(__name__)

# Module-level singletons — only populated after init_engine() is called.
_engine: AsyncEngine | None = None
_session_factory: async_sessionmaker[AsyncSession] | None = None


# ── Lifecycle ──────────────────────────────────────────────────────────────────


def init_engine() -> AsyncEngine:
    """Create the async SQLAlchemy engine and session factory.

    Must be called once during application startup (inside the lifespan context
    manager) before any database operations are attempted.

    Returns:
        The created :class:`AsyncEngine` instance.
    """
    global _engine, _session_factory

    settings = get_settings()

    _engine = create_async_engine(
        settings.database_url,
        # Echo SQL in development; silence in production to avoid log spam
        echo=settings.is_development,
        # Validate connections on checkout to detect stale connections
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
    )

    _session_factory = async_sessionmaker(
        bind=_engine,
        class_=AsyncSession,
        # Prevent attribute access errors after commit
        expire_on_commit=False,
    )

    logger.info("Database engine initialised | url=%s", _mask_url(settings.database_url))
    return _engine


async def dispose_engine() -> None:
    """Dispose the engine and release all pooled connections.

    Must be called once during application shutdown (inside the lifespan
    context manager).
    """
    global _engine, _session_factory

    if _engine is not None:
        await _engine.dispose()
        _engine = None
        _session_factory = None
        logger.info("Database engine disposed.")


async def verify_connection() -> None:
    """Ping the database to confirm connectivity.

    Raises:
        RuntimeError: Engine has not been initialised.
        sqlalchemy.exc.OperationalError: Database is unreachable.
    """
    if _engine is None:
        raise RuntimeError("Database engine is not initialised. Call init_engine() first.")

    async with _engine.connect() as conn:
        await conn.execute(text("SELECT 1"))

    logger.info("Database connectivity verified.")


# ── FastAPI Dependency ─────────────────────────────────────────────────────────


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Yield a per-request async database session.

    Commits on success; rolls back on any unhandled exception.
    Use as a FastAPI dependency::

        from app.database.connection import get_db

        @router.get("/example")
        async def example(db: AsyncSession = Depends(get_db)):
            ...

    Raises:
        RuntimeError: Engine has not been initialised.
    """
    if _session_factory is None:
        raise RuntimeError("Database engine is not initialised. Call init_engine() first.")

    async with _session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


# ── Helpers ────────────────────────────────────────────────────────────────────


def _mask_url(url: str) -> str:
    """Return the database URL with the password replaced by '***'.

    Prevents credentials from appearing in logs.

    Args:
        url: Raw database connection URL.

    Returns:
        URL string with password masked.
    """
    try:
        # Format: scheme://user:password@host/db
        if "@" in url:
            prefix, rest = url.rsplit("@", 1)
            scheme_user = prefix.rsplit(":", 1)[0]
            return f"{scheme_user}:***@{rest}"
    except Exception:
        pass
    return url
