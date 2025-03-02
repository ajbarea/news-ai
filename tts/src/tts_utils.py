"""
Text-to-Speech Utilities for News-AI

This module provides a set of utilities for converting text to speech
using various TTS engines, with gTTS (Google Text-to-Speech) as the default.
"""

import os
import logging
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


if __name__ == "__main__":
    # Example usage
    sample_text = "This is a test of the text-to-speech utility."
    text_to_speech(sample_text, play_sound=True)