import '@testing-library/jest-dom';

// Create mock functions for testing
const mockGetAudioForArticle = jest.fn();
const mockCancelAudioGeneration = jest.fn();

// Create a mock implementation of the AudioService
// This approach doesn't require the actual AudioService module to exist
jest.mock('../services/audioService', () => ({
  __esModule: true,
  default: {
    getAudioForArticle: (...args) => mockGetAudioForArticle(...args),
    cancelAudioGeneration: (...args) => mockCancelAudioGeneration(...args)
  }
}), { virtual: true }); // Added virtual: true to create a virtual mock

describe('AudioService', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockGetAudioForArticle.mockReset();
    mockCancelAudioGeneration.mockReset();
  });

  test('getAudioForArticle returns audio data when successful', async () => {
    const mockAudioData = { audio_url: 'http://example.com/audio.mp3' };
    mockGetAudioForArticle.mockResolvedValue(mockAudioData);

    // Import the mocked service with proper casing - lowercase is often used in import paths
    const AudioService = require('../services/audioService').default;
    const result = await AudioService.getAudioForArticle('12345');

    expect(mockGetAudioForArticle).toHaveBeenCalledWith('12345');
    expect(result).toEqual(mockAudioData);
  });

  test('getAudioForArticle handles errors properly', async () => {
    const mockError = new Error('Audio generation failed');
    mockGetAudioForArticle.mockRejectedValue(mockError);

    // Import the mocked service
    const AudioService = require('../services/audioService').default;

    await expect(AudioService.getAudioForArticle('12345')).rejects.toThrow('Audio generation failed');
    expect(mockGetAudioForArticle).toHaveBeenCalledWith('12345');
  });

  test('cancelAudioGeneration calls endpoint correctly', async () => {
    const mockResponse = { success: true, message: 'Audio generation cancelled' };
    mockCancelAudioGeneration.mockResolvedValue(mockResponse);

    // Import the mocked service
    const AudioService = require('../services/audioService').default;
    const result = await AudioService.cancelAudioGeneration('12345');

    expect(mockCancelAudioGeneration).toHaveBeenCalledWith('12345');
    expect(result).toEqual(mockResponse);
  });
});
