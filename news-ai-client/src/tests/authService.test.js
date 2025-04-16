import '@testing-library/jest-dom';
import AuthService, { apiClient as actualApiClient, API_URL } from '../services/authService';

// Mock axios before testing
jest.mock('axios', () => {
  const mockAxios = {
    create: jest.fn(() => mockAxios),
    defaults: { baseURL: '' },
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() }
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  };
  return mockAxios;
});

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Get axios mock for assertions
const axios = require('axios');

describe('Auth Service', () => {  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    test('successful login stores tokens and returns user', async () => {
      const username = 'testuser';
      const password = 'password';
      const mockResponse = { 
        data: { 
          access_token: 'test-token', 
          token_type: 'bearer',
          user: { id: 1, email: 'test@example.com' }
        } 
      };
      
      axios.post.mockResolvedValueOnce(mockResponse);
      
      const result = await AuthService.login(username, password);
      
      // Check form data content being sent - this is how the API expects the login data
      expect(axios.post).toHaveBeenCalledWith(`${API_URL}/token`, expect.any(FormData), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('access_token', 'test-token');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token_type', 'bearer');
      expect(result).toEqual(mockResponse.data);
    });
    
    test('failed login throws error', async () => {
      const username = 'testuser';
      const password = 'wrong';
      
      axios.post.mockRejectedValueOnce(new Error('Invalid credentials'));
      
      await expect(AuthService.login(username, password)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    test('successful registration returns user data', async () => {
      const username = 'testuser'; 
      const email = 'test@example.com';
      const password = 'password';
      const mockResponse = { 
        data: { id: 1, username: 'testuser', email: 'test@example.com' } 
      };
      
      axios.post.mockResolvedValueOnce(mockResponse);
      
      const result = await AuthService.register(username, email, password);
      
      expect(axios.post).toHaveBeenCalledWith('/register', {
        username,
        email,
        password
      });
      expect(result).toEqual(mockResponse);
    });
    
    test('failed registration throws error', async () => {
      const username = 'existinguser';
      const email = 'exists@example.com';
      const password = 'password';
      
      axios.post.mockRejectedValueOnce(new Error('Email already in use'));
      
      await expect(AuthService.register(username, email, password)).rejects.toThrow('Email already in use');
    });
  });

  describe('logout', () => {
    test('logout clears localStorage token', () => {
      AuthService.logout();
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('access_token');
    });
  });

  describe('refreshToken', () => {
    test('successful token refresh returns true', async () => {
      mockLocalStorage.getItem.mockReturnValueOnce('old-refresh-token');
      
      const mockResponse = { 
        data: { 
          access_token: 'new-access-token'
        } 
      };
      
      axios.post.mockResolvedValueOnce(mockResponse);
      
      const result = await AuthService.refreshToken();
      
      expect(axios.post).toHaveBeenCalledWith(`${API_URL}/token/refresh`, {
        refresh_token: 'old-refresh-token'
      });
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('access_token', 'new-access-token');
      expect(result).toBe(true);
    });
    
    test('returns false when token refresh fails', async () => {
      mockLocalStorage.getItem.mockReturnValueOnce('invalid-token');
      
      axios.post.mockRejectedValueOnce(new Error('Invalid refresh token'));
      
      const result = await AuthService.refreshToken();
      expect(result).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    test('returns current user data when request is successful', async () => {
      const mockUserData = { id: 1, username: 'testuser', email: 'test@example.com' };
      axios.get.mockResolvedValueOnce({ data: mockUserData });
      
      const result = await AuthService.getCurrentUser();
      
      expect(axios.get).toHaveBeenCalledWith('/users/me');
      expect(result).toEqual({ data: mockUserData });
    });
    
    test('throws error when request fails', async () => {
      axios.get.mockRejectedValueOnce(new Error('Unauthorized'));
      
      await expect(AuthService.getCurrentUser()).rejects.toThrow('Unauthorized');
    });
  });

  describe('updateProfile', () => {
    test('successful profile update returns updated user data', async () => {
      const userData = { name: 'Updated Name', email: 'updated@example.com' };
      
      const mockResponse = { 
        data: { id: 1, name: 'Updated Name', email: 'updated@example.com' } 
      };
      
      axios.put.mockResolvedValueOnce(mockResponse);
      
      const result = await AuthService.updateProfile(userData);
      
      expect(axios.put).toHaveBeenCalledWith('/users/me', userData);
      expect(result).toEqual(mockResponse);
    });
    
    test('failed profile update throws error', async () => {
      const userData = { email: 'taken@example.com' };
      
      axios.put.mockRejectedValueOnce(new Error('Email already in use'));
      
      await expect(AuthService.updateProfile(userData)).rejects.toThrow('Email already in use');
    });
  });

  describe('isAuthenticated', () => {
    test('returns true when token exists', () => {
      mockLocalStorage.getItem.mockReturnValueOnce('valid-token');
      
      const result = AuthService.isAuthenticated();
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('access_token');
      expect(result).toBe(true);
    });
    
    test('returns false when token does not exist', () => {
      mockLocalStorage.getItem.mockReturnValueOnce(null);
      
      const result = AuthService.isAuthenticated();
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('access_token');
      expect(result).toBe(false);
    });
  });
});
