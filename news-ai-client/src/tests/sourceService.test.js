import '@testing-library/jest-dom';
import SourceService from '../services/sourceService';
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

describe('SourceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllSources', () => {
    test('returns all sources when request is successful', async () => {
      const mockSources = [
        { id: 1, name: 'CNN' },
        { id: 2, name: 'BBC' }
      ];
      
      apiClient.get.mockResolvedValue({ data: mockSources });
      
      const result = await SourceService.getAllSources();
      
      expect(apiClient.get).toHaveBeenCalledWith('/sources');
      expect(result).toEqual(mockSources);
    });

    test('throws error when request fails', async () => {
      apiClient.get.mockRejectedValue(new Error('Network error'));
      
      await expect(SourceService.getAllSources()).rejects.toThrow('Network error');
    });
  });

  describe('getBlacklistedSources', () => {
    test('returns blacklisted sources when request is successful', async () => {
      const mockSources = [{ id: 3, name: 'Tabloid News' }];
      
      apiClient.get.mockResolvedValue({ data: mockSources });
      
      const result = await SourceService.getBlacklistedSources();
      
      expect(apiClient.get).toHaveBeenCalledWith('/users/me/blacklisted-sources');
      expect(result).toEqual(mockSources);
    });

    test('throws error when request fails', async () => {
      apiClient.get.mockRejectedValue(new Error('Unauthorized'));
      
      await expect(SourceService.getBlacklistedSources()).rejects.toThrow('Unauthorized');
    });
  });

  describe('addToBlacklist', () => {
    test('adds source to blacklist when request is successful', async () => {
      const mockResponse = { id: 2, name: 'BBC' };
      
      apiClient.post.mockResolvedValue({ data: mockResponse });
      
      const result = await SourceService.addToBlacklist(2);
      
      expect(apiClient.post).toHaveBeenCalledWith('/users/me/blacklisted-sources', {
        source_id: 2
      });
      expect(result).toEqual(mockResponse);
    });

    test('throws error when request fails', async () => {
      apiClient.post.mockRejectedValue(new Error('Source already blacklisted'));
      
      await expect(SourceService.addToBlacklist(2)).rejects.toThrow('Source already blacklisted');
    });
  });

  describe('removeFromBlacklist', () => {
    test('removes source from blacklist when request is successful', async () => {
      apiClient.delete.mockResolvedValue({});
      
      const result = await SourceService.removeFromBlacklist(3);
      
      expect(apiClient.delete).toHaveBeenCalledWith('/users/me/blacklisted-sources/3');
      expect(result).toBe(true);
    });

    test('throws error when request fails', async () => {
      apiClient.delete.mockRejectedValue(new Error('Source not found in blacklist'));
      
      await expect(SourceService.removeFromBlacklist(999)).rejects.toThrow('Source not found in blacklist');
    });
  });
});
