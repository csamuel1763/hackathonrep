"""
Logging configuration.

Provides two functions:
  - configure_logging(): call once at application startup (in lifespan).
  - get_logger(name): call in every module to obtain a named logger.

Deliberately kept simple. No third-party log libraries, no JSON formatters —
just stdlib logging with a readable format for dev and a concise format for prod.
"""

import logging
import sys


def configure_logging(level: str = "INFO") -> None:
    """Configure the root logger for the entire application.

    Must be called **once** during application startup before any log
    statements are emitted. Subsequent calls are harmless (no-ops if handlers
    are already present).

    Args:
        level: Logging level string, e.g. ``"DEBUG"``, ``"INFO"``, ``"WARNING"``.
    """
    root_logger = logging.getLogger()

    # Idempotent: skip if already configured
    if root_logger.handlers:
        return

    numeric_level = getattr(logging, level.upper(), logging.INFO)
    root_logger.setLevel(numeric_level)

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(numeric_level)

    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s — %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(formatter)
    root_logger.addHandler(handler)

    # Silence noisy third-party loggers in production
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.INFO if level.upper() == "DEBUG" else logging.WARNING
    )


def get_logger(name: str) -> logging.Logger:
    """Return a named logger for a module.

    Usage::

        from app.utils.logger import get_logger
        logger = get_logger(__name__)
        logger.info("Starting %s", service_name)

    Args:
        name: Logger name, typically ``__name__`` of the calling module.

    Returns:
        A :class:`logging.Logger` instance.
    """
    return logging.getLogger(name)
