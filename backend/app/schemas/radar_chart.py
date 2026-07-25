"""
Pydantic schemas for the Skill Radar Chart feature.
"""

from pydantic import BaseModel, Field


class RadarChartResponse(BaseModel):
    """Normalized radar chart data containing candidate and required values."""

    labels: list[str] = Field(..., description="Chronological labels for the radar domains.")
    candidate: list[int] = Field(..., description="Normalized scores for the candidate (0-100).")
    required: list[int] = Field(..., description="Normalized required scores for the target role (0-100).")
