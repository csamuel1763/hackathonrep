"""
Resume processing API endpoints.

Handles files uploaded via multipart form data, routing them to the service layer.
No business logic is defined directly in this router layer.
"""

import logging

from fastapi import APIRouter, File, UploadFile
from fastapi.responses import JSONResponse

from app.schemas.resume import ParsedResumeResponse
from app.services.resume_service import parse_uploaded_resume

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/resume", tags=["Resume"])


@router.post(
    "/parse",
    response_model=ParsedResumeResponse,
    status_code=200,
    summary="Upload and parse a resume file",
    description=(
        "Extracts plaintext and utilizes local Ollama AI to parse it into "
        "a structured JSON resume profile."
    ),
    responses={
        200: {"description": "Resume successfully parsed."},
        400: {"description": "Invalid file format or upload error."},
        500: {"description": "Internal processing failure."},
        502: {"description": "Local AI or external service error."},
    },
)
async def parse_resume(file: UploadFile = File(...)) -> ParsedResumeResponse:
    """Ingest, extract, and parse resume details to JSON."""
    logger.info("Resume parse endpoint hit | filename=%s", file.filename)
    return await parse_uploaded_resume(file)


@router.get(
    "/health",
    tags=["Resume"],
    summary="Health check for the resume endpoint",
    include_in_schema=False,
)
async def health_check() -> JSONResponse:
    """Liveness probe returning service health and local AI metadata."""
    from app.utils.config import get_settings
    settings = get_settings()
    return JSONResponse(content={
        "status": "healthy",
        "service": "resume-pipeline",
        "ai_provider": getattr(settings, "ai_provider", "ollama"),
        "ollama_model": settings.ollama_model,
        "ollama_base_url": settings.ollama_base_url
    })
