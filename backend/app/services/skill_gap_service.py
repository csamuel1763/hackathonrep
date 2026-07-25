"""
Skill Gap Analysis Service.

Computes a deterministic skill gap comparison between detected resume skills and
the required taxonomy skills for a target role, returning original taxonomy casing.
Uses intelligent matching with synonym resolution.
"""

import logging

from app.utils.taxonomy_loader import load_roles_taxonomy
from app.utils.exceptions import NotFoundError
from app.schemas.gap_analysis import SkillGapResponse
from app.utils.skill_matcher import is_skill_match

logger = logging.getLogger(__name__)


def compute_skill_gap(detected_skills: list[str], role_id: str) -> SkillGapResponse:
    """Compare candidate skills against target role required skills.

    Uses intelligent matching to account for punctuation, abbreviations, synonyms,
    and partial terms without returning false positives.

    Args:
        detected_skills: List of raw skill names extracted from the resume.
        role_id: Slug identifier of the target role.

    Returns:
        SkillGapResponse object containing matched, missing, and coverage metrics.

    Raises:
        NotFoundError: If the target role ID does not exist in the taxonomy.
    """
    logger.info("Computing skill gap | role_id=%s | skills_count=%d", role_id, len(detected_skills))

    # 1. Load taxonomy roles list
    raw_roles = load_roles_taxonomy()
    target_role = None
    for role in raw_roles:
        if role.get("id") == role_id:
            target_role = role
            break

    if not target_role:
        logger.warning("Target role not found for gap analysis | id=%s", role_id)
        raise NotFoundError(f"Cybersecurity role with ID '{role_id}' was not found in the database.")

    matched_skills_set = set()
    missing_skills_set = set()

    # Remove empty candidate inputs
    clean_detected = [s.strip() for s in detected_skills if s and s.strip()]

    # 2. Compare required skills
    required_skills_list = target_role.get("required_skills", [])
    for req_skill in required_skills_list:
        skill_name = req_skill.get("name", "").strip()
        if not skill_name:
            continue

        # Check if any candidate skill matches the required skill
        has_match = False
        for cand_skill in clean_detected:
            if is_skill_match(cand_skill, skill_name):
                has_match = True
                break

        if has_match:
            matched_skills_set.add(skill_name)
        else:
            missing_skills_set.add(skill_name)

    # 3. Sort lists alphabetically and get counts
    matched_skills = sorted(list(matched_skills_set))
    missing_skills = sorted(list(missing_skills_set))

    matched_count = len(matched_skills)
    missing_count = len(missing_skills)
    total_required = matched_count + missing_count

    if total_required > 0:
        coverage_percentage = int(round((matched_count / total_required) * 100))
    else:
        coverage_percentage = 100

    logger.info(
        "Skill gap computed | role=%s | matched=%d | missing=%d | coverage=%d%%",
        target_role.get("name"),
        matched_count,
        missing_count,
        coverage_percentage,
    )

    return SkillGapResponse(
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        coverage_percentage=coverage_percentage,
        matched_count=matched_count,
        missing_count=missing_count,
        total_required=total_required,
    )
