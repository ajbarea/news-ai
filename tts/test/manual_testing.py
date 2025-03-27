import sys
import os

# Add parent directory to Python path so it can find the tts module
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# Basic usage
from tts.src.tts_utils import text_to_speech, DEFAULT_AUDIO_DIR
from pathlib import Path

# Ensure the audio directory exists
Path(DEFAULT_AUDIO_DIR).mkdir(parents=True, exist_ok=True)

# Convert a simple string to speech
text_to_speech("Welcome to News-AI!", play_sound=True)

# Convert with custom options
text_to_speech(
    "Bienvenue sur News-AI!", 
    language="fr", 
    output_file="welcome_fr.mp3",  # Will be saved to ./tts/audios/welcome_fr.mp3
    play_sound=True
)

# Convert an article
from tts.src.tts_utils import article_to_speech

article = {
    "title": "Breaking News: AI Makes Significant Advancements",
    "content": "Researchers have announced a breakthrough in artificial intelligence..."
}

article_to_speech(article, output_file="news_article.mp3", play_sound=True)

# Convert a very long article by chunking
from tts.src.tts_utils import chunk_and_convert

long_text = "..." # Long article text
audio_files = chunk_and_convert(
    long_text,
    # Will use default directory ./tts/audios/chunks
    file_prefix="news_"
)

print(f"All audio files saved to {DEFAULT_AUDIO_DIR}")