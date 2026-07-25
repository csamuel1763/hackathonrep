"""
Digital Twin & Profile Intelligence API Router.

Exposes endpoints for AI Digital Twin generation, GitHub & LinkedIn intelligence analysis,
Cross-Profile validation, and 14-role career compatibility rankings.
"""

import logging
from fastapi import APIRouter, HTTPException

from app.schemas.digital_twin import (
    DigitalTwinRequest,
    DigitalTwinProfileResponse,
    GitHubAnalysisRequest,
    GitHubAnalysisResponse,
    LinkedInAnalysisRequest,
    LinkedInAnalysisResponse,
    CrossProfileValidationRequest,
    CrossProfileValidationResponse,
)
from app.services.digital_twin_service import generate_digital_twin, validate_cross_profiles
from app.services.github_service import analyze_github_profile
from app.services.linkedin_service import analyze_linkedin_profile

logger = logging.getLogger(__name__)

router = APIRouter(prefix="", tags=["Digital Twin & Intelligence"])


@router.post(
    "/digital-twin/generate",
    response_model=DigitalTwinProfileResponse,
    status_code=200,
    summary="Generate AI Digital Twin Profile",
    description="Assembles candidate's permanent AI Digital Twin profile, 10D Career DNA, Skill Graph, and 14-role career rankings.",
)
async def generate_digital_twin_endpoint(req: DigitalTwinRequest) -> DigitalTwinProfileResponse:
    """Generate complete AI Digital Twin profile."""
    logger.info("Digital Twin generate hit | candidate=%s", req.name)
    return await generate_digital_twin(req)


@router.post(
    "/github/analyze",
    response_model=GitHubAnalysisResponse,
    status_code=200,
    summary="Analyze GitHub Profile & Repositories",
    description="Fetches public repositories, languages, security tools, and calls OpenRouter AI for portfolio insights.",
)
async def analyze_github_endpoint(req: GitHubAnalysisRequest) -> GitHubAnalysisResponse:
    """Analyze GitHub profile."""
    if not req.username or not req.username.strip():
        raise HTTPException(status_code=400, detail="GitHub username cannot be empty.")
    logger.info("GitHub analyze hit | username=%s", req.username)
    return await analyze_github_profile(req)


@router.post(
    "/linkedin/analyze",
    response_model=LinkedInAnalysisResponse,
    status_code=200,
    summary="Analyze LinkedIn Profile",
    description="Evaluates professional branding, recruiter attractiveness, keyword optimization, and networking suggestions.",
)
async def analyze_linkedin_endpoint(req: LinkedInAnalysisRequest) -> LinkedInAnalysisResponse:
    """Analyze LinkedIn profile."""
    if not req.linkedin_url or not req.linkedin_url.strip():
        raise HTTPException(status_code=400, detail="LinkedIn URL cannot be empty.")
    logger.info("LinkedIn analyze hit | url=%s", req.linkedin_url)
    return await analyze_linkedin_profile(req)


@router.post(
    "/cross-profile/validate",
    response_model=CrossProfileValidationResponse,
    status_code=200,
    summary="Cross Profile Consistency Validation",
    description="Compares Resume vs GitHub vs LinkedIn profiles to detect inconsistencies and suggest cross-platform improvements.",
)
async def validate_cross_profile_endpoint(req: CrossProfileValidationRequest) -> CrossProfileValidationResponse:
    """Validate cross-profile consistency."""
    logger.info("Cross-profile validate hit")
    return validate_cross_profiles(req)
