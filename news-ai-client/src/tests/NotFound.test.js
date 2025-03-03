import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotFound from '../pages/NotFound';

// Mock the react-router-dom module
jest.mock('react-router-dom');

describe('NotFound Component', () => {
    beforeEach(() => {
        // Render the component before each test
        render(<NotFound />);
    });

    test('displays 404 title', () => {
        expect(screen.getByText('404')).toBeInTheDocument();
        expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    });

    test('displays error message', () => {
        expect(screen.getByText("The page you're looking for does not exist or has been moved.")).toBeInTheDocument();
    });

    test('contains link to homepage', () => {
        const homeLink = screen.getByText('Return to Homepage');
        expect(homeLink).toBeInTheDocument();
        expect(homeLink.closest('a')).toHaveAttribute('href', '/');
    });
});
