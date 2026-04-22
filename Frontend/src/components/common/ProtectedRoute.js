/**
 * Protected Route Component
 * 
 * This is a wrapper component that protects routes from unauthorized access.
 * It checks if the user is authenticated before allowing access to protected pages.
 * 
 * Functionality:
 * - Shows loading spinner while authentication status is being checked
 * - Redirects unauthenticated users to the login page
 * - Allows authenticated users to access the protected content
 * 
 * Usage:
 * Wrap any component that requires authentication with this component.
 * Example: <ProtectedRoute><Dashboard /></ProtectedRoute>
 * 
 * @param {React.ReactNode} children - The component(s) to protect
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
     // Get authentication status and loading state from context
     const { isAuthenticated, loading } = useAuth();

     // Show loading spinner while checking authentication status
     // This prevents flash of login page for authenticated users
     if (loading) {
          return (
               <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-banking-600"></div>
               </div>
          );
     }

     // If authenticated, render the protected content
     // If not authenticated, redirect to login page
     return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
