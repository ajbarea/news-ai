import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, ButtonGroup, Card, CardText, Spinner } from 'reactstrap';
import axios from 'axios';
import ArticleCard from '../components/ArticleCard';

function HomePage() {
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState(['All']);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('All');

    // Fetch articles from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch both articles and categories in parallel
                const [articlesRes, categoriesRes] = await Promise.all([
                    axios.get('http://localhost:8000/articles'),
                    axios.get('http://localhost:8000/categories')
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

    // Filter articles based on selected category
    const filteredArticles = activeCategory === 'All'
        ? articles.map(formatArticle)
        : articles
            .filter(article => article.category.name === activeCategory)
            .map(formatArticle);

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
                <Col>
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
            ) : (
                <Row>
                    {filteredArticles.map(article => (
                        <Col key={article.id} md="6" lg="4" className="mb-4">
                            <ArticleCard article={article} />
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
        </Container>
    );
}

export default HomePage;