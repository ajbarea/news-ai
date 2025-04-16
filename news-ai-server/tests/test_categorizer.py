import unittest
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from database.categorizer import categorize_article

class TestCategorizer(unittest.TestCase):
    """
    Test cases for article categorization
    """
    
    def test_technology_category(self):
        """
        Tests that technology articles are correctly categorized.
        """
        content = """Apple unveils new M3 chip with improved performance and power efficiency.
                    The processors feature enhanced neural engines and GPU capabilities."""
        categories = categorize_article(content)
        self.assertIn('Technology', categories)
        
    def test_politics_category(self):
        """
        Tests that political articles are correctly categorized.
        """
        content = """The Senate passed the new budget proposal with a narrow margin.
                    Opposition leaders criticized the bill's provisions on healthcare."""
        categories = categorize_article(content)
        self.assertIn('Politics', categories)
        
    def test_multiple_categories(self):
        """
        Tests that articles can belong to multiple categories.
        """
        content = """The regulatory committee approved new guidelines for AI technology companies,
                    requiring additional privacy measures for consumer data protection."""
        categories = categorize_article(content)
        self.assertTrue(len(categories) >= 2)
        self.assertTrue('Technology' in categories or 'Politics' in categories)

if __name__ == '__main__':
    unittest.main()
