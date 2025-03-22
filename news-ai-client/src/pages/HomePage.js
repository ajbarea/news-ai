import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, ButtonGroup, Card, CardText, Spinner } from 'reactstrap';
import { FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import ArticleCard from '../components/ArticleCard';
import { apiClient } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import FavoriteArticleService from '../services/favoriteArticleService';

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
        </Container>
    );
}

export default HomePage;