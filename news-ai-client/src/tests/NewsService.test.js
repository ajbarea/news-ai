import '@testing-library/jest-dom';

// Create mock functions for testing
const mockFetchTopHeadlines = jest.fn();
const mockSearchArticles = jest.fn();
const mockGetArticleById = jest.fn();
const mockGetCategories = jest.fn();

// Mock the NewsService module
jest.mock('../services/newsService', () => ({
  __esModule: true,
  default: {
    fetchTopHeadlines: (...args) => mockFetchTopHeadlines(...args),
    searchArticles: (...args) => mockSearchArticles(...args),
    getArticleById: (...args) => mockGetArticleById(...args),
    getCategories: (...args) => mockGetCategories(...args)
  }
}), { virtual: true });

describe('NewsService', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockFetchTopHeadlines.mockReset();
    mockSearchArticles.mockReset();
    mockGetArticleById.mockReset();
    mockGetCategories.mockReset();
  });

  test('fetchTopHeadlines returns articles when successful', async () => {
    const mockArticles = [
      { id: '1', title: 'First Article', url: 'http://example.com/1' },
      { id: '2', title: 'Second Article', url: 'http://example.com/2' }
    ];
    mockFetchTopHeadlines.mockResolvedValue(mockArticles);

    const NewsService = require('../services/newsService').default;
    const result = await NewsService.fetchTopHeadlines();

    expect(mockFetchTopHeadlines).toHaveBeenCalled();
    expect(result).toEqual(mockArticles);
  });

  test('searchArticles with query returns filtered articles', async () => {
    const mockArticles = [
      { id: '1', title: 'Tech News Article', url: 'http://example.com/tech' }
    ];
    mockSearchArticles.mockResolvedValue(mockArticles);

    const NewsService = require('../services/newsService').default;
    const result = await NewsService.searchArticles('tech');

    expect(mockSearchArticles).toHaveBeenCalledWith('tech');
    expect(result).toEqual(mockArticles);
  });

  test('getArticleById returns specific article', async () => {
    const mockArticle = { id: '123', title: 'Test Article', content: 'Test content' };
    mockGetArticleById.mockResolvedValue(mockArticle);

    const NewsService = require('../services/newsService').default;
    const result = await NewsService.getArticleById('123');

    expect(mockGetArticleById).toHaveBeenCalledWith('123');
    expect(result).toEqual(mockArticle);
  });
});
