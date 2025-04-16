import '@testing-library/jest-dom';
import UserPreferenceService from '../services/userPreferenceService';
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

describe('UserPreferenceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserPreferences', () => {
    test('returns user preferences when request is successful', async () => {
      // Mock both endpoints needed for getUserPreferences
      // First, mock the /users/me endpoint to return a user with ID 123
      apiClient.get.mockImplementation(url => {
        if (url === '/users/me') {
          return Promise.resolve({ data: { id: 123, username: 'testuser' } });
        } else if (url === '/users/123/preferences') {
          return Promise.resolve({
            data: [
              { id: 1, category_id: 1, category: { id: 1, name: 'Technology' }, score: 10, blacklisted: false },
              { id: 2, category_id: 2, category: { id: 2, name: 'Sports' }, score: 5, blacklisted: true }
            ]
          });
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });

      const result = await UserPreferenceService.getUserPreferences();
      
      expect(apiClient.get).toHaveBeenCalledTimes(2);
      expect(apiClient.get).toHaveBeenCalledWith('/users/me');
      expect(apiClient.get).toHaveBeenCalledWith('/users/123/preferences');
      expect(result).toHaveLength(2);
      expect(result[0].category.name).toBe('Technology');
      expect(result[1].category.name).toBe('Sports');
    });

    test('throws error when authentication fails', async () => {
      apiClient.get.mockImplementation(url => {
        if (url === '/users/me') {
          return Promise.reject({ response: { status: 401 } });
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });
      
      await expect(UserPreferenceService.getUserPreferences()).rejects.toThrow('Authentication required');
    });

    test('throws error when user ID is not found', async () => {
      apiClient.get.mockImplementation(url => {
        if (url === '/users/me') {
          return Promise.resolve({ data: { username: 'testuser' } }); // Missing ID
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });
      
      await expect(UserPreferenceService.getUserPreferences()).rejects.toThrow('Could not determine user ID');
    });
  });

  describe('updateCategoryPreference', () => {
    test('updates category preference when request is successful', async () => {
      const categoryData = { blacklisted: true };
      const mockResponse = { id: 5, ...categoryData };
      
      apiClient.put.mockResolvedValueOnce({ data: mockResponse });
      
      const result = await UserPreferenceService.updateCategoryPreference(5, categoryData);
      
      expect(apiClient.put).toHaveBeenCalledWith('/users/me/preferences/5', categoryData);
      expect(result).toEqual(mockResponse);
    });

    test('throws error when request fails', async () => {
      const categoryData = { blacklisted: true };
      
      apiClient.put.mockRejectedValueOnce(new Error('Invalid preferences'));
      
      await expect(UserPreferenceService.updateCategoryPreference(5, categoryData)).rejects.toThrow('Invalid preferences');
    });
  });

  describe('getBlacklistedCategories', () => {
    test('returns blacklisted categories when request is successful', async () => {
      // Mock endpoints needed for getBlacklistedCategories which calls getUserPreferences
      apiClient.get.mockImplementation(url => {
        if (url === '/users/me') {
          return Promise.resolve({ data: { id: 123, username: 'testuser' } });
        } else if (url === '/users/123/preferences') {
          return Promise.resolve({
            data: [
              { id: 1, category_id: 1, category: { id: 1, name: 'Technology' }, score: 10, blacklisted: false },
              { id: 2, category_id: 2, category: { id: 2, name: 'Sports' }, score: 5, blacklisted: true },
              { id: 3, category_id: 3, category: { id: 3, name: 'Politics' }, score: 2, blacklisted: true }
            ]
          });
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });

      const result = await UserPreferenceService.getBlacklistedCategories();
      
      expect(result).toHaveLength(2);
      expect(result[0].category.name).toBe('Sports');
      expect(result[1].category.name).toBe('Politics');
      expect(result.every(pref => pref.blacklisted === true)).toBe(true);
    });

    test('throws error when request fails', async () => {
      apiClient.get.mockRejectedValueOnce(new Error('Server error'));
      
      await expect(UserPreferenceService.getBlacklistedCategories()).rejects.toThrow('Server error');
    });
  });

  describe('getAllCategories', () => {
    test('returns all categories when request is successful', async () => {
      const mockCategories = [
        { id: 1, name: 'Politics' },
        { id: 2, name: 'Sports' },
        { id: 3, name: 'Technology' }
      ];
      
      apiClient.get.mockResolvedValueOnce({ data: mockCategories });
      
      const result = await UserPreferenceService.getAllCategories();
      
      expect(apiClient.get).toHaveBeenCalledWith('/categories');
      expect(result).toEqual(mockCategories);
    });

    test('throws error when request fails', async () => {
      apiClient.get.mockRejectedValueOnce(new Error('Server error'));
      
      await expect(UserPreferenceService.getAllCategories()).rejects.toThrow('Server error');
    });
  });

  describe('blacklistCategory', () => {
    test('blacklists category with numeric ID when request is successful', async () => {
      const categoryId = 5;
      const mockResponse = { id: 5, blacklisted: true };
      
      apiClient.put.mockResolvedValueOnce({ data: mockResponse });
      
      const result = await UserPreferenceService.blacklistCategory(categoryId);
      
      expect(apiClient.put).toHaveBeenCalledWith('/users/me/preferences/5', { blacklisted: true });
      expect(result).toEqual(mockResponse);
    });

    test('blacklists category with string name when request is successful', async () => {
      // Need to mock getAllCategories first to resolve the category name
      const mockCategories = [
        { id: 5, name: 'Entertainment' }
      ];
      
      apiClient.get.mockResolvedValueOnce({ data: mockCategories });
      
      const mockResponse = { id: 5, blacklisted: true };
      apiClient.put.mockResolvedValueOnce({ data: mockResponse });
      
      const result = await UserPreferenceService.blacklistCategory('Entertainment');
      
      expect(apiClient.get).toHaveBeenCalledWith('/categories');
      expect(apiClient.put).toHaveBeenCalledWith('/users/me/preferences/5', { blacklisted: true });
      expect(result).toEqual(mockResponse);
    });

    test('throws error when request fails', async () => {
      apiClient.put.mockRejectedValueOnce(new Error('Category already blacklisted'));
      
      await expect(UserPreferenceService.blacklistCategory(5)).rejects.toThrow('Category already blacklisted');
    });
  });
});
