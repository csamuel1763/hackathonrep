"""
Pydantic schemas for the Learning Roadmap feature.
"""

from pydantic import BaseModel, Field


class RoadmapStep(BaseModel):
    """A single step or milestone representing a week of study."""

    week: int = Field(..., description="The week number, starting at 1.")
    topics: list[str] = Field(..., description="Topics to learn during this week.")


class LearningRoadmapResponse(BaseModel):
    """Structured response containing estimated duration, total steps, and weekly milestones."""

    estimated_duration_weeks: int = Field(..., description="Estimated learning duration in weeks.")
    total_steps: int = Field(..., description="Total count of unique roadmap topics.")
    roadmap: list[RoadmapStep] = Field(..., description="Weekly learning path timeline.")
