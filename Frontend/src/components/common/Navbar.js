import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
     BanknotesIcon,
     UserCircleIcon,
     ArrowRightOnRectangleIcon,
     ChartBarIcon,
     UserIcon,
     Bars3Icon,
     XMarkIcon,
     ShieldCheckIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
     const { isAuthenticated, user, logout } = useAuth();
     const navigate = useNavigate();
     const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

     const handleLogout = () => {
          logout();
          navigate('/');
          setMobileMenuOpen(false);
     };

     const toggleMobileMenu = () => {
          setMobileMenuOpen(!mobileMenuOpen);
     };

     const closeMobileMenu = () => {
          setMobileMenuOpen(false);
     };

     return (
          <>
               <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                         <div className="flex justify-between items-center h-14 sm:h-16">
                              {/* Logo and Brand */}
                              <div className="flex items-center">
                                   <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
                                        {/* Custom Logo Image */}
                                        <div className="bg-banking-600 p-1.5 sm:p-2 rounded-lg flex items-center justify-center">
                                             <img
                                                  src="/logo.png"
                                                  alt="SecureBank Logo"
                                                  className="h-5 w-5 sm:h-6 sm:w-6 object-contain"
                                                  onError={(e) => {
                                                       // Fallback to icon if image fails to load
                                                       e.target.style.display = 'none';
                                                       e.target.nextSibling.style.display = 'block';
                                                  }}
                                             />
                                             <BanknotesIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white hidden" />
                                        </div>
                                        <span className="font-bold text-lg sm:text-xl text-gray-900">SecureBank</span>
                                   </Link>
                              </div>

                              {/* Desktop Navigation */}
                              <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
                                   {isAuthenticated ? (
                                        <>
                                             {user?.role === 'ADMIN' ? (
                                                  <Link
                                                       to="/admin"
                                                       className="flex items-center space-x-1 text-gray-600 hover:text-banking-600 px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                                  >
                                                       <ShieldCheckIcon className="h-4 w-4" />
                                                       <span>Admin Dashboard</span>
                                                  </Link>
                                             ) : (
                                                  <>
                                                       <Link
                                                            to="/dashboard"
                                                            className="flex items-center space-x-1 text-gray-600 hover:text-banking-600 px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                                       >
                                                            <ChartBarIcon className="h-4 w-4" />
                                                            <span>Dashboard</span>
                                                       </Link>

                                                       <Link
                                                            to="/transactions"
                                                            className="flex items-center space-x-1 text-gray-600 hover:text-banking-600 px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                                       >
                                                            <BanknotesIcon className="h-4 w-4" />
                                                            <span>Transactions</span>
                                                       </Link>

                                                       <Link
                                                            to="/profile"
                                                            className="flex items-center space-x-1 text-gray-600 hover:text-banking-600 px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                                       >
                                                            <UserIcon className="h-4 w-4" />
                                                            <span>Profile</span>
                                                       </Link>
                                                  </>
                                             )}

                                             {/* User Menu - Desktop */}
                                             <div className="flex items-center space-x-2 lg:space-x-3 ml-2 lg:ml-4 pl-2 lg:pl-4 border-l border-gray-200">
                                                  <div className="flex items-center space-x-2">
                                                       <UserCircleIcon className="h-6 w-6 lg:h-8 lg:w-8 text-gray-400" />
                                                       <div className="hidden lg:block">
                                                            <p className="text-sm font-medium text-gray-900">
                                                                 {user?.fullName || 'User'}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                 {user?.role === 'ADMIN' ? 'Administrator' : `Account: ${user?.accountNumber || 'N/A'}`}
                                                            </p>
                                                       </div>
                                                  </div>

                                                  <button
                                                       onClick={handleLogout}
                                                       className="flex items-center space-x-1 text-gray-600 hover:text-red-600 px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                                  >
                                                       <ArrowRightOnRectangleIcon className="h-4 w-4" />
                                                       <span className="hidden lg:inline">Logout</span>
                                                  </button>
                                             </div>
                                        </>
                                   ) : (
                                        <div className="flex items-center space-x-2 lg:space-x-4">
                                             <Link
                                                  to="/login"
                                                  className="text-gray-600 hover:text-banking-600 px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                             >
                                                  Login
                                             </Link>
                                             <Link
                                                  to="/register"
                                                  className="btn-primary text-sm"
                                             >
                                                  Get Started
                                             </Link>
                                        </div>
                                   )}
                              </div>

                              {/* Mobile menu button */}
                              <div className="md:hidden">
                                   <button
                                        onClick={toggleMobileMenu}
                                        className="text-gray-600 hover:text-banking-600 p-2 rounded-md transition-colors"
                                   >
                                        {mobileMenuOpen ? (
                                             <XMarkIcon className="h-6 w-6" />
                                        ) : (
                                             <Bars3Icon className="h-6 w-6" />
                                        )}
                                   </button>
                              </div>
                         </div>
                    </div>
               </nav>

               {/* Mobile Navigation Menu */}
               {mobileMenuOpen && (
                    <div className="fixed inset-0 z-50 md:hidden">
                         {/* Backdrop */}
                         <div
                              className="fixed inset-0 bg-black bg-opacity-50"
                              onClick={closeMobileMenu}
                         ></div>

                         {/* Menu Panel */}
                         <div className="fixed inset-y-0 right-0 w-64 bg-white shadow-xl">
                              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                   <span className="font-bold text-lg text-gray-900">Menu</span>
                                   <button
                                        onClick={closeMobileMenu}
                                        className="text-gray-600 hover:text-gray-900 p-1"
                                   >
                                        <XMarkIcon className="h-6 w-6" />
                                   </button>
                              </div>

                              <div className="px-4 py-6 space-y-4">
                                   {isAuthenticated ? (
                                        <>
                                             {/* User Info */}
                                             <div className="pb-4 border-b border-gray-200">
                                                  <div className="flex items-center space-x-3">
                                                       <UserCircleIcon className="h-10 w-10 text-gray-400" />
                                                       <div>
                                                            <p className="text-sm font-medium text-gray-900">
                                                                 {user?.fullName || 'User'}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                 {user?.role === 'ADMIN' ? 'Administrator' : `Account: ${user?.accountNumber || 'N/A'}`}
                                                            </p>
                                                       </div>
                                                  </div>
                                             </div>

                                             {/* Navigation Links */}
                                             {user?.role === 'ADMIN' ? (
                                                  <Link
                                                       to="/admin"
                                                       onClick={closeMobileMenu}
                                                       className="flex items-center space-x-3 text-gray-700 hover:text-banking-600 py-3 px-2 rounded-md transition-colors"
                                                  >
                                                       <ShieldCheckIcon className="h-5 w-5" />
                                                       <span>Admin Dashboard</span>
                                                  </Link>
                                             ) : (
                                                  <>
                                                       <Link
                                                            to="/dashboard"
                                                            onClick={closeMobileMenu}
                                                            className="flex items-center space-x-3 text-gray-700 hover:text-banking-600 py-3 px-2 rounded-md transition-colors"
                                                       >
                                                            <ChartBarIcon className="h-5 w-5" />
                                                            <span>Dashboard</span>
                                                       </Link>

                                                       <Link
                                                            to="/transactions"
                                                            onClick={closeMobileMenu}
                                                            className="flex items-center space-x-3 text-gray-700 hover:text-banking-600 py-3 px-2 rounded-md transition-colors"
                                                       >
                                                            <BanknotesIcon className="h-5 w-5" />
                                                            <span>Transactions</span>
                                                       </Link>

                                                       <Link
                                                            to="/profile"
                                                            onClick={closeMobileMenu}
                                                            className="flex items-center space-x-3 text-gray-700 hover:text-banking-600 py-3 px-2 rounded-md transition-colors"
                                                       >
                                                            <UserIcon className="h-5 w-5" />
                                                            <span>Profile</span>
                                                       </Link>
                                                  </>
                                             )}

                                             <button
                                                  onClick={handleLogout}
                                                  className="flex items-center space-x-3 text-red-600 hover:text-red-700 py-3 px-2 rounded-md transition-colors w-full text-left"
                                             >
                                                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                                  <span>Logout</span>
                                             </button>
                                        </>
                                   ) : (
                                        <>
                                             <Link
                                                  to="/login"
                                                  onClick={closeMobileMenu}
                                                  className="block text-gray-700 hover:text-banking-600 py-3 px-2 rounded-md transition-colors"
                                             >
                                                  Login
                                             </Link>
                                             <Link
                                                  to="/register"
                                                  onClick={closeMobileMenu}
                                                  className="block btn-primary w-full text-center"
                                             >
                                                  Get Started
                                             </Link>
                                        </>
                                   )}
                              </div>
                         </div>
                    </div>
               )}
          </>
     );
};

export default Navbar;
