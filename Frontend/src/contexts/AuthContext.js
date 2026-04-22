/**
 * AuthContext.js
 * 
 * This file handles all authentication-related functionality for the banking application.
 * It provides a React Context that manages user authentication state, login/logout processes,
 * and user registration across the entire application.
 * 
 * Key Features:
 * - User authentication state management
 * - Login functionality for both users and admins
 * - User registration
 * - Automatic authentication checking on app start
 * - JWT token-based authentication with localStorage
 * - Role-based access control (USER vs ADMIN)
 * - Automatic token expiration handling
 */

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { isTokenExpired, willTokenExpireSoon } from '../utils/jwtUtils';

// Create React Context for authentication
// This allows any component in the app to access authentication state
const AuthContext = createContext({});

/**
 * Custom hook to use the AuthContext
 * This hook must be used within an AuthProvider component
 * @returns {Object} Authentication context with user state and methods
 */
export const useAuth = () => {
     const context = useContext(AuthContext);
     if (!context) {
          throw new Error('useAuth must be used within an AuthProvider');
     }
     return context;
};

/**
 * AuthProvider Component
 * Wraps the entire application to provide authentication context
 * Manages user state, authentication status, and loading states
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const AuthProvider = ({ children }) => {
     // State to store current user information (includes role, account details, etc.)
     const [user, setUser] = useState(null);

     // Boolean to track if user is currently authenticated
     const [isAuthenticated, setIsAuthenticated] = useState(false);

     // Loading state for authentication operations
     const [loading, setLoading] = useState(true);

     // Ref to store the token check interval
     const tokenCheckInterval = useRef(null);

     /**
      * Effect hook to check authentication status when app starts
      * Runs once when the component mounts
      * Checks for existing JWT token in localStorage and validates it
      */
     useEffect(() => {
          const checkAuth = async () => {
               // Get stored JWT token from browser storage
               const token = localStorage.getItem('jwtToken');
               const userInfo = localStorage.getItem('userInfo');

               if (token) {
                    try {
                         // Set the token for API requests
                         api.setAuthToken(token);

                         // Try to get user dashboard to verify token validity
                         // This endpoint returns user info if token is valid
                         const response = await api.get('/user/dashboard');

                         if (response.status === 200) {
                              // Token is valid, user is authenticated
                              setIsAuthenticated(true);
                              setUser(response.data);
                              // Update stored user info
                              localStorage.setItem('userInfo', JSON.stringify(response.data));
                              // Set up token validation
                              setupTokenValidation();
                         }
                    } catch (error) {
                         // Token is invalid or expired, clean up
                         localStorage.removeItem('jwtToken');
                         localStorage.removeItem('userInfo');
                         api.clearAuthToken();
                    }
               }

               // Authentication check complete
               setLoading(false);
          };

          checkAuth();

          // Cleanup function to clear interval on unmount
          return () => {
               clearTokenValidation();
          };
     }, []);

     /**
      * Fetches current user data from the server
      * Used to refresh user information after login or updates
      * @throws {Error} If fetching user data fails
      */
     const fetchUserData = async () => {
          try {
               const response = await api.get('/user/dashboard');
               setUser(response.data);
          } catch (error) {
               // If user dashboard fails, user might be an admin
               console.error('Failed to fetch user data:', error);
               throw error;
          }
     };

     /**
      * Handles user login authentication
      * Supports both regular users and administrators using JWT
      * 
      * @param {string} email - User's email address
      * @param {string} password - User's password
      * @returns {Object} Login result with success status and user data
      */
     const login = async (email, password) => {
          try {
               setLoading(true);

               // Send authentication request to get JWT token
               const authResponse = await api.login({ email, password });

               if (authResponse.status === 200) {
                    // JWT token received and stored, now get user data
                    const userResponse = await api.get('/user/dashboard');

                    if (userResponse.status === 200) {
                         // Login successful - update state
                         setIsAuthenticated(true);
                         setUser(userResponse.data);

                         // Store user info for offline access
                         localStorage.setItem('userInfo', JSON.stringify(userResponse.data));

                         // Set up token validation
                         setupTokenValidation();

                         // Show success message to user
                         toast.success('Login successful!');

                         // Return success result with user data and admin flag
                         return {
                              success: true,
                              user: userResponse.data,
                              isAdmin: userResponse.data.role === 'ADMIN'
                         };
                    }
               }
          } catch (error) {
               // Login failed - clean up and show error
               api.clearAuthToken();

               // Check for specific error messages
               const errorMessage = error.response?.data?.message || error.response?.data;

               if (typeof errorMessage === 'string' && errorMessage.toLowerCase().includes('not verified')) {
                    toast.error('Please verify your email before logging in. Check your inbox for the verification link.');
                    return { success: false, error: 'Email not verified' };
               } else if (error.response?.status === 401) {
                    toast.error('Invalid email or password');
                    return { success: false, error: 'Invalid credentials' };
               } else {
                    toast.error('Login failed. Please try again.');
                    return { success: false, error: 'Login failed' };
               }
          } finally {
               setLoading(false);
          }
     };

     /**
      * Handles new user registration
      * Creates a new user account with provided information
      * 
      * @param {Object} userData - User registration data
      * @param {string} userData.fullName - User's full name
      * @param {string} userData.email - User's email address
      * @param {string} userData.password - User's password
      * @param {number} userData.balance - Initial account balance
      * @param {string} userData.accountType - Type of account (SAVINGS/CURRENT)
      * @returns {Object} Registration result with success status
      */
     const register = async (userData) => {
          try {
               setLoading(true);

               // Send registration request to backend
               const response = await api.post('/api/signup', userData);

               if (response.status === 201 || response.status === 200) {
                    // Registration successful
                    toast.success('Registration successful! Please check your email to verify your account before logging in.');
                    return { success: true, data: response.data };
               } else {
                    // Unexpected status code
                    toast.error('Registration failed. Please try again.');
                    return { success: false, error: 'Unexpected response status' };
               }
          } catch (error) {
               // Registration failed - extract error message
               const errorMessage = error.response?.data?.message || error.response?.data || 'Registration failed. Please try again.';
               toast.error(errorMessage);
               return { success: false, error: errorMessage };
          } finally {
               setLoading(false);
          }
     };

     /**
      * Logs out the current user
      * Clears JWT token and resets user state
      */
     const logout = () => {
          // Clear token validation interval
          clearTokenValidation();

          // Remove stored JWT token and user info
          localStorage.removeItem('jwtToken');
          localStorage.removeItem('userInfo');

          // Clear API authentication
          api.clearAuthToken();

          // Reset authentication state
          setUser(null);
          setIsAuthenticated(false);

          // Show logout confirmation
          toast.info('Logged out successfully');
     };

     /**
      * Sets up periodic token validation
      * Checks every minute if the token is about to expire
      */
     const setupTokenValidation = () => {
          // Clear any existing interval
          if (tokenCheckInterval.current) {
               clearInterval(tokenCheckInterval.current);
          }

          // Set up new interval to check token every minute
          tokenCheckInterval.current = setInterval(() => {
               const token = localStorage.getItem('jwtToken');

               if (token) {
                    // Check if token is expired
                    if (isTokenExpired(token)) {
                         toast.error('Your session has expired. Please login again.');
                         logout();
                         return;
                    }

                    // Check if token will expire soon (within 5 minutes)
                    if (willTokenExpireSoon(token, 5)) {
                         toast.warning('Your session will expire soon. Please save your work.');
                    }
               }
          }, 60000); // Check every minute
     };

     /**
      * Clears the token validation interval
      */
     const clearTokenValidation = () => {
          if (tokenCheckInterval.current) {
               clearInterval(tokenCheckInterval.current);
               tokenCheckInterval.current = null;
          }
     };

     // Context value that will be provided to all child components
     const value = {
          user,                // Current user object (null if not authenticated)
          isAuthenticated,     // Boolean indicating if user is logged in
          loading,             // Boolean indicating if auth operation is in progress
          login,               // Function to log in a user
          register,            // Function to register a new user
          logout,              // Function to log out current user
          fetchUserData        // Function to refresh user data
     };

     // Provide the authentication context to all child components
     return (
          <AuthContext.Provider value={value}>
               {children}
          </AuthContext.Provider>
     );
};
