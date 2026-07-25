"""
Pydantic schemas for the role intelligence feature.
"""

from pydantic import BaseModel, Field


class RequiredSkill(BaseModel):
    """Structured model for a required technical skill inside a role taxonomy."""

    name: str = Field(..., description="Name of the skill, e.g., 'Splunk'.")
    category: str = Field(..., description="Taxonomy category the skill belongs to, e.g., 'SIEM'.")
    importance: str = Field(..., description="Level of importance of the skill, e.g., 'High', 'Medium', 'Low'.")


class CybersecurityRoleResponse(BaseModel):
    """Structured response schema for a cybersecurity role."""

    id: str = Field(..., description="Unique slug identifier of the role.")
    name: str = Field(..., description="Display name of the role.")
    description: str = Field(..., description="Brief description of responsibilities.")
    required_skills: list[RequiredSkill] = Field(default_factory=list, description="Core technical skills required.")
    categories: list[str] = Field(default_factory=list, description="Skill taxonomy categories involved.")
    prerequisites: list[str] = Field(default_factory=list, description="Base certifications or general IT knowledge.")
