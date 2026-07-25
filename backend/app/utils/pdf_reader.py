"""
PDF text extraction utility.

Handles extraction of plain text from PDF files using PyMuPDF (fitz).
Does not interact with the database or external APIs.
"""

import logging
from pathlib import Path
import fitz  # PyMuPDF

from app.utils.exceptions import FileProcessingError

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_path: Path) -> str:
    """Extract plain text from a PDF file.

    Iterates through all pages of the PDF and extracts plain text.

    Args:
        file_path: Path to the PDF file.

    Returns:
        The extracted plain text.

    Raises:
        FileProcessingError: If the PDF cannot be opened or parsed.
    """
    try:
        text_parts: list[str] = []
        with fitz.open(str(file_path)) as doc:
            for page in doc:
                page_text = page.get_text()
                if page_text:
                    text_parts.append(page_text)

        extracted_text = "\n\n".join(text_parts).strip()
        if not extracted_text:
            raise FileProcessingError("PDF file is empty or contains no readable text.")

        logger.info("PDF extraction successful | path=%s | chars=%d", file_path, len(extracted_text))
        return extracted_text

    except fitz.FileDataError as exc:
        logger.error("Failed to parse PDF file | path=%s | error=%s", file_path, exc)
        raise FileProcessingError("The uploaded PDF file is corrupt or invalid.") from exc
    except Exception as exc:
        logger.error("Unexpected error during PDF extraction | path=%s | error=%s", file_path, exc)
        raise FileProcessingError("Failed to extract text from the PDF file.") from exc
