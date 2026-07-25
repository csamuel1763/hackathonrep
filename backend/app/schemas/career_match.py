"""
Pydantic schemas for the Career Match Dashboard feature.
"""

from pydantic import BaseModel, Field


class CareerMatchRole(BaseModel):
    """Comparative match details for a specific taxonomy role."""

    id: str = Field(..., description="Role slug identifier.")
    name: str = Field(..., description="Role title name.")
    description: str = Field(default="", description="Short role summary description.")
    score: int = Field(..., description="Overall calculated match percentage (0-100).")
    matched_skills: int = Field(..., description="Count of matched required skills.")
    required_skills: int = Field(..., description="Total required skills for the role.")
    missing_skills: int = Field(..., description="Count of missing required skills.")
