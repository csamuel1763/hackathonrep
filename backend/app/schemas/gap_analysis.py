"""
Pydantic schemas for the skill gap analysis feature.
"""

from pydantic import BaseModel, Field
from app.schemas.resume import ParsedSkill
from app.schemas.role import RequiredSkill


class GapAnalysisRequest(BaseModel):
    """Request schema for performing a skill gap analysis."""

    skills: list[ParsedSkill] = Field(..., description="List of parsed skills extracted from the candidate's resume.")
    role_id: str = Field(..., description="Unique slug identifier of the target cybersecurity role.")


class MatchedSkill(BaseModel):
    """A required role skill that was matched in the candidate's resume."""

    name: str = Field(..., description="Canonical name of the matched skill.")
    category: str = Field(..., description="Taxonomy category of the skill.")


class GapAnalysisResponse(BaseModel):
    """Structured response schema containing the deterministic gap analysis results."""

    role: str = Field(..., description="Name of the target cybersecurity role.")
    matched_skills: list[MatchedSkill] = Field(default_factory=list, description="Skills present in both the resume and the role requirements.")
    missing_skills: list[RequiredSkill] = Field(default_factory=list, description="Required role skills missing from the resume.")
    coverage_percentage: int = Field(..., description="Percentage of required skills matched (0-100).")
    gap_percentage: int = Field(..., description="Percentage of required skills missing (0-100).")
    covered_categories: list[str] = Field(default_factory=list, description="Categories that have at least one matched skill.")
    missing_categories: list[str] = Field(default_factory=list, description="Required categories that have zero matched skills.")


class SkillGapResponse(BaseModel):
    """Response schema for the Feature 6 Skill Gap Analysis Engine."""

    matched_skills: list[str] = Field(..., description="List of matched skill names, sorted alphabetically.")
    missing_skills: list[str] = Field(..., description="List of missing skill names, sorted alphabetically.")
    coverage_percentage: int = Field(..., description="Coverage percentage of matching skills (0-100).")
    matched_count: int = Field(..., description="Number of matched skills.")
    missing_count: int = Field(..., description="Number of missing skills.")
    total_required: int = Field(..., description="Total number of required skills defined for the role.")
