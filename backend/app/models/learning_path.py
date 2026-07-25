"""
LearningPath ORM model.

Table: ``learning_paths``

Stores the AI-generated personalised learning roadmap produced by the
OpenRouter pipeline for a specific user, resume, and target cybersecurity role.

Design note:
    The full roadmap is stored as JSONB so that the structure can evolve
    without schema migrations. The Pydantic response schema enforces the
    shape at the API boundary.

    A user may regenerate paths for the same resume with different target
    roles, so the (resume_id, target_role) combination is not unique —
    a user could iterate and compare multiple generated paths.
"""

import uuid
from typing import TYPE_CHECKING, Any

from sqlalchemy import ForeignKey, Index, String
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.resume import Resume


class LearningPath(TimestampMixin, Base):
    """AI-generated personalised cybersecurity learning roadmap.

    Each row represents one OpenRouter-generated learning plan for a specific
    resume analysed against a specific target role.

    Attributes:
        target_role: The cybersecurity role the user is aiming for
                     (e.g. ``"SOC Analyst"``). This drives the gap analysis
                     and prompt construction.
        roadmap:     Full structured roadmap stored as JSONB.
                     Shape is enforced by the Pydantic schema at the API layer.
    """

    __tablename__ = "learning_paths"

    __table_args__ = (
        # Most common query: fetch all paths for a user ordered by date
        Index("ix_learning_paths_user_id_created_at", "user_id", "created_at"),
        # Also query by resume to associate a path with its source document
        Index("ix_learning_paths_resume_id", "resume_id"),
    )

    # ── Primary Key ────────────────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        doc="Unique learning path identifier (UUID v4).",
    )

    # ── Foreign Keys ───────────────────────────────────────────────────────
    user_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        doc="The user who owns this learning path.",
    )

    resume_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("resumes.id", ondelete="CASCADE"),
        nullable=False,
        doc="The resume this learning path was generated from.",
    )

    # ── Roadmap Data ───────────────────────────────────────────────────────
    target_role: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        doc="The cybersecurity role the roadmap is tailored for.",
    )

    roadmap: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        doc=(
            "Full AI-generated roadmap. Structure is validated at the API layer. "
            "Typically includes: phases, milestones, resources, estimated durations."
        ),
    )

    # ── Relationships ──────────────────────────────────────────────────────
    user: Mapped["User"] = relationship(
        "User",
        back_populates="learning_paths",
        doc="The user who owns this learning path.",
    )

    resume: Mapped["Resume"] = relationship(
        "Resume",
        back_populates="learning_paths",
        doc="The resume that was analysed to produce this path.",
    )

    def __repr__(self) -> str:
        return (
            f"<LearningPath id={self.id} user_id={self.user_id} "
            f"role={self.target_role!r} resume_id={self.resume_id}>"
        )
