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
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, nullable=False)
    email = Column(String(255), unique=True)
    password_hash = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # Relationships
    preferences = relationship("UserPreference", back_populates="user")
    blacklisted_sources = relationship("UserSourceBlacklist", back_populates="user")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)

    # Relationships
    articles = relationship("Article", back_populates="category")
    user_preferences = relationship("UserPreference", back_populates="category")


class Source(Base):
    __tablename__ = "sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)
    url = Column(Text, nullable=False)
    subscription_required = Column(Boolean, default=False)
    logo_url = Column(Text, nullable=True)

    # Relationships
    articles = relationship("Article", back_populates="source")
    blacklisted_by = relationship("UserSourceBlacklist", back_populates="source")


class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    category_id = Column(
        Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False
    )
    score = Column(Integer, default=0)
    blacklisted = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", back_populates="preferences")
    category = relationship("Category", back_populates="user_preferences")


class UserSourceBlacklist(Base):
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
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(Text, nullable=False)
    category_id = Column(
        Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False
    )
    source_id = Column(
        Integer, ForeignKey("sources.id", ondelete="CASCADE"), nullable=False
    )
    url = Column(Text, nullable=False)
    published_at = Column(TIMESTAMP, nullable=False)
    image_url = Column(Text, nullable=True)

    # Relationships
    category = relationship("Category", back_populates="articles")
    source = relationship("Source", back_populates="articles")
