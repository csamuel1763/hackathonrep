"""
Career Readiness Score API Router.

Exposes a deterministic readiness scoring endpoint for candidates.
"""

import logging

from fastapi import APIRouter, Query

from app.schemas.readiness_score import ReadinessScoreResponse
from app.services.readiness_score_service import compute_readiness_score

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/readiness-score", tags=["Career Readiness Score"])


@router.get(
    "/{role_id}",
    response_model=ReadinessScoreResponse,
    status_code=200,
    summary="Compute Career Readiness Score",
    description="Evaluate and score a candidate's readiness level for a target role.",
    responses={
        404: {"description": "Target role ID not found in the taxonomy database."},
    },
)
async def get_readiness_score(
    role_id: str,
    skills: list[str] = Query(default=[], description="Detected skill names"),
    exp_title: list[str] = Query(default=[], description="Parsed job titles"),
    exp_desc: list[str] = Query(default=[], description="Parsed job descriptions"),
    exp_duration: list[str] = Query(default=[], description="Parsed job durations"),
    edu_degree: list[str] = Query(default=[], description="Parsed degree names"),
    cert_name: list[str] = Query(default=[], description="Parsed certification names"),
) -> ReadinessScoreResponse:
    """Trigger the career readiness score computation."""
    logger.info("Readiness score endpoint hit | role_id=%s", role_id)
    return compute_readiness_score(
        role_id=role_id,
        skills=skills,
        exp_titles=exp_title,
        exp_descriptions=exp_desc,
        exp_durations=exp_duration,
        edu_degrees=edu_degree,
        cert_names=cert_name,
    )
