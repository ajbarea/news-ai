import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchBar from '../components/SearchBar';

// Mock props and functions
const mockOnSearch = jest.fn();

describe('SearchBar Component', () => {
    beforeEach(() => {
        mockOnSearch.mockReset();
        render(<SearchBar onSearch={mockOnSearch} />);
    });

    test('renders search input field', () => {
        const searchInput = screen.getByPlaceholderText('Search for news...');
        expect(searchInput).toBeInTheDocument();
    });

    test('allows typing in the search field', () => {
        const searchInput = screen.getByPlaceholderText('Search for news...');
        fireEvent.change(searchInput, { target: { value: 'technology' } });
        expect(searchInput.value).toBe('technology');
    });

    test('calls onSearch function when form is submitted', () => {
        const searchInput = screen.getByPlaceholderText('Search for news...');
        const searchForm = searchInput.closest('form');
        
        fireEvent.change(searchInput, { target: { value: 'climate change' } });
        fireEvent.submit(searchForm);
        
        expect(mockOnSearch).toHaveBeenCalledWith('climate change');
    });

    test('calls onSearch when search button is clicked', () => {
        const searchInput = screen.getByPlaceholderText('Search for news...');
        const searchButton = screen.getByRole('button', { name: /search/i });
        
        fireEvent.change(searchInput, { target: { value: 'sports' } });
        fireEvent.click(searchButton);
        
        expect(mockOnSearch).toHaveBeenCalledWith('sports');
    });
});
