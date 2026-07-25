"""
Skill Gap Analysis Service.

Computes a deterministic comparison between candidate resume skills and the
taxonomy required skills for a selected target role, resolving aliases and case.
Uses intelligent matching with synonym resolution.
"""

import logging

from app.schemas.gap_analysis import GapAnalysisResponse, MatchedSkill
from app.schemas.resume import ParsedSkill
from app.services.role_service import get_role_by_id
from app.utils.skill_matcher import is_skill_match

logger = logging.getLogger(__name__)


def compute_gap_analysis(skills: list[ParsedSkill], role_id: str) -> GapAnalysisResponse:
    """Perform a deterministic skill gap analysis for a given set of skills against a target role.

    1. Loads the target role from the taxonomy.
    2. Runs intelligent alias-aware and synonym-aware comparison.
    3. Computes metrics (match list, missing list, coverage %, gap %).
    4. Resolves covered and missing categories.

    Args:
        skills: List of technical skills extracted from the resume.
        role_id: The identifier slug of the target role.

    Returns:
        A validated GapAnalysisResponse containing the analysis details.
    """
    logger.info("Computing skill gap analysis | role_id=%s | skills_submitted=%d", role_id, len(skills))

    # 1. Load target role from the taxonomy database
    role = get_role_by_id(role_id)

    matched_skills: list[MatchedSkill] = []
    missing_skills: list[type(role.required_skills[0])] = []  # Keep RequiredSkill instances

    # 2. Compare required skills against candidate set using intelligent matching
    for req_skill in role.required_skills:
        has_match = False
        for cand_skill in skills:
            if cand_skill.name and is_skill_match(cand_skill.name, req_skill.name):
                has_match = True
                break

        if has_match:
            matched_skills.append(
                MatchedSkill(
                    name=req_skill.name,
                    category=req_skill.category
                )
            )
        else:
            missing_skills.append(req_skill)

    # 3. Calculate coverage and gap percentages
    total_required = len(role.required_skills)
    if total_required > 0:
        coverage_percentage = int(round((len(matched_skills) / total_required) * 100))
        gap_percentage = 100 - coverage_percentage
    else:
        coverage_percentage = 100
        gap_percentage = 0

    # 4. Determine category coverage
    required_categories = set(role.categories)
    if not required_categories:
        required_categories = {s.category for s in role.required_skills}

    covered_categories = {s.category for s in matched_skills}
    missing_categories = required_categories - covered_categories

    logger.info(
        "Gap analysis computed | role=%s | coverage=%d%% | gap=%d%% | matched=%d | missing=%d",
        role.name,
        coverage_percentage,
        gap_percentage,
        len(matched_skills),
        len(missing_skills),
    )

    return GapAnalysisResponse(
        role=role.name,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        coverage_percentage=coverage_percentage,
        gap_percentage=gap_percentage,
        covered_categories=sorted(list(covered_categories)),
        missing_categories=sorted(list(missing_categories)),
    )
