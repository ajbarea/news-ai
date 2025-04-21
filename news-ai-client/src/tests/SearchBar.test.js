import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchBar from '../components/SearchBar';

// Mock props and functions
const mockProps = {
    searchQuery: '',
    setSearchQuery: jest.fn(),
    handleSearch: jest.fn(),
    handleKeyPress: jest.fn(),
    isSearching: false,
    searchError: null
};

describe('SearchBar Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        render(<SearchBar {...mockProps} />);
    });

    test('renders search input field', () => {
        const searchInput = screen.getByPlaceholderText('Search for any news topic...');
        expect(searchInput).toBeInTheDocument();
    });

    test('allows typing in the search field', () => {
        const searchInput = screen.getByPlaceholderText('Search for any news topic...');
        fireEvent.change(searchInput, { target: { value: 'technology' } });
        expect(mockProps.setSearchQuery).toHaveBeenCalled();
    });

    test('calls onSearch function when form is submitted', () => {
        const searchButton = screen.getByRole('button');
        fireEvent.click(searchButton);
        expect(mockProps.handleSearch).toHaveBeenCalled();
    });

    test('calls onSearch when search button is clicked', () => {
        const searchInput = screen.getByPlaceholderText('Search for any news topic...');
        const searchButton = screen.getByRole('button', { name: /search/i });
        
        fireEvent.change(searchInput, { target: { value: 'sports' } });
        fireEvent.click(searchButton);
        
        expect(mockProps.handleSearch).toHaveBeenCalled();
    });
});
