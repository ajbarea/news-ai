import '@testing-library/jest-dom';
import favoritesService from '../services/favoritesService';

// Mock localStorage
let mockLocalStorage = {};

beforeEach(() => {
  mockLocalStorage = {};
  
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(key => mockLocalStorage[key] || null),
      setItem: jest.fn((key, value) => {
        mockLocalStorage[key] = value.toString();
      }),
      removeItem: jest.fn(key => {
        delete mockLocalStorage[key];
      })
    },
    writable: true
  });
});

describe('Favorites Service', () => {
  test('getFavorites returns empty array when no favorites exist', () => {
    const favorites = favoritesService.getFavorites();
    expect(Array.isArray(favorites)).toBe(true);
    expect(favorites).toHaveLength(0);
    expect(localStorage.getItem).toHaveBeenCalledWith('favorites');
  });

  test('getFavorites returns array of favorites when they exist', () => {
    const mockFavorites = [
      { id: '1', title: 'Test Article 1' },
      { id: '2', title: 'Test Article 2' }
    ];
    mockLocalStorage['favorites'] = JSON.stringify(mockFavorites);
    
    const favorites = favoritesService.getFavorites();
    expect(Array.isArray(favorites)).toBe(true);
    expect(favorites).toHaveLength(2);
    expect(favorites[0].id).toBe('1');
    expect(favorites[1].title).toBe('Test Article 2');
  });

  test('addFavorite adds new article to favorites', () => {
    const newArticle = { id: '3', title: 'Test Article 3' };
    favoritesService.addFavorite(newArticle);
    
    expect(localStorage.setItem).toHaveBeenCalled();
    const storedFavorites = JSON.parse(mockLocalStorage['favorites']);
    expect(storedFavorites).toHaveLength(1);
    expect(storedFavorites[0].id).toBe('3');
  });

  test('addFavorite does not duplicate existing articles', () => {
    const article = { id: '3', title: 'Test Article 3' };
    mockLocalStorage['favorites'] = JSON.stringify([article]);
    
    favoritesService.addFavorite(article);
    
    const storedFavorites = JSON.parse(mockLocalStorage['favorites']);
    expect(storedFavorites).toHaveLength(1);
  });

  test('removeFavorite removes article from favorites', () => {
    const mockFavorites = [
      { id: '1', title: 'Test Article 1' },
      { id: '2', title: 'Test Article 2' }
    ];
    mockLocalStorage['favorites'] = JSON.stringify(mockFavorites);
    
    favoritesService.removeFavorite('1');
    
    const storedFavorites = JSON.parse(mockLocalStorage['favorites']);
    expect(storedFavorites).toHaveLength(1);
    expect(storedFavorites[0].id).toBe('2');
  });
});
