"""
Learning Roadmap API Router.

Exposes a deterministic personalized learning path generator for target role gaps.
"""

import logging

from fastapi import APIRouter, Query

from app.schemas.learning_roadmap import LearningRoadmapResponse
from app.services.learning_roadmap_service import generate_roadmap

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/learning-roadmap", tags=["Learning Roadmap"])


@router.get(
    "/{role_id}",
    response_model=LearningRoadmapResponse,
    status_code=200,
    summary="Get Personalized Learning Roadmap",
    description="Generates a dependency-ordered weekly roadmap based on missing skills and role prerequisites.",
    responses={
        404: {"description": "Target role ID not found in the taxonomy database."},
    },
)
async def get_learning_roadmap(
    role_id: str,
    skills: list[str] = Query(default=[], description="Candidate's current skill names"),
) -> LearningRoadmapResponse:
    """Trigger the learning path generation."""
    logger.info("Learning roadmap endpoint hit | role_id=%s", role_id)
    return generate_roadmap(skills, role_id)
