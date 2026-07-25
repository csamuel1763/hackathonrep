"""
Career Match Service.

Evaluates candidate profile alignment across all taxonomy roles, calculating
individual match percentages, matched/missing skill counts, and scoring bonuses.
"""

import logging

from app.utils.taxonomy_loader import load_roles_taxonomy
from app.utils.skill_matcher import is_skill_match
from app.schemas.career_match import CareerMatchRole

logger = logging.getLogger(__name__)


def compute_career_matches(
    skills: list[str],
    exp_titles: list[str],
    exp_descriptions: list[str],
    exp_durations: list[str],
    edu_degrees: list[str],
    cert_names: list[str]
) -> list[CareerMatchRole]:
    """Calculate ranked career suitability scores for all roles in the taxonomy."""
    logger.info("Computing career matches | candidate_skills_count=%d", len(skills))

    raw_roles = load_roles_taxonomy()
    matches = []

    # Pre-clean inputs
    clean_skills = [s.strip() for s in skills if s and s.strip()]
    clean_titles = [t.strip().lower() for t in exp_titles if t and t.strip()]
    clean_descriptions = [d.strip().lower() for d in exp_descriptions if d and d.strip()]
    clean_degrees = [deg.strip().lower() for deg in edu_degrees if deg and deg.strip()]
    clean_certs = [c.strip().lower() for c in cert_names if c and c.strip()]

    for role in raw_roles:
        role_id = role.get("id", "")
        role_name = role.get("name", "")
        role_desc = role.get("description", "")
        required_list = role.get("required_skills", [])
        total_required = len(required_list)

        # 1. Match skills
        matched_count = 0
        for req in required_list:
            req_name = req.get("name", "").strip()
            if not req_name:
                continue

            has_match = False
            for cand in clean_skills:
                if is_skill_match(cand, req_name):
                    has_match = True
                    break

            if has_match:
                matched_count += 1

        missing_count = total_required - matched_count
        
        # 2. Base score calculation
        if total_required > 0:
            base_score = (matched_count / total_required) * 100.0
        else:
            base_score = 100.0

        # 3. Calculate bonuses
        bonus = 0

        # Experience Bonus (+10)
        # Check if role name keywords are mentioned in job titles or descriptions
        role_keywords = [w.strip() for w in role_name.lower().split() if len(w.strip()) > 3]
        has_exp_match = False
        for kw in role_keywords:
            if any(kw in t for t in clean_titles) or any(kw in d for d in clean_descriptions):
                has_exp_match = True
                break
        if has_exp_match:
            bonus += 10

        # Education Bonus (+5)
        # Check if education degree matches relevant tech/cyber fields
        has_edu_match = False
        for deg in clean_degrees:
            if any(k in deg for k in ("cyber", "computer science", "it", "infosec", "engineering")):
                has_edu_match = True
                break
        if has_edu_match:
            bonus += 5

        # Certifications Bonus (+5)
        # Check if candidate certs match any required certifications of the role
        role_certs = [c.strip().lower() for c in role.get("certifications", [])]
        has_cert_match = False
        for cc in clean_certs:
            for rc in role_certs:
                if is_skill_match(cc, rc):
                    has_cert_match = True
                    break
            if has_cert_match:
                break
        if has_cert_match:
            bonus += 5

        # Final score, clamped to 100
        score = int(round(min(100.0, base_score + bonus)))

        matches.append(
            CareerMatchRole(
                id=role_id,
                name=role_name,
                description=role_desc,
                score=score,
                matched_skills=matched_count,
                required_skills=total_required,
                missing_skills=missing_count
            )
        )

    # Sort descending by score, and alphabetically by name as secondary tie-breaker
    matches.sort(key=lambda x: (-x.score, x.name))

    logger.info("Career matches computed successfully | count=%d", len(matches))
    return matches
