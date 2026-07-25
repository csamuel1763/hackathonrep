"""
Pydantic Schemas for AI Career Mission Control Dashboard & Dynamic Intelligence.
"""

from typing import Optional, Any
from pydantic import BaseModel, Field


class MissionTask(BaseModel):
    id: str
    title: str
    category: str  # "Certification" | "LinkedIn" | "GitHub" | "Skills" | "Interview" | "ATS"
    impact_level: str  # "Critical" | "High" | "Medium"
    estimated_hours: int
    roi_reason: str
    is_completed: bool = False


class WeeklyGoal(BaseModel):
    id: str
    title: str
    target_count: int
    current_count: int
    reward_xp: int
    is_completed: bool = False


class AchievementBadge(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    unlocked: bool = False
    unlocked_date: Optional[str] = None


class StrategicRecommendation(BaseModel):
    category: str  # "Certification" | "Project" | "Skill" | "Technology" | "Job Target"
    title: str
    roi_score: int = Field(..., ge=0, le=100)
    rationale: str


class PortfolioHealthItem(BaseModel):
    component: str  # "Resume" | "GitHub" | "LinkedIn" | "Projects"
    health_score: int = Field(..., ge=0, le=100)
    status: str  # "Optimal" | "Needs Attention" | "Incomplete"
    missing_evidence: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)


class CareerTimelineItem(BaseModel):
    phase: str  # "Past Achievement" | "Current Position" | "Next Milestone" | "Target Role" | "Future Projection"
    title: str
    description: str
    date_label: str
    status: str  # "completed" | "current" | "upcoming"


class SnapshotHistoryPoint(BaseModel):
    timestamp: str
    career_health: int
    recruiter_visibility: int
    hiring_readiness: int
    risk_score: int


class MetricFormulaInfo(BaseModel):
    metric_name: str
    current_value: int
    formula_description: str
    primary_factors: list[str] = Field(default_factory=list)


class ExecutiveAnalyticsData(BaseModel):
    salary_projections: list[dict] = Field(default_factory=list)
    learning_velocity: list[dict] = Field(default_factory=list)
    job_match_trend: list[dict] = Field(default_factory=list)
    skill_growth: list[dict] = Field(default_factory=list)


class PreviousSnapshotData(BaseModel):
    career_health: Optional[int] = None
    recruiter_visibility: Optional[int] = None
    hiring_readiness: Optional[int] = None
    risk_score: Optional[int] = None
    certs_count: Optional[int] = None


class MissionControlRequest(BaseModel):
    candidate_name: str = Field(default="Candidate")
    skills: list[str] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)
    exp_titles: list[str] = Field(default_factory=list)
    exp_descriptions: list[str] = Field(default_factory=list)
    exp_durations: list[str] = Field(default_factory=list)
    edu_degrees: list[str] = Field(default_factory=list)
    github_username: Optional[str] = ""
    linkedin_url: Optional[str] = ""
    target_role_id: Optional[str] = "soc-analyst"
    completed_milestones_count: int = 0
    completed_interviews_count: int = 0
    previous_snapshot: Optional[PreviousSnapshotData] = None


class MissionControlResponse(BaseModel):
    last_updated_timestamp: str
    daily_briefing: str
    delta_briefing: str
    career_health_score: int = Field(..., ge=0, le=100)
    career_health_trend: str
    recruiter_visibility_score: int = Field(..., ge=0, le=100)
    recruiter_visibility_trend: str
    visibility_level: str = "High Recruiter Attractiveness"
    hiring_readiness_pct: int = Field(..., ge=0, le=100)
    hiring_readiness_trend: str
    career_risk_score: int = Field(..., ge=0, le=100)
    career_risk_level: str
    metric_formulas: list[MetricFormulaInfo] = Field(default_factory=list)
    snapshot_history: list[SnapshotHistoryPoint] = Field(default_factory=list)
    mission_tasks: list[MissionTask] = Field(default_factory=list)
    weekly_goals: list[WeeklyGoal] = Field(default_factory=list)
    achievements: list[AchievementBadge] = Field(default_factory=list)
    strategic_recommendations: list[StrategicRecommendation] = Field(default_factory=list)
    portfolio_health: list[PortfolioHealthItem] = Field(default_factory=list)
    timeline: list[CareerTimelineItem] = Field(default_factory=list)
    analytics: ExecutiveAnalyticsData
