import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Register from '../../pages/Register';
import { useAuth } from '../../context/AuthContext';

// Mock the useAuth hook
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn()
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

describe('Register Component', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Default useAuth mock implementation
    useAuth.mockReturnValue({
      register: jest.fn().mockResolvedValue(true),
      loading: false,
      error: null,
      isAuthenticated: jest.fn().mockReturnValue(false)
    });
  });

  test('renders register form correctly', () => {
    render(<Register />);
    
    // Check for Register title
    expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
    
    // Check for form fields
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });
});
