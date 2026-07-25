"""
Skill Gap Analysis API Endpoints.

Exposes a deterministic gap analysis endpoint. All computational logic is delegated to the service layer.
"""

import logging

from fastapi import APIRouter, Query

from app.schemas.gap_analysis import GapAnalysisRequest, GapAnalysisResponse, SkillGapResponse
from app.services.gap_analysis_service import compute_gap_analysis
from app.services.skill_gap_service import compute_skill_gap

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/gap-analysis", tags=["Skill Gap Analysis"])


@router.post(
    "",
    response_model=GapAnalysisResponse,
    status_code=200,
    summary="Compute skill gap analysis",
    description=(
        "Compares a candidate's parsed skills against the required skills "
        "defined for a selected target role, computing matched/missing skills, "
        "covered/missing categories, and percentages."
    ),
    responses={
        404: {"description": "Target role ID not found in the taxonomy database."},
    },
)
async def analyze_skills_gap(request: GapAnalysisRequest) -> GapAnalysisResponse:
    """Trigger the deterministic gap analysis comparison."""
    logger.info("Skill gap analysis request received for role_id=%s", request.role_id)
    return compute_gap_analysis(request.skills, request.role_id)


@router.get(
    "/{role_id}",
    response_model=SkillGapResponse,
    status_code=200,
    summary="Get skill gap analysis for a target role",
    description=(
        "Compares a list of detected skills passed as query parameters against "
        "the required skills of a target role."
    ),
    responses={
        404: {"description": "Target role ID not found in the taxonomy database."},
    },
)
async def get_role_skill_gap(
    role_id: str,
    skills: list[str] = Query(default=[], description="List of detected skills from resume"),
) -> SkillGapResponse:
    """Compare a list of skills against the required skills of a target role ID."""
    logger.info("GET Skill gap analysis requested | role_id=%s | skills_count=%d", role_id, len(skills))
    return compute_skill_gap(skills, role_id)
