"""
Cybersecurity Role Intelligence API endpoints.

Exposes endpoints for listing and fetching roles from the cybersecurity taxonomy.
Deliberately thin; delegates all actions to the role service layer.
"""

import logging

from fastapi import APIRouter

from app.schemas.role import CybersecurityRoleResponse
from app.services.role_service import get_all_roles, get_role_by_id

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/roles", tags=["Role Intelligence"])


@router.get(
    "",
    response_model=list[CybersecurityRoleResponse],
    status_code=200,
    summary="List all cybersecurity roles",
    description="Returns the full list of supported cybersecurity career roles from the local taxonomy.",
)
async def list_roles() -> list[CybersecurityRoleResponse]:
    """Retrieve all cybersecurity roles."""
    logger.info("Roles list endpoint hit")
    return get_all_roles()


@router.get(
    "/{role_id}",
    response_model=CybersecurityRoleResponse,
    status_code=200,
    summary="Get details of a single role",
    description="Returns the details of a specific cybersecurity career role by its unique ID.",
    responses={
        404: {"description": "Role ID not found in the taxonomy database."},
    },
)
async def fetch_role(role_id: str) -> CybersecurityRoleResponse:
    """Retrieve details for a single role."""
    logger.info("Fetch role endpoint hit | id=%s", role_id)
    return get_role_by_id(role_id)
