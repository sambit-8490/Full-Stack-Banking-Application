/**
 * AdminDashboard.js
 * 
 * This component provides the administrative interface for the banking application.
 * It allows admin users to manage all regular users in the system.
 * 
 * Key Features:
 * - View all users (excluding other admins)
 * - Search users by name, email, ID, or account number
 * - Create new user accounts
 * - Edit existing user information (name and email)
 * - Delete user accounts with confirmation
 * - View detailed user information
 * - Pagination for large user lists
 * - Responsive design for desktop and mobile
 * - Dark admin theme for distinction from user interface
 * 
 * Security:
 * - Only accessible to users with ADMIN role
 * - Protected by AdminRoute component
 * - All API calls are authenticated
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import {
     UserIcon,
     PlusIcon,
     TrashIcon,
     MagnifyingGlassIcon,
     ShieldCheckIcon,
     UsersIcon,
     ExclamationTriangleIcon,
     EnvelopeIcon,
     LockClosedIcon,
     CurrencyDollarIcon,
     EyeIcon,
     EyeSlashIcon,
     PencilIcon
} from '@heroicons/react/24/outline';

/**
 * AdminDashboard Component
 * Main administrative interface for user management
 */
const AdminDashboard = () => {
     // Get current admin user from authentication context
     const { user } = useAuth();

     // ============================================================================
     // STATE MANAGEMENT
     // All component state variables for data and UI control
     // ============================================================================

     // Array to store all users fetched from the backend
     const [users, setUsers] = useState([]);

     // Loading state for API operations
     const [loading, setLoading] = useState(false);

     // Modal visibility states for different operations
     const [showCreateModal, setShowCreateModal] = useState(false);  // Create new user modal
     const [showDeleteModal, setShowDeleteModal] = useState(false);  // Delete confirmation modal
     const [showViewModal, setShowViewModal] = useState(false);      // View user details modal
     const [showEditModal, setShowEditModal] = useState(false);      // Edit user modal

     // Currently selected user for view/edit/delete operations
     const [selectedUser, setSelectedUser] = useState(null);

     // Form data for editing existing user
     const [editUser, setEditUser] = useState({
          fullName: '',
          email: '',
          balance: '',
          accountType: 'SAVINGS'
     });

     // Search term for filtering users
     const [searchTerm, setSearchTerm] = useState('');

     // Pagination state for user list
     const [pagination, setPagination] = useState({
          currentPage: 0,      // Current page number (0-based)
          totalPages: 0,       // Total number of pages
          totalElements: 0,    // Total number of users
          size: 10            // Number of users per page
     });

     // Form data for creating new user
     const [newUser, setNewUser] = useState({
          fullName: '',
          email: '',
          password: '',
          confirmPassword: '',
          balance: '',
          accountType: 'SAVINGS',
          role: 'USER'
     });

     // Password visibility toggles for create user form
     const [showPassword, setShowPassword] = useState(false);
     const [showConfirmPassword, setShowConfirmPassword] = useState(false);

     // ============================================================================
     // EFFECTS
     // React hooks for side effects and lifecycle management
     // ============================================================================

     /**
      * Effect to fetch users when component mounts or pagination changes
      * Runs whenever currentPage or page size changes
      */
     useEffect(() => {
          fetchUsers();
     }, [pagination.currentPage, pagination.size]);

     // ============================================================================
     // API FUNCTIONS
     // Functions that interact with the backend API
     // ============================================================================

     /**
      * Fetches users from the backend with pagination
      * Filters out admin users to show only regular users
      */
     const fetchUsers = async () => {
          try {
               setLoading(true);

               // Request paginated user data from admin endpoint
               const response = await api.getAllUsers(pagination.currentPage, pagination.size);
               const data = response.data;

               // Filter out admin users - only show regular users
               // Backend already filters this, but we double-check for security
               const regularUsers = (data.content || []).filter(user => user.role === 'USER');
               setUsers(regularUsers);

               // Update pagination information
               setPagination(prev => ({
                    ...prev,
                    totalPages: data.totalPages || 0,
                    totalElements: regularUsers.length
               }));
          } catch (error) {
               toast.error('Failed to load users');
               console.error('Error fetching users:', error);
          } finally {
               setLoading(false);
          }
     };     /**
      * Handles creating a new user account
      * Validates form data and sends request to backend
      * 
      * @param {Event} e - Form submit event
      */
     const handleCreateUser = async (e) => {
          e.preventDefault();

          // ============================================================================
          // FORM VALIDATION
          // Validate all required fields before submitting
          // ============================================================================

          // Validate full name
          if (!newUser.fullName.trim()) {
               toast.error('Full name is required');
               return;
          }

          // Validate email format
          if (!newUser.email.trim() || !/\S+@\S+\.\S+/.test(newUser.email)) {
               toast.error('Please enter a valid email');
               return;
          }

          // Validate password presence
          if (!newUser.password.trim()) {
               toast.error('Password is required');
               return;
          }

          // Validate password length
          if (newUser.password.length < 6) {
               toast.error('Password must be at least 6 characters');
               return;
          }

          // Validate password confirmation
          if (newUser.password !== newUser.confirmPassword) {
               toast.error('Passwords do not match');
               return;
          }

          // Validate balance if provided
          if (newUser.balance && (isNaN(newUser.balance) || parseFloat(newUser.balance) < 0)) {
               toast.error('Please enter a valid balance amount');
               return;
          }

          try {
               setLoading(true);

               // Prepare user data for API request
               const userData = {
                    fullName: newUser.fullName.trim(),
                    email: newUser.email.toLowerCase().trim(),
                    password: newUser.password,
                    balance: parseFloat(newUser.balance) || 0,
                    accountType: newUser.accountType,
                    role: newUser.role
               };

               // Send create user request to backend
               await api.createUser(userData);

               // Success - show message and reset form
               toast.success('User created successfully!');
               setShowCreateModal(false);

               // Reset form data
               setNewUser({
                    fullName: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    balance: '',
                    accountType: 'SAVINGS',
                    role: 'USER'
               });

               // Refresh user list to show new user
               fetchUsers();
          } catch (error) {
               // Handle creation error
               const errorMessage = error.response?.data?.message || 'Failed to create user';
               toast.error(errorMessage);
          } finally {
               setLoading(false);
          }
     };

     /**
      * Handles deleting a user account
      * Permanently removes user and all associated data
      */
     const handleDeleteUser = async () => {
          if (!selectedUser) return;

          try {
               setLoading(true);

               // Send delete request to backend
               await api.deleteUserAdmin(selectedUser.userId);

               // Success - show message and close modal
               toast.success('User deleted successfully!');
               setShowDeleteModal(false);
               setSelectedUser(null);

               // Refresh user list to remove deleted user
               fetchUsers();
          } catch (error) {
               // Handle deletion error
               const errorMessage = error.response?.data?.message || 'Failed to delete user';
               toast.error(errorMessage);
          } finally {
               setLoading(false);
          }
     };

     /**
      * Opens view modal for selected user
      * Displays read-only user information
      * 
      * @param {Object} user - User object to view
      */
     const handleViewUser = (user) => {
          setSelectedUser(user);
          setShowViewModal(true);
     };

     /**
      * Opens edit modal for selected user
      * Prepopulates form with current user data
      * 
      * @param {Object} user - User object to edit
      */
     const handleEditUser = (user) => {
          setSelectedUser(user);

          // Prepopulate edit form with current user data
          setEditUser({
               fullName: user.fullName,
               email: user.email,
               balance: user.balance.toString(),
               accountType: user.accountType
          });

          setShowEditModal(true);
     };

     /**
      * Handles updating user information
      * Only allows editing of name and email for security
      * 
      * @param {Event} e - Form submit event
      */
     const handleUpdateUser = async (e) => {
          e.preventDefault();

          // Validate required fields
          if (!editUser.fullName.trim()) {
               toast.error('Full name is required');
               return;
          }

          if (!editUser.email.trim() || !/\S+@\S+\.\S+/.test(editUser.email)) {
               toast.error('Please enter a valid email');
               return;
          }

          // Validate balance if changed
          if (editUser.balance && (isNaN(editUser.balance) || parseFloat(editUser.balance) < 0)) {
               toast.error('Please enter a valid balance amount');
               return;
          }

          try {
               setLoading(true);

               // Prepare update data (only name and email for security)
               const updateData = {
                    fullName: editUser.fullName.trim(),
                    email: editUser.email.toLowerCase().trim()
               };

               // Send update request to backend
               await api.updateUser(selectedUser.userId, updateData);

               // Success - show message and close modal
               toast.success('User updated successfully!');
               setShowEditModal(false);
               setSelectedUser(null);

               // Refresh user list to show updated information
               fetchUsers();
          } catch (error) {
               // Handle update error
               const errorMessage = error.response?.data?.message || 'Failed to update user';
               toast.error(errorMessage);
          } finally {
               setLoading(false);
          }
     };

     // ============================================================================
     // FORM INPUT HANDLERS
     // Functions to handle form input changes
     // ============================================================================

     /**
      * Handles input changes in edit user form
      * Updates editUser state when form fields change
      * 
      * @param {Event} e - Input change event
      */
     const handleEditInputChange = (e) => {
          const { name, value } = e.target;
          setEditUser(prev => ({
               ...prev,
               [name]: value
          }));
     };

     /**
      * Handles input changes in create user form
      * Updates newUser state when form fields change
      * 
      * @param {Event} e - Input change event
      */
     const handleInputChange = (e) => {
          const { name, value } = e.target;
          setNewUser(prev => ({
               ...prev,
               [name]: value
          }));
     };

     // ============================================================================
     // PAGINATION HANDLERS
     // Functions to handle page navigation and size changes
     // ============================================================================

     /**
      * Handles page change in pagination
      * @param {number} page - New page number to navigate to
      */
     const handlePageChange = (page) => {
          setPagination(prev => ({
               ...prev,
               currentPage: page
          }));
     };

     /**
      * Handles page size change in pagination
      * Resets to first page when size changes
      * 
      * @param {number} size - New page size (users per page)
      */
     const handleSizeChange = (size) => {
          setPagination(prev => ({
               ...prev,
               size: size,
               currentPage: 0  // Reset to first page
          }));
     };

     // ============================================================================
     // UTILITY FUNCTIONS
     // Helper functions for data processing and UI formatting
     // ============================================================================

     /**
      * Filters users based on search term
      * Searches across name, email, userId, and account number
      */
     const filteredUsers = users.filter(user =>
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.accountNumber.toString().includes(searchTerm)
     );

     /**
      * Formats currency amounts for display
      * Uses Indian Rupee (INR) format with proper formatting
      * 
      * @param {number} amount - Amount to format
      * @returns {string} Formatted currency string
      */
     const formatCurrency = (amount) => {
          return new Intl.NumberFormat('en-IN', {
               style: 'currency',
               currency: 'INR'
          }).format(amount);
     };

     /**
      * Returns appropriate CSS classes for role badges
      * Different colors for ADMIN vs USER roles
      * 
      * @param {string} role - User role (ADMIN/USER)
      * @returns {string} CSS classes for badge styling
      */
     const getRoleBadgeColor = (role) => {
          return role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
     };

     /**
      * Returns appropriate CSS classes for account type badges
      * Different colors for SAVINGS vs CURRENT accounts
      * 
      * @param {string} type - Account type (SAVINGS/CURRENT)
      * @returns {string} CSS classes for badge styling
      */
     const getAccountTypeBadgeColor = (type) => {
          return type === 'SAVINGS' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800';
     };

     // ============================================================================
     // COMPONENT RENDER
     // Main UI render with dark admin theme and responsive design
     // ============================================================================

     /**
      * Main component render
      * Returns the complete admin dashboard UI with dark theme
      * Includes header, stats cards, search/actions, user table, and modals
      */
     return (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-4 sm:py-8 overflow-x-hidden">
               <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <div className="flex items-center space-x-3">
                                   {/* SecureBank Logo */}
                                   <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700">
                                        <img
                                             src="/logo.png"
                                             alt="SecureBank Logo"
                                             className="h-6 w-6 sm:h-8 sm:w-8 object-contain filter brightness-110"
                                             onError={(e) => {
                                                  // Fallback to icon if image fails to load
                                                  e.target.style.display = 'none';
                                                  e.target.nextSibling.style.display = 'block';
                                             }}
                                        />
                                        <ShieldCheckIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 hidden" />
                                   </div>
                                   <div>
                                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white break-words">
                                             Administrative Dashboard
                                        </h1>
                                        <p className="text-slate-300 mt-1 sm:mt-2 text-sm sm:text-base break-words">
                                             User Management & System Administration
                                        </p>
                                   </div>
                              </div>
                              <div className="flex items-center space-x-2 sm:space-x-3 bg-slate-800/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-slate-700">
                                   <ShieldCheckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-400" />
                                   <div>
                                        <span className="text-sm sm:text-base font-medium text-white block">
                                             {user?.fullName}
                                        </span>
                                        <span className="text-xs text-slate-300">
                                             Administrator
                                        </span>
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                         <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
                              <div className="flex items-center">
                                   <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
                                        <UsersIcon className="h-6 w-6 text-blue-400" />
                                   </div>
                                   <div className="ml-4">
                                        <p className="text-sm font-medium text-slate-300">Total Users</p>
                                        <p className="text-2xl font-bold text-white">{users.length}</p>
                                   </div>
                              </div>
                         </div>

                         <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
                              <div className="flex items-center">
                                   <div className="bg-green-500/20 p-3 rounded-lg border border-green-500/30">
                                        <ShieldCheckIcon className="h-6 w-6 text-green-400" />
                                   </div>
                                   <div className="ml-4">
                                        <p className="text-sm font-medium text-slate-300">Active Users</p>
                                        <p className="text-2xl font-bold text-white">{filteredUsers.length}</p>
                                   </div>
                              </div>
                         </div>

                         <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 sm:col-span-2 lg:col-span-1">
                              <div className="flex items-center">
                                   <div className="bg-purple-500/20 p-3 rounded-lg border border-purple-500/30">
                                        <UserIcon className="h-6 w-6 text-purple-400" />
                                   </div>
                                   <div className="ml-4">
                                        <p className="text-sm font-medium text-slate-300">Your Role</p>
                                        <p className="text-2xl font-bold text-white">Administrator</p>
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Search and Actions */}
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 sm:p-6 mb-4 sm:mb-6 w-full">
                         <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                              <div className="flex-1 max-w-md">
                                   <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                             <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                                        </div>
                                        <input
                                             type="text"
                                             placeholder="Search by name, email, ID, or account number..."
                                             value={searchTerm}
                                             onChange={(e) => setSearchTerm(e.target.value)}
                                             className="w-full pl-8 sm:pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                   </div>
                              </div>
                              <button
                                   onClick={() => setShowCreateModal(true)}
                                   className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg"
                              >
                                   <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                   <span>Add New User</span>
                              </button>
                         </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 sm:p-6 w-full">
                         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                              <h2 className="text-base sm:text-lg font-semibold text-white">
                                   All Users ({users.length})
                              </h2>
                              <div className="flex items-center space-x-2">
                                   <span className="text-xs sm:text-sm text-slate-300">Show:</span>
                                   <select
                                        value={pagination.size}
                                        onChange={(e) => handleSizeChange(Number(e.target.value))}
                                        className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs sm:text-sm text-white"
                                   >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                   </select>
                              </div>
                         </div>

                         {loading ? (
                              <div className="flex justify-center py-12">
                                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
                              </div>
                         ) : filteredUsers.length > 0 ? (
                              <>
                                   {/* Desktop Table */}
                                   <div className="hidden lg:block overflow-x-auto table-responsive w-full">
                                        <table className="min-w-full divide-y divide-slate-700">
                                             <thead className="bg-slate-700/50">
                                                  <tr>
                                                       <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                                            User
                                                       </th>
                                                       <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                                            Account Info
                                                       </th>
                                                       <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                                            Balance
                                                       </th>
                                                       <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                                            Role
                                                       </th>
                                                       <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                                            Actions
                                                       </th>
                                                  </tr>
                                             </thead>
                                             <tbody className="bg-slate-800/30 divide-y divide-slate-700">
                                                  {filteredUsers.map((user) => (
                                                       <tr key={user.userId} className="hover:bg-slate-700/30 transition-colors">
                                                            <td className="px-3 sm:px-6 py-4">
                                                                 <div className="flex items-center">
                                                                      <div className="bg-slate-700 p-2 rounded-full">
                                                                           <UserIcon className="h-5 w-5 text-slate-300" />
                                                                      </div>
                                                                      <div className="ml-3 min-w-0">
                                                                           <div className="text-sm font-medium text-white break-words">
                                                                                {user.fullName}
                                                                           </div>
                                                                           <div className="text-sm text-slate-400 break-all">
                                                                                {user.email}
                                                                           </div>
                                                                      </div>
                                                                 </div>
                                                            </td>
                                                            <td className="px-3 sm:px-6 py-4">
                                                                 <div className="text-sm text-white font-mono break-all">
                                                                      {user.accountNumber || 'N/A'}
                                                                 </div>
                                                                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAccountTypeBadgeColor(user.accountType)}`}>
                                                                      {user.accountType || 'N/A'}
                                                                 </span>
                                                            </td>
                                                            <td className="px-3 sm:px-6 py-4 text-sm font-semibold text-white">
                                                                 {formatCurrency(user.balance || 0)}
                                                            </td>
                                                            <td className="px-3 sm:px-6 py-4">
                                                                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                                                      {user.role}
                                                                 </span>
                                                            </td>
                                                            <td className="px-3 sm:px-6 py-4">
                                                                 <div className="flex items-center space-x-2">
                                                                      <button
                                                                           onClick={() => handleViewUser(user)}
                                                                           className="text-blue-400 hover:text-blue-300 p-1 transition-colors"
                                                                           title="View User"
                                                                      >
                                                                           <EyeIcon className="h-4 w-4" />
                                                                      </button>
                                                                      <button
                                                                           onClick={() => handleEditUser(user)}
                                                                           className="text-yellow-400 hover:text-yellow-300 p-1 transition-colors"
                                                                           title="Edit User"
                                                                      >
                                                                           <PencilIcon className="h-4 w-4" />
                                                                      </button>
                                                                      <button
                                                                           onClick={() => {
                                                                                setSelectedUser(user);
                                                                                setShowDeleteModal(true);
                                                                           }}
                                                                           className="text-red-400 hover:text-red-300 p-1 transition-colors"
                                                                           title="Delete User"
                                                                      >
                                                                           <TrashIcon className="h-4 w-4" />
                                                                      </button>
                                                                 </div>
                                                            </td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                        </table>
                                   </div>

                                   {/* Mobile Cards */}
                                   <div className="lg:hidden space-y-4">
                                        {filteredUsers.map((user) => (
                                             <div key={user.userId} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                                                  <div className="flex items-start justify-between mb-3">
                                                       <div className="flex items-center space-x-3">
                                                            <div className="bg-slate-600 p-2 rounded-full">
                                                                 <UserIcon className="h-5 w-5 text-slate-300" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                 <p className="font-medium text-white break-words">{user.fullName}</p>
                                                                 <p className="text-sm text-slate-400 break-all">{user.email}</p>
                                                            </div>
                                                       </div>
                                                       <div className="flex items-center space-x-2">
                                                            <button
                                                                 onClick={() => handleViewUser(user)}
                                                                 className="text-blue-400 hover:text-blue-300 p-1 transition-colors"
                                                                 title="View User"
                                                            >
                                                                 <EyeIcon className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                 onClick={() => handleEditUser(user)}
                                                                 className="text-yellow-400 hover:text-yellow-300 p-1 transition-colors"
                                                                 title="Edit User"
                                                            >
                                                                 <PencilIcon className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                 onClick={() => {
                                                                      setSelectedUser(user);
                                                                      setShowDeleteModal(true);
                                                                 }}
                                                                 className="text-red-400 hover:text-red-300 p-1 transition-colors"
                                                                 title="Delete User"
                                                            >
                                                                 <TrashIcon className="h-4 w-4" />
                                                            </button>
                                                       </div>
                                                  </div>

                                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                                       <div>
                                                            <p className="text-slate-400">Account</p>
                                                            <p className="font-mono text-xs text-white break-all">{user.accountNumber || 'N/A'}</p>
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getAccountTypeBadgeColor(user.accountType)}`}>
                                                                 {user.accountType || 'N/A'}
                                                            </span>
                                                       </div>
                                                       <div>
                                                            <p className="text-slate-400">Balance</p>
                                                            <p className="font-semibold text-white">{formatCurrency(user.balance || 0)}</p>
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                                                 {user.role}
                                                            </span>
                                                       </div>
                                                  </div>
                                             </div>
                                        ))}
                                   </div>

                                   {/* Pagination */}
                                   {pagination.totalPages > 1 && (
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-700 space-y-3 sm:space-y-0">
                                             <div className="text-xs sm:text-sm text-slate-400 text-center sm:text-left">
                                                  Showing {pagination.currentPage * pagination.size + 1} to{' '}
                                                  {Math.min((pagination.currentPage + 1) * pagination.size, pagination.totalElements)} of{' '}
                                                  {pagination.totalElements} users
                                             </div>

                                             <div className="flex items-center justify-center space-x-1 sm:space-x-2 overflow-x-auto">
                                                  <button
                                                       onClick={() => handlePageChange(pagination.currentPage - 1)}
                                                       disabled={pagination.currentPage === 0}
                                                       className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-slate-600 rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-white bg-slate-700/50"
                                                  >
                                                       Previous
                                                  </button>

                                                  <div className="flex space-x-1 sm:space-x-2">
                                                       {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                                            const pageNum = Math.max(0, pagination.currentPage - 2) + i;
                                                            if (pageNum >= pagination.totalPages) return null;

                                                            return (
                                                                 <button
                                                                      key={pageNum}
                                                                      onClick={() => handlePageChange(pageNum)}
                                                                      className={`px-2 sm:px-3 py-1 text-xs sm:text-sm border rounded-md ${pageNum === pagination.currentPage
                                                                           ? 'bg-blue-600 text-white border-blue-600'
                                                                           : 'border-slate-600 hover:bg-slate-700 text-white bg-slate-700/50'
                                                                           }`}
                                                                 >
                                                                      {pageNum + 1}
                                                                 </button>
                                                            );
                                                       })}
                                                  </div>

                                                  <button
                                                       onClick={() => handlePageChange(pagination.currentPage + 1)}
                                                       disabled={pagination.currentPage >= pagination.totalPages - 1}
                                                       className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-slate-600 rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-white bg-slate-700/50"
                                                  >
                                                       Next
                                                  </button>
                                             </div>
                                        </div>
                                   )}
                              </>
                         ) : (
                              <div className="text-center py-12">
                                   <UsersIcon className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                                   <p className="text-slate-300">No users found</p>
                                   <p className="text-sm text-slate-400 mt-1">
                                        {searchTerm ? 'Try adjusting your search' : 'Create your first user to get started'}
                                   </p>
                              </div>
                         )}
                    </div>
               </div>

               {/* Create User Modal */}
               {showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50 overflow-hidden">
                         <div className="bg-slate-800 rounded-xl w-full max-w-2xl mx-3 sm:mx-4 p-4 sm:p-6 max-h-[90vh] overflow-y-auto border border-slate-700">
                              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6 w-full">
                                   <div className="bg-blue-500/20 p-2 rounded-lg flex-shrink-0 border border-blue-500/30">
                                        <PlusIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                                   </div>
                                   <h3 className="text-base sm:text-lg font-semibold text-white break-words min-w-0">Create New User</h3>
                              </div>

                              <form onSubmit={handleCreateUser} className="space-y-4 sm:space-y-6 w-full">
                                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                        <div className="w-full">
                                             <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">
                                                  Full Name
                                             </label>
                                             <input
                                                  type="text"
                                                  id="fullName"
                                                  name="fullName"
                                                  value={newUser.fullName}
                                                  onChange={handleInputChange}
                                                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                  placeholder="Enter full name"
                                                  required
                                             />
                                        </div>

                                        <div className="w-full">
                                             <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                                  Email Address
                                             </label>
                                             <input
                                                  type="email"
                                                  id="email"
                                                  name="email"
                                                  value={newUser.email}
                                                  onChange={handleInputChange}
                                                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                  placeholder="Enter email address"
                                                  required
                                             />
                                        </div>
                                   </div>

                                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                        <div className="w-full">
                                             <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                                  Password
                                             </label>
                                             <div className="relative w-full">
                                                  <input
                                                       type={showPassword ? 'text' : 'password'}
                                                       id="password"
                                                       name="password"
                                                       value={newUser.password}
                                                       onChange={handleInputChange}
                                                       className="w-full px-3 py-2 pr-10 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                       placeholder="Enter password"
                                                       required
                                                       minLength={6}
                                                  />
                                                  <button
                                                       type="button"
                                                       className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                       onClick={() => setShowPassword(!showPassword)}
                                                  >
                                                       {showPassword ? (
                                                            <EyeSlashIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 hover:text-slate-300" />
                                                       ) : (
                                                            <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 hover:text-slate-300" />
                                                       )}
                                                  </button>
                                             </div>
                                        </div>

                                        <div className="w-full">
                                             <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                                                  Confirm Password
                                             </label>
                                             <div className="relative w-full">
                                                  <input
                                                       type={showConfirmPassword ? 'text' : 'password'}
                                                       id="confirmPassword"
                                                       name="confirmPassword"
                                                       value={newUser.confirmPassword}
                                                       onChange={handleInputChange}
                                                       className="w-full px-3 py-2 pr-10 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                       placeholder="Confirm password"
                                                       required
                                                       minLength={6}
                                                  />
                                                  <button
                                                       type="button"
                                                       className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                       onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                  >
                                                       {showConfirmPassword ? (
                                                            <EyeSlashIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 hover:text-slate-300" />
                                                       ) : (
                                                            <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 hover:text-slate-300" />
                                                       )}
                                                  </button>
                                             </div>
                                        </div>
                                   </div>

                                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                        <div className="w-full">
                                             <label htmlFor="balance" className="block text-sm font-medium text-slate-300 mb-2">
                                                  Initial Balance (Optional)
                                             </label>
                                             <input
                                                  type="number"
                                                  id="balance"
                                                  name="balance"
                                                  value={newUser.balance}
                                                  onChange={handleInputChange}
                                                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                  placeholder="0.00"
                                                  min="0"
                                                  step="0.01"
                                             />
                                        </div>

                                        <div className="w-full">
                                             <label htmlFor="accountType" className="block text-sm font-medium text-slate-300 mb-2">
                                                  Account Type
                                             </label>
                                             <select
                                                  id="accountType"
                                                  name="accountType"
                                                  value={newUser.accountType}
                                                  onChange={handleInputChange}
                                                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                             >
                                                  <option value="SAVINGS">Savings Account</option>
                                                  <option value="CURRENT">Current Account</option>
                                             </select>
                                        </div>
                                   </div>

                                   <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full">
                                        <button
                                             type="button"
                                             onClick={() => setShowCreateModal(false)}
                                             className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors flex-1 order-2 sm:order-1"
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="submit"
                                             disabled={loading}
                                             className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg transition-colors flex-1 flex items-center justify-center disabled:opacity-50 order-1 sm:order-2"
                                        >
                                             {loading ? (
                                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                             ) : (
                                                  'Create User'
                                             )}
                                        </button>
                                   </div>
                              </form>
                         </div>
                    </div>
               )}

               {/* Delete Confirmation Modal */}
               {showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50 overflow-hidden">
                         <div className="bg-white rounded-xl w-full max-w-md mx-3 sm:mx-4 p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
                              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4 w-full">
                                   <div className="bg-red-100 p-2 rounded-lg flex-shrink-0">
                                        <ExclamationTriangleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                                   </div>
                                   <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words min-w-0">Delete User</h3>
                              </div>

                              <div className="mb-4 sm:mb-6 w-full">
                                   <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base break-words">
                                        Are you sure you want to delete <strong>{selectedUser?.fullName}</strong>? This action cannot be undone.
                                   </p>
                                   <div className="bg-red-50 border border-red-200 rounded-lg p-3 w-full">
                                        <p className="text-xs sm:text-sm text-red-700">
                                             <strong>This will permanently:</strong>
                                        </p>
                                        <ul className="text-xs sm:text-sm text-red-700 mt-1 list-disc list-inside space-y-1 break-words">
                                             <li>Delete the user account and all associated data</li>
                                             <li>Remove access to their banking services</li>
                                             <li>Cancel any pending transactions</li>
                                        </ul>
                                   </div>
                              </div>

                              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full">
                                   <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="btn-secondary flex-1 order-2 sm:order-1"
                                   >
                                        Cancel
                                   </button>
                                   <button
                                        onClick={handleDeleteUser}
                                        disabled={loading}
                                        className="btn-danger flex-1 flex items-center justify-center disabled:opacity-50 order-1 sm:order-2"
                                   >
                                        {loading ? (
                                             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        ) : (
                                             'Delete User'
                                        )}
                                   </button>
                              </div>
                         </div>
                    </div>
               )}

               {/* View User Modal */}
               {showViewModal && selectedUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50 overflow-hidden">
                         <div className="bg-slate-800 rounded-xl w-full max-w-2xl mx-3 sm:mx-4 p-4 sm:p-6 max-h-[90vh] overflow-y-auto border border-slate-700">
                              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6 w-full">
                                   <div className="bg-blue-500/20 p-2 rounded-lg flex-shrink-0 border border-blue-500/30">
                                        <EyeIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                                   </div>
                                   <h3 className="text-base sm:text-lg font-semibold text-white break-words min-w-0">User Details</h3>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                   <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                                        <p className="text-white bg-slate-700/50 rounded-lg p-3 border border-slate-600">{selectedUser.fullName}</p>
                                   </div>
                                   <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                                        <p className="text-white bg-slate-700/50 rounded-lg p-3 border border-slate-600 break-all">{selectedUser.email}</p>
                                   </div>
                                   <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">User ID</label>
                                        <p className="text-white bg-slate-700/50 rounded-lg p-3 border border-slate-600 font-mono text-sm break-all">{selectedUser.userId}</p>
                                   </div>
                                   <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(selectedUser.role)}`}>
                                             {selectedUser.role}
                                        </span>
                                   </div>
                                   <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Account Number</label>
                                        <p className="text-white bg-slate-700/50 rounded-lg p-3 border border-slate-600 font-mono">{selectedUser.accountNumber || 'N/A'}</p>
                                   </div>
                                   <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Account Type</label>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getAccountTypeBadgeColor(selectedUser.accountType)}`}>
                                             {selectedUser.accountType || 'N/A'}
                                        </span>
                                   </div>
                                   <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Balance</label>
                                        <p className="text-white bg-slate-700/50 rounded-lg p-3 border border-slate-600 text-xl font-bold">{formatCurrency(selectedUser.balance || 0)}</p>
                                   </div>
                              </div>

                              <div className="flex justify-end mt-6">
                                   <button
                                        onClick={() => setShowViewModal(false)}
                                        className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
                                   >
                                        Close
                                   </button>
                              </div>
                         </div>
                    </div>
               )}

               {/* Edit User Modal */}
               {showEditModal && selectedUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50 overflow-hidden">
                         <div className="bg-slate-800 rounded-xl w-full max-w-2xl mx-3 sm:mx-4 p-4 sm:p-6 max-h-[90vh] overflow-y-auto border border-slate-700">
                              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6 w-full">
                                   <div className="bg-yellow-500/20 p-2 rounded-lg flex-shrink-0 border border-yellow-500/30">
                                        <PencilIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
                                   </div>
                                   <h3 className="text-base sm:text-lg font-semibold text-white break-words min-w-0">Edit User</h3>
                              </div>

                              <form onSubmit={handleUpdateUser} className="space-y-4 sm:space-y-6 w-full">
                                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                        <div className="w-full">
                                             <label htmlFor="editFullName" className="block text-sm font-medium text-slate-300 mb-2">
                                                  Full Name
                                             </label>
                                             <input
                                                  type="text"
                                                  id="editFullName"
                                                  name="fullName"
                                                  value={editUser.fullName}
                                                  onChange={handleEditInputChange}
                                                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                  required
                                             />
                                        </div>

                                        <div className="w-full">
                                             <label htmlFor="editEmail" className="block text-sm font-medium text-slate-300 mb-2">
                                                  Email Address
                                             </label>
                                             <input
                                                  type="email"
                                                  id="editEmail"
                                                  name="email"
                                                  value={editUser.email}
                                                  onChange={handleEditInputChange}
                                                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                  required
                                             />
                                        </div>
                                   </div>

                                   <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full">
                                        <button
                                             type="button"
                                             onClick={() => setShowEditModal(false)}
                                             className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors flex-1 order-2 sm:order-1"
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="submit"
                                             disabled={loading}
                                             className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white px-4 py-2 rounded-lg transition-colors flex-1 flex items-center justify-center disabled:opacity-50 order-1 sm:order-2"
                                        >
                                             {loading ? (
                                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                             ) : (
                                                  'Update User'
                                             )}
                                        </button>
                                   </div>
                              </form>
                         </div>
                    </div>
               )}
          </div>
     );
};

export default AdminDashboard;
