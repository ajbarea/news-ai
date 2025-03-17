"""
Database models module.

Defines the data schema and relationships using SQLAlchemy 2.0 ORM style.
These models utilize type annotations with Mapped[] and mapped_column()
following SQLAlchemy 2.0 patterns, which provide better type checking
and IDE integration.

These models represent the core domain entities of the application
and their relationships, forming the foundation of the data layer.
"""

from typing import List, Optional
from sqlalchemy import (
    Boolean,
    Integer,
    String,
    Text,
    TIMESTAMP,
    ForeignKey,
    func,
    event,
    select,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database.database import Base
from .utils.logging_config import get_logger
from datetime import datetime

# Set up logging
logger = get_logger(__name__)


class User(Base):
    """
    User model representing application accounts.

    Central entity for authentication and personalization features,
    linked to preferences, blacklists, and favorites through
    one-to-many relationships with deletion cascades.
    """

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255))
    password_hash: Mapped[str] = mapped_column(
        Text, nullable=False
    )  # Never store plain passwords
    name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP, server_default=func.now(), onupdate=func.now()
    )

    # Relationships with cascading deletes to maintain referential integrity
    preferences: Mapped[List["UserPreference"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    blacklisted_sources: Mapped[List["UserSourceBlacklist"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    blacklisted_articles: Mapped[List["UserArticleBlacklist"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    favorite_articles: Mapped[List["UserFavoriteArticle"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class Category(Base):
    """
    Category model for content classification.

    Provides a taxonomy for organizing articles and enabling
    user preference tracking. The article_count field is
    automatically updated by event listeners when articles change.
    """

    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    icon: Mapped[Optional[str]] = mapped_column(
        String(10), nullable=True
    )  # Emoji or icon identifier
    color: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True
    )  # UI theme color
    article_count: Mapped[int] = mapped_column(
        Integer, default=0
    )  # Denormalized count for performance

    # Relationships
    articles: Mapped[List["Article"]] = relationship(back_populates="category")
    user_preferences: Mapped[List["UserPreference"]] = relationship(
        back_populates="category"
    )


class Source(Base):
    """
    Source model representing news publishers/sources.

    Sources store information about news publishers including their
    name, URL, and whether they require a subscription.
    """

    __tablename__ = "sources"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    url: Mapped[str] = mapped_column(
        Text, nullable=False
    )  # Base URL of the news source
    subscription_required: Mapped[bool] = mapped_column(
        Boolean, default=False
    )  # Whether the source requires paid subscription
    logo_url: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True
    )  # URL to the source's logo image

    # Relationships
    articles: Mapped[List["Article"]] = relationship(back_populates="source")
    blacklisted_by: Mapped[List["UserSourceBlacklist"]] = relationship(
        back_populates="source"
    )


class UserPreference(Base):
    """
    UserPreference model representing a user's interest in specific categories.

    This association table connects users to categories with a score
    indicating level of interest and a blacklist option.
    """

    __tablename__ = "user_preferences"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    category_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False
    )
    score: Mapped[int] = mapped_column(
        Integer, default=0
    )  # User's interest score for this category
    blacklisted: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="preferences")
    category: Mapped["Category"] = relationship(
        "Category", back_populates="user_preferences"
    )


class UserSourceBlacklist(Base):
    """
    UserSourceBlacklist model representing sources a user has chosen to ignore.

    This association table connects users to sources they don't want
    to see content from in their recommendations.
    """

    __tablename__ = "user_source_blacklist"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    source_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("sources.id", ondelete="CASCADE"), nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="blacklisted_sources")
    source: Mapped["Source"] = relationship("Source", back_populates="blacklisted_by")


class Article(Base):
    """
    Article model representing news articles.

    This stores article metadata including title, source, category,
    and publishing information. The actual content is accessed via the URL.
    """

    __tablename__ = "articles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    category_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False
    )
    source_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("sources.id", ondelete="CASCADE"), nullable=False
    )
    url: Mapped[str] = mapped_column(Text, nullable=False)  # Link to the full article
    published_at: Mapped[datetime] = mapped_column(
        TIMESTAMP, nullable=False
    )  # When the article was published
    image_url: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True
    )  # Optional featured image URL
    summary: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True
    )  # Summary of the article content

    # Relationships
    category: Mapped["Category"] = relationship("Category", back_populates="articles")
    source: Mapped["Source"] = relationship("Source", back_populates="articles")
    blacklisted_by: Mapped[List["UserArticleBlacklist"]] = relationship(
        back_populates="article"
    )
    favorited_by: Mapped[List["UserFavoriteArticle"]] = relationship(
        back_populates="article"
    )


class UserArticleBlacklist(Base):
    """
    UserArticleBlacklist model representing articles a user has chosen to hide.

    This association table connects users to articles they don't want
    to see in their feed.
    """

    __tablename__ = "user_article_blacklist"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    article_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("articles.id", ondelete="CASCADE"), nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="blacklisted_articles")
    article: Mapped["Article"] = relationship(
        "Article", back_populates="blacklisted_by"
    )


class UserFavoriteArticle(Base):
    """
    UserFavoriteArticle model representing articles a user has saved as favorites.

    This association table connects users to articles they want to save for later reference.
    """

    __tablename__ = "user_favorite_articles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    article_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("articles.id", ondelete="CASCADE"), nullable=False
    )
    favorited_at: Mapped[datetime] = mapped_column(
        TIMESTAMP, server_default=func.now()
    )  # When the article was favorited

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="favorite_articles")
    article: Mapped["Article"] = relationship("Article", back_populates="favorited_by")


# Event listeners to maintain data integrity and denormalized fields


@event.listens_for(Article, "after_insert")
def increment_category_article_count(mapper, connection, target):
    """
    Maintain accurate article counts in categories.

    Updates the denormalized article_count when articles are created,
    avoiding expensive COUNT queries during read operations.

    Args:
        mapper: The mapper which is the target of this event
        connection: The Connection being used
        target: The instance being inserted
    """
    logger.debug(f"Incrementing article count for category ID: {target.category_id}")
    connection.execute(
        Category.__table__.update()
        .where(Category.id == target.category_id)
        .values(article_count=Category.article_count + 1)
    )


@event.listens_for(Article, "after_delete")
def decrement_category_article_count(mapper, connection, target):
    """
    Maintain accurate article counts in categories.

    Decrements the denormalized article_count when articles are deleted,
    preventing negative counts with a database-agnostic approach.

    Args:
        mapper: The mapper which is the target of this event
        connection: The Connection being used
        target: The instance being deleted
    """
    logger.debug(f"Decrementing article count for category ID: {target.category_id}")

    # First get current count to avoid going negative
    result = connection.execute(
        select([Category.article_count]).where(Category.id == target.category_id)
    ).scalar()

    # Only decrement if greater than zero
    new_count = max(0, (result or 0) - 1)

    # Update with safe value
    connection.execute(
        Category.__table__.update()
        .where(Category.id == target.category_id)
        .values(article_count=new_count)
    )


@event.listens_for(User, "after_insert")
def create_user_preferences(mapper, connection, target):
    """
    Automatically initialize user preferences.

    Creates default preference entries for all categories when a new user
    is created. This ensures consistent behavior in the recommendation
    system by guaranteeing that all users have complete preference records.

    Args:
        mapper: The mapper which is the target of this event
        connection: The Connection being used
        target: The User instance being inserted
    """
    logger.debug(f"Creating default preferences for new user ID: {target.id}")
    # Get all category IDs
    categories = connection.execute(Category.__table__.select()).fetchall()

    # Create a preference entry for each category with default score of 0
    for category in categories:
        connection.execute(
            UserPreference.__table__.insert().values(
                user_id=target.id, category_id=category.id, score=0, blacklisted=False
            )
        )
    logger.debug(
        f"Created {len(categories)} default preferences for user ID: {target.id}"
    )
