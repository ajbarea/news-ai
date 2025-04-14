import '@testing-library/jest-dom';
import AudioService from '../services/audioService';
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

describe('AudioService', () => {
  let mockAudioElement;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Audio element
    mockAudioElement = {
      src: '',
      play: jest.fn(),
      pause: jest.fn(),
      addEventListener: jest.fn()
    };
    global.URL.createObjectURL = jest.fn();
    global.Audio = jest.fn(() => mockAudioElement);
  });

  describe('getArticleAudio', () => {
    test('returns audio data when request is successful', async () => {
      const mockAudioBlob = new Blob(['audio data'], { type: 'audio/mpeg' });
      apiClient.get.mockResolvedValue({ data: mockAudioBlob });

      const result = await AudioService.getArticleAudio(123);
      
      expect(apiClient.get).toHaveBeenCalledWith('/articles/123/audio', {
        responseType: 'blob'
      });
      expect(result).toEqual(mockAudioBlob);
    });

    test('throws error when request fails', async () => {
      apiClient.get.mockRejectedValue(new Error('Audio not found'));
      
      await expect(AudioService.getArticleAudio(999)).rejects.toThrow('Audio not found');
    });
  });

  describe('generateArticleAudio', () => {
    test('generates audio with default language', async () => {
      const mockResponse = { status: 'success' };
      apiClient.post.mockResolvedValue({ data: mockResponse });

      const result = await AudioService.generateArticleAudio(123);
      
      expect(apiClient.post).toHaveBeenCalledWith('/articles/123/audio', {}, {
        params: { language: 'en', force_regenerate: true }
      });
      expect(result).toEqual(mockResponse);
    });

    test('generates audio with specified language', async () => {
      const mockResponse = { status: 'success' };
      apiClient.post.mockResolvedValue({ data: mockResponse });

      const result = await AudioService.generateArticleAudio(123, 'fr');
      
      expect(apiClient.post).toHaveBeenCalledWith('/articles/123/audio', {}, {
        params: { language: 'fr', force_regenerate: true }
      });
      expect(result).toEqual(mockResponse);
    });

    test('throws error when request fails', async () => {
      apiClient.post.mockRejectedValue(new Error('Generation failed'));
      
      await expect(AudioService.generateArticleAudio(123)).rejects.toThrow('Generation failed');
    });
  });

  describe('cancelAudioGeneration', () => {
    test('cancels audio generation when request is successful', async () => {
      const mockResponse = { status: 'cancelled' };
      apiClient.post.mockResolvedValue({ data: mockResponse });

      const result = await AudioService.cancelAudioGeneration(123);
      
      expect(apiClient.post).toHaveBeenCalledWith('/articles/123/audio/cancel');
      expect(result).toEqual(mockResponse);
    });

    test('throws error when request fails', async () => {
      apiClient.post.mockRejectedValue(new Error('Cannot cancel'));
      
      await expect(AudioService.cancelAudioGeneration(123)).rejects.toThrow('Cannot cancel');
    });
  });

  describe('playAudio', () => {
    test('plays audio from blob', () => {
      const audioBlob = new Blob(['audio data'], { type: 'audio/mpeg' });
      URL.createObjectURL.mockReturnValue('blob:http://example.com/audio');

      const result = AudioService.playAudio(audioBlob);
      
      expect(URL.createObjectURL).toHaveBeenCalledWith(audioBlob);
      expect(mockAudioElement.src).toBe('blob:http://example.com/audio');
      expect(mockAudioElement.play).toHaveBeenCalled();
      expect(result).toBe(mockAudioElement);
    });
  });
});
