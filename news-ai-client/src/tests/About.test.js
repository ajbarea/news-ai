import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import About from '../pages/About';

describe('About Component', () => {
    beforeEach(() => {
        // Render the component before each test
        render(<About />);
    });

    test('displays the title correctly', () => {
        expect(screen.getByText('About News-AI')).toBeInTheDocument();
    });

    test('displays mission statement', () => {
        expect(screen.getByText(/Our mission is to keep users informed/)).toBeInTheDocument();
    });

    test('displays platform description', () => {
        expect(screen.getByText(/News-AI is a modern platform/)).toBeInTheDocument();
        expect(screen.getByText(/personalized content recommendations/)).toBeInTheDocument();
    });

    test('renders in a Container with proper structure', () => {
        // Verify the component structure includes Cards
        const cardBody = screen.getByText('About News-AI').closest('.card-body');
        expect(cardBody).toBeInTheDocument();
    });
});
