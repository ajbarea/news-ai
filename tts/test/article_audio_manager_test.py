import sys
import os

# Add parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from tts.src.tts_utils import ArticleAudioManager
from pathlib import Path

# Create an instance of ArticleAudioManager
audio_manager = ArticleAudioManager()

# Example articles
articles = [
    {
        "id": "article-1",
        "title": "Breaking News: AI Makes Significant Advancements",
        "content": "Researchers have announced a breakthrough in artificial intelligence that could revolutionize how machines learn and process information."
    },
    {
        "id": "article-2",
        "title": "Climate Change Report Released",
        "content": "A new report indicates that global temperatures have risen significantly over the past decade, leading to concerns about long-term environmental impacts."
    }
]

# Process each article - this will only create audio files if they don't exist
for article in articles:
    print(f"Processing article: {article['id']} - {article['title']}")
    audio_path = audio_manager.article_to_audio(
        article_id=article['id'],
        article={
            "title": article['title'],
            "content": article['content']
        },
        language="en"
    )
    print(f"Audio file path: {audio_path}")
    
# List all available article audio files
available_articles = audio_manager.list_available_articles()
print(f"\nAvailable audio files: {len(available_articles)}")
for article_id in available_articles:
    metadata = audio_manager.metadata[article_id]
    print(f"- {article_id}: {metadata['article_title']} (Created: {metadata['created']})")

# Try processing the same article again - should use existing file
print("\nTrying to process article-1 again (should use existing file):")
audio_path = audio_manager.article_to_audio(
    article_id="article-1",
    article=articles[0],
    language="en"
)
print(f"Audio file path: {audio_path}")
