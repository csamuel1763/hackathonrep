"""
SQLAlchemy ORM declarative base.

All ORM model classes must inherit from Base.
This module imports nothing from the rest of the application,
so it can be safely imported by both models and the connection module
without creating circular dependencies.

Usage::

    from app.database.base import Base

    class User(Base):
        __tablename__ = "users"
        ...
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Shared declarative base for all SQLAlchemy ORM models."""
