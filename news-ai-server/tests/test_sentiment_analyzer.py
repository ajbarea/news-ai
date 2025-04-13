import unittest
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from database.sentiment_analyzer import analyze_sentiment

class TestSentimentAnalyzer(unittest.TestCase):
    """
    Test cases for AI-driven sentiment analysis
    """
    
    def test_positive_sentiment(self):
        """
        Tests that positive text is correctly identified as positive.
        """
        text = "This is an amazing breakthrough in technology that will help millions of people."
        sentiment = analyze_sentiment(text)
        self.assertEqual(sentiment['label'], 'POSITIVE')
        self.assertTrue(sentiment['score'] > 0.7)
    
    def test_negative_sentiment(self):
        """
        Tests that negative text is correctly identified as negative.
        """
        text = "The market crashed today causing severe losses to investors."
        sentiment = analyze_sentiment(text)
        self.assertEqual(sentiment['label'], 'NEGATIVE')
        self.assertTrue(sentiment['score'] > 0.6)
        
    def test_neutral_sentiment(self):
        """
        Tests that neutral text is correctly identified as neutral.
        """
        text = "The report contains data from Tuesday's meeting."
        sentiment = analyze_sentiment(text)
        self.assertEqual(sentiment['label'], 'NEUTRAL')
        self.assertTrue(sentiment['score'] > 0.5)

if __name__ == '__main__':
    unittest.main()
