/**
 * Admin Route Component
 * 
 * This is a specialized wrapper component that protects admin-only routes.
 * It performs a two-step authentication check:
 * 1. Ensures the user is authenticated
 * 2. Verifies the user has ADMIN role
 * 
 * Functionality:
 * - Shows loading spinner while authentication is being verified
 * - Redirects unauthenticated users to login page
 * - Redirects non-admin users to regular user dashboard
 * - Only allows ADMIN role users to access admin content
 * 
 * Usage:
 * Wrap admin-only components with this component.
 * Example: <AdminRoute><AdminDashboard /></AdminRoute>
 * 
 * @param {React.ReactNode} children - The admin component(s) to protect
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminRoute = ({ children }) => {
     // Get authentication status, user data, and loading state
     const { isAuthenticated, user, loading } = useAuth();

     // Show loading spinner while checking authentication and user role
     if (loading) {
          return (
               <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-banking-600"></div>
               </div>
          );
     }

     // First check: User must be authenticated
     if (!isAuthenticated) {
          return <Navigate to="/login" replace />;
     }

     // Second check: User must have ADMIN role
     // Regular users are redirected to their dashboard
     if (user?.role !== 'ADMIN') {
          return <Navigate to="/dashboard" replace />;
     }

     // User is authenticated and is an admin - render protected content
     return children;
};

export default AdminRoute;
