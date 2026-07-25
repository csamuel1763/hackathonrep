"""
ExtractedSkill ORM model.

Table: ``extracted_skills``

Records a single skill identified by the NLP pipeline for a given resume.
Multiple rows per resume — one per detected skill.

Design note:
    Skill gaps are NOT persisted here. Gap analysis is computed dynamically
    at request time by comparing extracted skills against the JSON taxonomy
    for the user's chosen target role.
"""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Float, ForeignKey, Index, String, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.resume import Resume


class ExtractedSkill(Base):
    """A single cybersecurity skill detected in an uploaded resume.

    Skills are extracted by the spaCy NLP pipeline using a combination of
    entity recognition and taxonomy-driven pattern matching.

    Attributes:
        skill_name: Normalised skill name (e.g. ``"Splunk"``).
        category:   Top-level taxonomy category (e.g. ``"SIEM & Log Analysis"``).
        confidence: Extraction confidence score in ``[0.0, 1.0]``.
                    Pattern-matched skills default to ``1.0``; NER-based
                    detections carry a model confidence score.
        source:     Which extraction method produced this row.
                    Either ``"pattern_match"`` or ``"ner"``.
    """

    __tablename__ = "extracted_skills"

    __table_args__ = (
        # Speed up queries that filter by resume + category (dashboard aggregations)
        Index("ix_extracted_skills_resume_id_category", "resume_id", "category"),
    )

    # ── Primary Key ────────────────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        doc="Unique skill record identifier (UUID v4).",
    )

    # ── Foreign Key ────────────────────────────────────────────────────────
    resume_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("resumes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="The resume from which this skill was extracted.",
    )

    # ── Skill Data ─────────────────────────────────────────────────────────
    skill_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        doc="Normalised skill name as matched against the taxonomy.",
    )

    category: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        doc="Top-level taxonomy category this skill belongs to.",
    )

    confidence: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=1.0,
        server_default="1.0",
        doc="Extraction confidence score. 1.0 for pattern matches, 0–1 for NER.",
    )

    source: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        doc="Extraction method: 'pattern_match' or 'ner'.",
    )

    # ── Audit ──────────────────────────────────────────────────────────────
    # ExtractedSkill is append-only; records are never updated after creation.
    # Therefore only created_at is needed — no updated_at.
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        doc="Timestamp when this skill record was created.",
    )

    # ── Relationships ──────────────────────────────────────────────────────
    resume: Mapped["Resume"] = relationship(
        "Resume",
        back_populates="extracted_skills",
        doc="The resume this skill was extracted from.",
    )

    def __repr__(self) -> str:
        return (
            f"<ExtractedSkill id={self.id} skill={self.skill_name!r} "
            f"category={self.category!r} confidence={self.confidence:.2f}>"
        )
