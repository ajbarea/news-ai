import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ArticleDetail from '../components/ArticleDetail';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useParams: () => ({ id: '12345' }),
  useNavigate: () => jest.fn()
}));

// Mock the NewsService
const mockGetArticleById = jest.fn();
jest.mock('../services/newsService', () => ({
  __esModule: true,
  default: {
    getArticleById: (...args) => mockGetArticleById(...args)
  }
}));

describe('ArticleDetail Component', () => {
  const mockArticle = {
    id: '12345',
    title: 'Test Article Title',
    content: 'This is the full content of the test article.',
    publishedAt: '2023-11-20T12:00:00Z',
    source: { name: 'Test Source' },
    urlToImage: 'http://example.com/image.jpg'
  };

  beforeEach(() => {
    mockGetArticleById.mockReset();
  });

  test('displays loading state initially', () => {
    mockGetArticleById.mockReturnValue(new Promise(() => {})); // Never resolves
    render(<ArticleDetail />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('displays article details when loaded', async () => {
    mockGetArticleById.mockResolvedValue(mockArticle);
    
    render(<ArticleDetail />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Article Title')).toBeInTheDocument();
      expect(screen.getByText('This is the full content of the test article.')).toBeInTheDocument();
      expect(screen.getByText(/Test Source/)).toBeInTheDocument();
      expect(screen.getByAltText('Test Article Title')).toHaveAttribute('src', 'http://example.com/image.jpg');
    });
  });

  test('displays error message when article fails to load', async () => {
    mockGetArticleById.mockRejectedValue(new Error('Failed to load article'));
    
    render(<ArticleDetail />);
    
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
