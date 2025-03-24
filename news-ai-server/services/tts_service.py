"""
Text-to-Speech Service for News-AI Server

This service handles generating and storing audio files for articles.
"""

import os
import sys
import logging
import tempfile
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

# Add the parent directory to the path so we can import modules from the parent directory
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import models and TTS utilities
from .. import models  # Changed from news_ai_server import models to relative import
from tts.src.tts_utils import article_to_speech

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("tts_service")

class TTSService:
    """Service for handling text-to-speech operations for articles"""
    
    def __init__(self, db: Session):
        """Initialize with a database session"""
        self.db = db
    
    def generate_article_audio(
        self, 
        article_id: int, 
        language: str = "en", 
        force_regenerate: bool = False
    ) -> Optional[models.ArticleAudio]:
        """
        Generate audio for an article and store it in the database
        
        Args:
            article_id: ID of the article to generate audio for
            language: Language code (default: 'en')
            force_regenerate: If True, regenerate even if audio exists
            
        Returns:
            ArticleAudio object if successful, None otherwise
        """
        try:
            # Check if audio already exists for this article
            existing_audio = (
                self.db.query(models.ArticleAudio)
                .filter(models.ArticleAudio.article_id == article_id)
                .first()
            )
            
            if existing_audio and not force_regenerate:
                logger.info(f"Audio already exists for article {article_id}")
                return existing_audio
                
            # Get the article from the database
            article = (
                self.db.query(models.Article)
                .filter(models.Article.id == article_id)
                .first()
            )
            
            if not article:
                logger.error(f"Article {article_id} not found")
                return None
                
            # Create a temporary file for the audio
            with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as temp_file:
                temp_path = temp_file.name
                
            # Generate the article content for TTS
            # We'll use title and summary since articles typically don't have full content
            article_content = {
                "title": article.title,
                "content": article.summary or ""
            }
            
            # Generate the audio file
            success = article_to_speech(
                article=article_content,
                output_file=temp_path,
                language=language,
                slow=False,
                engine="google",
                play_sound=False
            )
            
            if not success:
                logger.error(f"Failed to generate audio for article {article_id}")
                os.unlink(temp_path)  # Clean up the temporary file
                return None
                
            # Read the generated audio file
            with open(temp_path, "rb") as audio_file:
                audio_data = audio_file.read()
                
            # Clean up the temporary file
            os.unlink(temp_path)
            
            # Delete existing audio if it exists
            if existing_audio:
                self.db.delete(existing_audio)
                self.db.commit()
                
            # Create a new ArticleAudio object
            new_audio = models.ArticleAudio(
                article_id=article_id,
                audio_data=audio_data,
                language=language
            )
            
            # Save to database
            self.db.add(new_audio)
            self.db.commit()
            self.db.refresh(new_audio)
            
            logger.info(f"Successfully generated audio for article {article_id}")
            return new_audio
            
        except SQLAlchemyError as e:
            logger.error(f"Database error generating audio for article {article_id}: {str(e)}")
            self.db.rollback()
            return None
        except Exception as e:
            logger.error(f"Error generating audio for article {article_id}: {str(e)}")
            return None
    
    def get_article_audio(self, article_id: int) -> Optional[models.ArticleAudio]:
        """
        Get the audio for an article from the database
        
        Args:
            article_id: ID of the article
            
        Returns:
            ArticleAudio object if it exists, None otherwise
        """
        try:
            audio = (
                self.db.query(models.ArticleAudio)
                .filter(models.ArticleAudio.article_id == article_id)
                .first()
            )
            return audio
        except SQLAlchemyError as e:
            logger.error(f"Database error retrieving audio for article {article_id}: {str(e)}")
            return None
    
    def delete_article_audio(self, article_id: int) -> bool:
        """
        Delete the audio for an article from the database
        
        Args:
            article_id: ID of the article
            
        Returns:
            True if successfully deleted, False otherwise
        """
        try:
            audio = (
                self.db.query(models.ArticleAudio)
                .filter(models.ArticleAudio.article_id == article_id)
                .first()
            )
            
            if audio:
                self.db.delete(audio)
                self.db.commit()
                logger.info(f"Successfully deleted audio for article {article_id}")
                return True
            
            logger.info(f"No audio found for article {article_id}")
            return False
        except SQLAlchemyError as e:
            logger.error(f"Database error deleting audio for article {article_id}: {str(e)}")
            self.db.rollback()
            return False
