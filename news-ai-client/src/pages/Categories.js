import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, CardText, Input, Button, InputGroup, Spinner } from 'reactstrap';
import { apiClient } from '../services/authService';
import { useSearchParams } from 'react-router-dom';
import ArticleService from '../services/articleService';
import { useAuth } from '../context/AuthContext';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const loadingRef = useRef(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSearchQuery, setLastSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [showNoResultsMessage, setShowNoResultsMessage] = useState(false);
  const noResultsTimeoutRef = useRef(null);

  // New states for category selection and article fetching
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryArticles, setCategoryArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [categoryArticlesError, setCategoryArticlesError] = useState(null);

  const [searchParams] = useSearchParams();

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        loadingRef.current = true;
        // Add a timeout to the request to prevent it from hanging
        const response = await apiClient.get('/categories', {
          timeout: 10000 // 10 seconds timeout
        });

        if (Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          console.error('Unexpected data format:', response.data);
          setError('Received invalid data format from server');
        }
        setLoading(false);
        loadingRef.current = false;
      } catch (err) {
        console.error('Error fetching categories:', err);
        if (err.code === 'ECONNABORTED') {
          setError('Request timed out. Please check if the API server is running.');
        } else if (err.response) {
          // The request was made and the server responded with a status code
          setError(`Server error: ${err.response.status} - ${err.response.statusText}`);
        } else if (err.request) {
          // The request was made but no response was received
          setError('No response from server. Please check if the API server is running.');
        } else {
          setError('An unexpected error occurred. Please try again later.');
        }
        setLoading(false);
        loadingRef.current = false;
      }
    };

    fetchCategories();

    // Fallback in case something goes wrong with state management
    const timeout = setTimeout(() => {
      if (loadingRef.current) {
        console.log('Loading took too long, resetting loading state');
        setLoading(false);
        setError('Loading took too long. Please refresh the page.');
      }
    }, 15000); // 15 seconds fallback

    return () => clearTimeout(timeout);
  }, []);

  // Handle category selection from URL query parameters
  useEffect(() => {
    const categoryIdParam = searchParams.get('category');

    if (!categoryIdParam) {
      // If no category parameter is present, reset to show all categories
      setSelectedCategory(null);
      setCategoryArticles([]);
      return;
    }

    // Only process if we have categories loaded and a category ID parameter
    if (categories.length > 0) {
      const categoryId = parseInt(categoryIdParam, 10);
      const category = categories.find(cat => cat.id === categoryId);

      if (category) {
        setSelectedCategory(category);
        fetchArticlesByCategory(category.id);
      }
    }
  }, [categories, searchParams]); // Remove selectedCategory from dependencies

  // New function to fetch articles by category
  const fetchArticlesByCategory = async (categoryId) => {
    try {
      setLoadingArticles(true);
      setCategoryArticlesError(null);
      setCategoryArticles([]);

      const response = await apiClient.get('/articles', {
        params: { category_id: categoryId },
        timeout: 10000
      });

      setCategoryArticles(response.data);
      setLoadingArticles(false);
    } catch (err) {
      console.error('Error fetching category articles:', err);
      if (err.code === 'ECONNABORTED') {
        setCategoryArticlesError('Request timed out. Please check if the API server is running.');
      } else if (err.response) {
        setCategoryArticlesError(`Server error: ${err.response.status} - ${err.response.statusText}`);
      } else if (err.request) {
        setCategoryArticlesError('No response from server. Please check if the API server is running.');
      } else {
        setCategoryArticlesError('An unexpected error occurred. Please try again later.');
      }
      setLoadingArticles(false);
    }
  };

  // Handler for category card click
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    fetchArticlesByCategory(category.id);
    // Reset search when selecting a category
    setSearchResults([]);
  };

  // Handler to go back to categories view
  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setCategoryArticles([]);
  };

  const getCardColorClass = (color) => {
    const colorMap = {
      primary: 'border-primary',
      secondary: 'border-secondary',
      success: 'border-success',
      danger: 'border-danger',
      warning: 'border-warning',
      info: 'border-info',
      purple: 'border-primary'
    };
    return colorMap[color] || 'border-primary';
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchError('Please enter at least 2 characters to search');
      return;
    }

    // Clear any existing timeout
    if (noResultsTimeoutRef.current) {
      clearTimeout(noResultsTimeoutRef.current);
      noResultsTimeoutRef.current = null;
    }

    try {
      setIsSearching(true);
      setSearchError(null);
      setSearchResults([]);
      setSelectedCategory(null);
      setCategoryArticles([]);
      setLastSearchQuery(searchQuery.trim()); // Store the query before clearing it
      setShowNoResultsMessage(false);

      const response = await apiClient.get('/search', {
        params: { query: searchQuery.trim() },
        timeout: 10000
      });

      setSearchResults(response.data);
      setIsSearching(false);
      setSearchQuery('');

      // If no results were found, show the temporary message
      if (response.data.length === 0) {
        setShowNoResultsMessage(true);
        // Hide the message after 5 seconds
        noResultsTimeoutRef.current = setTimeout(() => {
          setShowNoResultsMessage(false);
        }, 5000);
      }
    } catch (err) {
      console.error('Error searching articles:', err);
      if (err.code === 'ECONNABORTED') {
        setSearchError('Search request timed out. Please try again.');
      } else if (err.response) {
        setSearchError(`Server error: ${err.response.status} - ${err.response.data.detail || err.response.statusText}`);
      } else if (err.request) {
        setSearchError('No response from server. Please check if the API server is running.');
      } else {
        setSearchError('An unexpected error occurred. Please try again later.');
      }
      setIsSearching(false);
      setSearchQuery('');
    }
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (noResultsTimeoutRef.current) {
        clearTimeout(noResultsTimeoutRef.current);
      }
    };
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle article read tracking
  const handleReadMore = async (article) => {
    if (isAuthenticated()) {
      try {
        await ArticleService.trackArticleRead(article.id);
      } catch (error) {
        console.error('Failed to track article read:', error);
      }
    }
    // Open article URL in a new tab
    window.open(article.url, '_blank');
  };

  // Render article cards (used for both search results and category articles)
  const renderArticleCards = (articles) => {
    return articles.map((article) => (
      <Col key={article.id} md="6" className="mb-4">
        <Card className="h-100">
          <Row className="g-0">
            {article.image_url && (
              <Col md="4">
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="img-fluid rounded-start h-100 object-fit-cover"
                  style={{ maxHeight: "200px" }}
                />
              </Col>
            )}
            <Col md={article.image_url ? "8" : "12"}>
              <CardBody>
                <CardTitle tag="h5">{article.title}</CardTitle>
                <CardText className="text-muted small">
                  <span className="badge bg-secondary me-2">{article.category.name}</span>
                  From <strong>{article.source.name}</strong> • {new Date(article.published_at).toLocaleDateString()}
                  {article.source.subscription_required &&
                    <span className="ms-1 badge bg-warning text-dark">Subscription</span>
                  }
                </CardText>
                <CardText className="text-truncate">{article.summary}</CardText>
                <Button
                  color="primary"
                  onClick={() => handleReadMore(article)}
                  size="sm"
                >
                  Read More
                </Button>
              </CardBody>
            </Col>
          </Row>
        </Card>
      </Col>
    ));
  };

  if (loading) {
    return (
      <Container className="mt-5 pt-4 text-center">
        <Spinner color="primary" />
        <p className="mt-3">Loading categories...</p>
        <p className="text-muted">Connecting to API at localhost:8000...</p>
      </Container>
    );
  }

  // Show error with retry button
  if (error) {
    return (
      <Container className="mt-5 pt-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error loading categories</h4>
          <p>{error}</p>
        </div>
        <Button color="primary" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Container>
    );
  }

  // Fallback for empty categories
  if (!categories || categories.length === 0) {
    return (
      <Container className="mt-5 pt-4">
        <div className="alert alert-warning" role="alert">
          No categories found. The database might be empty.
        </div>
        <Button color="primary" onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </Container>
    );
  }

  return (
    <Container className="mt-5 pt-4">
      {/* Show selected category articles */}
      {selectedCategory && (
        <>
          <Row className="mb-4">
            <Col>
              <h2>
                <span className="me-2">{selectedCategory.icon}</span>
                {selectedCategory.name}
              </h2>
              <p>Showing {categoryArticles.length} articles in this category</p>
              <Button color="secondary" className="mb-4" onClick={handleBackToCategories}>
                Back to Categories
              </Button>
            </Col>
          </Row>

          {loadingArticles ? (
            <div className="text-center my-5">
              <Spinner color="primary" />
              <p>Loading articles...</p>
            </div>
          ) : categoryArticlesError ? (
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Error loading articles</h4>
              <p>{categoryArticlesError}</p>
              <Button color="primary" className="mt-2" onClick={() => fetchArticlesByCategory(selectedCategory.id)}>
                Retry
              </Button>
            </div>
          ) : categoryArticles.length === 0 ? (
            <div className="alert alert-info" role="alert">
              <h4 className="alert-heading">No articles found</h4>
              <p>There are no articles available in this category.</p>
            </div>
          ) : (
            <Row>
              {renderArticleCards(categoryArticles)}
            </Row>
          )}
        </>
      )}

      {/* Only show header when not displaying search results or category articles */}
      {!searchResults.length && !selectedCategory && (
        <Row className="mb-4">
          <Col>
            <h1 className="mb-3">News Categories</h1>
            <p className="text-muted">Browse news articles by your favorite categories</p>
          </Col>
        </Row>
      )}

      {/* Only show categories if we're not displaying search results or category articles */}
      {!searchResults.length && !selectedCategory && (
        <Row>
          {categories.map((category) => (
            <Col key={category.id} md="6" lg="4" xl="3" className="mb-4">
              <Card
                className={`h-100 ${getCardColorClass(category.color)} cursor-pointer`}
                style={{ borderWidth: '2px', cursor: 'pointer' }}
                onClick={() => handleCategoryClick(category)}
              >
                <CardBody className="text-center">
                  <div className="mb-2 fs-1">{category.icon}</div>
                  <CardTitle tag="h3" className="mb-2">{category.name}</CardTitle>
                  <span className="badge bg-light text-dark">{category.article_count} articles</span>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Display search results if we have any */}
      {searchResults.length > 0 && (
        <>
          <Row className="mb-4">
            <Col>
              <h2>Search Results</h2>
              <p>Found {searchResults.length} articles matching "{lastSearchQuery}"</p>
              <Button color="secondary" className="mb-4" onClick={() => {
                setSearchResults([]);
                setLastSearchQuery('');
              }}>
                Back to Categories
              </Button>
            </Col>
          </Row>
          <Row>
            {renderArticleCards(searchResults)}
          </Row>
        </>
      )}

      {/* Show message when search was performed but no results were found */}
      {showNoResultsMessage && !isSearching && searchResults.length === 0 && !searchError && (
        <div className="alert alert-info my-4" role="alert">
          <h4 className="alert-heading">No results found</h4>
          <p>We couldn't find any articles matching "{lastSearchQuery}". Please try a different search term.</p>
        </div>
      )}

      {/* Only show search card if not viewing category articles */}
      {!selectedCategory && (
        <Row className="mt-5">
          <Col>
            <Card className="bg-light border-primary">
              <CardBody>
                <CardTitle tag="h2" className="mb-3">Can't find what you're looking for?</CardTitle>
                <CardText className="text-muted mb-4">
                  Our AI can help you find articles on any topic, even if it's not listed in our categories.
                </CardText>
                <InputGroup>
                  <Input
                    type="text"
                    placeholder="Enter any topic..."
                    className="flex-grow-1"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isSearching}
                  />
                  <Button
                    color="primary"
                    onClick={handleSearch}
                    disabled={isSearching}
                  >
                    {isSearching ? <><Spinner size="sm" /> Searching...</> : 'Search'}
                  </Button>
                </InputGroup>
                {searchError && <div className="text-danger mt-2">{searchError}</div>}
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      {/* Show loading indicator for search */}
      {isSearching && (
        <div className="text-center mt-4">
          <Spinner color="primary" />
          <p>Searching for articles...</p>
        </div>
      )}
    </Container>
  );
}

export default Categories;
