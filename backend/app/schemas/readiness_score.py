"""
Pydantic schemas for the Career Readiness Score feature.
"""

from pydantic import BaseModel, Field


class ReadinessScoreResponse(BaseModel):
    """Response schema containing component scores and the overall career readiness score."""

    overall_score: int = Field(..., description="Overall readiness score from 0 to 100.")
    skills_score: int = Field(..., description="Component score based on skill alignment (0-100).")
    experience_score: int = Field(..., description="Component score based on parsed experience (0-100).")
    education_score: int = Field(..., description="Component score based on academic relevance (0-100).")
    certification_score: int = Field(..., description="Component score based on certs obtained (0-100).")
    readiness_level: str = Field(..., description="Qualified level (Beginner, Intermediate, Job Ready, Excellent).")
