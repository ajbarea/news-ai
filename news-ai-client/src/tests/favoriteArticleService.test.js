import '@testing-library/jest-dom';
import FavoriteArticleService from '../services/favoriteArticleService';
import { apiClient } from '../services/authService';

// Mock the apiClient
jest.mock('../services/authService', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

describe('FavoriteArticleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getFavoriteArticles', () => {
    test('returns favorite articles when request is successful', async () => {
      const mockArticles = [
        { id: 1, title: 'Favorite Article 1' },
        { id: 2, title: 'Favorite Article 2' }
      ];
      
      apiClient.get.mockResolvedValue({ data: mockArticles });
      
      const result = await FavoriteArticleService.getFavoriteArticles();
      
      expect(apiClient.get).toHaveBeenCalledWith('/users/me/favorite-articles');
      expect(result).toEqual(mockArticles);
    });

    test('throws error when request fails', async () => {
      apiClient.get.mockRejectedValue(new Error('Unauthorized'));
      
      await expect(FavoriteArticleService.getFavoriteArticles()).rejects.toThrow('Unauthorized');
    });
  });

  describe('addToFavorites', () => {
    test('adds article to favorites when request is successful', async () => {
      const mockResponse = { id: 123, title: 'Test Article' };
      apiClient.post.mockResolvedValue({ data: mockResponse });
      
      const result = await FavoriteArticleService.addToFavorites(123);
      
      expect(apiClient.post).toHaveBeenCalledWith('/users/me/favorite-articles', {
        article_id: 123
      });
      expect(result).toEqual(mockResponse);
    });

    test('throws error when request fails', async () => {
      apiClient.post.mockRejectedValue(new Error('Article already favorited'));
      
      await expect(FavoriteArticleService.addToFavorites(123)).rejects.toThrow('Article already favorited');
    });
  });

  describe('removeFromFavorites', () => {
    test('removes article from favorites when request is successful', async () => {
      apiClient.delete.mockResolvedValue({});
      
      const result = await FavoriteArticleService.removeFromFavorites(123);
      
      expect(apiClient.delete).toHaveBeenCalledWith('/users/me/favorite-articles/123');
      expect(result).toBe(true);
    });

    test('throws error when request fails', async () => {
      apiClient.delete.mockRejectedValue(new Error('Article not found'));
      
      await expect(FavoriteArticleService.removeFromFavorites(999)).rejects.toThrow('Article not found');
    });
  });

  describe('isArticleFavorited', () => {
    test('returns true when article is in favorites', () => {
      const favoriteArticles = [
        { id: 123, title: 'Favorite Article' },
        { id: 456, title: 'Another Favorite' }
      ];
      
      const result = FavoriteArticleService.isArticleFavorited(favoriteArticles, 123);
      
      expect(result).toBe(true);
    });

    test('returns false when article is not in favorites', () => {
      const favoriteArticles = [
        { id: 456, title: 'Another Favorite' }
      ];
      
      const result = FavoriteArticleService.isArticleFavorited(favoriteArticles, 123);
      
      expect(result).toBe(false);
    });

    test('returns false with empty favorites array', () => {
      const result = FavoriteArticleService.isArticleFavorited([], 123);
      
      expect(result).toBe(false);
    });
  });
});
