"""
Skill Radar Chart API Router.

Exposes an endpoint to generate comparative radar data arrays for a target role.
"""

import logging

from fastapi import APIRouter, Query

from app.schemas.radar_chart import RadarChartResponse
from app.services.radar_chart_service import compute_radar_data

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/radar-chart", tags=["Radar Chart"])


@router.get(
    "/{role_id}",
    response_model=RadarChartResponse,
    status_code=200,
    summary="Get Normalized Skill Radar Chart Data",
    description="Calculates comparative normalized domain arrays for candidates against target role competencies.",
    responses={
        404: {"description": "Target role ID not found in the taxonomy database."},
    },
)
async def get_radar_chart_data(
    role_id: str,
    skills: list[str] = Query(default=[], description="Candidate's current skill names"),
) -> RadarChartResponse:
    """Trigger radar chart data computation."""
    logger.info("Radar chart data endpoint hit | role_id=%s", role_id)
    return compute_radar_data(skills, role_id)
