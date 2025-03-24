"""
API schema models module.

Defines Pydantic models for request/response validation, serialization,
and OpenAPI documentation. These schemas establish the contract between
the API and clients, ensuring data consistency and type safety.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class Token(BaseModel):
    """
    JWT authentication token response schema.

    Returned when a user successfully authenticates,
    containing the token for subsequent authenticated requests.
    """

    access_token: str
    token_type: str


class TokenData(BaseModel):
    """
    JWT token payload schema.

    Represents the decoded content of the JWT,
    used for internal authentication processing.
    """

    username: str | None = None


class UserBase(BaseModel):
    """
    User base schema with common non-sensitive attributes.

    Contains fields shared across various user-related schemas,
    excluding security-sensitive data like passwords.
    """

    username: str
    email: Optional[str] = None
    name: Optional[str] = None


class UserCreate(UserBase):
    """
    User registration schema with password field.

    Extends UserBase for user creation endpoints,
    including the password which is never returned in responses.
    """

    password: str


class User(UserBase):
    """
    Complete User schema for responses.

    Contains all user data returned by API endpoints,
    but excludes security-sensitive fields like password_hash.
    """

    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Enables ORM model -> schema conversion


class UserUpdate(BaseModel):
    """
    User profile update schema.

    All fields are optional to support partial updates
    without requiring all user information to be resent.
    """

    username: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None


class CategoryBase(BaseModel):
    """
    Category base schema with common attributes.

    Contains fields that define a content category
    including display properties for UI consistency.
    """

    name: str
    icon: Optional[str] = None  # Emoji or icon identifier
    color: Optional[str] = None  # UI color theme identifier
    article_count: int = 0  # Cache of article count


class Category(CategoryBase):
    """
    Complete Category schema for responses.

    Extends base schema with database identifier.
    """

    id: int

    class Config:
        from_attributes = True


class SourceBase(BaseModel):
    """
    News source base schema.

    Defines the properties of a content provider,
    including subscription status and branding.
    """

    name: str
    url: str
    subscription_required: bool = False  # Whether content requires paid access
    logo_url: Optional[str] = None  # Publisher logo for UI display


class Source(SourceBase):
    """
    Complete news source schema for responses.

    Extends base schema with database identifier.
    """

    id: int

    class Config:
        from_attributes = True


class ArticleBase(BaseModel):
    """
    Article base schema with common content attributes.

    Contains the core fields that define a news article,
    independent of category or source relationships.
    """

    title: str
    url: str  # Link to full content
    published_at: datetime
    image_url: Optional[str] = None  # Featured image
    summary: Optional[str] = None  # Article excerpt or summary


class Article(ArticleBase):
    """
    Standard Article schema with relationship identifiers.

    Extends base schema with database ID and foreign keys
    for category and source relationships.
    """

    id: int
    category_id: int
    source_id: int

    class Config:
        from_attributes = True


class ArticleDetail(Article):
    """
    Expanded Article schema with nested relationship data.

    Used for detailed article views that need complete
    information about related categories and sources.
    """

    category: Category
    source: Source
    has_audio: bool = False  # Keep as a regular field, not a property


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


class UserFavoriteArticleBase(BaseModel):
    """
    Base schema for user favorite article operations.
    """

    article_id: int


class UserFavoriteArticleCreate(UserFavoriteArticleBase):
    """
    Schema for adding an article to favorites.
    """

    pass


class UserFavoriteArticle(UserFavoriteArticleBase):
    """
    Complete schema for user favorite article responses.
    """

    id: int
    user_id: int
    favorited_at: datetime
    article: Optional[Article] = None

    class Config:
        from_attributes = True
        
class ArticleAudioBase(BaseModel):
    language: str = "en"
    format: str = "mp3"


class ArticleAudioCreate(ArticleAudioBase):
    article_id: int


class ArticleAudio(ArticleAudioBase):
    id: int
    article_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
