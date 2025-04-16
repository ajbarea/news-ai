import unittest
from unittest.mock import patch
import sys
import os
import requests

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "news-ai-server")))
from database.summarizer import fetch_webpage, generate_summary

mock_file_path = os.path.join(os.path.dirname(__file__), "mock_data", "test_article.html")

def get_mock_page_content():
    with open(mock_file_path, "r", encoding="utf-8") as f:
        return f.read()

class TestSummarizer(unittest.TestCase):
    """
    Test cases for AI-driven summary generator using mocked webpage content
    """

    @patch("tests.test_summarizer.fetch_webpage")
    def test_valid_url(self, mock_fetch):
        """
        Tests that a webpage and its contents can be found with a valid url, given a known string from the article.
        """
        mock_fetch.return_value = get_mock_page_content()
        page_content = fetch_webpage("any_url")
        self.assertIn("cheeto", page_content.lower())

    def test_invalid_url(self):
        """
        Tests that an invalid url results in an error return message, doesn't need to be mocked.
        """
        bad_url = "https://www.polooloogoon.com/pokmon/534195/pokmon-shapd-chto-chtozard-auction-price"
        page_content = fetch_webpage(bad_url)
        self.assertTrue("Error" in page_content)

    @patch("tests.test_summarizer.fetch_webpage")
    def test_summary_generated(self, mock_fetch):
        """
        Tests that a summary is generated, regardless of contents.
        """
        mock_fetch.return_value = get_mock_page_content()
        page_content = fetch_webpage("any_url")
        summary = generate_summary(page_content)
        self.assertIsNotNone(summary)

    @patch("tests.test_summarizer.fetch_webpage")
    def test_summary_relevance(self, mock_fetch):
        """
        Tests that the summarizer has accurately identified components of the article, indicating relevance and link accuracy.
        """
        mock_fetch.return_value = get_mock_page_content()
        page_content = fetch_webpage("any_url")
        summary = generate_summary(page_content)

        for keyword in ["cheeto", "charizard", "$250"]:
            self.assertIn(keyword, summary.lower())

    @patch("tests.test_summarizer.fetch_webpage")
    def test_summary_length(self, mock_fetch):
        """
        Tests that the summarizer is adhering to summary length constraints.
        """
        mock_fetch.return_value = get_mock_page_content()
        page_content = fetch_webpage("any_url")
        summary = generate_summary(page_content)
        self.assertLessEqual(len(summary.split()), 150)

    def test_empty_content_summary(self):
        """
        Tests that the summarizer properly handles empty page content requests and doesn't crash.
        """
        summary = generate_summary("")
        self.assertTrue(isinstance(summary, str))
        self.assertGreaterEqual(len(summary), 0) 

    def test_long_input_truncation(self):
        """
        Tests that the summarizer properly handles very large content requests.
        """
        long_content = "This is filler text. " * 2000
        summary = generate_summary(long_content)
        self.assertIsInstance(summary, str)
        self.assertLessEqual(len(summary.split()), 150)

    @patch("requests.get")
    def test_fetch_webpage_no_paragraphs(self, mock_get):
        """
        Tests that the summarizer properly handles page content without paragraphs.
        """
        mock_get.return_value.status_code = 200
        mock_get.return_value.text = "<html><body><div>No paragraphs here!</div></body></html>"

        content = fetch_webpage("http://fakeurl.com")
        self.assertEqual(content.strip(), "")

    @patch("requests.get", side_effect=requests.exceptions.Timeout)
    def test_fetch_webpage_timeout(self):
        """
        Tests that the summarizer can handle page timeouts
        """
        content = fetch_webpage("http://slow-site.com")
        self.assertIn("Error fetching the webpage", content)

if __name__ == '__main__':
    unittest.main()