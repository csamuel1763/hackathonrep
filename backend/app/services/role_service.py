"""
Role intelligence service layer.

Retrieves role data from the taxonomy loader and exposes domain-validated models.
Standardizes and normalizes required skill names during loading.
"""

import logging

from app.schemas.role import CybersecurityRoleResponse
from app.utils.exceptions import NotFoundError
from app.utils.taxonomy_loader import load_roles_taxonomy
from app.utils.skill_normalizer import normalize_skill

logger = logging.getLogger(__name__)


def get_all_roles() -> list[CybersecurityRoleResponse]:
    """Retrieve and validate all cybersecurity roles from the taxonomy.

    Standardizes all required skill names before validation.

    Returns:
        List of CybersecurityRoleResponse models.
    """
    raw_roles = load_roles_taxonomy()
    roles = []

    for role in raw_roles:
        # Normalize required skill names
        if "required_skills" in role:
            for skill in role["required_skills"]:
                if "name" in skill:
                    skill["name"] = normalize_skill(skill["name"])
        roles.append(CybersecurityRoleResponse.model_validate(role))

    logger.info("Loaded and validated roles | count=%d", len(roles))
    return roles


def get_role_by_id(role_id: str) -> CybersecurityRoleResponse:
    """Retrieve a single cybersecurity role by its unique ID.

    Standardizes all required skill names before validation.

    Args:
        role_id: Slug identifier of the role (e.g. 'soc-analyst').

    Returns:
        The matching CybersecurityRoleResponse model.

    Raises:
        NotFoundError: If no matching role is found in the taxonomy database.
    """
    raw_roles = load_roles_taxonomy()
    for role in raw_roles:
        if role.get("id") == role_id:
            # Normalize required skill names
            if "required_skills" in role:
                for skill in role["required_skills"]:
                    if "name" in skill:
                        skill["name"] = normalize_skill(skill["name"])
            logger.info("Role found | id=%s | name=%s", role_id, role.get("name"))
            return CybersecurityRoleResponse.model_validate(role)

    logger.warning("Requested role not found in taxonomy | id=%s", role_id)
    raise NotFoundError(f"Cybersecurity role with ID '{role_id}' was not found in the database.")
