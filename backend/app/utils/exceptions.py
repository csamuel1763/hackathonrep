"""
Custom exception hierarchy and FastAPI exception handlers.

Defines all domain-specific errors mapped to distinct HTTP status codes,
supporting structured JSON response envelopes and production-quality logging.
"""

import logging

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


# ── Base Exception ─────────────────────────────────────────────────────────────


class CareerPilotError(Exception):
    """Base class for all application-specific exceptions.

    Maps to standard HTTP status codes and formats structured JSON responses.
    """

    def __init__(self, message: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR) -> None:
        self.message = message
        self.status_code = status_code
        super().__init__(message)


# ── Domain Exceptions ──────────────────────────────────────────────────────────


class NotFoundError(CareerPilotError):
    """Raised when a requested resource does not exist."""

    def __init__(self, message: str = "Resource not found.") -> None:
        super().__init__(message, status_code=status.HTTP_404_NOT_FOUND)


class AuthenticationError(CareerPilotError):
    """Raised when credentials are missing or invalid."""

    def __init__(self, message: str = "Authentication failed.") -> None:
        super().__init__(message, status_code=status.HTTP_401_UNAUTHORIZED)


class AuthorizationError(CareerPilotError):
    """Raised when permissions are insufficient."""

    def __init__(self, message: str = "Permission denied.") -> None:
        super().__init__(message, status_code=status.HTTP_403_FORBIDDEN)


class ConflictError(CareerPilotError):
    """Raised on database or transaction conflicts."""

    def __init__(self, message: str = "Conflict occurred.") -> None:
        super().__init__(message, status_code=status.HTTP_409_CONFLICT)


class FileProcessingError(CareerPilotError):
    """Raised when file upload, size checks, or plain text extraction fails."""

    def __init__(self, message: str = "Invalid Resume.") -> None:
        super().__init__(message, status_code=status.HTTP_400_BAD_REQUEST)


class ExternalServiceError(CareerPilotError):
    """General wrapper for external dependency errors."""

    def __init__(self, message: str = "Unable to connect to OpenRouter.") -> None:
        super().__init__(message, status_code=status.HTTP_502_BAD_GATEWAY)


# ── AI Specific Exceptions ──────────────────────────────────────────────────────


class AIAPIKeyError(CareerPilotError):
    """Raised when the AI API key is missing or invalid."""

    def __init__(self, message: str = "Invalid AI configuration.") -> None:
        super().__init__(message, status_code=status.HTTP_401_UNAUTHORIZED)


class AIRateLimitError(CareerPilotError):
    """Raised when rate limit quotas are exceeded."""

    def __init__(self, message: str = "AI service is busy. Please try again.") -> None:
        super().__init__(message, status_code=status.HTTP_429_TOO_MANY_REQUESTS)


class AITimeoutError(CareerPilotError):
    """Raised when connection attempts time out."""

    def __init__(self, message: str = "Request timed out. Please retry.") -> None:
        super().__init__(message, status_code=status.HTTP_504_GATEWAY_TIMEOUT)


class AIInvalidJSONError(CareerPilotError):
    """Raised when AI service returns malformed response JSON."""

    def __init__(self, message: str = "AI service returned invalid JSON.") -> None:
        super().__init__(message, status_code=status.HTTP_502_BAD_GATEWAY)


class AIModelError(CareerPilotError):
    """Raised when an invalid model name is specified."""

    def __init__(self, message: str = "Invalid AI model specified.") -> None:
        super().__init__(message, status_code=status.HTTP_400_BAD_REQUEST)


class AINetworkError(CareerPilotError):
    """Raised when a network failure occurs during communication."""

    def __init__(self, message: str = "AI service unavailable due to network failure.") -> None:
        super().__init__(message, status_code=status.HTTP_502_BAD_GATEWAY)


# ── Exception Handlers ─────────────────────────────────────────────────────────


def register_exception_handlers(app: FastAPI) -> None:
    """Attach customized exception handlers to FastAPI."""

    @app.exception_handler(CareerPilotError)
    async def careerpilot_error_handler(request: Request, exc: CareerPilotError) -> JSONResponse:
        """Handle all domain-specific errors."""
        logger.warning(
            "Domain error | status=%d | type=%s | path=%s | message=%r",
            exc.status_code,
            type(exc).__name__,
            request.url.path,
            exc.message,
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": exc.message},
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        """Fallback handler for unhandled server errors (500)."""
        logger.exception("Unexpected server error occurred | path=%s", request.url.path)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "Unexpected server error"},
        )
