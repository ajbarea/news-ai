import axios from 'axios';

export const API_URL = 'http://localhost:8000';

// Helper to manage tokens in localStorage
const TokenService = {
  getToken: () => localStorage.getItem('access_token'),
  setToken: (token) => localStorage.setItem('access_token', token),
  removeToken: () => localStorage.removeItem('access_token'),
  getTokenType: () => localStorage.getItem('token_type') || 'bearer',
  setTokenType: (type) => localStorage.setItem('token_type', type),
};

// Create axios instance with authorization header
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization header to requests when token exists
apiClient.interceptors.request.use(
  (config) => {
    const token = TokenService.getToken();
    if (token) {
      config.headers['Authorization'] = `${TokenService.getTokenType()} ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const AuthService = {
  login: async (username, password) => {
    // FastAPI OAuth2 expects form data, not JSON
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await axios.post(`${API_URL}/token`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (response.data.access_token) {
      TokenService.setToken(response.data.access_token);
      TokenService.setTokenType(response.data.token_type);
    }

    return response.data;
  },

  register: async (username, email, password) => {
    return apiClient.post('/register', {
      username,
      email,
      password,
    });
  },

  getCurrentUser: async () => {
    return apiClient.get('/users/me');
  },

  updateProfile: async (userData) => {
    return apiClient.put('/users/me', userData);
  },

  logout: () => {
    TokenService.removeToken();
  },

  isAuthenticated: () => {
    return !!TokenService.getToken();
  },
};

export default AuthService;
