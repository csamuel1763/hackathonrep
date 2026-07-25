"""
Pydantic Schemas for AI Career Copilot & Autonomous Career Agent.
"""

from typing import Optional, Any
from pydantic import BaseModel, Field


class CopilotNotification(BaseModel):
    id: str
    title: str
    message: str
    category: str  # "warning" | "opportunity" | "insight"
    timestamp: str = "Just now"
    action_url: Optional[str] = None


class CopilotMission(BaseModel):
    id: str
    title: str
    description: str
    why_reason: str
    expected_impact: str
    difficulty: str  # "Easy" | "Medium" | "Hard"
    est_time_hours: int
    roi_score: int = Field(..., ge=0, le=100)
    is_completed: bool = False


class TimelineRoadmap(BaseModel):
    phase_30_day: list[str] = Field(default_factory=list)
    phase_60_day: list[str] = Field(default_factory=list)
    phase_90_day: list[str] = Field(default_factory=list)
    summary: str = ""


class WeeklyProgressReport(BaseModel):
    report_date: str
    skill_growth_summary: str
    portfolio_health_summary: str
    interview_performance_score: int = Field(..., ge=0, le=100)
    salary_projection_change: str
    mission_completion_rate: str
    executive_summary: str


class WhatIfSimulationRequest(BaseModel):
    action_type: str  # "learn_skill" | "earn_cert" | "build_projects"
    action_value: str  # e.g., "Kubernetes", "CompTIA Security+", "3 Cloud Security Labs"
    current_health: int = 75
    current_readiness: int = 70
    current_salary: int = 95000
    current_recruiter_vis: int = 72


class WhatIfSimulationResponse(BaseModel):
    action_value: str
    projected_health: int
    health_delta: int
    projected_readiness: int
    readiness_delta: int
    projected_salary: int
    salary_delta: int
    projected_match_increase_pct: int
    projected_recruiter_vis: int
    recruiter_vis_delta: int
    forecast_summary: str


class CopilotStateRequest(BaseModel):
    candidate_name: str = Field(default="Candidate")
    skills: list[str] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)
    exp_titles: list[str] = Field(default_factory=list)
    github_username: Optional[str] = ""
    linkedin_url: Optional[str] = ""
    target_role_id: Optional[str] = "soc-analyst"


class CopilotStateResponse(BaseModel):
    notifications: list[CopilotNotification] = Field(default_factory=list)
    daily_top_missions: list[CopilotMission] = Field(default_factory=list)
    roadmap_30_60_90: TimelineRoadmap
    weekly_report: WeeklyProgressReport
