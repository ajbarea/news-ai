import React from 'react';
import { Container, Alert } from 'reactstrap';

function NotFound() {
    return (
        <Container className="mt-4">
            <Alert color="danger">
                <h1 className="mb-4">404 - Not Found</h1>
                <p>The page you're looking for does not exist.</p>
            </Alert>
        </Container>
    );
}

export default NotFound;
