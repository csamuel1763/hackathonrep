"""
Job Description Matching & Compatibility Analysis Service.

Computes a hybrid local deterministic score (keyword, skill, certification, experience overlap)
and calls OpenRouter AI for deep semantic reasoning, strengths/weaknesses, ATS suggestions,
and PDF report compilation.
"""

import math
import re
import logging
from io import BytesIO
from datetime import datetime

from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, PageBreak
from reportlab.graphics.shapes import Drawing, Rect

from app.schemas.job_match import JobMatchRequest, JobMatchResponse
from app.ai.ollama_client import generate_structured_json
from app.utils.taxonomy_loader import load_roles_taxonomy
from app.services.pdf_report_service import NumberedCanvas, draw_pdf_progress_bar

logger = logging.getLogger(__name__)


def _extract_keywords(text: str) -> set[str]:
    """Tokenize text into lowercased alphanumeric keywords (length >= 3)."""
    words = re.findall(r'\b[a-zA-Z0-9+#\.]+\b', text.lower())
    return {w for w in words if len(w) >= 3}


def _compute_local_scores(req: JobMatchRequest) -> dict:
    """Compute deterministic local overlap scores using candidate resume fields and target JD."""
    jd_text = req.job_description.lower()
    jd_words = _extract_keywords(jd_text)

    # 1. Technical Skills Score
    cand_skills = [s.strip().lower() for s in req.skills if s.strip()]
    if cand_skills:
        matched_skills = [s for s in req.skills if s.strip().lower() in jd_text]
        skill_score = min(100, int((len(matched_skills) / max(1, len(cand_skills))) * 100))
    else:
        matched_skills = []
        skill_score = 0

    # 2. Certifications Score
    cand_certs = [c.strip().lower() for c in req.cert_names if c.strip()]
    if cand_certs:
        matched_certs = [c for c in req.cert_names if c.strip().lower() in jd_text]
        cert_score = min(100, int((len(matched_certs) / max(1, len(cand_certs))) * 100))
    else:
        matched_certs = []
        cert_score = 50  # Neutral baseline if no certs in resume

    # 3. Experience Score
    exp_words = set()
    for title in req.exp_titles:
        exp_words.update(_extract_keywords(title))
    for desc in req.exp_descriptions:
        exp_words.update(_extract_keywords(desc))

    if exp_words and jd_words:
        overlap = exp_words.intersection(jd_words)
        exp_score = min(100, int((len(overlap) / min(30, len(jd_words))) * 100))
    else:
        exp_score = 40

    # 4. ATS Keyword Score
    matched_words = jd_words.intersection(exp_words.union(set(cand_skills)))
    ats_score = min(100, int((len(matched_words) / max(10, len(jd_words) * 0.4)) * 100))

    return {
        "technical_skills_score": max(10, skill_score),
        "certifications_score": cert_score,
        "experience_score": max(15, exp_score),
        "ats_keyword_score": max(10, ats_score),
        "matched_skills": matched_skills,
    }


async def compute_job_match(req: JobMatchRequest) -> JobMatchResponse:
    """Perform hybrid deterministic + OpenRouter AI Job Description matching analysis."""
    logger.info("Computing Job Description match | resume_name=%s, jd_len=%d", req.name, len(req.job_description))

    # Calculate local baseline scores
    local_metrics = _compute_local_scores(req)

    # Build prompt for OpenRouter AI semantic analysis
    skills_str = ", ".join(req.skills) if req.skills else "None"
    certs_str = ", ".join(req.cert_names) if req.cert_names else "None"
    exp_titles_str = ", ".join(req.exp_titles) if req.exp_titles else "None"
    summary_str = req.summary or "None"

    prompt = f"""
You are CareerPilot AI, an expert ATS and technical recruiter specializing in cybersecurity and IT careers.
Analyze the candidate's resume profile against the target Job Description below.

=== CANDIDATE RESUME PROFILE ===
Name: {req.name or 'Candidate'}
Summary: {summary_str}
Technical Skills: {skills_str}
Certifications: {certs_str}
Past Job Titles: {exp_titles_str}

=== TARGET JOB DESCRIPTION ===
{req.job_description[:3000]}

=== INSTRUCTIONS ===
Evaluate the match and return a single valid JSON object matching this schema (no markdown, no fences, no explanation):
{{
  "overall_semantic_score": 75,
  "missing_skills": ["List key technical skills required in JD but missing in candidate resume"],
  "missing_technologies": ["Tools, frameworks, or cloud platforms mentioned in JD but missing"],
  "missing_certifications": ["Certifications requested in JD not held by candidate"],
  "missing_soft_skills": ["Soft skills, methodologies, or GRC frameworks requested"],
  "strengths": ["3-5 key candidate resume strengths strongly aligned with the JD"],
  "weaknesses": ["2-4 major gaps or areas where the candidate falls short"],
  "ats_keywords": ["Top 8-12 critical ATS keywords extracted directly from JD"],
  "bullet_improvements": ["3-4 specific bullet point improvements for the resume"],
  "keywords_to_include": ["5-8 exact keywords candidate should add to resume"],
  "suggested_projects": ["2-3 practical cybersecurity project additions"],
  "wording_improvements": ["2-3 suggested phrasing rewrites to boost ATS impact"]
}}
""".strip()

    ai_data = {}
    try:
        ai_data = await generate_structured_json(prompt)
    except Exception as exc:
        logger.warning("OpenRouter AI analysis failed for job match, falling back to local heuristic: %s", exc)

    # Extract AI fields with safe fallbacks
    semantic_score = ai_data.get("overall_semantic_score")
    if not isinstance(semantic_score, int) or semantic_score <= 0:
        semantic_score = int(
            0.4 * local_metrics["technical_skills_score"] +
            0.3 * local_metrics["experience_score"] +
            0.2 * local_metrics["ats_keyword_score"] +
            0.1 * local_metrics["certifications_score"]
        )

    overall_score = min(100, max(0, int(0.5 * semantic_score + 0.5 * local_metrics["technical_skills_score"])))

    # Determine match level
    if overall_score >= 90:
        match_level = "Excellent"
    elif overall_score >= 75:
        match_level = "Good"
    elif overall_score >= 60:
        match_level = "Moderate"
    else:
        match_level = "Weak"

    matched_skills = local_metrics["matched_skills"]
    missing_skills = ai_data.get("missing_skills") or [s for s in req.skills if s not in matched_skills][:5]

    return JobMatchResponse(
        overall_score=overall_score,
        match_level=match_level,
        technical_skills_score=local_metrics["technical_skills_score"],
        certifications_score=local_metrics["certifications_score"],
        experience_score=local_metrics["experience_score"],
        ats_keyword_score=local_metrics["ats_keyword_score"],
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        missing_technologies=ai_data.get("missing_technologies") or [],
        missing_certifications=ai_data.get("missing_certifications") or [],
        missing_soft_skills=ai_data.get("missing_soft_skills") or [],
        strengths=ai_data.get("strengths") or ["Relevant technical background"],
        weaknesses=ai_data.get("weaknesses") or ["Missing specific JD tools/certifications"],
        ats_keywords=ai_data.get("ats_keywords") or matched_skills,
        bullet_improvements=ai_data.get("bullet_improvements") or ["Quantify past achievements with metric results."],
        keywords_to_include=ai_data.get("keywords_to_include") or missing_skills[:6],
        suggested_projects=ai_data.get("suggested_projects") or ["Build a home SIEM lab or cloud security test environment."],
        wording_improvements=ai_data.get("wording_improvements") or ["Use strong action verbs like Implemented, Configured, Analyzed."],
    )


def generate_job_match_pdf_report(req: JobMatchRequest, resp: JobMatchResponse) -> bytes:
    """Generate a downloadable multi-page PDF report for Job Description Match Analysis using ReportLab."""
    logger.info("Generating Job Match PDF Report for candidate=%s", req.name)

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=64
    )

    base_styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=base_styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=HexColor("#4f46e5"),
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=base_styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=HexColor("#475569"),
        spaceAfter=20
    )
    h1_style = ParagraphStyle(
        'SectionH1',
        parent=base_styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=HexColor("#1e293b"),
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )
    body_style = ParagraphStyle(
        'BodyDark',
        parent=base_styles['BodyText'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=HexColor("#334155")
    )
    bold_label_style = ParagraphStyle(
        'BoldLabel',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    story = []

    # Title & Subtitle
    story.append(Paragraph("CareerPilot AI", title_style))
    story.append(Paragraph("Job Description Compatibility & ATS Alignment Report", subtitle_style))
    story.append(Spacer(1, 10))

    # Candidate Summary Table
    profile_data = [
        [Paragraph("Candidate Name:", bold_label_style), Paragraph(req.name or "N/A", body_style)],
        [Paragraph("Overall Match:", bold_label_style), Paragraph(f"<b>{resp.overall_score}/100</b> ({resp.match_level})", bold_label_style)],
        [Paragraph("Technical Skills Score:", bold_label_style), Paragraph(f"{resp.technical_skills_score}/100", body_style)],
        [Paragraph("ATS Keyword Score:", bold_label_style), Paragraph(f"{resp.ats_keyword_score}/100", body_style)],
    ]
    t = Table(profile_data, colWidths=[130, 370])
    t.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('LINEBELOW', (0, 0), (-1, -2), 0.5, HexColor("#f1f5f9")),
    ]))
    story.append(t)
    story.append(Spacer(1, 15))

    # Match Progress Bar
    story.append(Paragraph("<b>Overall JD Compatibility Progress:</b>", body_style))
    story.append(Spacer(1, 4))
    story.append(draw_pdf_progress_bar(resp.overall_score))
    story.append(Spacer(1, 15))

    # Section: Skills & Gaps Analysis
    story.append(Paragraph("Section 1: Skill & Gap Analysis", h1_style))
    gap_table_data = [
        [Paragraph("✔ Matched Skills", bold_label_style), Paragraph("✖ Missing Skills / Tech Stack", bold_label_style)],
        [
            Paragraph("<br/>".join([f"• {s}" for s in resp.matched_skills]) or "None", body_style),
            Paragraph("<br/>".join([f"• {s}" for s in resp.missing_skills + resp.missing_technologies]) or "None", body_style)
        ]
    ]
    gt = Table(gap_table_data, colWidths=[245, 255])
    gt.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BACKGROUND', (0, 0), (0, 0), HexColor("#d1fae5")),
        ('BACKGROUND', (1, 0), (1, 0), HexColor("#fee2e2")),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#cbd5e1")),
    ]))
    story.append(KeepTogether([gt]))
    story.append(Spacer(1, 15))

    # Section: Strengths & Weaknesses
    story.append(Paragraph("Section 2: Strengths & Weaknesses", h1_style))
    sw_data = [
        [Paragraph("Key Candidate Strengths", bold_label_style), Paragraph("Areas for Improvement", bold_label_style)],
        [
            Paragraph("<br/>".join([f"• {s}" for s in resp.strengths]), body_style),
            Paragraph("<br/>".join([f"• {w}" for w in resp.weaknesses]), body_style)
        ]
    ]
    swt = Table(sw_data, colWidths=[250, 250])
    swt.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#e2e8f0")),
        ('BACKGROUND', (0, 0), (-1, 0), HexColor("#f8fafc")),
    ]))
    story.append(KeepTogether([swt]))
    story.append(Spacer(1, 15))

    # Section: Resume Improvement Recommendations
    story.append(Paragraph("Section 3: ATS & Resume Recommendations", h1_style))
    for imp in resp.bullet_improvements:
        story.append(Paragraph(f"• {imp}", body_style))
        story.append(Spacer(1, 3))

    if resp.keywords_to_include:
        story.append(Spacer(1, 5))
        story.append(Paragraph(f"<b>Keywords to add to resume:</b> {', '.join(resp.keywords_to_include)}", body_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
