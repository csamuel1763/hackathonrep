"""
PDF Report API Router.

Exposes an endpoint to generate and download a compiled PDF career report.
"""

import logging

from fastapi import APIRouter, Query, Response

from app.services.pdf_report_service import generate_pdf_report

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/report", tags=["Career Report"])


@router.get(
    "/download",
    summary="Download Career Intelligence PDF Report",
    description="Calculates analysis variables and compiles a multi-page ReportLab PDF document.",
    responses={
        200: {
            "content": {"application/pdf": {}},
            "description": "Successfully compiled and returned PDF career intelligence report.",
        },
        404: {"description": "Target role ID not found in the taxonomy database."},
    },
)
async def download_career_report(
    role_id: str,
    skills: list[str] = Query(default=[], description="Parsed skill names"),
    name: str = Query(default="", description="Candidate name"),
    email: str = Query(default="", description="Candidate email"),
    phone: str = Query(default="", description="Candidate phone number"),
    summary: str = Query(default="", description="Candidate summary text"),
    exp_title: list[str] = Query(default=[], description="Parsed job titles"),
    exp_desc: list[str] = Query(default=[], description="Parsed job descriptions"),
    exp_duration: list[str] = Query(default=[], description="Parsed job durations"),
    edu_degree: list[str] = Query(default=[], description="Parsed degrees"),
    cert_name: list[str] = Query(default=[], description="Parsed certifications"),
) -> Response:
    """Download compiled career report."""
    logger.info("PDF download endpoint hit | role_id=%s, name=%s", role_id, name)
    pdf_bytes = generate_pdf_report(
        role_id=role_id,
        skills=skills,
        name=name,
        email=email,
        phone=phone,
        summary=summary,
        exp_titles=exp_title,
        exp_descriptions=exp_desc,
        exp_durations=exp_duration,
        edu_degrees=edu_degree,
        cert_names=cert_name,
    )
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=CareerPilot_Report.pdf",
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )
