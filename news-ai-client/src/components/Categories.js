import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, CardBody, CardTitle, CardText, Input, Button, InputGroup } from 'reactstrap';

function Categories() {
  const categories = [
    { id: 'business', name: 'Business', count: 24, color: 'primary', icon: '💼' },
    { id: 'technology', name: 'Technology', count: 18, color: 'purple', icon: '💻' },
    { id: 'health', name: 'Health', count: 12, color: 'success', icon: '🏥' },
    { id: 'sports', name: 'Sports', count: 15, color: 'danger', icon: '🏈' },
    { id: 'entertainment', name: 'Entertainment', count: 21, color: 'warning', icon: '🎭' },
    { id: 'science', name: 'Science', count: 9, color: 'info', icon: '🔬' },
    { id: 'politics', name: 'Politics', count: 17, color: 'secondary', icon: '🏛️' },
    { id: 'environment', name: 'Environment', count: 11, color: 'success', icon: '🌍' },
  ];

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
                <span className="badge bg-light text-dark">{category.count} articles</span>
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
