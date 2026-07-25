"""
AI Career Copilot API Router.

Exposes endpoints for the global autonomous career copilot agent,
smart notifications, daily missions, What-If scenario simulations, and 30/60/90-day roadmaps.
"""

import logging
from fastapi import APIRouter

from app.schemas.copilot import (
    CopilotStateRequest,
    CopilotStateResponse,
    WhatIfSimulationRequest,
    WhatIfSimulationResponse,
)
from app.services.copilot_service import get_copilot_state, simulate_what_if

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/copilot", tags=["AI Career Copilot"])


@router.post(
    "/state",
    response_model=CopilotStateResponse,
    status_code=200,
    summary="Get Global AI Copilot State & Notifications",
    description="Returns real-time smart notifications, top 5 ROI daily missions, 30/60/90-day execution roadmaps, and automated weekly executive report.",
)
async def get_copilot_state_endpoint(req: CopilotStateRequest) -> CopilotStateResponse:
    """Get global Copilot state and notifications."""
    logger.info("Copilot state hit | candidate=%s", req.candidate_name)
    return get_copilot_state(req)


@router.post(
    "/what-if",
    response_model=WhatIfSimulationResponse,
    status_code=200,
    summary="Simulate Hypothetical Career Scenarios",
    description="Calculates real-time projected impact of learning new skills (e.g. Kubernetes, Azure), earning certifications, or building projects on salary, hiring readiness, and job match.",
)
async def simulate_what_if_endpoint(req: WhatIfSimulationRequest) -> WhatIfSimulationResponse:
    """Run What-If scenario simulation."""
    logger.info("What-If simulation hit | action=%s, value=%s", req.action_type, req.action_value)
    return simulate_what_if(req)
