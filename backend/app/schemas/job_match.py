"""
Pydantic schemas for Resume vs Job Description Matching.
"""

from typing import Optional
from pydantic import BaseModel, Field


class JobMatchRequest(BaseModel):
    """Payload received from frontend to analyze a candidate resume against a Job Description."""
    job_description: str = Field(..., min_length=1, description="Full text of the target job description.")
    skills: list[str] = Field(default_factory=list, description="Parsed candidate technical skills.")
    name: str = Field(default="", description="Candidate name")
    email: str = Field(default="", description="Candidate email")
    phone: str = Field(default="", description="Candidate phone number")
    summary: str = Field(default="", description="Candidate professional summary")
    exp_titles: list[str] = Field(default_factory=list, description="Parsed job titles")
    exp_descriptions: list[str] = Field(default_factory=list, description="Parsed job descriptions")
    exp_durations: list[str] = Field(default_factory=list, description="Parsed job durations")
    edu_degrees: list[str] = Field(default_factory=list, description="Parsed education degrees")
    cert_names: list[str] = Field(default_factory=list, description="Parsed certifications")


class JobMatchResponse(BaseModel):
    """Structured response output for Job Description matching analysis."""
    overall_score: int = Field(..., ge=0, le=100, description="Combined compatibility score (0-100)")
    match_level: str = Field(..., description="Match level classification: Excellent, Good, Moderate, or Weak")
    technical_skills_score: int = Field(..., ge=0, le=100, description="Technical skill overlap score (0-100)")
    certifications_score: int = Field(..., ge=0, le=100, description="Certification overlap score (0-100)")
    experience_score: int = Field(..., ge=0, le=100, description="Experience relevance score (0-100)")
    ats_keyword_score: int = Field(..., ge=0, le=100, description="ATS keyword coverage score (0-100)")
    matched_skills: list[str] = Field(default_factory=list, description="Skills present in both resume and JD")
    missing_skills: list[str] = Field(default_factory=list, description="Important skills required in JD but missing in resume")
    missing_technologies: list[str] = Field(default_factory=list, description="Missing tools, frameworks, or tech stack")
    missing_certifications: list[str] = Field(default_factory=list, description="Missing certifications mentioned in JD")
    missing_soft_skills: list[str] = Field(default_factory=list, description="Missing soft skills or domain methodologies")
    strengths: list[str] = Field(default_factory=list, description="Key resume strengths aligned with the JD")
    weaknesses: list[str] = Field(default_factory=list, description="Key candidate gaps or missing areas relative to JD")
    ats_keywords: list[str] = Field(default_factory=list, description="Key ATS terms extracted from JD")
    bullet_improvements: list[str] = Field(default_factory=list, description="Actionable bullet points to improve resume")
    keywords_to_include: list[str] = Field(default_factory=list, description="Must-add keywords for ATS optimization")
    suggested_projects: list[str] = Field(default_factory=list, description="Hands-on project ideas to bridge gaps")
    wording_improvements: list[str] = Field(default_factory=list, description="Suggested resume phrasing improvements")
