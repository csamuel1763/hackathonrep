"""
Pydantic Schemas for Live Cyber Career Marketplace & Market Intelligence.
"""

from typing import Optional, Any
from pydantic import BaseModel, Field


class JobListing(BaseModel):
    id: str
    title: str
    company: str
    company_logo: str = ""
    location: str
    salary_range: str
    work_type: str  # "Remote" | "Hybrid" | "Onsite"
    employment_type: str = "Full-Time"
    min_experience_years: int
    security_domain: str = "SOC / Incident Response"
    required_skills: list[str] = Field(default_factory=list)
    required_certs: list[str] = Field(default_factory=list)
    education_req: str = "Bachelor's in CS / Cybersecurity or equivalent"
    posted_date: str = "Just now"
    apply_url: str = ""
    badges: list[str] = Field(default_factory=list)
    description: str = ""


class JobMatchExplanation(BaseModel):
    why_good_fit: list[str] = Field(default_factory=list)
    why_not_perfect: list[str] = Field(default_factory=list)
    interview_probability_pct: int = Field(..., ge=0, le=100)


class JobActionPlan(BaseModel):
    missing_skills: list[str] = Field(default_factory=list)
    recommended_certs: list[str] = Field(default_factory=list)
    recommended_projects: list[str] = Field(default_factory=list)
    learning_roadmap_summary: str = ""
    ai_recommendation_reason: str = ""
    estimated_readiness_weeks: int = 4


class JobMatchResult(BaseModel):
    job: JobListing
    overall_match_score: int = Field(..., ge=0, le=100)
    technical_match_score: int = Field(..., ge=0, le=100)
    experience_match_score: int = Field(..., ge=0, le=100)
    certification_match_score: int = Field(..., ge=0, le=100)
    education_match_score: int = Field(..., ge=0, le=100)
    soft_skill_match_score: int = Field(..., ge=0, le=100)
    ats_match_score: int = Field(..., ge=0, le=100)
    confidence_score: int = Field(..., ge=0, le=100)
    recruiter_visibility_score: int = Field(default=88, ge=0, le=100)
    opportunity_score: int = Field(..., ge=0, le=100)
    fit_explanation: JobMatchExplanation
    action_plan: JobActionPlan


class MarketInsightItem(BaseModel):
    name: str
    count_or_value: int
    category: str = ""


class SkillHeatmapItem(BaseModel):
    skill: str
    demand_score: int = Field(..., ge=0, le=100)
    growth_rate: str = "+15% YoY"
    job_count: int = 12
    salary_boost: str = "+$14,500/yr"
    resume_matched: bool = False


class MarketInsightsData(BaseModel):
    most_requested_skills: list[MarketInsightItem] = Field(default_factory=list)
    fastest_growing_tech: list[MarketInsightItem] = Field(default_factory=list)
    most_requested_certs: list[MarketInsightItem] = Field(default_factory=list)
    average_salaries_by_role: list[MarketInsightItem] = Field(default_factory=list)
    top_hiring_companies: list[MarketInsightItem] = Field(default_factory=list)
    top_locations: list[MarketInsightItem] = Field(default_factory=list)
    trending_roles: list[MarketInsightItem] = Field(default_factory=list)


class MarketplaceSearchRequest(BaseModel):
    candidate_skills: list[str] = Field(default_factory=list)
    candidate_certs: list[str] = Field(default_factory=list)
    candidate_exp_titles: list[str] = Field(default_factory=list)
    candidate_exp_descriptions: list[str] = Field(default_factory=list)
    query: Optional[str] = ""
    work_type_filter: Optional[str] = "All"  # "All" | "Remote" | "Hybrid" | "Onsite"
    security_domain_filter: Optional[str] = "All"
    sort_by: Optional[str] = "Highest Match"  # "Highest Match" | "Highest Confidence" | "Latest Jobs" | "Highest Salary" | "Remote First"
    min_match_filter: Optional[int] = 0


class MarketplaceSearchResponse(BaseModel):
    total_jobs: int
    avg_match_pct: int = 82
    avg_confidence_pct: int = 88
    highest_salary_today: str = "$195,000"
    top_company_today: str = "CrowdStrike"
    ranked_jobs: list[JobMatchResult] = Field(default_factory=list)
    top_matches: list[JobMatchResult] = Field(default_factory=list)
    market_insights: MarketInsightsData
    skill_demand_heatmap: list[SkillHeatmapItem] = Field(default_factory=list)
