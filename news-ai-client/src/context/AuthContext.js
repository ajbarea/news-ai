import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in (token exists)
    const loadUser = async () => {
      setLoading(true);
      if (AuthService.isAuthenticated()) {
        try {
          const response = await AuthService.getCurrentUser();
          setCurrentUser(response.data);
        } catch (err) {
          console.error('Failed to fetch current user:', err);
          AuthService.logout(); // Clear invalid token
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      await AuthService.login(username, password);
      const response = await AuthService.getCurrentUser();
      setCurrentUser(response.data);
      return true;
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      await AuthService.register(username, email, password);
      return true;
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setCurrentUser(null);
  };

  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      // Store old username to compare with the new one
      const oldUsername = currentUser?.username;
      const response = await AuthService.updateProfile(userData);
      setCurrentUser(response.data);

      // If username changed, we need to get a new JWT token
      if (userData.username && oldUsername !== userData.username) {
        console.log("Username changed, refreshing authentication token");
        // Log the user out, which will clear the existing token
        AuthService.logout();
        // We need to redirect to login page after this
        setError("Your username was updated. Please login again with your new username.");
        return "USERNAME_CHANGED";
      }

      return true;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: AuthService.isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
