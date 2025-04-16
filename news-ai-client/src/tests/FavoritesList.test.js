import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FavoritesList from '../components/FavoritesList';

// Mock favorites service
const mockGetFavorites = jest.fn();
const mockRemoveFavorite = jest.fn();

jest.mock('../services/favoritesService', () => ({
  getFavorites: () => mockGetFavorites(),
  removeFavorite: (...args) => mockRemoveFavorite(...args)
}));

describe('FavoritesList Component', () => {
  const mockFavorites = [
    {
      id: 'fav1',
      title: 'Favorite Article 1',
      description: 'Description of favorite article 1',
      url: 'http://example.com/article1',
      publishedAt: '2023-11-19T10:00:00Z',
      source: { name: 'Test Source' }
    },
    {
      id: 'fav2',
      title: 'Favorite Article 2',
      description: 'Description of favorite article 2',
      url: 'http://example.com/article2',
      publishedAt: '2023-11-18T10:00:00Z',
      source: { name: 'Another Source' }
    }
  ];

  beforeEach(() => {
    mockGetFavorites.mockReset();
    mockRemoveFavorite.mockReset();
    mockGetFavorites.mockReturnValue(mockFavorites);
  });

  test('displays list of favorite articles', () => {
    render(<FavoritesList />);
    
    expect(screen.getByText('Favorite Article 1')).toBeInTheDocument();
    expect(screen.getByText('Favorite Article 2')).toBeInTheDocument();
    expect(screen.getByText('Description of favorite article 1')).toBeInTheDocument();
    expect(screen.getByText('Description of favorite article 2')).toBeInTheDocument();
  });

  test('displays empty state when no favorites', () => {
    mockGetFavorites.mockReturnValue([]);
    
    render(<FavoritesList />);
    
    expect(screen.getByText(/no favorite articles/i)).toBeInTheDocument();
  });

  test('allows removing a favorite article', () => {
    render(<FavoritesList />);
    
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    fireEvent.click(removeButtons[0]); // Remove the first article
    
    expect(mockRemoveFavorite).toHaveBeenCalledWith('fav1');
  });
});
