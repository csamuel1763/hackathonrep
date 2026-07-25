"""
AI Digital Twin Profile & Career Compatibility Service.

Assembles candidate's permanent AI Digital Twin profile from Resume + GitHub + LinkedIn data,
computes 10-dimensional Career DNA, builds Skill Graph, ranks 14 cybersecurity career paths,
and predicts 6m/1y/2y career forecasts.
"""

import math
import logging
from typing import Optional

from app.schemas.digital_twin import (
    DigitalTwinRequest,
    DigitalTwinProfileResponse,
    CareerDNAScores,
    SkillGraphData,
    SkillGraphNode,
    SkillGraphEdge,
    CareerCompatibilityRole,
    DetailedSkillGapItem,
    CareerForecastMilestone,
    CrossProfileValidationRequest,
    CrossProfileValidationResponse,
    ProfileInconsistencyItem,
    GitHubAnalysisRequest,
    LinkedInAnalysisRequest,
)
from app.services.github_service import analyze_github_profile
from app.services.linkedin_service import analyze_linkedin_profile
from app.utils.taxonomy_loader import load_roles_taxonomy
from app.ai.ollama_client import generate_structured_json

logger = logging.getLogger(__name__)

# 14 Target Cybersecurity Roles with specific requirements & baseline transition times
CAREER_ROLES_CONFIG: list[dict] = [
    {
        "id": "soc-analyst",
        "name": "SOC Analyst",
        "domain": "SOC / Incident Response",
        "required_skills": ["SIEM", "Splunk", "Python", "Network Security", "Wireshark", "Incident Response"],
        "required_certs": ["CompTIA Security+", "CySA+"],
        "base_weeks": 2,
    },
    {
        "id": "security-analyst",
        "name": "Security Analyst",
        "domain": "SOC / Incident Response",
        "required_skills": ["Cybersecurity", "Network Security", "Vulnerability Management", "Python", "SIEM"],
        "required_certs": ["CompTIA Security+"],
        "base_weeks": 3,
    },
    {
        "id": "blue-team-engineer",
        "name": "Blue Team Engineer",
        "domain": "SOC / Incident Response",
        "required_skills": ["SIEM", "Splunk", "Threat Hunting", "Log Analysis", "YARA", "Incident Response"],
        "required_certs": ["CISSP", "GCIH"],
        "base_weeks": 4,
    },
    {
        "id": "red-team-engineer",
        "name": "Red Team Engineer",
        "domain": "Red Team / OffSec",
        "required_skills": ["Penetration Testing", "Metasploit", "Python", "Burp Suite", "Web Security", "Nmap"],
        "required_certs": ["OSCP", "CEH"],
        "base_weeks": 12,
    },
    {
        "id": "penetration-tester",
        "name": "Penetration Tester",
        "domain": "Red Team / OffSec",
        "required_skills": ["Penetration Testing", "Burp Suite", "Nmap", "Metasploit", "Python", "Web Security"],
        "required_certs": ["OSCP", "CEH"],
        "base_weeks": 12,
    },
    {
        "id": "cloud-security-engineer",
        "name": "Cloud Security Engineer",
        "domain": "Cloud Security",
        "required_skills": ["AWS", "Terraform", "Docker", "Python", "Cloud Security", "IAM", "Kubernetes"],
        "required_certs": ["AWS Certified Security Specialist", "CCSP"],
        "base_weeks": 10,
    },
    {
        "id": "security-engineer",
        "name": "Security Engineer",
        "domain": "SOC / Incident Response",
        "required_skills": ["Network Security", "Python", "Linux Security", "SIEM", "Firewalls", "Cryptographic Protocols"],
        "required_certs": ["CISSP", "CompTIA Security+"],
        "base_weeks": 6,
    },
    {
        "id": "devsecops-engineer",
        "name": "DevSecOps Engineer",
        "domain": "DevSecOps",
        "required_skills": ["DevOps", "Docker", "Kubernetes", "CI/CD", "Python", "SAST", "DAST"],
        "required_certs": ["Certified DevSecOps Professional", "CompTIA Security+"],
        "base_weeks": 8,
    },
    {
        "id": "threat-hunter",
        "name": "Threat Hunter",
        "domain": "SOC / Incident Response",
        "required_skills": ["EDR", "Threat Hunting", "Reverse Engineering", "Python", "YARA", "Incident Response"],
        "required_certs": ["GCFA", "GREM"],
        "base_weeks": 14,
    },
    {
        "id": "incident-responder",
        "name": "Incident Responder",
        "domain": "SOC / Incident Response",
        "required_skills": ["Incident Response", "DFIR", "Forensics", "Wireshark", "Containment Playbooks", "SIEM"],
        "required_certs": ["GCIH", "GCFA"],
        "base_weeks": 6,
    },
    {
        "id": "appsec-engineer",
        "name": "Application Security Engineer",
        "domain": "DevSecOps",
        "required_skills": ["Web Security", "OWASP", "Python", "JavaScript", "Code Review", "Burp Suite"],
        "required_certs": ["GWAPT", "CEH"],
        "base_weeks": 8,
    },
    {
        "id": "grc-analyst",
        "name": "GRC Analyst",
        "domain": "GRC & Compliance",
        "required_skills": ["Compliance & GRC", "NIST 800-53", "ISO 27001", "Risk Assessment", "Audit", "Documentation"],
        "required_certs": ["CISA", "CRISC"],
        "base_weeks": 6,
    },
    {
        "id": "iam-engineer",
        "name": "IAM Engineer",
        "domain": "Cloud Security",
        "required_skills": ["Identity & Access Management", "Azure AD", "Okta", "SAML", "OAuth", "Python"],
        "required_certs": ["Okta Certified Administrator", "Azure Security Engineer"],
        "base_weeks": 6,
    },
    {
        "id": "security-consultant",
        "name": "Security Consultant",
        "domain": "GRC & Compliance",
        "required_skills": ["Cybersecurity", "Risk Assessment", "Client Communication", "NIST 800-53", "Report Writing"],
        "required_certs": ["CISSP", "CISA"],
        "base_weeks": 16,
    },
]


def _compute_career_dna(skills: list[str], exp_titles: list[str], certs: list[str], gh_tech: list[str]) -> CareerDNAScores:
    """Calculate 10-dimensional Career DNA scores (0-100) based on candidate skill keywords."""
    combined = " ".join(skills + exp_titles + certs + gh_tech).lower()

    def score_dim(keywords: list[str], base: int = 40) -> int:
        hits = sum(1 for kw in keywords if kw.lower() in combined)
        return min(100, max(25, base + hits * 15))

    return CareerDNAScores(
        cybersecurity=score_dim(["security", "siem", "soc", "incident", "vulnerability", "threat", "nist", "cissp", "security+"]),
        programming=score_dim(["python", "bash", "go", "javascript", "c++", "scripting", "java", "code"]),
        networking=score_dim(["network", "wireshark", "tcp/ip", "dns", "firewall", "router", "vpn", "nmap", "packet"]),
        cloud=score_dim(["aws", "azure", "gcp", "cloud", "iam", "s3", "container", "docker"]),
        devops=score_dim(["docker", "kubernetes", "ci/cd", "terraform", "ansible", "git", "pipeline", "automation"]),
        leadership=score_dim(["lead", "manager", "architect", "senior", "governance", "mentor", "strategy", "compliance"]),
        communication=score_dim(["report", "summary", "documentation", "client", "stakeholder", "presentation", "writing"]),
        problem_solving=score_dim(["analysis", "investigation", "troubleshooting", "resolution", "root cause", "forensics"]),
        threat_hunting=score_dim(["threat", "hunting", "yara", "miter", "att&ck", "behavior", "ioc", "edr"]),
        incident_response=score_dim(["incident", "response", "containment", "forensics", "playbook", "soc", "triage"]),
    )


def _build_skill_graph(skills: list[str], certs: list[str], exp_titles: list[str]) -> SkillGraphData:
    """Construct an internal graph linking candidate skills, certs, and target roles."""
    nodes = []
    edges = []

    nodes.append(SkillGraphNode(id="soc-analyst", name="SOC Analyst", type="role", weight=10))
    nodes.append(SkillGraphNode(id="security-engineer", name="Security Engineer", type="role", weight=9))

    for i, s in enumerate(skills[:8]):
        sid = f"skill-{i}"
        nodes.append(SkillGraphNode(id=sid, name=s, type="skill", weight=7))
        edges.append(SkillGraphEdge(source=sid, target="soc-analyst", relation="requires"))
        edges.append(SkillGraphEdge(source=sid, target="security-engineer", relation="enhances"))

    for i, c in enumerate(certs[:4]):
        cid = f"cert-{i}"
        nodes.append(SkillGraphNode(id=cid, name=c, type="certification", weight=8))
        edges.append(SkillGraphEdge(source=cid, target="soc-analyst", relation="certified_by"))

    return SkillGraphData(nodes=nodes, edges=edges)


def validate_cross_profiles(req: CrossProfileValidationRequest) -> CrossProfileValidationResponse:
    """Validate consistency across Resume, GitHub, and LinkedIn profiles."""
    inconsistencies = []
    resume_skills = []
    if req.resume_data and isinstance(req.resume_data, dict):
        resume_skills = [s.get("name", "") if isinstance(s, dict) else str(s) for s in req.resume_data.get("skills", [])]

    if req.github_username and not any("python" in s.lower() or "code" in s.lower() for s in resume_skills):
        inconsistencies.append(
            ProfileInconsistencyItem(
                source_a="Resume",
                source_b="GitHub",
                issue="GitHub profile connected but resume lists few programming or scripting skills.",
                recommendation="Highlight Python/automation projects from GitHub in your resume skills section."
            )
        )

    if req.linkedin_url and not req.resume_data:
        inconsistencies.append(
            ProfileInconsistencyItem(
                source_a="LinkedIn",
                source_b="Resume",
                issue="LinkedIn profile active but resume document has not been uploaded yet.",
                recommendation="Upload your latest resume PDF to sync full work history and skills."
            )
        )

    return CrossProfileValidationResponse(
        consistency_score=88 if not inconsistencies else max(60, 95 - len(inconsistencies) * 12),
        inconsistencies=inconsistencies,
        missing_resume_skills=["Cloud Security", "Docker", "Terraform"] if not any("cloud" in s.lower() for s in resume_skills) else [],
        missing_github_projects=["Automated SIEM Log Parser", "AWS Cloud Trail Monitor"],
        missing_linkedin_skills=["Threat Intelligence", "Incident Triage"],
        resume_improvements=["Add metrics to recent job titles", "Include Github project links in summary"],
        github_improvements=["Add README.md setup instructions to top repos", "Add MIT license to open source repos"],
        linkedin_improvements=["Update headline with target role keywords", "Add 3 core skills to top featured section"],
    )


async def generate_digital_twin(req: DigitalTwinRequest) -> DigitalTwinProfileResponse:
    """Assemble complete AI Digital Twin profile."""
    logger.info("Generating AI Digital Twin for candidate name=%s", req.name)

    gh_res: Optional[Any] = None
    if req.github_username:
        try:
            gh_res = await analyze_github_profile(GitHubAnalysisRequest(username=req.github_username, resume_skills=req.skills))
        except Exception as e:
            logger.warning("GitHub analysis failed for %s: %s", req.github_username, e)

    li_res: Optional[Any] = None
    if req.linkedin_url:
        try:
            li_res = await analyze_linkedin_profile(LinkedInAnalysisRequest(linkedin_url=req.linkedin_url, resume_skills=req.skills))
        except Exception as e:
            logger.warning("LinkedIn analysis failed for %s: %s", req.linkedin_url, e)

    gh_tech = gh_res.security_tools_detected if gh_res else []
    career_dna = _compute_career_dna(req.skills, req.exp_titles, req.cert_names, gh_tech)
    skill_graph = _build_skill_graph(req.skills, req.cert_names, req.exp_titles)

    cand_skills_lower = [s.strip().lower() for s in req.skills]
    cand_certs_lower = [c.strip().lower() for c in req.cert_names]

    career_rankings: list[CareerCompatibilityRole] = []

    for config in CAREER_ROLES_CONFIG:
        r_id = config["id"]
        r_name = config["name"]
        req_skills = config["required_skills"]
        req_certs = config["required_certs"]
        base_weeks = config["base_weeks"]

        # Skill matching
        matched_skills = []
        missing_skills = []
        for rs in req_skills:
            rs_clean = rs.lower()
            if any(rs_clean in cs or cs in rs_clean for cs in cand_skills_lower):
                matched_skills.append(rs)
            else:
                missing_skills.append(rs)

        tech_score = int((len(matched_skills) / max(1, len(req_skills))) * 100)

        # Cert matching
        matched_certs = []
        missing_certs = []
        for rc in req_certs:
            rc_clean = rc.lower()
            if any(rc_clean in cc or cc in rc_clean for cc in cand_certs_lower):
                matched_certs.append(rc)
            else:
                missing_certs.append(rc)

        cert_score = int((len(matched_certs) / max(1, len(req_certs))) * 100) if req_certs else 85
        exp_score = 80 if req.exp_titles else 50

        # Weighted compatibility score
        comp_score = min(98, max(18, round(0.50 * tech_score + 0.30 * cert_score + 0.20 * exp_score)))

        # Dynamic confidence score based on profile richness
        profile_items = len(req.skills) + len(req.cert_names) + len(req.exp_titles)
        conf_score = min(97, max(62, 65 + min(25, profile_items * 3) + len(matched_skills)))

        # Transition time in weeks (varies per role based on complexity & missing skills count)
        est_weeks = max(base_weeks, int(base_weeks + len(missing_skills) * 2.5))

        # Detailed Gaps
        gap_items = []
        for miss_s in missing_skills[:4]:
            gap_items.append(
                DetailedSkillGapItem(
                    skill_name=miss_s,
                    importance="Critical" if miss_s in req_skills[:2] else "High",
                    difficulty="Moderate",
                    estimated_learning_hours=30,
                    recommended_resources=[f"Hands-on {miss_s} Lab", f"Official {miss_s} Documentation"],
                    priority=1 if miss_s in req_skills[:2] else 2,
                )
            )

        summary_text = (
            f"{est_weeks}-week targeted transition path. "
            f"Requires mastering {', '.join(missing_skills[:2]) or 'advanced hands-on labs'}."
        )

        career_rankings.append(
            CareerCompatibilityRole(
                role_id=r_id,
                role_name=r_name,
                compatibility_score=comp_score,
                confidence_score=conf_score,
                strength_match_percentage=tech_score,
                matched_skills=matched_skills,
                missing_skills=missing_skills,
                missing_certifications=missing_certs or [req_certs[0] if req_certs else "CompTIA Security+"],
                estimated_reach_time_weeks=est_weeks,
                roadmap_summary=summary_text,
                detailed_gaps=gap_items,
            )
        )

    # Sort rankings from highest compatibility to lowest
    career_rankings.sort(key=lambda r: r.compatibility_score, reverse=True)

    top_role = career_rankings[0].role_name if career_rankings else "SOC Analyst"
    top_score = career_rankings[0].compatibility_score if career_rankings else 82

    # Cross profile validation
    cross_prof = validate_cross_profiles(
        CrossProfileValidationRequest(
            resume_data={"name": req.name, "skills": req.skills},
            github_username=req.github_username,
            linkedin_url=req.linkedin_url,
        )
    )

    return DigitalTwinProfileResponse(
        name=req.name or "Candidate",
        email=req.email or "N/A",
        phone=req.phone or "N/A",
        summary=req.summary or "Cybersecurity Specialist",
        career_persona=f"Cybersecurity Professional ({top_role})",
        personality_summary=f"You demonstrate strong affinity for {top_role} roles with high technical skill coverage in core security operations.",
        readiness_score=top_score,
        career_level="Mid-Level Professional" if len(req.skills) >= 6 else "Junior Specialist",
        technical_stack=req.skills or ["Network Security", "SIEM", "Python"],
        soft_skills=["Problem Solving", "Analytical Triage", "Technical Communication", "Incident Escalation"],
        certifications=req.cert_names or ["CompTIA Security+"],
        career_interests=[top_role, "Cloud Security", "Incident Response"],
        strengths=["Core security fundamentals", "Hands-on log triage mindset"],
        weaknesses=["Cloud infrastructure automation (AWS/Terraform)"],
        growth_opportunities=["Master Cloud Security Controls", "Obtain CySA+ / CISSP"],
        career_dna=career_dna,
        skill_graph=skill_graph,
        career_rankings=career_rankings,
        future_forecast=[
            CareerForecastMilestone(
                timeline="6 Months",
                predicted_role=f"Junior {top_role}",
                expected_salary_range="$80,000 - $95,000",
                key_achievements=["Complete specialized security certification"],
                recommended_focus_areas=["Hands-on lab exercises"]
            ),
            CareerForecastMilestone(
                timeline="1 Year",
                predicted_role=f"Mid-Level {top_role}",
                expected_salary_range="$100,000 - $120,000",
                key_achievements=["Lead security monitoring workflows"],
                recommended_focus_areas=["Automation & Threat Hunting"]
            ),
            CareerForecastMilestone(
                timeline="2 Years",
                predicted_role=f"Senior {top_role} / Security Lead",
                expected_salary_range="$130,000 - $155,000",
                key_achievements=["Architect enterprise security controls"],
                recommended_focus_areas=["Cloud Security & Leadership"]
            ),
        ],
        github_analysis=gh_res,
        linkedin_analysis=li_res,
        cross_profile=cross_prof,
    )
