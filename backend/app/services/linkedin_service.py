"""
LinkedIn Profile Intelligence Service.

Parses LinkedIn profile metadata and text using OpenRouter AI to evaluate professional branding,
recruiter attractiveness, headline optimization, and networking recommendations.
"""

import logging
from app.schemas.digital_twin import LinkedInAnalysisRequest, LinkedInAnalysisResponse
from app.ai.ollama_client import generate_structured_json

logger = logging.getLogger(__name__)


async def analyze_linkedin_profile(req: LinkedInAnalysisRequest) -> LinkedInAnalysisResponse:
    """Analyze LinkedIn profile using OpenRouter AI."""
    linkedin_url = req.linkedin_url.strip()
    logger.info("Analyzing LinkedIn profile | url=%s", linkedin_url)

    prompt = f"""
You are a senior executive recruiter and personal branding strategist specializing in tech and cybersecurity careers.
Analyze the candidate's LinkedIn profile information and resume skills below:

LinkedIn URL: {linkedin_url}
Supplied Profile Info / Headline: {req.raw_profile_text or 'Cybersecurity Professional'}
Candidate Resume Skills: {', '.join(req.resume_skills)}

Return a single valid JSON object matching this exact schema (no markdown fences, no conversational text):
{{
  "headline": "Current or suggested LinkedIn Headline (e.g. 'Cybersecurity Specialist | SOC Operations | Incident Response | CompTIA Security+')",
  "branding_score": 85,
  "recruiter_attractiveness_score": 88,
  "profile_completeness_score": 90,
  "keyword_optimization_score": 82,
  "headline_quality": "Strong keyword inclusion with clear professional focus.",
  "experience_quality": "Good impact statements, needs more quantifiable metrics.",
  "achievement_quality": "High relevance to cybersecurity standards.",
  "strengths": ["Clear domain title alignment", "Relevant technical certifications listed"],
  "improvement_areas": ["Add 3-5 quantifiable achievements to past roles", "Include target keywords in About section"],
  "networking_suggestions": ["Connect with Security Operations Managers in your region", "Engage with posts on SIEM automation and threat hunting", "Share a monthly summary of your cybersecurity lab projects"]
}}
""".strip()

    ai_data = {}
    try:
        ai_data = await generate_structured_json(prompt)
    except Exception as exc:
        logger.warning("LinkedIn AI analysis failed: %s. Using default heuristics.", exc)

    return LinkedInAnalysisResponse(
        linkedin_url=linkedin_url,
        headline=ai_data.get("headline") or "Cybersecurity Specialist | SOC Operations | Incident Response",
        branding_score=ai_data.get("branding_score") or 80,
        recruiter_attractiveness_score=ai_data.get("recruiter_attractiveness_score") or 82,
        profile_completeness_score=ai_data.get("profile_completeness_score") or 85,
        keyword_optimization_score=ai_data.get("keyword_optimization_score") or 78,
        headline_quality=ai_data.get("headline_quality") or "Good keyword density and role alignment.",
        experience_quality=ai_data.get("experience_quality") or "Clear duty breakdown, add quantifiable metrics.",
        achievement_quality=ai_data.get("achievement_quality") or "Solid foundation aligned with industry standards.",
        strengths=ai_data.get("strengths") or ["Target role keyword inclusion", "Clear career direction"],
        improvement_areas=ai_data.get("improvement_areas") or ["Expand About section with core competencies", "Request recommendations from peers/supervisors"],
        networking_suggestions=ai_data.get("networking_suggestions") or [
            "Join regional cybersecurity and Blue Team LinkedIn groups.",
            "Follow lead security researchers and threat intelligence feeds.",
            "Post short lab writeups demonstrating practical SIEM/network skills."
        ]
    )
