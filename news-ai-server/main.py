"""
Main FastAPI application module.
This file defines the API endpoints, authentication logic, and application 
setup for the News AI backend server. It provides RESTful endpoints for
accessing news articles, categories, sources, and user preferences.
"""

from datetime import datetime, timedelta, timezone
from typing import Annotated, List
import jwt
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from .database.database import get_db, engine, Base
from .database.seed import seed_all
from . import models, schemas

# Security configuration
SECRET_KEY = "4735ea57b2de730edcbb12a0e707f4cd9424378d2563611404e29b6a1c6b160e"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing and OAuth2 configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Initialize FastAPI application
app = FastAPI(title="News AI API")

# Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Create database tables on startup if they don't exist
Base.metadata.create_all(bind=engine)


# Database initialization on application startup
@app.on_event("startup")
def startup_db_client():
    """
    Initialize the database with seed data on application startup.
    This ensures the database has categories, sources, and sample articles.
    """
    seed_all()


# Authentication helper functions
def verify_password(plain_password, hashed_password):
    """
    Verify a password against its hash using bcrypt.

    Args:
        plain_password: The plain text password to verify
        hashed_password: The hashed password to compare against

    Returns:
        bool: True if password is correct, False otherwise
    """
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        print(f"Password verification error: {e}")
        return False


def get_password_hash(password):
    """
    Hash a password using bcrypt.

    Args:
        password: The plain text password to hash

    Returns:
        str: The hashed password
    """
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """
    Create a JWT access token.

    Args:
        data: The data to encode in the token
        expires_delta: Optional expiration time delta

    Returns:
        str: The encoded JWT token
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# User authentication functions
def get_user_by_username(db: Session, username: str):
    """
    Retrieve a user from the database by username.

    Args:
        db: Database session
        username: The username to look up

    Returns:
        User: The user record if found, None otherwise
    """
    return db.query(models.User).filter(models.User.username == username).first()


def authenticate_user(db: Session, username: str, password: str):
    """
    Authenticate a user with username and password.

    Args:
        db: Database session
        username: The username to authenticate
        password: The password to verify

    Returns:
        User: The authenticated user if successful, False otherwise
    """
    user = get_user_by_username(db, username)
    if not user:
        print(f"User not found: {username}")
        return False

    # Try to verify password
    valid = verify_password(password, user.password_hash)
    if not valid:
        print(f"Invalid password for user: {username}")

    return user if valid else False


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)
):
    """
    Get the current authenticated user from a JWT token.
    Used as a dependency for protected endpoints.

    Args:
        token: The JWT token from the request
        db: Database session

    Returns:
        User: The authenticated user

    Raises:
        HTTPException: If token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decode the JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except jwt.PyJWTError:  # Catch all JWT exceptions
        raise credentials_exception

    # Get the user from database
    user = get_user_by_username(db, username=token_data.username)
    if user is None:
        raise credentials_exception

    return user


# API Routes
@app.get("/", tags=["Root"])
def read_root():
    """
    Root endpoint to check API status.

    Returns:
        dict: Simple message confirming API is running
    """
    return {"message": "News AI API"}


@app.post("/register", response_model=schemas.User, tags=["Authentication"])
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.

    Args:
        user: User creation data
        db: Database session

    Returns:
        User: The created user

    Raises:
        HTTPException: If username already exists
    """
    db_user = get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.post("/token", response_model=schemas.Token, tags=["Authentication"])
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db),
):
    """
    Obtain a JWT access token for authentication.

    Args:
        form_data: Username and password form data
        db: Database session

    Returns:
        dict: The access token and token type

    Raises:
        HTTPException: If authentication fails
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/users/me", response_model=schemas.User, tags=["Users"])
async def read_users_me(
    current_user: Annotated[models.User, Depends(get_current_user)],
):
    """
    Get the current authenticated user's information.

    Args:
        current_user: Current authenticated user (from token)

    Returns:
        User: Current user information
    """
    return current_user


@app.get("/categories", response_model=List[schemas.Category], tags=["Categories"])
def get_categories(db: Session = Depends(get_db)):
    """
    Get all available news categories.

    Args:
        db: Database session

    Returns:
        List[Category]: List of all categories
    """
    categories = db.query(models.Category).all()
    return categories


@app.get("/sources", response_model=List[schemas.Source], tags=["Sources"])
def get_sources(db: Session = Depends(get_db)):
    """
    Get all available news sources.

    Args:
        db: Database session

    Returns:
        List[Source]: List of all sources
    """
    sources = db.query(models.Source).all()
    return sources


@app.get("/articles", response_model=List[schemas.ArticleDetail], tags=["Articles"])
def get_articles(
    skip: int = 0,
    limit: int = 10,
    category_id: int = None,
    db: Session = Depends(get_db),
):
    """
    Get news articles with optional filtering by category.

    Args:
        skip: Number of articles to skip (pagination)
        limit: Maximum number of articles to return
        category_id: Optional category ID to filter by
        db: Database session

    Returns:
        List[ArticleDetail]: List of articles with detailed information
    """
    query = db.query(models.Article)
    if category_id:
        query = query.filter(models.Article.category_id == category_id)

    articles = (
        query.order_by(models.Article.published_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return articles


@app.get(
    "/articles/{article_id}", response_model=schemas.ArticleDetail, tags=["Articles"]
)
def get_article(article_id: int, db: Session = Depends(get_db)):
    """
    Get a specific article by ID.

    Args:
        article_id: ID of the article to retrieve
        db: Database session

    Returns:
        ArticleDetail: Detailed article information

    Raises:
        HTTPException: If article not found
    """
    article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if article is None:
        raise HTTPException(status_code=404, detail="Article not found")
    return article


@app.get(
    "/users/{user_id}/preferences",
    response_model=List[schemas.UserPreference],
    tags=["Users"],
)
def get_user_preferences(
    user_id: int,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Get preferences for a specific user.
    Authenticated users can only access their own preferences.

    Args:
        user_id: ID of the user to get preferences for
        current_user: Current authenticated user (from token)
        db: Database session

    Returns:
        List[UserPreference]: User's preferences

    Raises:
        HTTPException: If not authorized to access these preferences
    """
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to access these preferences"
        )

    preferences = (
        db.query(models.UserPreference)
        .filter(models.UserPreference.user_id == user_id)
        .all()
    )
    return preferences
