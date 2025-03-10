"""
Database connection module.
This file handles the database connection setup using SQLAlchemy.
It provides the database engine, session factory, and base class for models.
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Load environment variables from .env file
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# Get database URL from environment variable
DATABASE_URL = os.environ.get("DEV_DATABASE_URL")

# Create SQLAlchemy engine with the given connection string
engine = create_engine(DATABASE_URL)

# Create a sessionmaker factory that will create new database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all database models
Base = declarative_base()


def get_db():
    """
    Create a new database session and close it when done.
    This function is typically used as a dependency in FastAPI endpoints.

    Yields:
        Session: SQLAlchemy database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
