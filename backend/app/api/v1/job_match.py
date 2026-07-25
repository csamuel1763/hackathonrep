"""
Job Description Matching API Router.

Exposes endpoints to analyze a resume against a target Job Description
and generate a downloadable PDF match report.
"""

import logging
from fastapi import APIRouter, HTTPException, Response

from app.schemas.job_match import JobMatchRequest, JobMatchResponse
from app.services.job_match_service import compute_job_match, generate_job_match_pdf_report

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/job-match", tags=["Job Description Match"])


@router.post(
    "/analyze",
    response_model=JobMatchResponse,
    status_code=200,
    summary="Analyze resume against Job Description",
    description="Calculates local skill overlap scores and performs OpenRouter AI semantic reasoning to generate a detailed compatibility report.",
    responses={
        400: {"description": "Invalid input or empty Job Description."},
        502: {"description": "External AI service error."},
    },
)
async def analyze_job_match_endpoint(req: JobMatchRequest) -> JobMatchResponse:
    """Analyze resume against target Job Description."""
    if not req.job_description or not req.job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty.")
    
    logger.info("Job match analyze endpoint hit | candidate=%s, jd_length=%d", req.name, len(req.job_description))
    return await compute_job_match(req)


@router.post(
    "/report",
    summary="Download Job Match PDF Report",
    description="Compiles and downloads a multi-page PDF compatibility report.",
    responses={
        200: {
            "content": {"application/pdf": {}},
            "description": "Successfully compiled and returned PDF job match report.",
        },
        400: {"description": "Invalid input."},
    },
)
async def download_job_match_report_endpoint(req: JobMatchRequest) -> Response:
    """Download compiled Job Match PDF report."""
    if not req.job_description or not req.job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty.")
    
    logger.info("Job match report download hit | candidate=%s", req.name)
    match_resp = await compute_job_match(req)
    pdf_bytes = generate_job_match_pdf_report(req, match_resp)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=CareerPilot_Job_Match_Report.pdf",
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )
