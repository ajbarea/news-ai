import React from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, CardText } from 'reactstrap';

function About() {
    return (
        <Container className="py-3">
            <Row>
                <Col>
                    <Card className="border-0">
                        <CardBody>
                            <CardTitle tag="h1" className="display-4 mb-4">About News-AI</CardTitle>
                            <CardText className="lead">
                                News-AI is a modern platform that gathers and showcases the latest news articles using artificial intelligence to provide personalized content recommendations.
                            </CardText>

                            <CardText className="mt-4">
                                Our mission is to keep users informed with high-quality, relevant news content from trusted sources around the world.
                                By leveraging cutting-edge AI technology, we analyze reading patterns and preferences to deliver a tailored news experience.
                            </CardText>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default About;
