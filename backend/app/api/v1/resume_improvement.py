"""
Resume Improvement Suggestions API Router.

Exposes an endpoint to generate personalized priority actions and resume formatting tips.
"""

import logging

from fastapi import APIRouter, Query

from app.schemas.resume_improvement import ResumeImprovementResponse
from app.services.resume_improvement_service import compute_resume_improvements

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/resume-improvements", tags=["Resume Improvements"])


@router.get(
    "/{role_id}",
    response_model=ResumeImprovementResponse,
    status_code=200,
    summary="Get Resume Improvement Suggestions",
    description="Generates actionable priority training goals, certification paths, and formatting fixes.",
    responses={
        404: {"description": "Target role ID not found in the taxonomy database."},
    },
)
async def get_resume_improvements(
    role_id: str,
    skills: list[str] = Query(default=[], description="Detected skill names"),
    name: str = Query(default="", description="Candidate name"),
    email: str = Query(default="", description="Candidate email"),
    phone: str = Query(default="", description="Candidate phone number"),
    summary: str = Query(default="", description="Candidate summary text"),
    exp_title: list[str] = Query(default=[], description="Parsed job titles"),
    exp_desc: list[str] = Query(default=[], description="Parsed job descriptions"),
    exp_duration: list[str] = Query(default=[], description="Parsed job durations"),
    edu_degree: list[str] = Query(default=[], description="Parsed degrees"),
    cert_name: list[str] = Query(default=[], description="Parsed certifications"),
) -> ResumeImprovementResponse:
    """Download compiled career report."""
    logger.info("Resume improvements endpoint hit | role_id=%s, name=%s", role_id, name)
    return compute_resume_improvements(
        role_id=role_id,
        skills=skills,
        name=name,
        email=email,
        phone=phone,
        summary=summary,
        exp_titles=exp_title,
        exp_descriptions=exp_desc,
        exp_durations=exp_duration,
        edu_degrees=edu_degree,
        cert_names=cert_name,
    )
