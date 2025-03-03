import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, CardBody, CardTitle, CardText, Button } from 'reactstrap';

function NotFound() {
    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card className="border-danger shadow-sm">
                        <CardBody className="text-center">
                            <div className="display-1 text-danger mb-4">404</div>
                            <CardTitle tag="h1" className="mb-4">Page Not Found</CardTitle>
                            <CardText className="lead mb-4">
                                The page you're looking for does not exist or has been moved.
                            </CardText>
                            <Button color="primary" tag={Link} to="/" size="lg">
                                Return to Homepage
                            </Button>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default NotFound;
