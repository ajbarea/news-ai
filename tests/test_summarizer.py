import unittest
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "news-ai-server")))
from database.summarizer import *

url = "https://www.polygon.com/pokemon/534195/pokemon-shaped-cheeto-cheetozard-auction-price"

class TestSummarizer(unittest.TestCase):
    """
    Test cases for AI-driven summary generator
    """

    def test_valid_url(self):
        """
        Tests that a webpage and its contents can be found with a valid url, given a known string from the article.
        """
        page_content = fetch_webpage(url)
        valid_string = "cheeto"
        self.assertTrue(valid_string in page_content.lower())
    
    def test_invalid_url(self):
        """
        Tests that an invalid url results in an error return message.
        """
        bad_url = "https://www.polooloogoon.com/pokmon/534195/pokmon-shapd-chto-chtozard-auction-price"
        page_content = fetch_webpage(bad_url)
        self.assertTrue("Error" in page_content)

    def test_summary_generated(self):
        """
        Tests that a summary is generated, regardless of contents.
        """
        page_content = fetch_webpage(url)
        summary = generate_summary(page_content)
        self.assertIsNotNone(summary)
    
    def test_summary_relevance(self):
        """
        Tests that the summarizer has accurately identified components of the article, indicating relevance and link accuracy.
        """
        page_content = fetch_webpage(url)
        summary = generate_summary(page_content)
        print(summary)

        relevant_string = "cheeto"
        self.assertTrue(relevant_string in summary.lower())
        relevant_string = "charizard"
        self.assertTrue(relevant_string in summary.lower())
        relevant_string = "$250"
        self.assertTrue(relevant_string in summary.lower())

    def test_summary_length(self):
        """
        Tests that the summarizer is adhering to summary length constraints.
        """
        max_words = 150
        page_content = fetch_webpage(url)
        summary = generate_summary(page_content)
        self.assertTrue (max_words >= len(summary.split()))

if __name__ == '__main__':
    unittest.main()