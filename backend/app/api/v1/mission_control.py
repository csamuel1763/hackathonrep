"""
AI Career Mission Control API Router.

Exposes endpoints for the executive Mission Control dashboard, AI daily briefing,
ranked mission tasks, high-ROI strategic recommendations, and executive progress analytics.
"""

import logging
from fastapi import APIRouter

from app.schemas.mission_control import MissionControlRequest, MissionControlResponse
from app.services.mission_control_service import generate_mission_control

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/mission-control", tags=["Mission Control Dashboard"])


@router.post(
    "/briefing",
    response_model=MissionControlResponse,
    status_code=200,
    summary="Generate Executive Mission Control Dashboard",
    description="Synthesizes candidate Digital Twin analytics into AI daily briefing, career health score, recruiter visibility metrics, ranked mission tasks, high-ROI recommendations, and executive charts data.",
)
async def get_mission_control_briefing(req: MissionControlRequest) -> MissionControlResponse:
    """Generate executive Mission Control dashboard data."""
    logger.info("Mission Control briefing hit | candidate=%s", req.candidate_name)
    return generate_mission_control(req)
