import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../pages/Home';

// Mock article data
const mockArticles = [
  { id: '1', title: 'Headline 1', url: 'http://example.com/1' },
  { id: '2', title: 'Headline 2', url: 'http://example.com/2' }
];

const mockSearchResults = [
  { id: '3', title: 'Article about climate', url: 'http://example.com/3' }
];

// Set up direct mocks for newsService functions
jest.mock('../services/newsService', () => ({
  fetchTopHeadlines: jest.fn(),
  searchArticles: jest.fn(),
  getArticleById: jest.fn(),
  getCategories: jest.fn()
}));

// Mock the SearchBar component
jest.mock('../components/SearchBar', () => {
  return function MockSearchBar({ onSearch }) {
    return (
      <div data-testid="search-bar">
        <input data-testid="search-input" />
        <button data-testid="search-button" onClick={() => onSearch('climate')}>
          Search
        </button>
      </div>
    );
  };
});

describe('Home Component', () => {
  // Import the mock to configure it within tests
  const newsService = require('../services/newsService');
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders the home component with title', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: 'Latest News' })).toBeInTheDocument();
  });
  
  test('fetches and displays headlines on initial render', async () => {
    // Setup the mock to immediately resolve with articles
    newsService.fetchTopHeadlines.mockResolvedValue(mockArticles);
    
    render(<Home />);
    
    // Check that fetchTopHeadlines was called
    expect(newsService.fetchTopHeadlines).toHaveBeenCalled();
    
    // Wait for the loading indicator to disappear and articles to appear
    await waitFor(() => {
      expect(screen.queryByText('Loading articles...')).not.toBeInTheDocument();
    });
    
    // Now check for headlines
    expect(screen.getByText('Headline 1')).toBeInTheDocument();
    expect(screen.getByText('Headline 2')).toBeInTheDocument();
    
    // Check links
    const links = screen.getAllByText('Read more');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', 'http://example.com/1');
  });
  
  test('handles search and updates articles', async () => {
    // Setup both mock implementations
    newsService.fetchTopHeadlines.mockResolvedValue(mockArticles);
    newsService.searchArticles.mockResolvedValue(mockSearchResults);
    
    render(<Home />);
    
    // Wait for the initial articles to load
    await waitFor(() => {
      expect(screen.getByText('Headline 1')).toBeInTheDocument();
    });
    
    // Click search button
    fireEvent.click(screen.getByTestId('search-button'));
    
    // Verify search was called with right param
    expect(newsService.searchArticles).toHaveBeenCalledWith('climate');
    
    // Wait for search results to appear
    await waitFor(() => {
      expect(screen.getByText('Article about climate')).toBeInTheDocument();
    });
    
    // Verify initial articles are no longer there
    expect(screen.queryByText('Headline 1')).not.toBeInTheDocument();
  });

  test('shows error message when API call fails', async () => {
    // Mock API failure
    newsService.fetchTopHeadlines.mockRejectedValue(new Error('API Error'));
    
    render(<Home />);
    
    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Error: Failed to load articles/i)).toBeInTheDocument();
    });
  });
});
