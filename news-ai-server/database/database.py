"""
Database connection module.
Establishes SQLAlchemy session management and connection pooling.
"""

import os
import time
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from ..utils.logging_config import get_logger

# Set up logging
logger = get_logger(__name__)

# Load environment variables from .env file
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# Database connection setup
DATABASE_URL = os.environ.get("DEV_DATABASE_URL")
# Log connection attempt without exposing full connection string details
logger.info(
    f"Initializing database connection to {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else 'database'}"
)

# Create engine with connection pooling for efficient connection management
engine = create_engine(DATABASE_URL)

# Session factory configured to match FastAPI's request lifecycle
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for SQLAlchemy models
Base = declarative_base()


def get_db():
    """
    Dependency provider for database sessions.

    Yields a session per request and ensures proper cleanup through the
    context manager pattern, even if exceptions occur during request processing.
    This pattern prevents connection leaks in the connection pool.

    Yields:
        Session: SQLAlchemy database session
    """
    db = SessionLocal()
    start_time = time.time()
    request_id = None

    # Try to get request ID from FastAPI if available
    try:
        from fastapi import Request
        import inspect

        # Find the Request object in the stack
        frame = inspect.currentframe()
        while frame:
            for _, obj in frame.f_locals.items():
                if isinstance(obj, Request) and hasattr(obj.state, "request_id"):
                    request_id = obj.state.request_id
                    break
            if request_id:
                break
            frame = frame.f_back
    except (ImportError, Exception):
        pass

    try:
        yield db
        duration = time.time() - start_time
        if duration > 0.5:  # Log slow queries (>500ms)
            logger.warning(
                f"Slow database session: {duration:.2f}s",
                extra={"duration": duration, "request_id": request_id},
            )
        else:
            logger.debug(
                f"Database session completed in {duration:.4f}s",
                extra={"request_id": request_id},
            )
    except Exception as e:
        logger.error(
            f"Database session error: {str(e)}",
            extra={"error_type": type(e).__name__, "request_id": request_id},
        )
        raise
    finally:
        db.close()
