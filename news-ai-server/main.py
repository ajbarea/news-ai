"""
Main FastAPI application module.
This file defines the API endpoints, authentication logic, and application
setup for the News AI backend server. It provides RESTful endpoints for
accessing news articles, categories, sources, and user preferences.
"""

from .utils import patches  # noqa: F401
from datetime import datetime, timedelta, timezone
from typing import Annotated, List, Optional
import jwt
from fastapi import Depends, FastAPI, HTTPException, status, Query
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from sqlalchemy.orm import Session, joinedload
from .database.database import get_db, engine, Base
from .database.seed import seed_all, teardown
from . import models, schemas
from contextlib import asynccontextmanager
from .utils.logging_config import setup_logging, get_logger
from .utils.log_helpers import log_create, log_update, log_delete, log_read
from .middleware.request_logging import RequestLoggingMiddleware
from sqlalchemy import select
from fastapi.responses import StreamingResponse
from io import BytesIO
from services.tts_service import TTSService

# Set up logging using the centralized configuration
setup_logging()
logger = get_logger(__name__)

# Security configuration
SECRET_KEY = "4735ea57b2de730edcbb12a0e707f4cd9424378d2563611404e29b6a1c6b160e"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 90

# Password hashing and OAuth2 configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
# Add optional OAuth2 scheme that doesn't raise an error if token is missing
optional_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)


# Define lifespan context manager for application startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager to handle application startup and shutdown.
    This replaces the deprecated on_event handlers.
    """
    # Startup: Initialize the database with seed data
    logger.info("Application startup: Initializing database")
    teardown()
    seed_all()
    yield
    logger.info("Application shutdown")


# Initialize FastAPI application with lifespan
app = FastAPI(
    title="News AI API",
    description="API for accessing personalized news articles and user preferences",
    version="1.0.0",
    lifespan=lifespan,
)

# Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Add request logging middleware for correlation IDs and performance tracking
app.add_middleware(RequestLoggingMiddleware)

# Create database tables on startup if they don't exist
Base.metadata.create_all(bind=engine)


# Authentication helper functions
def verify_password(plain_password, hashed_password):
    """
    Verify a password against its stored hash using bcrypt.

    Password verification is wrapped in exception handling to prevent
    cryptic errors when invalid hash formats are encountered.

    Args:
        plain_password: The plain text password to verify
        hashed_password: The hashed password to compare against

    Returns:
        bool: True if password is correct, False otherwise
    """
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error(
            f"Password verification failed: {type(e).__name__} - Check hash format integrity"
        )
        return False


def get_password_hash(password):
    """
    Hash a password using bcrypt with secure settings.

    Creates a cryptographically secure password hash using the
    configured work factor in CryptContext.

    Args:
        password: The plain text password to hash

    Returns:
        str: The securely hashed password
    """
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """
    Create a JWT access token with configurable expiration.

    Follows JWT best practices by including expiration time
    and using a secure signing algorithm.

    Args:
        data: The claims to encode in the token
        expires_delta: Optional custom expiration time

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

    Performs a case-sensitive username lookup for security reasons.

    Args:
        db: Database session
        username: The username to look up

    Returns:
        User: The user record if found, None otherwise
    """
    stmt = select(models.User).where(models.User.username == username)
    return db.execute(stmt).scalars().first()


def authenticate_user(db: Session, username: str, password: str):
    """
    Authenticate a user with username and password.

    Implements constant-time comparison via bcrypt to prevent timing attacks.
    Logs authentication attempts for security auditing without exposing credentials.

    Args:
        db: Database session
        username: The username to authenticate
        password: The password to verify

    Returns:
        User: The authenticated user if successful, False otherwise
    """
    user = get_user_by_username(db, username)
    if not user:
        logger.info(f"Authentication failed: User not found [username={username}]")
        return False

    # Try to verify password
    valid = verify_password(password, user.password_hash)
    if not valid:
        logger.info(f"Authentication failed: Invalid password [username={username}]")

    return user if valid else False


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)
):
    """
    Get the current authenticated user from a JWT token.

    Validates JWT tokens and extracts user identity for protected endpoints.
    Performs comprehensive error handling to provide secure authentication.

    Args:
        token: The JWT token from the request
        db: Database session

    Returns:
        User: The authenticated user

    Raises:
        HTTPException: If token is invalid, expired or user not found
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
            logger.warning("Token validation failed: Missing subject claim in token")
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except jwt.ExpiredSignatureError:
        logger.info("Token validation failed: Token has expired")
        raise credentials_exception
    except jwt.InvalidTokenError:
        logger.warning("Token validation failed: Invalid token format")
        raise credentials_exception
    except Exception as e:
        logger.error(
            f"Unexpected token validation error: {type(e).__name__} - {str(e)}"
        )
        raise credentials_exception

    # Get the user from database
    user = get_user_by_username(db, username=token_data.username)
    if user is None:
        logger.warning(
            f"Token validation failed: User not found [username={token_data.username}]"
        )
        raise credentials_exception

    return user


async def get_optional_current_user(
    token: Optional[str] = Depends(optional_oauth2_scheme),
    db: Session = Depends(get_db),
):
    """
    Get the current authenticated user from a JWT token if available.
    Returns None instead of raising an exception if token is invalid or not provided.
    Used as a dependency for endpoints that can work with or without authentication.

    Args:
        token: The JWT token from the request
        db: Database session

    Returns:
        User | None: The authenticated user or None if not authenticated
    """
    if token is None:
        return None

    try:
        # Decode the JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            return None

        # Get the user from database
        user = get_user_by_username(db, username=username)
        return user
    except jwt.PyJWTError:
        logger.debug("Optional authentication: Invalid JWT token")
        return None
    except Exception as e:
        logger.debug(f"Optional authentication error: {e}")
        return None


# API Routes
@app.get(
    "/",
    tags=["Root"],
    summary="API Status Check",
    description="Root endpoint to verify the API is running",
)
def read_root():
    """
    Root endpoint to check API status.

    Returns:
        dict: Simple message confirming API is running
    """
    return {"message": "News AI API"}


@app.post(
    "/register",
    response_model=schemas.User,
    tags=["Authentication"],
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user account with username, email, and password",
)
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
        logger.info(f"Registration failed: Username already exists - {user.username}")
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

    log_create("user", db_user.id, None, username=user.username)
    return db_user


@app.post(
    "/token",
    response_model=schemas.Token,
    tags=["Authentication"],
    summary="Authenticate user and get token",
    description="Login with username and password to obtain a JWT access token",
)
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
        logger.info(
            f"Login failed: Invalid credentials for user - {form_data.username}"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    logger.info(f"User authenticated successfully: {form_data.username}")
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
    log_read("user", current_user.id, current_user.id)
    return current_user


@app.put("/users/me", response_model=schemas.User, tags=["Users"])
async def update_user(
    user_update: schemas.UserUpdate,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Update the current user's profile information.

    Args:
        user_update: User data to update
        current_user: Current authenticated user (from token)
        db: Database session

    Returns:
        User: Updated user information

    Raises:
        HTTPException: If username or email already exists for another user
    """
    changed_fields = []

    # Check if username is being updated and already exists
    if user_update.username and user_update.username != current_user.username:
        existing_user = get_user_by_username(db, user_update.username)
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already registered")
        current_user.username = user_update.username
        changed_fields.append("username")

    # Check if email is being updated and already exists
    if user_update.email and user_update.email != current_user.email:
        existing_email = (
            db.query(models.User).filter(models.User.email == user_update.email).first()
        )
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already registered")
        current_user.email = user_update.email
        changed_fields.append("email")

    # Update name if provided
    if user_update.name is not None:
        current_user.name = user_update.name
        changed_fields.append("name")

    db.commit()
    db.refresh(current_user)

    log_update("user", current_user.id, current_user.id, changed_fields=changed_fields)
    return current_user


@app.delete("/users/me", status_code=status.HTTP_204_NO_CONTENT, tags=["Users"])
async def delete_user(
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Delete the current user's account.
    This permanently removes the user and all associated data.

    Args:
        current_user: Current authenticated user (from token)
        db: Database session

    Returns:
        None: 204 No Content response on successful deletion
    """
    user_id = current_user.id
    username = current_user.username

    # Delete the user
    db.delete(current_user)
    db.commit()

    log_delete("user", user_id, user_id, username=username)
    return None


@app.post("/users/me/change-password", response_model=schemas.User, tags=["Users"])
async def change_password(
    password_data: dict,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Change the current user's password.
    Requires current password for verification.

    Args:
        password_data: Contains current_password and new_password
        current_user: Current authenticated user (from token)
        db: Database session

    Returns:
        User: Updated user information

    Raises:
        HTTPException: If current password is incorrect
    """
    if not verify_password(
        password_data["current_password"], current_user.password_hash
    ):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    # Update password
    current_user.password_hash = get_password_hash(password_data["new_password"])
    db.commit()
    db.refresh(current_user)

    log_update("user", current_user.id, current_user.id, changed_fields=["password"])
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
    stmt = select(models.Category)
    categories = db.execute(stmt).scalars().all()

    logger.debug(f"Retrieved {len(categories)} categories")
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
    stmt = select(models.Source)
    sources = db.execute(stmt).scalars().all()

    logger.debug(f"Retrieved {len(sources)} sources")
    return sources


@app.get(
    "/articles",
    response_model=List[schemas.ArticleDetail],
    tags=["Articles"],
    summary="Get news articles",
    description="Retrieve news articles with optional filtering by category. If authenticated, respects user preferences and blacklists.",
)
def get_articles(
    skip: int = 0,
    limit: int = 50,
    category_id: int = None,
    current_user: Annotated[models.User, None] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """
    Get news articles with optional filtering by category.
    If a user is authenticated, articles from blacklisted sources, blacklisted
    categories, and individually blacklisted articles are excluded.

    Args:
        skip: Number of articles to skip (pagination)
        limit: Maximum number of articles to return
        category_id: Optional category ID to filter by
        current_user: Optional current authenticated user (from token)
        db: Database session

    Returns:
        List[ArticleDetail]: List of articles with detailed information
    """
    # Create a select statement for articles
    stmt = select(models.Article)

    # Filter by category if specified
    if category_id:
        stmt = stmt.where(models.Article.category_id == category_id)

    # Filter out blacklisted sources and articles if user is authenticated
    if current_user:
        logger.debug(
            f"User authenticated: {current_user.username} (ID: {current_user.id})"
        )

        # Get all blacklisted category IDs for this user
        blacklisted_categories_stmt = select(models.UserPreference.category_id).where(
            models.UserPreference.user_id == current_user.id,
            models.UserPreference.blacklisted.is_(True),
        )

        # Execute the query to get the actual IDs
        blacklisted_category_ids = [
            row[0] for row in db.execute(blacklisted_categories_stmt).all()
        ]

        if blacklisted_category_ids:
            logger.debug(
                f"Filtering out blacklisted categories: {blacklisted_category_ids}"
            )

            # Get the names of blacklisted categories for logging
            blacklisted_category_names = db.execute(
                select(models.Category.name).where(
                    models.Category.id.in_(blacklisted_category_ids)
                )
            ).all()

            logger.debug(
                f"Blacklisted category names: {[name[0] for name in blacklisted_category_names]}"
            )

            # Exclude articles from categories in the blacklist
            stmt = stmt.where(
                models.Article.category_id.not_in(blacklisted_category_ids)
            )
        else:
            logger.debug("No blacklisted categories found for this user")

        # Get all blacklisted source IDs for this user
        blacklisted_sources_stmt = select(models.UserSourceBlacklist.source_id).where(
            models.UserSourceBlacklist.user_id == current_user.id
        )

        # Execute the query to get the actual IDs
        blacklisted_source_ids = [
            row[0] for row in db.execute(blacklisted_sources_stmt).all()
        ]

        if blacklisted_source_ids:
            logger.debug(f"Filtering out blacklisted sources: {blacklisted_source_ids}")

            # Get the names of blacklisted sources for logging
            blacklisted_source_names = db.execute(
                select(models.Source.name).where(
                    models.Source.id.in_(blacklisted_source_ids)
                )
            ).all()

            logger.debug(
                f"Blacklisted source names: {[name[0] for name in blacklisted_source_names]}"
            )

            # Exclude articles from sources in the blacklist
            stmt = stmt.where(models.Article.source_id.not_in(blacklisted_source_ids))
        else:
            logger.debug("No blacklisted sources found for this user")

        # Get all blacklisted article IDs for this user
        blacklisted_articles_stmt = select(
            models.UserArticleBlacklist.article_id
        ).where(models.UserArticleBlacklist.user_id == current_user.id)

        # Execute the query to get the actual IDs
        blacklisted_article_ids = [
            row[0] for row in db.execute(blacklisted_articles_stmt).all()
        ]

        if blacklisted_article_ids:
            logger.debug(
                f"Filtering out blacklisted articles: {blacklisted_article_ids}"
            )

            # Exclude individually blacklisted articles
            stmt = stmt.where(models.Article.id.not_in(blacklisted_article_ids))
        else:
            logger.debug("No blacklisted articles found for this user")
    else:
        logger.debug("No authenticated user - showing all articles")

    # Apply pagination and ordering
    stmt = stmt.order_by(models.Article.published_at.desc()).offset(skip).limit(limit)

    # Execute the query
    articles = db.execute(stmt).scalars().all()

    # Log information about returned articles
    logger.debug(f"Returning {len(articles)} articles")

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
    stmt = select(models.Article).where(models.Article.id == article_id)
    article = db.execute(stmt).scalars().first()

    if article is None:
        logger.info(f"Article not found: ID={article_id}")
        raise HTTPException(status_code=404, detail="Article not found")

    logger.debug(f"Retrieved article: ID={article_id}, title={article.title}")
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
        List[UserPreference]: User's preferences with category details

    Raises:
        HTTPException: If not authorized to access these preferences
    """
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to access these preferences"
        )

    # Get preferences with eager loading of the category relationship using joinedload
    from sqlalchemy.orm import selectinload

    stmt = (
        select(models.UserPreference)
        .options(selectinload(models.UserPreference.category))
        .where(models.UserPreference.user_id == user_id)
    )

    preferences = db.execute(stmt).scalars().all()

    # Add debugging to verify preferences and their blacklisted status
    logger.debug(f"Found {len(preferences)} preferences for user {user_id}")
    blacklisted_prefs = [p for p in preferences if p.blacklisted]
    logger.debug(f"Of which {len(blacklisted_prefs)} are blacklisted")

    for pref in blacklisted_prefs:
        category_name = pref.category.name if pref.category else "Unknown"
        logger.debug(
            f"Blacklisted preference: id={pref.id}, category={category_name}, value={pref.blacklisted}"
        )

    # Return the preferences with their associated categories
    return preferences


@app.get("/search", response_model=List[schemas.ArticleDetail], tags=["Articles"])
def search_articles(
    query: str,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    """
    Search for articles across multiple fields including title, summary,
    source name, and category name.

    This endpoint searches for the provided query string in article titles,
    summaries, and other relevant text fields, as well as related entities.

    Args:
        query: The search term to look for
        limit: Maximum number of articles to return
        db: Database session

    Returns:
        List[ArticleDetail]: List of articles that match the search query

    Raises:
        HTTPException: If search query is too short
    """
    if not query or len(query.strip()) < 2:
        raise HTTPException(
            status_code=400, detail="Search query must be at least 2 characters"
        )

    # Convert query to lowercase for case-insensitive search
    search_term = f"%{query.lower()}%"

    # Search across multiple text columns with explicit joins
    articles = (
        db.query(models.Article)
        .join(models.Source, models.Article.source_id == models.Source.id)
        .join(models.Category, models.Article.category_id == models.Category.id)
        .filter(
            # Use ILIKE for case-insensitive search (PostgreSQL specific)
            # Search in multiple columns including relationships
            models.Article.title.ilike(search_term)
            | models.Article.summary.ilike(search_term)
            | models.Source.name.ilike(search_term)
            | models.Category.name.ilike(search_term)
        )
        .order_by(models.Article.published_at.desc())
        .limit(limit)
        .all()
    )

    return articles


@app.get(
    "/users/me/blacklisted-sources", response_model=List[schemas.Source], tags=["Users"]
)
async def get_blacklisted_sources(
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Get all sources that the current user has blacklisted.

    Args:
        current_user: Current authenticated user (from token)
        db: Database session

    Returns:
        List[Source]: List of blacklisted sources
    """
    blacklisted_source_ids = [
        row[0]
        for row in db.query(models.UserSourceBlacklist.source_id)
        .filter(models.UserSourceBlacklist.user_id == current_user.id)
        .all()
    ]

    sources = (
        db.query(models.Source)
        .filter(models.Source.id.in_(blacklisted_source_ids))
        .all()
    )

    return sources


@app.post(
    "/users/me/blacklisted-sources",
    response_model=schemas.Source,
    status_code=status.HTTP_201_CREATED,
    tags=["Users"],
)
async def add_blacklisted_source(
    source_data: schemas.UserSourceBlacklistCreate,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Add a source to the current user's blacklist.

    Args:
        source_data: Contains source_id to blacklist
        current_user: Current authenticated user (from token)
        db: Database session

    Returns:
        Source: The blacklisted source

    Raises:
        HTTPException: If source not found or already blacklisted
    """
    # Check if source exists
    source = (
        db.query(models.Source)
        .filter(models.Source.id == source_data.source_id)
        .first()
    )
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")

    # Check if already blacklisted
    existing = (
        db.query(models.UserSourceBlacklist)
        .filter(
            models.UserSourceBlacklist.user_id == current_user.id,
            models.UserSourceBlacklist.source_id == source_data.source_id,
        )
        .first()
    )

    if existing:
        raise HTTPException(status_code=400, detail="Source already blacklisted")

    # Create blacklist entry
    blacklist_entry = models.UserSourceBlacklist(
        user_id=current_user.id, source_id=source_data.source_id
    )

    db.add(blacklist_entry)
    db.commit()

    return source


@app.delete(
    "/users/me/blacklisted-sources/{source_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["Users"],
)
async def remove_blacklisted_source(
    source_id: int,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Remove a source from the current user's blacklist.

    Args:
        source_id: ID of the source to remove from blacklist
        current_user: Current authenticated user (from token)
        db: Database session

    Returns:
        None: 204 No Content response on successful removal

    Raises:
        HTTPException: If source not found in blacklist
    """
    blacklist_entry = (
        db.query(models.UserSourceBlacklist)
        .filter(
            models.UserSourceBlacklist.user_id == current_user.id,
            models.UserSourceBlacklist.source_id == source_id,
        )
        .first()
    )

    if not blacklist_entry:
        raise HTTPException(status_code=404, detail="Source not found in blacklist")

    db.delete(blacklist_entry)
    db.commit()

    return None


@app.get(
    "/users/me/blacklisted-articles",
    response_model=List[schemas.ArticleDetail],
    tags=["Users"],
)
async def get_blacklisted_articles(
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Get all articles that the current user has blacklisted.

    Args:
        current_user: Current authenticated user (from token)
        db: Database session

    Returns:
        List[ArticleDetail]: List of blacklisted articles with category and source details
    """
    blacklisted_article_ids = [
        row[0]
        for row in db.query(models.UserArticleBlacklist.article_id)
        .filter(models.UserArticleBlacklist.user_id == current_user.id)
        .all()
    ]

    # Use joinedload to eagerly load category and source relationships
    articles = (
        db.query(models.Article)
        .options(joinedload(models.Article.category), joinedload(models.Article.source))
        .filter(models.Article.id.in_(blacklisted_article_ids))
        .all()
    )

    return articles


@app.post(
    "/users/me/blacklisted-articles",
    response_model=schemas.Article,
    status_code=status.HTTP_201_CREATED,
    tags=["Users"],
)
async def add_blacklisted_article(
    article_data: schemas.UserArticleBlacklistCreate,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Add an article to the current user's blacklist.

    Args:
        article_data: Contains article_id to blacklist
        current_user: Current authenticated user (from token)
        db: Database session

    Returns:
        Article: The blacklisted article

    Raises:
        HTTPException: If article not found or already blacklisted
    """
    # Check if article exists
    article = (
        db.query(models.Article)
        .filter(models.Article.id == article_data.article_id)
        .first()
    )
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    # Check if already blacklisted
    existing = (
        db.query(models.UserArticleBlacklist)
        .filter(
            models.UserArticleBlacklist.user_id == current_user.id,
            models.UserArticleBlacklist.article_id == article_data.article_id,
        )
        .first()
    )

    if existing:
        raise HTTPException(status_code=400, detail="Article already blacklisted")

    # Create blacklist entry
    blacklist_entry = models.UserArticleBlacklist(
        user_id=current_user.id, article_id=article_data.article_id
    )

    db.add(blacklist_entry)
    db.commit()

    logger.info(
        "Article blacklisted",
        extra={
            "user_id": current_user.id,
            "article_id": article.id,
            "article_title": (
                article.title[:30] + "..." if len(article.title) > 30 else article.title
            ),
        },
    )

    return article


@app.delete(
    "/users/me/blacklisted-articles/{article_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["Users"],
)
async def remove_blacklisted_article(
    article_id: int,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Remove an article from the current user's blacklist.

    Args:
        article_id: ID of the article to remove from blacklist
        current_user: Current authenticated user (from token)
        db: Database session

    Returns:
        None: 204 No Content response on successful removal

    Raises:
        HTTPException: If article not found in blacklist
    """
    blacklist_entry = (
        db.query(models.UserArticleBlacklist)
        .filter(
            models.UserArticleBlacklist.user_id == current_user.id,
            models.UserArticleBlacklist.article_id == article_id,
        )
        .first()
    )

    if not blacklist_entry:
        raise HTTPException(status_code=404, detail="Article not found in blacklist")

    db.delete(blacklist_entry)
    db.commit()

    # Use the helper for consistent logging
    log_delete("article_blacklist", article_id, current_user.id)

    return None


@app.post(
    "/articles/{article_id}/read",
    response_model=schemas.UserPreference,
    tags=["Articles"],
)
async def track_article_read(
    article_id: int,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Track when a user reads an article and increase their preference score
    for the article's category.

    Args:
        article_id: ID of the article being read
        current_user: Current authenticated user (from token)
        db: Database session

    Returns:
        UserPreference: The updated user preference for the category

    Raises:
        HTTPException: If article not found
    """
    # Find the article
    article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    # Find the user preference for this category
    preference = (
        db.query(models.UserPreference)
        .filter(
            models.UserPreference.user_id == current_user.id,
            models.UserPreference.category_id == article.category_id,
        )
        .first()
    )

    # Increment the score (preference should exist due to our event listener)
    if preference:
        preference.score += 1
        db.commit()
        db.refresh(preference)
    else:
        # This is an unexpected case, but we'll handle it gracefully
        preference = models.UserPreference(
            user_id=current_user.id,
            category_id=article.category_id,
            score=1,
            blacklisted=False,
        )
        db.add(preference)
        db.commit()
        db.refresh(preference)

    return preference


@app.put(
    "/users/me/preferences/{category_id}",
    response_model=schemas.UserPreference,
    tags=["Users"],
    summary="Update user category preference",  # Add a summary
    description="Update the user's preference score and blacklist status for a specific content category",  # Add a description
)
async def update_user_preference(
    category_id: int,
    current_user: Annotated[models.User, Depends(get_current_user)],
    preference: schemas.UserPreferenceUpdate,
    db: Session = Depends(get_db),
):
    """
    Update a user's preference for a specific category.

    Args:
        category_id: ID of the category to update preferences for
        preference: Updated preference data (score and/or blacklisted status)
        current_user: Current authenticated user (from token)
        db: Database session

    Returns:
        UserPreference: The updated user preference

    Raises:
        HTTPException: If category not found or preference not found
    """
    # Check if category exists
    category = (
        db.query(models.Category).filter(models.Category.id == category_id).first()
    )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Find the user preference for this category
    user_preference = (
        db.query(models.UserPreference)
        .filter(
            models.UserPreference.user_id == current_user.id,
            models.UserPreference.category_id == category_id,
        )
        .first()
    )

    if not user_preference:
        # Create a new preference if one doesn't exist
        user_preference = models.UserPreference(
            user_id=current_user.id,
            category_id=category_id,
            score=0,
            blacklisted=False,
        )
        db.add(user_preference)

    # Update preference fields if provided
    if preference.score is not None:
        user_preference.score = preference.score

    if preference.blacklisted is not None:
        user_preference.blacklisted = preference.blacklisted

    db.commit()
    db.refresh(user_preference)

    return user_preference


@app.get(
    "/users/me/favorite-articles",
    response_model=List[schemas.ArticleDetail],
    tags=["Users"],
)
async def get_favorite_articles(
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Get all articles that the current user has saved as favorites.

    Args:
        current_user: Current authenticated user (from token)
        db: Database session

    Returns:
        List[ArticleDetail]: List of favorited articles
    """
    favorite_article_ids = [
        row[0]
        for row in db.query(models.UserFavoriteArticle.article_id)
        .filter(models.UserFavoriteArticle.user_id == current_user.id)
        .all()
    ]

    articles = (
        db.query(models.Article)
        .filter(models.Article.id.in_(favorite_article_ids))
        .all()
    )

    return articles


@app.post(
    "/users/me/favorite-articles",
    response_model=schemas.Article,
    status_code=status.HTTP_201_CREATED,
    tags=["Users"],
)
async def add_favorite_article(
    article_data: schemas.UserFavoriteArticleCreate,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Add an article to the current user's favorites.

    Args:
        article_data: Contains article_id to add to favorites
        current_user: Current authenticated user (from token)
        db: Database session

    Returns:
        Article: The favorited article

    Raises:
        HTTPException: If article not found or already in favorites
    """
    # Check if article exists
    article = (
        db.query(models.Article)
        .filter(models.Article.id == article_data.article_id)
        .first()
    )
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    # Check if already in favorites
    existing = (
        db.query(models.UserFavoriteArticle)
        .filter(
            models.UserFavoriteArticle.user_id == current_user.id,
            models.UserFavoriteArticle.article_id == article_data.article_id,
        )
        .first()
    )

    if existing:
        raise HTTPException(status_code=400, detail="Article already in favorites")

    # Create favorite entry
    favorite_entry = models.UserFavoriteArticle(
        user_id=current_user.id, article_id=article_data.article_id
    )

    db.add(favorite_entry)
    db.commit()

    return article


@app.delete(
    "/users/me/favorite-articles/{article_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["Users"],
)
async def remove_favorite_article(
    article_id: int,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Remove an article from the current user's favorites.

    Args:
        article_id: ID of the article to remove from favorites
        current_user: Current authenticated user (from token)
        db: Database session

    Returns:
        None: 204 No Content response on successful removal

    Raises:
        HTTPException: If article not found in favorites
    """
    favorite_entry = (
        db.query(models.UserFavoriteArticle)
        .filter(
            models.UserFavoriteArticle.user_id == current_user.id,
            models.UserFavoriteArticle.article_id == article_id,
        )
        .first()
    )

    if not favorite_entry:
        raise HTTPException(status_code=404, detail="Article not found in favorites")

    db.delete(favorite_entry)
    db.commit()

    return None


# TTS Endpoints
@app.post(
    "/articles/{article_id}/audio",
    response_model=schemas.ArticleAudio,
    tags=["Articles"],
    summary="Generate audio for an article",
    description="Generate text-to-speech audio for an article and store it in the database"
)
async def generate_article_audio(
    article_id: int,
    language: str = Query("en", description="Language code for the TTS voice"),
    force_regenerate: bool = Query(False, description="Force regeneration of existing audio"),
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    # Create TTS service
    tts_service = TTSService(db)
    
    # Generate audio
    audio = tts_service.generate_article_audio(
        article_id=article_id,
        language=language,
        force_regenerate=force_regenerate
    )
    
    if not audio:
        raise HTTPException(status_code=500, detail="Failed to generate audio for article")
    
    return audio

@app.get(
    "/articles/{article_id}/audio",
    tags=["Articles"],
    summary="Get audio for an article",
    description="Stream the audio file for an article"
)
async def get_article_audio(
    article_id: int,
    db: Session = Depends(get_db),
):
    # Create TTS service
    tts_service = TTSService(db)
    
    # Get audio
    audio = tts_service.get_article_audio(article_id)
    
    if not audio:
        # Generate audio if it doesn't exist
        audio = tts_service.generate_article_audio(article_id)
        if not audio:
            raise HTTPException(status_code=404, detail="Audio not found for article and could not be generated")
    
    # Return the audio file as a streaming response
    return StreamingResponse(
        BytesIO(audio.audio_data),
        media_type=f"audio/{audio.format}",
        headers={"Content-Disposition": f"attachment; filename=article_{article_id}.{audio.format}"}
    )

@app.delete(
    "/articles/{article_id}/audio",
    tags=["Articles"],
    summary="Delete audio for an article",
    description="Delete the audio file for an article from the database"
)
async def delete_article_audio(
    article_id: int,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    # Make sure the user has admin privileges
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Create TTS service
    tts_service = TTSService(db)
    
    # Delete audio
    success = tts_service.delete_article_audio(article_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Audio not found for article")
    
    return {"detail": "Audio successfully deleted"}
