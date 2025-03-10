"""
API schema models module.
This file defines Pydantic models used for data validation, serialization,
and documentation in the API endpoints. These schemas define the structure
of request and response data for the News AI application.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class Token(BaseModel):
    """
    Token schema used for authentication responses.
    """

    access_token: str
    token_type: str


class TokenData(BaseModel):
    """
    Token payload schema used for JWT content.
    """

    username: str | None = None


class UserBase(BaseModel):
    """
    Base User schema with common attributes.
    Used as a basis for other user-related schemas.
    """

    username: str
    email: Optional[str] = None
    name: Optional[str] = None


class UserCreate(UserBase):
    """
    Schema for creating new users, extends UserBase to include password.
    Used for user registration endpoints.
    """

    password: str


class User(UserBase):
    """
    Complete User schema for responses, extends UserBase with database fields.
    Used when returning user information from API endpoints.
    """

    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Allows model to be created from ORM objects


class UserUpdate(BaseModel):
    """
    Schema for updating user information.
    All fields are optional since updates may be partial.
    """

    username: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None


class CategoryBase(BaseModel):
    """
    Base Category schema with common attributes.
    """

    name: str
    icon: Optional[str] = None
    color: Optional[str] = None
    article_count: int = 0


class Category(CategoryBase):
    """
    Complete Category schema for responses.
    """

    id: int

    class Config:
        from_attributes = True


class SourceBase(BaseModel):
    """
    Base Source schema with common attributes.
    Used for creating and updating news sources.
    """

    name: str
    url: str
    subscription_required: bool = False
    logo_url: Optional[str] = None


class Source(SourceBase):
    """
    Complete Source schema for responses.
    """

    id: int

    class Config:
        from_attributes = True


class ArticleBase(BaseModel):
    """
    Base Article schema with common attributes.
    Used for creating and updating articles.
    """

    title: str
    url: str
    published_at: datetime
    image_url: Optional[str] = None
    summary: Optional[str] = None


class Article(ArticleBase):
    """
    Standard Article schema for responses.
    Includes database IDs for related entities.
    """

    id: int
    category_id: int
    source_id: int

    class Config:
        from_attributes = True


class ArticleDetail(Article):
    """
    Detailed Article schema that includes related entities.
    Used for endpoints that need complete article information.
    """

    category: Category
    source: Source

    class Config:
        from_attributes = True


class UserPreferenceBase(BaseModel):
    """
    Base UserPreference schema for creating and updating user preferences.
    Defines a user's interest level in a specific news category.
    """

    category_id: int
    score: int = 0  # Interest level score
    blacklisted: bool = False  # Whether to exclude this category


class UserPreference(UserPreferenceBase):
    """
    Complete UserPreference schema for responses.
    """

    id: int
    user_id: int
    category: Optional[Category] = None

    class Config:
        from_attributes = True


class UserPreferenceCreate(UserPreferenceBase):
    """
    Schema for creating a new user preference.
    """

    pass


class UserPreferenceUpdate(BaseModel):
    """
    Schema for updating an existing user preference.
    All fields are optional since updates may be partial.
    """

    score: Optional[int] = None
    blacklisted: Optional[bool] = None


class UserSourceBlacklistBase(BaseModel):
    """
    Base schema for user source blacklist operations.
    """

    source_id: int


class UserSourceBlacklistCreate(UserSourceBlacklistBase):
    """
    Schema for adding a source to a user's blacklist.
    """

    pass


class UserSourceBlacklist(UserSourceBlacklistBase):
    """
    Complete schema for user source blacklist responses.
    """

    id: int
    user_id: int
    source: Optional[Source] = None

    class Config:
        from_attributes = True


class UserArticleBlacklistBase(BaseModel):
    """
    Base schema for user article blacklist operations.
    """

    article_id: int


class UserArticleBlacklistCreate(UserArticleBlacklistBase):
    """
    Schema for adding an article to a user's blacklist.
    """

    pass


class UserArticleBlacklist(UserArticleBlacklistBase):
    """
    Complete schema for user article blacklist responses.
    """

    id: int
    user_id: int
    article: Optional[Article] = None

    class Config:
        from_attributes = True
