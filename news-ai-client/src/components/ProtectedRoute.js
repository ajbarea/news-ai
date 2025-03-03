import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show nothing while checking authentication status to prevent flash of content
  if (loading) {
    return <div className="d-flex justify-content-center mt-5">Loading...</div>;
  }

  // If not authenticated, redirect to login
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
