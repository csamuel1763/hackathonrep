"""
AI Mentor API Router.

Exposes a chat endpoint to receive candidate career questions and return personalized advice.
Mapped to POST /api/v1/mentor/chat.
"""

import logging

from fastapi import APIRouter

from app.schemas.career_mentor import CareerMentorRequest, CareerMentorResponse
from app.services.career_mentor_service import generate_mentor_answer

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/mentor", tags=["Mentor"])


@router.post(
    "/chat",
    response_model=CareerMentorResponse,
    status_code=200,
    summary="Chat with AI Mentor",
    description="Receives candidate message alongside resume profile context and returns personalized advice.",
)
async def chat_with_mentor(body: CareerMentorRequest) -> CareerMentorResponse:
    """Trigger career mentor AI conversation."""
    logger.info("Mentor request received | endpoint=/api/v1/mentor/chat")
    return await generate_mentor_answer(body)
