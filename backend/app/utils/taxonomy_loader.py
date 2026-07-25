"""
Taxonomy loader utility.

Responsible for loading and parsing the local cybersecurity roles taxonomy
from the taxonomy/roles.json file.
"""

import json
import logging
from pathlib import Path
from typing import Any

from app.utils.exceptions import FileProcessingError

logger = logging.getLogger(__name__)


def load_roles_taxonomy() -> list[dict[str, Any]]:
    """Load the cybersecurity roles taxonomy from the JSON file."""
    this_file = Path(__file__).resolve()

    candidate_paths = [
        this_file.parent.parent.parent / "taxonomy" / "roles.json",
        this_file.parent.parent / "taxonomy" / "roles.json",
        this_file.parent.parent.parent.parent / "taxonomy" / "roles.json",
        Path.cwd() / "taxonomy" / "roles.json",
        Path.cwd() / "backend" / "taxonomy" / "roles.json",
        Path.cwd().parent / "taxonomy" / "roles.json",
        Path("/app/taxonomy/roles.json"),
    ]

    roles_path = next((p for p in candidate_paths if p and p.exists()), None)

    if not roles_path:
        logger.error("Roles taxonomy file not found in any candidate paths: %s", candidate_paths)
        raise FileProcessingError(
            "Roles taxonomy database is currently unavailable. File not found."
        )

    try:
        with open(roles_path, "r", encoding="utf-8") as file:
            roles_data = json.load(file)
            if not isinstance(roles_data, list):
                raise ValueError("Taxonomy data must be a list of roles.")
            return roles_data
    except Exception as exc:
        logger.error("Failed to load roles taxonomy JSON | path=%s | error=%s", roles_path, exc)
        raise FileProcessingError(
            "Failed to load or parse the cybersecurity roles database."
        ) from exc
