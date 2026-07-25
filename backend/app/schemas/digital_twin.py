"""
Pydantic Schemas for AI Digital Twin Profile, GitHub & LinkedIn Intelligence, and Career Compatibility.
"""

from typing import Optional, Any
from pydantic import BaseModel, Field


# ── Career DNA & Radar ────────────────────────────────────────────────────────

class CareerDNAScores(BaseModel):
    cybersecurity: int = Field(default=50, ge=0, le=100)
    programming: int = Field(default=50, ge=0, le=100)
    networking: int = Field(default=50, ge=0, le=100)
    cloud: int = Field(default=50, ge=0, le=100)
    devops: int = Field(default=50, ge=0, le=100)
    leadership: int = Field(default=50, ge=0, le=100)
    communication: int = Field(default=50, ge=0, le=100)
    problem_solving: int = Field(default=50, ge=0, le=100)
    threat_hunting: int = Field(default=50, ge=0, le=100)
    incident_response: int = Field(default=50, ge=0, le=100)


class SkillGraphNode(BaseModel):
    id: str
    name: str
    type: str  # "skill" | "certification" | "project" | "role" | "technology"
    weight: int = Field(default=1, ge=1, le=10)


class SkillGraphEdge(BaseModel):
    source: str
    target: str
    relation: str  # "requires" | "enhances" | "used_in" | "certified_by"


class SkillGraphData(BaseModel):
    nodes: list[SkillGraphNode] = Field(default_factory=list)
    edges: list[SkillGraphEdge] = Field(default_factory=list)


# ── Future Career Forecast ───────────────────────────────────────────────────

class CareerForecastMilestone(BaseModel):
    timeline: str  # "6 Months" | "1 Year" | "2 Years"
    predicted_role: str
    expected_salary_range: str
    key_achievements: list[str] = Field(default_factory=list)
    recommended_focus_areas: list[str] = Field(default_factory=list)


# ── Skill Gap Detail ──────────────────────────────────────────────────────────

class DetailedSkillGapItem(BaseModel):
    skill_name: str
    importance: str  # "Critical" | "High" | "Medium"
    difficulty: str   # "Easy" | "Moderate" | "Hard"
    estimated_learning_hours: int
    recommended_resources: list[str] = Field(default_factory=list)
    priority: int = Field(default=1, ge=1, le=5)


class CareerCompatibilityRole(BaseModel):
    role_id: str
    role_name: str
    compatibility_score: int = Field(..., ge=0, le=100)
    confidence_score: int = Field(..., ge=0, le=100)
    strength_match_percentage: int = Field(..., ge=0, le=100)
    matched_skills: list[str] = Field(default_factory=list)
    missing_skills: list[str] = Field(default_factory=list)
    missing_certifications: list[str] = Field(default_factory=list)
    estimated_reach_time_weeks: int
    roadmap_summary: str
    detailed_gaps: list[DetailedSkillGapItem] = Field(default_factory=list)


# ── GitHub Profile Intelligence ──────────────────────────────────────────────

class GitHubAnalysisRequest(BaseModel):
    username: str = Field(..., description="GitHub username or repository URL")
    resume_skills: list[str] = Field(default_factory=list)


class RepositorySummary(BaseModel):
    name: str
    description: Optional[str] = ""
    language: Optional[str] = "Plain Text"
    stars: int = 0
    forks: int = 0
    url: str = ""
    is_security_related: bool = False


class GitHubAnalysisResponse(BaseModel):
    username: str
    developer_profile: str
    portfolio_score: int = Field(..., ge=0, le=100)
    coding_maturity: str  # "Beginner" | "Intermediate" | "Advanced" | "Expert"
    project_quality_score: int = Field(..., ge=0, le=100)
    contribution_score: int = Field(..., ge=0, le=100)
    open_source_readiness: str
    public_repos_count: int = 0
    total_stars: int = 0
    primary_languages: list[str] = Field(default_factory=list)
    security_tools_detected: list[str] = Field(default_factory=list)
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    top_repositories: list[RepositorySummary] = Field(default_factory=list)
    repo_recommendations: list[str] = Field(default_factory=list)


# ── LinkedIn Profile Intelligence ─────────────────────────────────────────────

class LinkedInAnalysisRequest(BaseModel):
    linkedin_url: str = Field(..., description="LinkedIn profile URL or supplied profile text")
    raw_profile_text: Optional[str] = Field(default="", description="Optional additional profile text")
    resume_skills: list[str] = Field(default_factory=list)


class LinkedInAnalysisResponse(BaseModel):
    linkedin_url: str
    headline: str
    branding_score: int = Field(..., ge=0, le=100)
    recruiter_attractiveness_score: int = Field(..., ge=0, le=100)
    profile_completeness_score: int = Field(..., ge=0, le=100)
    keyword_optimization_score: int = Field(..., ge=0, le=100)
    headline_quality: str
    experience_quality: str
    achievement_quality: str
    strengths: list[str] = Field(default_factory=list)
    improvement_areas: list[str] = Field(default_factory=list)
    networking_suggestions: list[str] = Field(default_factory=list)


# ── Cross Profile Validation ──────────────────────────────────────────────────

class ProfileInconsistencyItem(BaseModel):
    source_a: str  # e.g., "Resume"
    source_b: str  # e.g., "GitHub"
    issue: str
    recommendation: str


class CrossProfileValidationRequest(BaseModel):
    resume_data: Optional[Any] = None
    github_username: Optional[str] = ""
    linkedin_url: Optional[str] = ""


class CrossProfileValidationResponse(BaseModel):
    consistency_score: int = Field(..., ge=0, le=100)
    inconsistencies: list[ProfileInconsistencyItem] = Field(default_factory=list)
    missing_resume_skills: list[str] = Field(default_factory=list)
    missing_github_projects: list[str] = Field(default_factory=list)
    missing_linkedin_skills: list[str] = Field(default_factory=list)
    resume_improvements: list[str] = Field(default_factory=list)
    github_improvements: list[str] = Field(default_factory=list)
    linkedin_improvements: list[str] = Field(default_factory=list)


# ── Full Digital Twin Profile ────────────────────────────────────────────────

class DigitalTwinRequest(BaseModel):
    name: str = Field(default="", description="Candidate name")
    email: str = Field(default="", description="Candidate email")
    phone: str = Field(default="", description="Candidate phone")
    summary: str = Field(default="", description="Professional summary")
    skills: list[str] = Field(default_factory=list)
    exp_titles: list[str] = Field(default_factory=list)
    exp_descriptions: list[str] = Field(default_factory=list)
    exp_durations: list[str] = Field(default_factory=list)
    edu_degrees: list[str] = Field(default_factory=list)
    cert_names: list[str] = Field(default_factory=list)
    github_username: Optional[str] = ""
    linkedin_url: Optional[str] = ""
    target_role_id: Optional[str] = "soc-analyst"


class DigitalTwinProfileResponse(BaseModel):
    name: str
    email: str
    phone: str
    summary: str
    career_persona: str
    personality_summary: str
    readiness_score: int = Field(..., ge=0, le=100)
    career_level: str  # "Entry-Level" | "Junior Specialist" | "Mid-Level Professional" | "Senior Engineer" | "Principal Expert"
    technical_stack: list[str] = Field(default_factory=list)
    soft_skills: list[str] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)
    career_interests: list[str] = Field(default_factory=list)
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    growth_opportunities: list[str] = Field(default_factory=list)
    career_dna: CareerDNAScores
    skill_graph: SkillGraphData
    career_rankings: list[CareerCompatibilityRole] = Field(default_factory=list)
    future_forecast: list[CareerForecastMilestone] = Field(default_factory=list)
    github_analysis: Optional[GitHubAnalysisResponse] = None
    linkedin_analysis: Optional[LinkedInAnalysisResponse] = None
    cross_profile: Optional[CrossProfileValidationResponse] = None
