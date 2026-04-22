/**
 * Main Application Component
 * 
 * This is the root component of the Bank Management Application that sets up:
 * - React Router for navigation between pages
 * - Authentication context for managing user sessions
 * - Protected routes for user and admin access
 * - Global toast notifications for user feedback
 * - Responsive layout structure with navbar and footer
 * 
 * The app supports two types of users:
 * 1. Regular users: Can access dashboard, transactions, and profile
 * 2. Administrators: Can access admin dashboard for user management
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Authentication and routing components
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Page components for different user interfaces
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import TransactionHistory from './pages/TransactionHistory';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import EmailVerificationPage from './pages/EmailVerificationPage';

function App() {
     return (
          // AuthProvider wraps the entire app to provide authentication context
          <AuthProvider>
               <Router>
                    {/* Main layout with responsive min-height and flex structure */}
                    <div className="min-h-screen bg-gray-50 flex flex-col">
                         {/* Navigation bar - shows different links based on user role */}
                         <Navbar />

                         {/* Main content area that grows to fill available space */}
                         <main className="flex-grow">
                              <Routes>
                                   {/* Public routes - accessible without authentication */}
                                   <Route path="/" element={<LandingPage />} />
                                   <Route path="/login" element={<LoginPage />} />
                                   <Route path="/register" element={<RegisterPage />} />
                                   <Route path="/verify-email" element={<EmailVerificationPage />} />

                                   {/* Protected routes - require user authentication */}
                                   <Route
                                        path="/dashboard"
                                        element={
                                             <ProtectedRoute>
                                                  <Dashboard />
                                             </ProtectedRoute>
                                        }
                                   />
                                   <Route
                                        path="/transactions"
                                        element={
                                             <ProtectedRoute>
                                                  <TransactionHistory />
                                             </ProtectedRoute>
                                        }
                                   />
                                   <Route
                                        path="/profile"
                                        element={
                                             <ProtectedRoute>
                                                  <Profile />
                                             </ProtectedRoute>
                                        }
                                   />

                                   {/* Admin-only route - requires admin role */}
                                   <Route
                                        path="/admin"
                                        element={
                                             <AdminRoute>
                                                  <AdminDashboard />
                                             </AdminRoute>
                                        }
                                   />

                                   {/* Catch-all route - redirects unknown URLs to home */}
                                   <Route path="*" element={<Navigate to="/" replace />} />
                              </Routes>
                         </main>

                         {/* Footer component at the bottom of the page */}
                         <Footer />

                         {/* Global toast notification container for user feedback */}
                         <ToastContainer
                              position="top-right"
                              autoClose={5000}
                              hideProgressBar={false}
                              newestOnTop={false}
                              closeOnClick
                              rtl={false}
                              pauseOnFocusLoss
                              draggable
                              pauseOnHover
                              theme="light"
                         />
                    </div>
               </Router>
          </AuthProvider>
     );
}

export default App;
