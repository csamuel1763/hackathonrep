"""
File I/O utilities for resume uploads.

Responsibilities:
  - Validate file extension and size.
  - Generate a collision-safe filename.
  - Persist an UploadFile to disk asynchronously.
  - Delete a file safely.

No business logic. No database interaction. No parsing.
"""

import uuid
import logging
from pathlib import Path

import aiofiles
from fastapi import UploadFile

from app.utils.config import get_settings
from app.utils.exceptions import FileProcessingError

logger = logging.getLogger(__name__)

# Supported resume file extensions (lowercase)
ALLOWED_EXTENSIONS: frozenset[str] = frozenset({".pdf", ".docx"})


# ── Validation ─────────────────────────────────────────────────────────────────


def validate_file_extension(filename: str) -> None:
    """Raise FileProcessingError if the file extension is not allowed.

    Args:
        filename: Original filename from the upload, e.g. ``"resume.pdf"``.

    Raises:
        FileProcessingError: Extension is not in ALLOWED_EXTENSIONS.
    """
    suffix = Path(filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise FileProcessingError(
            f"Unsupported file type '{suffix}'. Only PDF and DOCX are accepted."
        )


def validate_file_size(size_bytes: int) -> None:
    """Raise FileProcessingError if the file exceeds the configured size limit.

    Args:
        size_bytes: File size in bytes.

    Raises:
        FileProcessingError: File is larger than ``MAX_FILE_SIZE_MB``.
    """
    settings = get_settings()
    if size_bytes > settings.max_file_size_bytes:
        raise FileProcessingError(
            f"File size {size_bytes / (1024 ** 2):.1f} MB exceeds the "
            f"{settings.max_file_size_mb} MB limit."
        )


# ── Naming ─────────────────────────────────────────────────────────────────────


def generate_safe_filename(original_filename: str) -> str:
    """Return a UUID-based filename preserving the original extension.

    Prevents path-traversal attacks and filename collisions.

    Args:
        original_filename: The raw filename from the client upload.

    Returns:
        A safe, unique filename such as ``"a3f8...d2.pdf"``.
    """
    suffix = Path(original_filename).suffix.lower()
    return f"{uuid.uuid4().hex}{suffix}"


# ── Persistence ────────────────────────────────────────────────────────────────


async def save_upload_file(upload_file: UploadFile) -> Path:
    """Validate, read, and write an uploaded file to the upload directory.

    Reads the entire file into memory for size validation before writing,
    which is safe for the configured 10 MB maximum.

    Args:
        upload_file: The :class:`fastapi.UploadFile` received from the request.

    Returns:
        Absolute :class:`pathlib.Path` of the saved file.

    Raises:
        FileProcessingError: Extension or size validation fails.
    """
    original_name = upload_file.filename or "resume"
    validate_file_extension(original_name)

    content: bytes = await upload_file.read()
    validate_file_size(len(content))

    settings = get_settings()
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)

    safe_name = generate_safe_filename(original_name)
    destination = upload_dir / safe_name

    async with aiofiles.open(destination, "wb") as file_handle:
        await file_handle.write(content)

    logger.info("File saved | path=%s | size=%d bytes", destination, len(content))
    return destination


# ── Deletion ───────────────────────────────────────────────────────────────────


def delete_file(path: Path) -> None:
    """Delete a file from disk if it exists. No-op if the file is absent.

    Args:
        path: Absolute path to the file to remove.
    """
    if path.exists():
        path.unlink()
        logger.info("File deleted | path=%s", path)
