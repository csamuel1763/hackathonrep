"""
Central API router.

All versioned route groups are registered here.
main.py mounts this single router so it never needs to know
about individual feature routers.

To add a new feature router:
  1. Import its router object below.
  2. Call api_router.include_router(new_router).
"""

from fastapi import APIRouter

from app.api.v1.resume import router as resume_router
from app.api.v1.role_api import router as role_router
from app.api.v1.gap_analysis import router as gap_analysis_router
from app.api.v1.readiness_score import router as readiness_score_router
from app.api.v1.learning_roadmap import router as learning_roadmap_router
from app.api.v1.radar_chart import router as radar_chart_router
from app.api.v1.pdf_report import router as pdf_report_router
from app.api.v1.career_match import router as career_matches_router
from app.api.v1.resume_improvement import router as resume_improvements_router
from app.api.v1.career_mentor import router as career_mentor_router
from app.api.v1.mentor import router as mentor_router
from app.api.v1.job_match import router as job_match_router
from app.api.v1.digital_twin import router as digital_twin_router
from app.api.v1.marketplace import router as marketplace_router
from app.api.v1.mission_control import router as mission_control_router
from app.api.v1.copilot import router as copilot_router
from app.api.v1.auth import router as auth_router

# All v1 routes are prefixed with /api/v1
api_router = APIRouter(prefix="/api/v1")

# ── Feature routers ────────────────────────────────────────────────────────────
api_router.include_router(resume_router)
api_router.include_router(role_router)
api_router.include_router(gap_analysis_router)
api_router.include_router(readiness_score_router)
api_router.include_router(learning_roadmap_router)
api_router.include_router(radar_chart_router)
api_router.include_router(pdf_report_router)
api_router.include_router(career_matches_router)
api_router.include_router(resume_improvements_router)
api_router.include_router(career_mentor_router)
api_router.include_router(mentor_router)
api_router.include_router(job_match_router)
api_router.include_router(digital_twin_router)
api_router.include_router(marketplace_router)
api_router.include_router(mission_control_router)
api_router.include_router(copilot_router)
api_router.include_router(auth_router)

# Future routers (added per sprint):
# from app.api.v1.auth import router as auth_router
# from app.api.v1.dashboard import router as dashboard_router
# from app.api.v1.learning_path import router as learning_path_router
# api_router.include_router(auth_router)
# api_router.include_router(dashboard_router)
# api_router.include_router(learning_path_router)
