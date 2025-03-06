"""
Database models module.
This file defines all SQLAlchemy ORM models representing database tables.
It establishes the data structure for the News AI application, including users,
articles, categories, sources, and their relationships.
"""

from sqlalchemy import (
    Boolean,
    Column,
    ForeignKey,
    Integer,
    String,
    Text,
    TIMESTAMP,
    func,
)
from sqlalchemy.orm import relationship
from .database.database import Base


class User(Base):
    """
    User model representing application users.

    This model stores user authentication information and serves as
    the central entity for user-specific preferences and settings.
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, nullable=False)
    email = Column(String(255), unique=True)
    password_hash = Column(Text, nullable=False)  # Stores hashed password only
    name = Column(String(255), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())  # Auto-set on creation
    updated_at = Column(
        TIMESTAMP, server_default=func.now(), onupdate=func.now()
    )  # Auto-updated

    # Relationships
    preferences = relationship("UserPreference", back_populates="user")
    blacklisted_sources = relationship("UserSourceBlacklist", back_populates="user")


class Category(Base):
    """
    Category model representing article categories/topics.

    Categories help organize articles and allow users to set preferences
    for the types of news they're interested in.
    """

    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)
    icon = Column(String(10), nullable=True)  # Emoji icon for the category
    color = Column(String(50), nullable=True)  # Color theme for the category UI
    article_count = Column(Integer, default=0)  # Count of articles in this category

    # Relationships
    articles = relationship("Article", back_populates="category")
    user_preferences = relationship("UserPreference", back_populates="category")


class Source(Base):
    """
    Source model representing news publishers/sources.

    Sources store information about news publishers including their
    name, URL, and whether they require a subscription.
    """

    __tablename__ = "sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)
    url = Column(Text, nullable=False)  # Base URL of the news source
    subscription_required = Column(
        Boolean, default=False
    )  # Whether the source requires paid subscription
    logo_url = Column(Text, nullable=True)  # URL to the source's logo image

    # Relationships
    articles = relationship("Article", back_populates="source")
    blacklisted_by = relationship("UserSourceBlacklist", back_populates="source")


class UserPreference(Base):
    """
    UserPreference model representing a user's interest in specific categories.

    This association table connects users to categories with a score
    indicating level of interest and a blacklist option.
    """

    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    category_id = Column(
        Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False
    )
    score = Column(Integer, default=0)  # User's interest score for this category
    blacklisted = Column(
        Boolean, default=False
    )  # Whether user wants to exclude this category

    # Relationships
    user = relationship("User", back_populates="preferences")
    category = relationship("Category", back_populates="user_preferences")


class UserSourceBlacklist(Base):
    """
    UserSourceBlacklist model representing sources a user has chosen to ignore.

    This association table connects users to sources they don't want
    to see content from in their recommendations.
    """

    __tablename__ = "user_source_blacklist"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    source_id = Column(
        Integer, ForeignKey("sources.id", ondelete="CASCADE"), nullable=False
    )

    # Relationships
    user = relationship("User", back_populates="blacklisted_sources")
    source = relationship("Source", back_populates="blacklisted_by")


class Article(Base):
    """
    Article model representing news articles.

    This stores article metadata including title, source, category,
    and publishing information. The actual content is accessed via the URL.
    """

    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(Text, nullable=False)
    category_id = Column(
        Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False
    )
    source_id = Column(
        Integer, ForeignKey("sources.id", ondelete="CASCADE"), nullable=False
    )
    url = Column(Text, nullable=False)  # Link to the full article
    published_at = Column(TIMESTAMP, nullable=False)  # When the article was published
    image_url = Column(Text, nullable=True)  # Optional featured image URL
    summary = Column(Text, nullable=True)  # Summary of the article content

    # Relationships
    category = relationship("Category", back_populates="articles")
    source = relationship("Source", back_populates="articles")
