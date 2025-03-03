import React from 'react';
import { Spinner, Container } from 'reactstrap';

const LoadingSpinner = ({ message = 'Loading...' }) => (
    <Container className="d-flex justify-content-center align-items-center py-5 my-5">
        <Spinner color="primary" className="me-2" />
        <span>{message}</span>
    </Container>
);

export default LoadingSpinner;
