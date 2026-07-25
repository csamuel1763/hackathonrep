"""
Career Matches API Router.

Exposes a ranked comparison endpoint of candidate alignment across all taxonomy roles.
"""

import logging

from fastapi import APIRouter, Query

from app.schemas.career_match import CareerMatchRole
from app.services.career_match_service import compute_career_matches

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/career-matches", tags=["Career Match Dashboard"])


@router.get(
    "",
    response_model=list[CareerMatchRole],
    status_code=200,
    summary="Get Ranked Career Role Matches",
    description="Calculates comparative suitability scores and returns a ranked list of all taxonomy cybersecurity roles.",
)
async def get_career_matches(
    skills: list[str] = Query(default=[], description="Candidate's current skill names"),
    exp_title: list[str] = Query(default=[], description="Parsed job titles"),
    exp_desc: list[str] = Query(default=[], description="Parsed job descriptions"),
    exp_duration: list[str] = Query(default=[], description="Parsed job durations"),
    edu_degree: list[str] = Query(default=[], description="Parsed degrees"),
    cert_name: list[str] = Query(default=[], description="Parsed certifications"),
) -> list[CareerMatchRole]:
    """Trigger career matches computation."""
    logger.info("Career matches endpoint hit | skills_count=%d", len(skills))
    return compute_career_matches(
        skills=skills,
        exp_titles=exp_title,
        exp_descriptions=exp_desc,
        exp_durations=exp_duration,
        edu_degrees=edu_degree,
        cert_names=cert_name,
    )
