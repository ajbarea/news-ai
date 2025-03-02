from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


class UserBase(BaseModel):
    username: str
    email: Optional[str] = None


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CategoryBase(BaseModel):
    name: str


class Category(CategoryBase):
    id: int

    class Config:
        from_attributes = True


class SourceBase(BaseModel):
    name: str
    url: str
    subscription_required: bool = False
    logo_url: Optional[str] = None


class Source(SourceBase):
    id: int

    class Config:
        from_attributes = True


class ArticleBase(BaseModel):
    title: str
    url: str
    published_at: datetime
    image_url: Optional[str] = None


class Article(ArticleBase):
    id: int
    category_id: int
    source_id: int

    class Config:
        from_attributes = True


class ArticleDetail(Article):
    category: Category
    source: Source

    class Config:
        from_attributes = True


class UserPreferenceBase(BaseModel):
    category_id: int
    score: int = 0
    blacklisted: bool = False


class UserPreference(UserPreferenceBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
