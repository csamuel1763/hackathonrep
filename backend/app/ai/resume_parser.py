"""
Resume text extraction dispatcher.

Coordinates file-type-specific text extraction, delegating PDF handling
to the pdf_reader utility and handling DOCX files natively using python-docx.
"""

import logging
from pathlib import Path
from docx import Document

from app.utils.exceptions import FileProcessingError
from app.utils.pdf_reader import extract_text_from_pdf

logger = logging.getLogger(__name__)


def _extract_from_docx(file_path: Path) -> str:
    """Extract plain text from a DOCX file using python-docx.

    Args:
        file_path: Path to the DOCX file.

    Returns:
        The extracted plain text.

    Raises:
        FileProcessingError: If the DOCX cannot be opened or parsed.
    """
    try:
        doc = Document(str(file_path))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        extracted_text = "\n".join(paragraphs).strip()

        if not extracted_text:
            raise FileProcessingError("DOCX file is empty or contains no readable text.")

        logger.info("DOCX extraction successful | path=%s | chars=%d", file_path, len(extracted_text))
        return extracted_text

    except Exception as exc:
        logger.error("Failed to parse DOCX file | path=%s | error=%s", file_path, exc)
        raise FileProcessingError("Failed to extract text from the DOCX file.") from exc


def extract_text(file_path: Path) -> str:
    """Extract plain text from a PDF or DOCX resume document.

    Args:
        file_path: Path to the resume file.

    Returns:
        Clean plain text from the document.

    Raises:
        FileProcessingError: If the file type is unsupported or extraction fails.
    """
    suffix = file_path.suffix.lower()

    if suffix == ".pdf":
        return extract_text_from_pdf(file_path)
    elif suffix == ".docx":
        return _extract_from_docx(file_path)
    else:
        logger.warning("Unsupported file type upload attempted | extension=%s", suffix)
        raise FileProcessingError(
            f"Unsupported file type '{suffix}'. Only PDF and DOCX files are allowed."
        )
