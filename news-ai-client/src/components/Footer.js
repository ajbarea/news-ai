import React from 'react';
import { Container, Row, Col } from 'reactstrap';

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer mt-auto py-3 bg-light">
            <Container fluid>
                <Row>
                    <Col className="text-center text-md-start">
                        <span className="me-2" aria-label="News">📰</span>
                        NewsAI  • SWEN-732 • Group 3 • {currentYear}
                    </Col>
                </Row>
            </Container>
        </footer>
    );
}

export default Footer;
