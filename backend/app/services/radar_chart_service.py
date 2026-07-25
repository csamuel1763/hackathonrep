"""
Skill Radar Chart Service.

Generates normalized radar chart score arrays (0-100) comparing candidate skills
and target role required skills across 6 standardized cybersecurity domains.
"""

import logging

from app.utils.taxonomy_loader import load_roles_taxonomy
from app.utils.skill_matcher import is_skill_match
from app.utils.exceptions import NotFoundError
from app.schemas.radar_chart import RadarChartResponse

logger = logging.getLogger(__name__)

RADAR_LABELS = [
    "Networking",
    "Python",
    "Linux",
    "Cloud",
    "SIEM",
    "Incident Response"
]


def _get_radar_category(skill_name: str, category: str) -> str:
    """Map a taxonomy skill name and category to one of the 6 radar domains."""
    name_lower = skill_name.lower().strip()
    cat_lower = category.lower().strip()

    if "python" in name_lower or "scripting" in cat_lower or "programming" in cat_lower:
        return "Python"
    elif "linux" in name_lower or "os" in cat_lower or "operating system" in cat_lower or "windows" in name_lower:
        return "Linux"
    elif "cloud" in name_lower or "aws" in name_lower or "cloud" in cat_lower:
        return "Cloud"
    elif "siem" in name_lower or "splunk" in name_lower or "log" in name_lower or "siem" in cat_lower:
        return "SIEM"
    elif any(k in cat_lower for k in ("incident", "response", "forensic", "malware", "threat", "hunting", "intelligence")):
        return "Incident Response"
    else:
        # Fallback to Networking for network security, wireshark, routing etc.
        return "Networking"


def compute_radar_data(detected_skills: list[str], role_id: str) -> RadarChartResponse:
    """Compute normalized radar scores for candidate vs target role required skills."""
    logger.info("Computing skill radar chart data | role_id=%s", role_id)

    # 1. Load taxonomy roles list
    raw_roles = load_roles_taxonomy()
    target_role = None
    for role in raw_roles:
        if role.get("id") == role_id:
            target_role = role
            break

    if not target_role:
        logger.warning("Target role not found for radar chart computation | id=%s", role_id)
        raise NotFoundError(f"Cybersecurity role with ID '{role_id}' was not found in the database.")

    # 2. Categorize required skills
    required_skills_list = target_role.get("required_skills", [])
    
    # Initialize point counters per category
    req_points = {label: [] for label in RADAR_LABELS}
    cand_points = {label: [] for label in RADAR_LABELS}

    # Remove empty candidate inputs
    clean_detected = [s.strip() for s in detected_skills if s and s.strip()]

    # Map importance strings to scores
    importance_scores = {"High": 100, "Medium": 80, "Low": 60}

    # Group required skills
    for req in required_skills_list:
        name = req.get("name", "").strip()
        category = req.get("category", "").strip()
        importance = req.get("importance", "Medium")
        
        if not name:
            continue

        label = _get_radar_category(name, category)
        req_score = importance_scores.get(importance, 80)
        req_points[label].append(req_score)

        # Check if matched by candidate
        has_match = False
        for cand in clean_detected:
            if is_skill_match(cand, name):
                has_match = True
                break

        if has_match:
            cand_points[label].append(req_score)
        else:
            cand_points[label].append(20)  # Baseline points for unmatched items to show in radar shape

    # 3. Formulate final scores
    candidate_scores = []
    required_scores = []

    for label in RADAR_LABELS:
        # Required Score
        if req_points[label]:
            req_score = int(round(sum(req_points[label]) / len(req_points[label])))
        else:
            # Default required baseline if category is not required in the taxonomy role
            req_score = 80
        required_scores.append(req_score)

        # Candidate Score
        if req_points[label]:
            cand_score = int(round(sum(cand_points[label]) / len(cand_points[label])))
        else:
            # If no skills required, check if candidate has any skills matching this category dynamically
            matched_count = 0
            for cand in clean_detected:
                if _get_radar_category(cand, "") == label:
                    matched_count += 1
            cand_score = min(100, 20 + 20 * matched_count)
            if cand_score == 20 and label in ("Networking", "Linux", "Python"):
                # Baseline padding for general foundational domains
                cand_score = 30
        candidate_scores.append(cand_score)

    logger.info("Radar chart data computed successfully | labels=%s", RADAR_LABELS)

    return RadarChartResponse(
        labels=RADAR_LABELS,
        candidate=candidate_scores,
        required=required_scores
    )
