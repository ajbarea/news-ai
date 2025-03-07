import unittest
from src.transformers_summarizer import *

url = "https://www.polygon.com/pokemon/534195/pokemon-shaped-cheeto-cheetozard-auction-price"

class TestSummarizer(unittest.TestCase):
    """
    Test cases for summary generator R&D implementation
    """

    def test_valid_url(self):
        """
        Tests that a webpage and its contents can be found with a valid url, given a known string from the article.
        """
        page_content = fetch_webpage(url)
        valid_string = "cheetozard"
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
        summary = analyze_content_with_transformers(page_content)
        self.assertIsNotNone(summary)
    
    def test_summary_relevance(self):
        """
        Tests that the summarizer has accurately identified components of the article, indicating relevance and link accuracy.
        """
        page_content = fetch_webpage(url)
        summary = analyze_content_with_transformers(page_content)

        relevant_string = "cheeto"
        self.assertTrue(relevant_string in summary.lower())
        relevant_string = "charizard"
        self.assertTrue(relevant_string in summary.lower())
        relevant_string = "1st and goal"
        self.assertTrue(relevant_string in summary.lower())

    def test_summary_length(self):
        """
        Tests that the summarizer is adhering to the summary length constraints in the prompt.
        """
        max_words = 250
        page_content = fetch_webpage(url)
        summary = analyze_content_with_transformers(page_content)
        self.assertTrue (max_words >= len(summary.split()))

        

if __name__ == '__main__':
    unittest.main()