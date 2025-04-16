import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '../../pages/Login';
import { useAuth } from '../../context/AuthContext';

// Mock the useAuth hook
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn()
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  useLocation: () => ({ state: null }),
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

describe('Login Component', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Default useAuth mock implementation
    useAuth.mockReturnValue({
      login: jest.fn().mockResolvedValue(true),
      loading: false,
      error: null,
      isAuthenticated: jest.fn().mockReturnValue(false)
    });
  });

  test('renders login form correctly', () => {
    render(<Login />);
    
    // Check for Login title
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    
    // Check for form fields
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });
});
