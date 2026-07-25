"""
Resume ORM model and status enumeration.

Table: ``resumes``

A resume belongs to one user and owns many extracted skills and learning paths.
The ``status`` column tracks the asynchronous parsing pipeline state.
"""

import enum
import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.skill import ExtractedSkill
    from app.models.learning_path import LearningPath


class ResumeStatus(str, enum.Enum):
    """Processing pipeline states for an uploaded resume.

    Inheriting from ``str`` makes values JSON-serialisable and compatible
    with Pydantic response schemas without additional coercion.

    States:
        PENDING:    File uploaded; parsing has not started.
        PROCESSING: NLP extraction pipeline is running.
        COMPLETED:  Skills extracted successfully.
        FAILED:     An error occurred during parsing or extraction.
    """

    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Resume(TimestampMixin, Base):
    """Uploaded resume document.

    Stores both the file reference and the extracted plain text.
    The raw text is populated after the parsing pipeline completes.

    Relationships:
        - ``user``:            The owning user (many-to-one).
        - ``extracted_skills``: Skills parsed from this resume (1-to-many).
        - ``learning_paths``:   Paths generated from this resume (1-to-many).
    """

    __tablename__ = "resumes"

    __table_args__ = (
        # Composite index to speed up queries filtering by user + status
        Index("ix_resumes_user_id_status", "user_id", "status"),
    )

    # ── Primary Key ────────────────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        doc="Unique resume identifier (UUID v4).",
    )

    # ── Foreign Key ────────────────────────────────────────────────────────
    user_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="The user who uploaded this resume.",
    )

    # ── File Metadata ──────────────────────────────────────────────────────
    original_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        doc="Original filename as provided by the user (for display only).",
    )

    file_path: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        doc="Absolute path to the stored file on disk.",
    )

    # ── Extracted Content ──────────────────────────────────────────────────
    raw_text: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        doc="Plain text extracted from the resume. Null until parsing completes.",
    )

    # ── Pipeline Status ────────────────────────────────────────────────────
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default=ResumeStatus.PENDING.value,
        server_default=ResumeStatus.PENDING.value,
        doc="Current state of the parsing pipeline.",
    )

    # ── Relationships ──────────────────────────────────────────────────────
    user: Mapped["User"] = relationship(
        "User",
        back_populates="resumes",
        doc="The user who owns this resume.",
    )

    extracted_skills: Mapped[list["ExtractedSkill"]] = relationship(
        "ExtractedSkill",
        back_populates="resume",
        cascade="all, delete-orphan",
        lazy="selectin",
        doc="Skills extracted from this resume by the NLP pipeline.",
    )

    learning_paths: Mapped[list["LearningPath"]] = relationship(
        "LearningPath",
        back_populates="resume",
        cascade="all, delete-orphan",
        lazy="selectin",
        doc="Learning paths generated using this resume.",
    )

    def __repr__(self) -> str:
        return (
            f"<Resume id={self.id} user_id={self.user_id} "
            f"status={self.status!r} file={self.original_filename!r}>"
        )
