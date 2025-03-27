"""
Migration script to create the article_audio table
"""

import os
import sys
from datetime import datetime

# Add parent directories to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy import Column, Integer, String, LargeBinary, DateTime, ForeignKey, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Get database URL from environment variable or use default
from database.config import get_database_url
db_url = get_database_url()

# Create engine and session
engine = create_engine(db_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base
Base = declarative_base()

class ArticleAudio(Base):
    __tablename__ = "article_audio"

    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(Integer, ForeignKey("articles.id", ondelete="CASCADE"), nullable=False, unique=True)
    audio_data = Column(LargeBinary, nullable=False)
    format = Column(String, default="mp3")
    language = Column(String, default="en")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

def run_migration():
    print(f"Creating article_audio table...")
    Base.metadata.create_all(bind=engine)
    print(f"Migration completed successfully.")

if __name__ == "__main__":
    run_migration()
