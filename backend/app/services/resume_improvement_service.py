"""
Resume Improvement Suggestions Service.

Evaluates candidate profiles dynamically against target roles to generate
actionable priority learning actions, resume content tips, and predicted score gains.
"""

import logging

from app.services.skill_gap_service import compute_skill_gap
from app.services.readiness_score_service import compute_readiness_score
from app.utils.taxonomy_loader import load_roles_taxonomy
from app.utils.skill_matcher import is_skill_match
from app.utils.exceptions import NotFoundError
from app.schemas.resume_improvement import ResumeImprovementResponse, PriorityRecommendation

logger = logging.getLogger(__name__)

SKILL_TIPS = {
    "splunk": {"difficulty": "Medium", "duration": "3 Weeks", "impact": 9, "reason": "Crucial SIEM tool required for target role: {role_name}."},
    "wireshark": {"difficulty": "Easy", "duration": "1 Week", "impact": 8, "reason": "Industry standard for network packet inspection in {role_name} positions."},
    "metasploit": {"difficulty": "Medium", "duration": "2 Weeks", "impact": 8, "reason": "Standard exploitation framework expected for penetration testing tasks."},
    "burp suite": {"difficulty": "Medium", "duration": "2 Weeks", "impact": 8, "reason": "Core web proxy required for web application security assessments."},
    "nmap": {"difficulty": "Easy", "duration": "1 Week", "impact": 7, "reason": "Fundamental scanning tool used for host discovery and port auditing."},
    "vulnerability scanning": {"difficulty": "Easy", "duration": "2 Weeks", "impact": 7, "reason": "Essential competency for identifying and reporting security weaknesses."},
    "python": {"difficulty": "Easy", "duration": "4 Weeks", "impact": 8, "reason": "Highly requested scripting language for automating daily security tasks."},
    "aws security": {"difficulty": "Medium", "duration": "4 Weeks", "impact": 8, "reason": "Crucial skill for configuring and auditing cloud environments."},
    "iam policies": {"difficulty": "Medium", "duration": "2 Weeks", "impact": 7, "reason": "Identity and access controls are a core defense competency."},
    "cryptography": {"difficulty": "Hard", "duration": "3 Weeks", "impact": 6, "reason": "Fundamental mathematical concept needed for secure transmission."},
    "firewall configuration": {"difficulty": "Medium", "duration": "2 Weeks", "impact": 8, "reason": "Necessary network perimeter defense skill for target role: {role_name}."},
    "log analysis": {"difficulty": "Easy", "duration": "2 Weeks", "impact": 8, "reason": "Core competency for identifying suspicious events in log streams."},
    "siem integration": {"difficulty": "Hard", "duration": "3 Weeks", "impact": 9, "reason": "Central logging correlation skill required for target role."},
    "incident response": {"difficulty": "Medium", "duration": "3 Weeks", "impact": 9, "reason": "Critical containment and resolution skill needed for security teams."},
    "threat hunting": {"difficulty": "Hard", "duration": "4 Weeks", "impact": 9, "reason": "Proactive detection capabilities requested by advanced teams."},
}


def compute_resume_improvements(
    role_id: str,
    skills: list[str],
    name: str,
    email: str,
    phone: str,
    summary: str,
    exp_titles: list[str],
    exp_descriptions: list[str],
    exp_durations: list[str],
    edu_degrees: list[str],
    cert_names: list[str],
) -> ResumeImprovementResponse:
    """Generate dynamic actionable priority items and resume tips based on profile."""
    logger.info("Computing resume improvements | role_id=%s, name=%s", role_id, name)

    # 1. Load taxonomy target role details
    raw_roles = load_roles_taxonomy()
    target_role = next((r for r in raw_roles if r.get("id") == role_id), None)
    if not target_role:
        logger.warning("Target role not found for improvement suggestions | id=%s", role_id)
        raise NotFoundError(f"Cybersecurity role with ID '{role_id}' was not found in the database.")

    role_name = target_role.get("name", "N/A")

    # 2. Get missing skills
    skill_gap = compute_skill_gap(skills, role_id)
    missing_skills = skill_gap.missing_skills

    # 3. Formulate priority recommendations
    priorities = []

    # A. Certifications suggestions
    role_certs = target_role.get("certifications", [])
    clean_certs = [c.strip().lower() for c in cert_names if c and c.strip()]
    
    unmatched_certs = []
    for rc in role_certs:
        rc_clean = rc.strip().lower()
        matched = False
        for cc in clean_certs:
            if is_skill_match(cc, rc_clean):
                matched = True
                break
        if not matched:
            unmatched_certs.append(rc)

    for cert in unmatched_certs:
        # Check cert difficulty
        diff = "Medium"
        dur = "6 Weeks"
        if any(k in cert.lower() for k in ("cissp", "cism", "oscp")):
            diff = "Hard"
            dur = "12 Weeks"
        elif any(k in cert.lower() for k in ("security+", "network+", "ceh")):
            diff = "Easy"
            dur = "4 Weeks"

        priorities.append(
            PriorityRecommendation(
                title=f"Earn {cert}",
                reason=f"Listed as expected certification for target {role_name} roles.",
                difficulty=diff,
                duration=dur,
                impact=10
            )
        )

    # B. Missing skills suggestions
    for ms in missing_skills:
        ms_lower = ms.lower().strip()
        if ms_lower in SKILL_TIPS:
            tip = SKILL_TIPS[ms_lower]
            priorities.append(
                PriorityRecommendation(
                    title=f"Learn {ms}",
                    reason=tip["reason"].format(role_name=role_name),
                    difficulty=tip["difficulty"],
                    duration=tip["duration"],
                    impact=tip["impact"]
                )
            )
        else:
            priorities.append(
                PriorityRecommendation(
                    title=f"Learn {ms}",
                    reason=f"Required technical competency for target {role_name} roles.",
                    difficulty="Medium",
                    duration="2 Weeks",
                    impact=7
                )
            )

    # Sort priority recommendations by impact descending
    priorities.sort(key=lambda x: -x.impact)

    # 4. Formulate resume improvements list (content rules)
    improvements = []
    clean_descriptions = [d.strip().lower() for d in exp_descriptions if d and d.strip()]
    clean_skills = [s.strip().lower() for s in skills if s and s.strip()]

    # Metric rule
    has_metrics = False
    for desc in clean_descriptions:
        if any(c.isdigit() for c in desc):
            has_metrics = True
            break
    if not has_metrics:
        improvements.append("Quantify professional and internship achievements with measurable metrics (e.g., remediated 15+ vulnerabilities weekly).")

    # Tools section rule
    if len(clean_skills) < 8:
        improvements.append("Expand your skills list to include a dedicated cybersecurity tools and technologies section.")

    # Linux experience rule
    has_linux_skill = any("linux" in s for s in clean_skills)
    has_linux_exp = any("linux" in d for d in clean_descriptions)
    if has_linux_skill and not has_linux_exp:
        improvements.append("Highlight specific Linux administration, configuration, or scripting tasks in your job history descriptions.")

    # Networking projects rule
    has_net_skill = any("network" in s or "tcp" in s for s in clean_skills)
    has_net_exp = any("network" in d or "tcp" in d for d in clean_descriptions)
    if has_net_skill and not has_net_exp:
        improvements.append("Mention TCP/IP networking projects, firewalls, or packet capture tasks inside your experience logs.")

    # Certifications entry rule
    if not cert_names:
        improvements.append("Include a section for relevant entry-level certifications (like Security+) or trainings you are pursuing.")

    # Add default tail items to ensure at least 4 items are present
    defaults = [
        "Tailor your summary description to clearly reflect alignment with target role requirements.",
        "Add a link to a GitHub portfolio showing scripting projects or cybersecurity writeups.",
        "Use active cybersecurity verbs (e.g. mitigated, engineered, detected) at the start of experience bullet points."
    ]
    for d in defaults:
        if len(improvements) < 4:
            improvements.append(d)

    # 5. Calculate predicted score gain
    # Score gain calculation: 5 points per missing skill, 4 points per missing cert
    score_gain = int(len(missing_skills) * 5 + len(unmatched_certs) * 4)
    # Clamp score gain to realistic boundaries
    estimated_score_gain = min(35, max(5, score_gain))

    logger.info("Resume improvements computed successfully | gain=%d", estimated_score_gain)

    return ResumeImprovementResponse(
        estimated_score_gain=estimated_score_gain,
        priority=priorities,
        resume_improvements=improvements
    )
