"""
SQLAlchemy ORM model registry.

Importing this package registers all mapped classes with ``Base.metadata``.

This file must be imported by Alembic's ``env.py`` *before* calling
``Base.metadata`` so that every table is discovered during migration
auto-generation::

    # In alembic/env.py:
    import app.models  # noqa: F401 — registers all models
    from app.database.base import Base
    target_metadata = Base.metadata

Public re-exports allow callers to do::

    from app.models import User, Resume, ExtractedSkill, LearningPath
"""

from app.models.user import User
from app.models.resume import Resume, ResumeStatus
from app.models.skill import ExtractedSkill
from app.models.learning_path import LearningPath

__all__: list[str] = [
    "User",
    "Resume",
    "ResumeStatus",
    "ExtractedSkill",
    "LearningPath",
]
