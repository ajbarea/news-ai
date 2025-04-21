import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, ButtonGroup, Card, CardText, Spinner, Input, InputGroup, CardTitle, CardBody } from 'reactstrap';
import { FaSortAmountDown, FaSortAmountUp, FaSearch } from 'react-icons/fa';
import ArticleCard from '../components/ArticleCard';
import { apiClient } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import FavoriteArticleService from '../services/favoriteArticleService';
import ArticleService from '../services/articleService';

function HomePage() {
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState(['All']);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('All');
    const [visibleArticles, setVisibleArticles] = useState(9); // Initially show 9 articles
    const articlesPerPage = 6; // Load 6 more articles on each click
    const [favoriteArticles, setFavoriteArticles] = useState([]);
    const [loadingFavorites, setLoadingFavorites] = useState(false);
    const { isAuthenticated } = useAuth();
    const [sortOrder, setSortOrder] = useState('newest');
    
    // Search functionality states
    const [searchQuery, setSearchQuery] = useState('');
    const [lastSearchQuery, setLastSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [showNoResultsMessage, setShowNoResultsMessage] = useState(false);
    const noResultsTimeoutRef = useRef(null);

    // Fetch articles from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Use apiClient to include the auth token
                const [articlesRes, categoriesRes] = await Promise.all([
                    apiClient.get('/articles'),
                    apiClient.get('/categories')
                ]);

                setArticles(articlesRes.data);

                // Extract category names for filter buttons
                const categoryNames = ['All', ...categoriesRes.data.map(cat => cat.name)];
                setCategories(categoryNames);

                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load articles. Please try again later.');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Fetch user's favorite articles if authenticated
    useEffect(() => {
        const fetchFavorites = async () => {
            if (!isAuthenticated()) return;

            try {
                setLoadingFavorites(true);
                const favorites = await FavoriteArticleService.getFavoriteArticles();
                setFavoriteArticles(favorites);
            } catch (err) {
                console.error('Error fetching favorites:', err);
            } finally {
                setLoadingFavorites(false);
            }
        };

        fetchFavorites();
    }, [isAuthenticated]);

    // Handle favorite change from ArticleCard
    const handleFavoriteChange = (articleId, isFavorite) => {
        if (isFavorite) {
            // Find the article and add it to favorites
            const article = articles.find(a => a.id === articleId);
            if (article) {
                setFavoriteArticles(prev => [...prev, article]);
            }
        } else {
            // Remove from favorites
            setFavoriteArticles(prev => prev.filter(a => a.id !== articleId));
        }
    };

    // Format articles for display
    const formatArticle = (article) => ({
        id: article.id,
        title: article.title,
        summary: article.summary || 'No summary available for this article.',
        source: article.source,
        category: article.category.name,
        date: article.published_at,
        imageUrl: article.image_url,
        url: article.url
    });

    // Filter articles based on selected category, then sort by publication date
    const filteredArticles = activeCategory === 'All'
        ? articles.map(formatArticle)
        : articles
            .filter(article => article.category.name === activeCategory)
            .map(formatArticle);

    // Sort the filtered articles by publication date
    const sortedArticles = [...filteredArticles].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    // Get only the articles that should be visible
    const currentArticles = sortedArticles.slice(0, visibleArticles);

    // Load more articles function
    const loadMoreArticles = () => {
        setVisibleArticles(prev => prev + articlesPerPage);
    };

    // Toggle sort order function
    const toggleSortOrder = () => {
        setSortOrder(prevOrder => prevOrder === 'newest' ? 'oldest' : 'newest');
    };

    // Reset visible articles when changing category or sort order
    useEffect(() => {
        setVisibleArticles(9);
    }, [activeCategory, sortOrder]);

    // Clean up timeout on unmount
    useEffect(() => {
        return () => {
            if (noResultsTimeoutRef.current) {
                clearTimeout(noResultsTimeoutRef.current);
            }
        };
    }, []);
    
    // Handle search functionality
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
            setLastSearchQuery(searchQuery.trim());
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

    return (
        <Container className="mt-5 mb-4">
            <Row className="mb-4">
                <Col>
                    <h1>Welcome to News-AI</h1>
                    <p>
                        Stay informed with the latest news, trends, and stories from around the world.
                        Our AI-powered platform brings you personalized content tailored to your interests.
                    </p>
                </Col>
            </Row>
            
            {/* Search Bar */}
            <Row className="mb-4">
                <Col>
                    <Card className="border-primary shadow-sm">
                        <CardBody>
                            <InputGroup>
                                <Input
                                    type="text"
                                    placeholder="Search for any news topic..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    disabled={isSearching}
                                    className="border-end-0"
                                />
                                <Button
                                    color="primary"
                                    onClick={handleSearch}
                                    disabled={isSearching}
                                >
                                    {isSearching ? <><Spinner size="sm" /> Searching...</> : <><FaSearch className="me-1" /> Search</>}
                                </Button>
                            </InputGroup>
                            {searchError && <div className="text-danger mt-2">{searchError}</div>}
                        </CardBody>
                    </Card>
                </Col>
            </Row>
            
            {/* Search Results Display */}
            {searchResults.length > 0 && (
                <>
                    <Row className="mb-4">
                        <Col>
                            <h2>Search Results</h2>
                            <p>Found {searchResults.length} articles matching "{lastSearchQuery}"</p>
                            <Button 
                                color="secondary" 
                                className="mb-4" 
                                onClick={() => {
                                    setSearchResults([]);
                                    setLastSearchQuery('');
                                }}
                            >
                                Back to Main Feed
                            </Button>
                        </Col>
                    </Row>
                    <Row>
                        {searchResults.map((article) => (
                            <Col key={article.id} md="6" lg="4" className="mb-4">
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
                        ))}
                    </Row>
                </>
            )}
            
            {/* No search results message */}
            {showNoResultsMessage && !isSearching && searchResults.length === 0 && (
                <Row className="mb-4">
                    <Col>
                        <div className="alert alert-info" role="alert">
                            <h4 className="alert-heading">No results found</h4>
                            <p>We couldn't find any articles matching "{lastSearchQuery}". Please try a different search term.</p>
                        </div>
                    </Col>
                </Row>
            )}

            {/* Only show category filters and regular content when there are no search results */}
            {!searchResults.length && (
                <>
                    {/* Category Filter */}
                    <Row className="mb-4">
                        <Col md="8">
                            <ButtonGroup className="flex-wrap">
                                {categories.map(category => (
                                    <Button
                                        key={category}
                                        color={activeCategory === category ? "primary" : "secondary"}
                                        outline={activeCategory !== category}
                                        onClick={() => setActiveCategory(category)}
                                        className="me-2 mb-2"
                                    >
                                        {category}
                                    </Button>
                                ))}
                            </ButtonGroup>
                        </Col>
                        <Col md="4" className="text-md-end mt-3 mt-md-0">
                            <Button
                                color="primary"
                                outline
                                onClick={toggleSortOrder}
                                className="d-flex align-items-center ms-auto"
                            >
                                {sortOrder === 'newest'
                                    ? <FaSortAmountDown className="me-2" />
                                    : <FaSortAmountUp className="me-2" />}
                                Sort by: {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
                            </Button>
                        </Col>
                    </Row>

                    <Row className="mb-4">
                        <Col>
                            <h2 className="mb-3">
                                {activeCategory === 'All' ? 'Personalized Recommendations' : `${activeCategory} News`}
                            </h2>
                        </Col>
                    </Row>

                    {loading ? (
                        <Row className="text-center py-5">
                            <Col>
                                <Spinner color="primary" />
                                <p className="mt-3">Loading articles...</p>
                            </Col>
                        </Row>
                    ) : error ? (
                        <Row className="py-5">
                            <Col className="text-center">
                                <Card body>
                                    <CardText className="text-danger mb-3">{error}</CardText>
                                    <Button color="primary" onClick={() => window.location.reload()}>
                                        Retry
                                    </Button>
                                </Card>
                            </Col>
                        </Row>
                    ) : loadingFavorites ? (
                        <Row>
                            {currentArticles.map(article => (
                                <Col key={article.id} md="6" lg="4" className="mb-4">
                                    <div className="position-relative">
                                        <ArticleCard
                                            article={article}
                                            favoriteArticles={[]}
                                            onFavoriteChange={handleFavoriteChange}
                                        />
                                        {/* Small loading indicator for bookmark status */}
                                        <div className="position-absolute top-0 end-0 mt-3 me-3">
                                            <Spinner size="sm" color="primary" />
                                        </div>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <Row>
                            {currentArticles.map(article => (
                                <Col key={article.id} md="6" lg="4" className="mb-4">
                                    <ArticleCard
                                        article={article}
                                        favoriteArticles={favoriteArticles}
                                        onFavoriteChange={handleFavoriteChange}
                                    />
                                </Col>
                            ))}
                        </Row>
                    )}

                    {!loading && !error && filteredArticles.length === 0 && (
                        <Row className="py-5">
                            <Col className="text-center">
                                <Card body>
                                    <CardText className="mb-3">No articles found in this category.</CardText>
                                    <Button
                                        color="primary"
                                        onClick={() => setActiveCategory('All')}
                                    >
                                        View All Articles
                                    </Button>
                                </Card>
                            </Col>
                        </Row>
                    )}

                    {/* Load More button - only show if there are more articles to load */}
                    {!loading && !error && currentArticles.length > 0 && currentArticles.length < filteredArticles.length && (
                        <Row className="mt-4 mb-5">
                            <Col className="text-center">
                                <Button color="primary" onClick={loadMoreArticles}>
                                    Load More Articles
                                </Button>
                            </Col>
                        </Row>
                    )}
                </>
            )}
            
            {/* Search in progress indicator */}
            {isSearching && (
                <div className="text-center mt-4">
                    <Spinner color="primary" />
                    <p>Searching for articles...</p>
                </div>
            )}
        </Container>
    );
}

export default HomePage;