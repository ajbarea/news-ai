import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, CardBody, CardTitle, CardText, Input, Button, InputGroup, Spinner } from 'reactstrap';
import axios from 'axios';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const loadingRef = useRef(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('Fetching categories...');
        setLoading(true);
        loadingRef.current = true;
        // Add a timeout to the request to prevent it from hanging
        const response = await axios.get('http://localhost:8000/categories', {
          timeout: 10000 // 10 seconds timeout
        });
        console.log('Categories data received:', response.data);

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
      <Row className="mb-4">
        <Col>
          <h1 className="mb-3">News Categories</h1>
          <p className="text-muted">Browse news articles by your favorite categories</p>
        </Col>
      </Row>
      <Row>
        {categories.map((category) => (
          <Col key={category.id} md="6" lg="4" xl="3" className="mb-4">
            <Card
              tag={Link}
              to={`/category/${category.id}`}
              className={`h-100 ${getCardColorClass(category.color)}`}
              style={{ textDecoration: 'none', borderWidth: '2px' }}
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
                />
                <Button color="primary">Search</Button>
              </InputGroup>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Categories;
