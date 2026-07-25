"""
Shared SQLAlchemy model mixins.

Mixins are plain Python classes (not inheriting from Base).
SQLAlchemy 2.x copies column definitions from a mixin into each
subclass that uses it, so every model gets its own physical columns.

Usage::

    class User(TimestampMixin, Base):
        __tablename__ = "users"
        ...
"""

from datetime import datetime

from sqlalchemy import DateTime, func
from sqlalchemy.orm import Mapped, mapped_column


class TimestampMixin:
    """Adds ``created_at`` and ``updated_at`` audit columns to a model.

    Both columns are timezone-aware and set automatically by the database
    server on insert. ``updated_at`` is refreshed on every UPDATE via
    ``onupdate``.

    Note:
        ``server_default`` executes on the DB side (reliable even for
        bulk inserts that bypass the ORM). ``onupdate`` is ORM-side and
        fires on ``session.flush()`` for individual row updates.
    """

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
