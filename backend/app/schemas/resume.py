"""
Pydantic schemas for resume upload and AI parsing.

Defines the structured JSON schemas representing the parsed resume data,
enforcing standard types, defaults, and extensibility.
"""

from pydantic import BaseModel, Field


# ── Nested Models ─────────────────────────────────────────────────────────────


class ParsedSkill(BaseModel):
    """A technical or domain skill detected in the resume."""

    name: str = Field(..., description="Name of the skill, e.g., 'Python'.")
    category: str = Field(default="Other", description="Taxonomy category of the skill.")
    confidence: float = Field(default=1.0, description="Extraction confidence score from 0.0 to 1.0.")


class WorkExperience(BaseModel):
    """An employment record in the resume."""

    title: str = Field(default="", description="Job title, e.g., 'SOC Analyst'.")
    company: str = Field(default="", description="Name of the company.")
    duration: str = Field(default="", description="Duration of employment, e.g., 'Jan 2021 - Present'.")
    description: str = Field(default="", description="Description of responsibilities and achievements.")


class Education(BaseModel):
    """An academic qualification."""

    degree: str = Field(default="", description="Degree or program title, e.g., 'B.S. Computer Science'.")
    institution: str = Field(default="", description="Name of the school or university.")
    year: str = Field(default="", description="Graduation year or duration.")


class Certification(BaseModel):
    """A professional certification or license."""

    name: str = Field(..., description="Name of the certification, e.g., 'CISSP'.")
    issuer: str = Field(default="", description="Organization that issued the certification, e.g., 'ISC2'.")


# ── API Response Model ─────────────────────────────────────────────────────────


class ParsedResumeResponse(BaseModel):
    """Complete flat-structured resume data returned by the parsing pipeline."""

    name: str = Field(default="", description="Full name of the candidate.")
    email: str = Field(default="", description="Email address.")
    phone: str = Field(default="", description="Phone number.")
    summary: str = Field(default="", description="Professional summary.")

    skills: list[ParsedSkill] = Field(default_factory=list, description="List of technical and domain skills.")
    experience: list[WorkExperience] = Field(default_factory=list, description="Work experience records.")
    education: list[Education] = Field(default_factory=list, description="Education history.")
    certifications: list[Certification] = Field(default_factory=list, description="Professional certifications.")
