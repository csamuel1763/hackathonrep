"""
Career Readiness Scoring Service.

Evaluates candidate readiness for a target cybersecurity role based on skills,
experience, education, and certifications, returning a deterministic overall score.
"""

import re
import logging

from app.services.skill_gap_service import compute_skill_gap
from app.schemas.readiness_score import ReadinessScoreResponse

logger = logging.getLogger(__name__)


def evaluate_experience_score(exp_titles: list[str], exp_descriptions: list[str], exp_durations: list[str]) -> int:
    """Calculate experience score based on employment records.

    Rules:
    - No experience = 20
    - Internship = 60
    - 1-2 years = 80
    - 3+ years = 100
    """
    if not exp_titles and not exp_descriptions and not exp_durations:
        return 20

    total_years = 0.0
    has_internship = False

    # Check for internship in titles or descriptions
    for title in exp_titles:
        if "intern" in title.lower():
            has_internship = True
    for desc in exp_descriptions:
        if "intern" in desc.lower():
            has_internship = True

    # Parse durations to sum up years
    for duration in exp_durations:
        dur_lower = duration.lower()
        if "intern" in dur_lower:
            has_internship = True

        # Matches patterns like "3 years", "1.5 yrs", "2 yr"
        year_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:year|yr)", dur_lower)
        if year_match:
            total_years += float(year_match.group(1))
        else:
            # Matches patterns like "6 months", "3 mo"
            month_match = re.search(r"(\d+)\s*(?:month|mo)", dur_lower)
            if month_match:
                total_years += float(month_match.group(1)) / 12.0

    if total_years >= 3.0:
        return 100
    elif total_years >= 1.0:
        return 80
    elif has_internship:
        return 60
    elif len(exp_titles) > 0:
        # Graceful fallback: if experience records exist but duration parsing failed, assume 1-2 years
        return 80
    return 20


def evaluate_education_score(edu_degrees: list[str]) -> int:
    """Calculate education score based on degrees.

    Rules:
    - Relevant cybersecurity degree = 100
    - Computer Science = 90
    - IT = 85
    - Other engineering = 70
    - Other = 50
    """
    if not edu_degrees:
        return 50  # Default to "Other" = 50

    best_score = 50
    for deg in edu_degrees:
        deg_lower = deg.lower()
        if any(k in deg_lower for k in ("cyber", "infosec", "information security", "network security")):
            best_score = max(best_score, 100)
        elif any(k in deg_lower for k in ("computer science", "cs", "software engineering", "computer engineering")):
            best_score = max(best_score, 90)
        elif any(k in deg_lower for k in ("information technology", "it", "information systems", "technology")):
            best_score = max(best_score, 85)
        elif any(k in deg_lower for k in ("engineering", "electrical", "mechanical", "civil", "chemical")):
            best_score = max(best_score, 70)

    return best_score


def evaluate_certification_score(cert_names: list[str]) -> int:
    """Calculate certification score based on cert count.

    Rules:
    - None = 0
    - 1 Certification = 50
    - 2 Certifications = 80
    - 3+ = 100
    """
    cert_count = len([c for c in cert_names if c and c.strip()])
    if cert_count == 0:
        return 0
    elif cert_count == 1:
        return 50
    elif cert_count == 2:
        return 80
    else:
        return 100


def get_readiness_level(score: int) -> str:
    """Get the string description of the readiness level.

    Rules:
    - 0-39: Beginner
    - 40-69: Intermediate
    - 70-89: Job Ready
    - 90-100: Excellent Candidate
    """
    if score < 40:
        return "Beginner"
    elif score < 70:
        return "Intermediate"
    elif score < 90:
        return "Job Ready"
    else:
        return "Excellent Candidate"


def compute_readiness_score(
    role_id: str,
    skills: list[str],
    exp_titles: list[str],
    exp_descriptions: list[str],
    exp_durations: list[str],
    edu_degrees: list[str],
    cert_names: list[str],
) -> ReadinessScoreResponse:
    """Compute the deterministic career readiness score response."""
    logger.info("Computing readiness score | role_id=%s", role_id)

    # 1. Compute component scores
    skill_gap = compute_skill_gap(skills, role_id)
    skills_score = skill_gap.coverage_percentage

    experience_score = evaluate_experience_score(exp_titles, exp_descriptions, exp_durations)
    education_score = evaluate_education_score(edu_degrees)
    certification_score = evaluate_certification_score(cert_names)

    # 2. Compute overall score (weighted sum)
    overall_score = int(
        round(
            0.50 * skills_score
            + 0.25 * experience_score
            + 0.15 * education_score
            + 0.10 * certification_score
        )
    )

    readiness_level = get_readiness_level(overall_score)

    logger.info(
        "Readiness score computed | overall=%d | readiness=%s",
        overall_score,
        readiness_level,
    )

    return ReadinessScoreResponse(
        overall_score=overall_score,
        skills_score=skills_score,
        experience_score=experience_score,
        education_score=education_score,
        certification_score=certification_score,
        readiness_level=readiness_level,
    )
