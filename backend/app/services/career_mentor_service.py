"""
AI Career Mentor Service.

Integrates parsed resume data, skill gap analysis, career readiness scores, and learning roadmaps
into a personalized system prompt fed into Ollama local AI to answer candidate career questions.
"""

import json
import logging

from app.schemas.career_mentor import CareerMentorRequest, CareerMentorResponse
from app.services.skill_gap_service import compute_skill_gap
from app.services.readiness_score_service import compute_readiness_score
from app.services.learning_roadmap_service import generate_roadmap
from app.services.career_match_service import compute_career_matches
from app.utils.taxonomy_loader import load_roles_taxonomy
from app.ai.ollama_client import generate_text_response
from app.utils.exceptions import (
    AITimeoutError,
    AINetworkError,
    ExternalServiceError,
)
from app.utils.config import get_settings

logger = logging.getLogger(__name__)


async def generate_mentor_response(req: CareerMentorRequest) -> CareerMentorResponse:
    """Generate a personalized AI career mentor response using local Ollama model."""
    try:
        user_message = req.message.strip()
        if not user_message:
            return CareerMentorResponse(
                success=False,
                answer="Please enter a valid message.",
                reply="Please enter a valid message.",
                error="Empty message received.",
            )

        # Step 1: Resolve Target Role
        target_role_name = "Cybersecurity Specialist"
        target_role_id = req.role_id
        if target_role_id:
            try:
                roles = load_roles_taxonomy()
                matched_role = next((r for r in roles if r.get("id") == target_role_id), None)
                if matched_role:
                    target_role_name = matched_role.get("name", target_role_name)
            except Exception as e:
                logger.warning("Could not load taxonomy for target role in mentor: %s", e)

        # Step 2: Compute context variables if skills are provided
        skills = req.skills or []
        gap_info = ""
        readiness_info = ""
        roadmap_info = ""

        if target_role_id and skills:
            try:
                gap = compute_skill_gap(skills, target_role_id)
                gap_info = f"Matched Skills: {', '.join(gap.matched_skills)}. Missing Skills: {', '.join(gap.missing_skills)}."
            except Exception:
                pass

            try:
                readiness = compute_readiness_score(
                    target_role_id,
                    skills,
                    req.exp_titles,
                    req.exp_descriptions,
                    req.exp_durations,
                    req.edu_degrees,
                    req.cert_names,
                )
                readiness_info = f"Readiness Score: {readiness.overall_score}/100 ({readiness.readiness_level})."
            except Exception:
                pass

            try:
                roadmap = generate_roadmap(skills, target_role_id)
                roadmap_steps_summary = f"{roadmap.total_steps} milestones over {roadmap.estimated_duration_weeks} weeks."
                roadmap_info = f"Learning Roadmap: {roadmap_steps_summary}"
            except Exception:
                pass

        # Step 3: Build System & Context Prompt
        system_prompt = (
            "You are CareerPilot AI, an elite Cybersecurity Career Mentor. "
            "You provide actionable, highly professional, encouraging, and technical career advice. "
            "Address the user's career question directly using the provided context telemetry."
        )

        candidate_name = req.name or "Candidate"
        experience_summary = ", ".join(req.exp_titles) if req.exp_titles else "Entry Level"
        education_summary = ", ".join(req.edu_degrees) if req.edu_degrees else "Not specified"
        certs_summary = ", ".join(req.cert_names) if req.cert_names else "None listed"

        full_prompt = (
            f"{system_prompt}\n\n"
            "CANDIDATE TELEMETRY:\n"
            f"- Name: {candidate_name}\n"
            f"- Target Role: {target_role_name}\n"
            f"- Known Skills: {', '.join(skills) if skills else 'General Cybersecurity'}\n"
            f"- Work Experience: {experience_summary}\n"
            f"- Education: {education_summary}\n"
            f"- Certifications: {certs_summary}\n"
            f"- Skill Gap Telemetry: {gap_info or 'Not computed'}\n"
            f"- Readiness Telemetry: {readiness_info or 'Not computed'}\n"
            f"- Roadmap Telemetry: {roadmap_info or 'Not computed'}\n\n"
            f"USER QUESTION: {user_message}\n\n"
            "Provide a direct, encouraging, highly technical career advice response."
        )

        # Step 4: Call Ollama
        settings = get_settings()
        logger.info("Sending prompt to Ollama | Provider=Ollama | model=%s", settings.ollama_model)
        raw_answer = await generate_text_response(full_prompt)

        answer_text = raw_answer.strip()
        if answer_text.startswith("{") and ("response" in answer_text or "answer" in answer_text):
            try:
                parsed = json.loads(answer_text)
                if isinstance(parsed, dict):
                    answer_text = str(parsed.get("response") or parsed.get("answer") or parsed.get("reply") or answer_text)
            except Exception:
                pass

        logger.info("Mentor response successfully generated | length=%d", len(answer_text))
        return CareerMentorResponse(success=True, answer=answer_text, reply=answer_text)

    except (ExternalServiceError, AINetworkError, AITimeoutError) as e:
        logger.warning("Local AI engine unavailable for mentor chat: %s", e)
        err_msg = "Local AI unavailable. Start Ollama and try again."
        return CareerMentorResponse(success=False, answer=err_msg, reply=err_msg, error=err_msg)
    except Exception as exc:
        logger.error("Error in generate_mentor_response: %s", exc)
        err_msg = f"Failed to generate AI mentor response: {str(exc)}"
        return CareerMentorResponse(success=False, answer=err_msg, reply=err_msg, error=err_msg)


generate_mentor_answer = generate_mentor_response

