"""
Text-to-Speech Utilities for News-AI

This module provides a set of utilities for converting text to speech
using various TTS engines, with gTTS (Google Text-to-Speech) as the default.
"""

import os
import logging
import json
import datetime
from typing import Optional, Union, Dict, Any
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("tts_utils")

# Define default audio output directory
DEFAULT_AUDIO_DIR = "./tts/audios"

# Import gTTS for Google's Text-to-Speech API
try:
    from gtts import gTTS
    from gtts.lang import tts_langs
    GTTS_AVAILABLE = True
except ImportError:
    logger.warning("gTTS not available. Please install with 'pip install gtts'")
    GTTS_AVAILABLE = False


class TTSEngine:
    """Base TTS Engine class that can be extended for different TTS providers"""
    
    def __init__(self, language: str = 'en', slow: bool = False):
        """
        Initialize the TTS Engine.
        
        Args:
            language: Language code (default: 'en' for English)
            slow: Whether to speak slowly (default: False)
        """
        self.language = language
        self.slow = slow
    
    def convert_to_speech(self, text: str, output_file: str) -> bool:
        """
        Convert text to speech and save to file.
        
        Args:
            text: Text to convert
            output_file: Path to save audio file
            
        Returns:
            bool: True if successful, False otherwise
        """
        raise NotImplementedError("Subclasses must implement this method")
    
    def play_audio(self, audio_file: str) -> bool:
        """
        Play the audio file.
        
        Args:
            audio_file: Path to the audio file
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            if os.name == 'nt':  # Windows
                os.system(f"start {audio_file}")
            elif os.name == 'posix':  # macOS or Linux
                if os.uname().sysname == 'Darwin':  # macOS
                    os.system(f"open {audio_file}")
                else:  # Linux
                    os.system(f"xdg-open {audio_file}")
            return True
        except Exception as e:
            logger.error(f"Failed to play audio: {e}")
            return False


class GoogleTTS(TTSEngine):
    """Google Text-to-Speech implementation"""
    
    def __init__(self, language: str = 'en', slow: bool = False):
        """
        Initialize Google TTS Engine.
        
        Args:
            language: Language code (default: 'en' for English)
            slow: Whether to speak slowly (default: False)
        """
        super().__init__(language, slow)
        if not GTTS_AVAILABLE:
            raise ImportError("gTTS is not installed. Install with 'pip install gtts'")
    
    def get_available_languages(self) -> Dict[str, str]:
        """
        Get available language options.
        
        Returns:
            Dict[str, str]: Dictionary of available languages (code: name)
        """
        try:
            return tts_langs()
        except Exception as e:
            logger.error(f"Error retrieving languages: {e}")
            return {}
    
    def convert_to_speech(self, text: str, output_file: str) -> bool:
        """
        Convert text to speech using Google TTS and save to file.
        
        Args:
            text: Text to convert
            output_file: Path to save audio file
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            tts = gTTS(text=text, lang=self.language, slow=self.slow)
            tts.save(output_file)
            logger.info(f"Successfully saved TTS to {output_file}")
            return True
        except Exception as e:
            logger.error(f"Failed to convert text to speech: {e}")
            return False


def text_to_speech(
    text: str, 
    output_file: str = "output.mp3",
    language: str = "en",
    slow: bool = False,
    engine: str = "google",
    play_sound: bool = False
) -> bool:
    """
    Convert text to speech using the specified engine.
    
    Args:
        text: Text to convert to speech
        output_file: Path to save the audio file (default: output.mp3)
        language: Language code (default: 'en' for English)
        slow: Whether to speak slowly (default: False)
        engine: TTS engine to use (default: 'google')
        play_sound: Whether to play the sound after conversion (default: False)
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Ensure the output path is in the default audio directory if not already specified
        if not os.path.dirname(output_file):
            output_file = os.path.join(DEFAULT_AUDIO_DIR, output_file)
        
        # Create output directory if it doesn't exist
        output_path = Path(output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Select TTS engine
        if engine.lower() == 'google':
            tts_engine = GoogleTTS(language=language, slow=slow)
        else:
            raise ValueError(f"Unsupported TTS engine: {engine}")
        
        # Convert text to speech
        success = tts_engine.convert_to_speech(text, str(output_path))
        
        # Play sound if requested
        if success and play_sound:
            tts_engine.play_audio(str(output_path))
        
        return success
    except Exception as e:
        logger.error(f"Text to speech conversion failed: {e}")
        return False


def article_to_speech(
    article: Union[str, Dict[str, Any]],
    output_file: str = "article_audio.mp3",
    language: str = "en", 
    slow: bool = False,
    engine: str = "google",
    play_sound: bool = False
) -> bool:
    """
    Convert an article to speech. The article can be a string or a dictionary.
    If it's a dictionary, it should have 'title' and 'content' keys.
    
    Args:
        article: Article text or dictionary with title and content
        output_file: Path to save the audio file (default: article_audio.mp3)
        language: Language code (default: 'en' for English)
        slow: Whether to speak slowly (default: False)
        engine: TTS engine to use (default: 'google')
        play_sound: Whether to play the sound after conversion (default: False)
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Process the article content
        if isinstance(article, dict):
            title = article.get('title', '')
            content = article.get('content', '')
            
            if not title and not content:
                logger.error("Article dictionary must contain 'title' or 'content' keys")
                return False
            
            # Format the text with title and content
            text = f"{title}. {content}" if title else content
        else:
            text = article
        
        # Ensure the output path is in the default audio directory if not already specified
        if not os.path.dirname(output_file):
            output_file = os.path.join(DEFAULT_AUDIO_DIR, output_file)
            
        # Use the standard text_to_speech function
        return text_to_speech(
            text=text,
            output_file=output_file,
            language=language,
            slow=slow,
            engine=engine,
            play_sound=play_sound
        )
    except Exception as e:
        logger.error(f"Article to speech conversion failed: {e}")
        return False


def chunk_and_convert(
    text: str,
    output_dir: str = None,
    max_chunk_size: int = 5000,  # gTTS has character limits
    file_prefix: str = "chunk_",
    language: str = "en",
    slow: bool = False,
    engine: str = "google",
) -> list:
    """
    Split long text into chunks and convert each chunk to speech.
    Useful for very long articles or documents that might exceed TTS API limits.
    
    Args:
        text: Long text to convert
        output_dir: Directory to save audio chunks (default: ./tts/audios/chunks)
        max_chunk_size: Maximum characters per chunk
        file_prefix: Prefix for output files
        language: Language code
        slow: Whether to speak slowly
        engine: TTS engine to use
        
    Returns:
        list: List of generated audio file paths
    """
    try:
        # Use default chunks directory if not specified
        if output_dir is None:
            output_dir = os.path.join(DEFAULT_AUDIO_DIR, "chunks")
            
        # Create output directory if it doesn't exist
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        
        # Split text into chunks (simple implementation - split by sentences)
        sentences = text.split('.')
        chunks = []
        current_chunk = ""
        
        for sentence in sentences:
            if sentence.strip():
                if len(current_chunk) + len(sentence) + 1 <= max_chunk_size:
                    current_chunk += sentence + '.'
                else:
                    if current_chunk:
                        chunks.append(current_chunk)
                    current_chunk = sentence + '.'
        
        if current_chunk:
            chunks.append(current_chunk)
        
        # Convert each chunk to speech
        output_files = []
        for i, chunk in enumerate(chunks):
            output_file = os.path.join(output_dir, f"{file_prefix}{i:03d}.mp3")
            if text_to_speech(
                text=chunk,
                output_file=output_file,
                language=language,
                slow=slow,
                engine=engine,
                play_sound=False
            ):
                output_files.append(output_file)
        
        logger.info(f"Generated {len(output_files)} audio chunks in {output_dir}")
        return output_files
    except Exception as e:
        logger.error(f"Chunk conversion failed: {e}")
        return []


class ArticleAudioManager:
    """
    Manages the creation and storage of article audio files.
    Ensures each article is converted to audio only once and stored for future use.
    """
    
    def __init__(self, storage_dir=None, metadata_file=None):
        """
        Initialize the audio manager.
        
        Args:
            storage_dir: Directory to store audio files (default: DEFAULT_AUDIO_DIR/articles)
            metadata_file: File to store metadata about audio files (default: storage_dir/metadata.json)
        """
        self.storage_dir = storage_dir or os.path.join(DEFAULT_AUDIO_DIR, "articles")
        Path(self.storage_dir).mkdir(parents=True, exist_ok=True)
        
        self.metadata_file = metadata_file or os.path.join(self.storage_dir, "metadata.json")
        self.metadata = self._load_metadata()
    
    def _load_metadata(self):
        """Load metadata from file or initialize if not exists"""
        if os.path.exists(self.metadata_file):
            try:
                with open(self.metadata_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Failed to load metadata: {e}")
                return {}
        return {}
    
    def _save_metadata(self):
        """Save metadata to file"""
        try:
            with open(self.metadata_file, 'w') as f:
                json.dump(self.metadata, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save metadata: {e}")
    
    def get_audio_path(self, article_id):
        """
        Get the path to the audio file for an article.
        
        Args:
            article_id: Unique identifier for the article
            
        Returns:
            str: Path to the audio file if it exists, None otherwise
        """
        if str(article_id) in self.metadata:
            audio_path = self.metadata[str(article_id)]["audio_path"]
            if os.path.exists(audio_path):
                return audio_path
        return None
    
    def article_to_audio(self, article_id, article, language="en", slow=False, engine="google"):
        """
        Convert an article to audio if it doesn't already exist.
        
        Args:
            article_id: Unique identifier for the article
            article: Article content (string or dictionary)
            language: Language code (default: 'en' for English)
            slow: Whether to speak slowly (default: False)
            engine: TTS engine to use (default: 'google')
            
        Returns:
            str: Path to the audio file
        """
        # Check if we already have an audio file for this article
        existing_path = self.get_audio_path(article_id)
        if existing_path:
            logger.info(f"Using existing audio file for article {article_id}")
            return existing_path
        
        # Generate a filename based on the article ID
        safe_id = str(article_id).replace('/', '_').replace('\\', '_')
        filename = f"{safe_id}.mp3"
        output_path = os.path.join(self.storage_dir, filename)
        
        # Convert the article to speech
        success = article_to_speech(
            article=article,
            output_file=output_path,
            language=language,
            slow=slow,
            engine=engine,
            play_sound=False
        )
        
        if success:
            # Store metadata about this audio file
            title = article.get("title", "") if isinstance(article, dict) else ""
            self.metadata[str(article_id)] = {
                "audio_path": output_path,
                "created": datetime.datetime.now().isoformat(),
                "article_title": title,
                "language": language
            }
            self._save_metadata()
            return output_path
        
        return None
    
    def list_available_articles(self):
        """
        List all articles that have audio files available.
        
        Returns:
            list: List of article IDs with available audio
        """
        return [id for id in self.metadata if os.path.exists(self.metadata[id]["audio_path"])]


if __name__ == "__main__":
    # Example usage
    sample_text = "This is a test of the text-to-speech utility."
    text_to_speech(sample_text, play_sound=True)
    
    # Example of using the ArticleAudioManager
    audio_manager = ArticleAudioManager()
    
    # Example article
    article1 = {
        "title": "Test Article",
        "content": "This is a test article for the text-to-speech system."
    }
    
    # Convert article to audio (first time - creates the file)
    audio_path1 = audio_manager.article_to_audio("test-article-1", article1)
    print(f"Audio file created at: {audio_path1}")
    
    # Try converting the same article again (should use existing file)
    audio_path2 = audio_manager.article_to_audio("test-article-1", article1)
    print(f"Using existing audio file: {audio_path2}")