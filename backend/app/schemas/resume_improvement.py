"""
Pydantic schemas for the AI Resume Improvement Suggestions feature.
"""

from pydantic import BaseModel, Field


class PriorityRecommendation(BaseModel):
    """Action item recommendation for candidate readiness improvement."""

    title: str = Field(..., description="Action title, e.g. 'Learn Splunk'.")
    reason: str = Field(..., description="Contextual reason for recommendation.")
    difficulty: str = Field(..., description="Difficulty level (Easy, Medium, Hard).")
    duration: str = Field(..., description="Estimated duration (e.g. '2 Weeks').")
    impact: int = Field(..., description="Impact score from 1 to 10.")


class ResumeImprovementResponse(BaseModel):
    """Complete recommendations payload containing score gain, priorities, and tips."""

    estimated_score_gain: int = Field(..., description="Estimated score improvement gain.")
    priority: list[PriorityRecommendation] = Field(..., description="Priority recommendations sorted by impact.")
    resume_improvements: list[str] = Field(..., description="Actionable resume content formatting tips.")
