"""
Live Cyber Career Marketplace & Market Intelligence API Router.

Exposes endpoints to search normalized job opportunities, match against candidate Digital Twin,
and retrieve real-time market demand analytics & skill heatmaps.
"""

import logging
from fastapi import APIRouter

from app.schemas.marketplace import MarketplaceSearchRequest, MarketplaceSearchResponse
from app.services.marketplace_service import search_marketplace

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/marketplace", tags=["Career Marketplace"])


@router.post(
    "/search",
    response_model=MarketplaceSearchResponse,
    status_code=200,
    summary="Search & Match Cybersecurity Opportunities",
    description="Evaluates candidate Digital Twin skills against live normalized job listings to rank opportunities by compatibility, opportunity score, and interview probability.",
)
async def search_marketplace_endpoint(req: MarketplaceSearchRequest) -> MarketplaceSearchResponse:
    """Search marketplace and return Digital Twin matched job listings."""
    logger.info("Marketplace search hit | skills_count=%d", len(req.candidate_skills))
    return search_marketplace(req)
