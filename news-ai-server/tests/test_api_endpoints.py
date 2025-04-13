import unittest
import json
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app import app

class TestAPIEndpoints(unittest.TestCase):
    """
    Test cases for API endpoints
    """
    
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
    
    def test_get_articles_endpoint(self):
        """
        Tests that the articles endpoint returns valid data.
        """
        response = self.app.get('/api/articles')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue('articles' in data)
        self.assertTrue(isinstance(data['articles'], list))
    
    def test_get_article_by_id(self):
        """
        Tests retrieving a specific article by ID.
        """
        # First get all articles to extract an ID
        response = self.app.get('/api/articles')
        all_articles = json.loads(response.data)['articles']
        
        if all_articles:
            article_id = all_articles[0]['id']
            response = self.app.get(f'/api/articles/{article_id}')
            self.assertEqual(response.status_code, 200)
            data = json.loads(response.data)
            self.assertEqual(data['article']['id'], article_id)
    
    def test_summarize_article_endpoint(self):
        """
        Tests the article summarization endpoint.
        """
        payload = {
            'url': 'https://www.example.com/valid-article'
        }
        response = self.app.post('/api/summarize', 
                                json=payload,
                                content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue('summary' in data)

if __name__ == '__main__':
    unittest.main()
