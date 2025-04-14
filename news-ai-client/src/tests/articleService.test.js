import '@testing-library/jest-dom';
import ArticleService from '../services/articleService';
import { apiClient } from '../services/authService';

// Mock the apiClient with all required methods
jest.mock('../services/authService', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

describe('ArticleService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getArticles', () => {
    test('returns articles when the request is successful', async () => {
      const mockArticles = [{ id: 1, title: 'Test Article' }];
      apiClient.get.mockResolvedValue({ data: mockArticles });

      const result = await ArticleService.getArticles();
      
      expect(apiClient.get).toHaveBeenCalledWith('/articles', { params: {} });
      expect(result).toEqual(mockArticles);
    });

    test('passes parameters correctly', async () => {
      const params = { category_id: 1, page: 2 };
      const mockArticles = [{ id: 1, title: 'Test Article' }];
      apiClient.get.mockResolvedValue({ data: mockArticles });

      const result = await ArticleService.getArticles(params);
      
      expect(apiClient.get).toHaveBeenCalledWith('/articles', { params });
      expect(result).toEqual(mockArticles);
    });

    test('throws error when the request fails', async () => {
      const error = new Error('Network error');
      apiClient.get.mockRejectedValue(error);
      
      await expect(ArticleService.getArticles()).rejects.toThrow('Network error');
    });
  });

  describe('getArticleById', () => {
    test('returns an article when the request is successful', async () => {
      const mockArticle = { id: 123, title: 'Test Article' };
      apiClient.get.mockResolvedValue({ data: mockArticle });

      const result = await ArticleService.getArticleById(123);
      
      expect(apiClient.get).toHaveBeenCalledWith('/articles/123');
      expect(result).toEqual(mockArticle);
    });

    test('throws error when the request fails', async () => {
      apiClient.get.mockRejectedValue(new Error('Not found'));
      
      await expect(ArticleService.getArticleById(999)).rejects.toThrow('Not found');
    });
  });

  describe('addToBlacklist', () => {
    test('blacklists an article when the request is successful', async () => {
      const mockResponse = { id: 123, title: 'Test Article' };
      apiClient.post.mockResolvedValue({ data: mockResponse });

      const result = await ArticleService.addToBlacklist(123);
      
      expect(apiClient.post).toHaveBeenCalledWith('/users/me/blacklisted-articles', {
        article_id: 123
      });
      expect(result).toEqual(mockResponse);
    });

    test('throws error when the request fails', async () => {
      apiClient.post.mockRejectedValue(new Error('Unauthorized'));
      
      await expect(ArticleService.addToBlacklist(123)).rejects.toThrow('Unauthorized');
    });
  });

  describe('removeFromBlacklist', () => {
    test('removes an article from blacklist when request is successful', async () => {
      apiClient.delete.mockResolvedValue({});

      const result = await ArticleService.removeFromBlacklist(123);
      
      expect(apiClient.delete).toHaveBeenCalledWith('/users/me/blacklisted-articles/123');
      expect(result).toBe(true);
    });

    test('throws error when the request fails', async () => {
      apiClient.delete.mockRejectedValue(new Error('Not found'));
      
      await expect(ArticleService.removeFromBlacklist(999)).rejects.toThrow('Not found');
    });
  });

  describe('getBlacklistedArticles', () => {
    test('returns blacklisted articles when request is successful', async () => {
      const mockArticles = [{ id: 123, title: 'Blacklisted Article' }];
      apiClient.get.mockResolvedValue({ data: mockArticles });

      const result = await ArticleService.getBlacklistedArticles();
      
      expect(apiClient.get).toHaveBeenCalledWith('/users/me/blacklisted-articles');
      expect(result).toEqual(mockArticles);
    });

    test('throws error when the request fails', async () => {
      apiClient.get.mockRejectedValue(new Error('Unauthorized'));
      
      await expect(ArticleService.getBlacklistedArticles()).rejects.toThrow('Unauthorized');
    });
  });

  describe('trackArticleRead', () => {
    test('tracks a read article when request is successful', async () => {
      const mockResponse = { success: true };
      apiClient.post.mockResolvedValue({ data: mockResponse });
      
      // Mock window.dispatchEvent
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
      
      const result = await ArticleService.trackArticleRead(123);
      
      expect(apiClient.post).toHaveBeenCalledWith('/articles/123/read');
      expect(result).toEqual(mockResponse);
      expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(CustomEvent));
      expect(dispatchEventSpy.mock.calls[0][0].type).toBe('userPreferencesChanged');
      
      dispatchEventSpy.mockRestore();
    });

    test('throws error when the request fails', async () => {
      apiClient.post.mockRejectedValue(new Error('Server error'));
      
      await expect(ArticleService.trackArticleRead(123)).rejects.toThrow('Server error');
    });
  });
});
