"""
User ORM model.

Table: ``users``

One user owns many resumes and many learning paths.
Passwords are never stored in plain text; only the bcrypt hash lives here.
"""

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    # Avoid circular imports at runtime; used only for type-checker annotations.
    from app.models.resume import Resume
    from app.models.learning_path import LearningPath


class User(TimestampMixin, Base):
    """Registered platform user.

    Relationships:
        - ``resumes``:       All resumes uploaded by this user (1-to-many).
        - ``learning_paths``: All learning paths generated for this user (1-to-many).
    """

    __tablename__ = "users"

    # ── Primary Key ────────────────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        doc="Unique user identifier (UUID v4).",
    )

    # ── Credentials ────────────────────────────────────────────────────────
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
        doc="User's email address. Must be unique across the platform.",
    )

    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        doc="bcrypt hash of the user's password. Never store plain text.",
    )

    # ── Profile ────────────────────────────────────────────────────────────
    full_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        doc="User's display name.",
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default="true",
        nullable=False,
        doc="Soft-disable flag. Inactive users cannot authenticate.",
    )

    # ── Relationships ──────────────────────────────────────────────────────
    resumes: Mapped[list["Resume"]] = relationship(
        "Resume",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
        doc="All resumes belonging to this user.",
    )

    learning_paths: Mapped[list["LearningPath"]] = relationship(
        "LearningPath",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
        doc="All learning paths generated for this user.",
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r} active={self.is_active}>"
