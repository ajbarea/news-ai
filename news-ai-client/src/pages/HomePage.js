import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Card, CardText, Spinner } from 'reactstrap';
import { FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { apiClient } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import FavoriteArticleService from '../services/favoriteArticleService';
import UserPreferenceService from '../services/userPreferenceService';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import ArticleGrid from '../components/ArticleGrid';
import { performSearch, formatArticle, sortArticlesByDate } from '../utils/searchUtils';

function HomePage() {
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState(['All']);
    const [blockedCategories, setBlockedCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('All');
    const [visibleArticles, setVisibleArticles] = useState(9);
    const articlesPerPage = 6;
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

    // Fetch user's blocked categories if authenticated
    useEffect(() => {
        const fetchBlockedCategories = async () => {
            if (!isAuthenticated()) {
                setBlockedCategories([]);
                return;
            }

            try {
                const blacklistedCategories = await UserPreferenceService.getBlacklistedCategories();
                // Extract just the category names from the preferences data
                const blockedCategoryNames = blacklistedCategories.map(pref => {
                    // The API might return category objects or just the category name
                    return pref.category?.name || pref.name || '';
                }).filter(name => name !== '');
                
                setBlockedCategories(blockedCategoryNames);
            } catch (err) {
                console.error('Error fetching blocked categories:', err);
                setBlockedCategories([]);
            }
        };

        fetchBlockedCategories();
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

    // Format and filter articles
    const formattedArticles = articles.map(formatArticle);
    const formattedSearchResults = searchResults.map(formatArticle);
    
    // Filter search results to exclude blocked categories
    const filteredFormattedSearchResults = formattedSearchResults.filter(article => 
        !blockedCategories.includes(article.category)
    );

    // Filter regular articles based on selected category
    const filteredArticles = activeCategory === 'All'
        ? formattedArticles
        : formattedArticles.filter(article => article.category === activeCategory);

    // Filter search results based on selected category
    const filteredSearchResults = activeCategory === 'All'
        ? filteredFormattedSearchResults
        : filteredFormattedSearchResults.filter(article => article.category === activeCategory);

    // Sort searched articles by date
    const sortedSearchResults = sortArticlesByDate(filteredSearchResults, sortOrder);

    // Get only the articles that should be visible in recommended ordering
    const currentArticles = filteredArticles.slice(0, visibleArticles);

    // Load more articles function
    const loadMoreArticles = () => {
        setVisibleArticles(prev => prev + articlesPerPage);
    };

    // Toggle sort order function
    const toggleSortOrder = () => {
        setSortOrder(prevOrder => prevOrder === 'newest' ? 'oldest' : 'newest');
    };

    // Filter out blocked categories
    const filteredCategories = categories.filter(category => 
        category === 'All' || !blockedCategories.includes(category)
    );

    // Reset visible articles when changing category or sort order
    useEffect(() => {
        setVisibleArticles(9);
    }, [activeCategory, sortOrder]);

    // Clean up timeout on unmount
    useEffect(() => {
        // Store the current timeout ID in a variable inside the effect
        const timeoutId = noResultsTimeoutRef.current;
        
        return () => {
            // Use the variable in cleanup, not the ref directly
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, []);
    
    // Handle search functionality using our utility function
    const handleSearch = () => {
        performSearch(
            searchQuery,
            setIsSearching,
            setSearchError,
            setSearchResults,
            setShowNoResultsMessage,
            setLastSearchQuery,
            setSearchQuery,
            noResultsTimeoutRef
        );
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Render sort button
    const renderSortButton = () => (
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
    );

    // Render no results message
    const renderNoArticlesMessage = (category) => (
        <Row className="py-5">
            <Col className="text-center">
                <Card body>
                    <CardText className="mb-3">No articles found{category !== 'All' ? ` in the ${category} category` : ''}.</CardText>
                    <Button
                        color="primary"
                        onClick={() => setActiveCategory('All')}
                    >
                        View All Articles
                    </Button>
                </Card>
            </Col>
        </Row>
    );

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
                    <SearchBar
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        handleSearch={handleSearch}
                        handleKeyPress={handleKeyPress}
                        isSearching={isSearching}
                        searchError={searchError}
                    />
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

                    {/* Category Filter for Search Results */}
                    <Row className="mb-4">
                        <Col md="8">
                            <CategoryFilter 
                                categories={filteredCategories}
                                activeCategory={activeCategory}
                                setActiveCategory={setActiveCategory}
                            />
                        </Col>
                        <Col md="4" className="text-md-end mt-3 mt-md-0">
                            {renderSortButton()}
                        </Col>
                    </Row>

                    {filteredSearchResults.length > 0 ? (
                        <ArticleGrid 
                            articles={sortedSearchResults}
                            favoriteArticles={favoriteArticles}
                            onFavoriteChange={handleFavoriteChange}
                        />
                    ) : (
                        renderNoArticlesMessage(activeCategory)
                    )}
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
                            <CategoryFilter 
                                categories={filteredCategories}
                                activeCategory={activeCategory}
                                setActiveCategory={setActiveCategory}
                            />
                        </Col>
                        <Col md="4" className="text-md-end mt-3 mt-md-0">
                            {renderSortButton()}
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
                        <ArticleGrid 
                            articles={currentArticles}
                            favoriteArticles={[]} // Empty while loading
                            onFavoriteChange={handleFavoriteChange}
                        />
                    ) : (
                        <ArticleGrid 
                            articles={currentArticles}
                            favoriteArticles={favoriteArticles}
                            onFavoriteChange={handleFavoriteChange}
                        />
                    )}

                    {!loading && !error && filteredArticles.length === 0 && (
                        renderNoArticlesMessage(activeCategory)
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