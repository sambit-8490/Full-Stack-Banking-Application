import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import {
     UserIcon,
     EnvelopeIcon,
     BanknotesIcon,
     ShieldCheckIcon,
     PencilIcon,
     TrashIcon,
     ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
     const { user, logout, fetchUserData } = useAuth();
     const [isEditing, setIsEditing] = useState(false);
     const [showDeleteModal, setShowDeleteModal] = useState(false);
     const [showPasswordModal, setShowPasswordModal] = useState(false);
     const [loading, setLoading] = useState(false);
     const [formData, setFormData] = useState({
          fullName: user?.fullName || '',
          email: user?.email || ''
     });
     const [passwordData, setPasswordData] = useState({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
     });

     const handleInputChange = (e) => {
          const { name, value } = e.target;
          setFormData(prev => ({
               ...prev,
               [name]: value
          }));
     };

     const handlePasswordChange = (e) => {
          const { name, value } = e.target;
          setPasswordData(prev => ({
               ...prev,
               [name]: value
          }));
     };

     const handleUpdateProfile = async (e) => {
          e.preventDefault();

          if (!formData.fullName.trim()) {
               toast.error('Full name is required');
               return;
          }

          if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
               toast.error('Please enter a valid email');
               return;
          }

          try {
               setLoading(true);
               await api.updateUser(user.userId, {
                    fullName: formData.fullName.trim(),
                    email: formData.email.toLowerCase().trim()
               });

               await fetchUserData();
               setIsEditing(false);
               toast.success('Profile updated successfully!');
          } catch (error) {
               const errorMessage = error.response?.data?.message || 'Failed to update profile';
               toast.error(errorMessage);
          } finally {
               setLoading(false);
          }
     };

     const handleUpdatePassword = async (e) => {
          e.preventDefault();

          if (!passwordData.currentPassword.trim()) {
               toast.error('Current password is required');
               return;
          }

          if (!passwordData.newPassword.trim()) {
               toast.error('New password is required');
               return;
          }

          if (passwordData.newPassword.length < 6) {
               toast.error('New password must be at least 6 characters');
               return;
          }

          if (passwordData.newPassword !== passwordData.confirmPassword) {
               toast.error('New passwords do not match');
               return;
          }

          try {
               setLoading(true);
               await api.changePassword({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
               });

               setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
               });
               setShowPasswordModal(false);
               toast.success('Password updated successfully!');
          } catch (error) {
               const errorMessage = error.response?.data || 'Failed to update password';
               toast.error(errorMessage);
          } finally {
               setLoading(false);
          }
     };

     const handleDeleteAccount = async () => {
          try {
               setLoading(true);
               await api.deleteUser(user.userId);
               toast.success('Account deleted successfully');
               logout();
          } catch (error) {
               const errorMessage = error.response?.data?.message || 'Failed to delete account';
               toast.error(errorMessage);
          } finally {
               setLoading(false);
               setShowDeleteModal(false);
          }
     };

     const cancelEdit = () => {
          setFormData({
               fullName: user?.fullName || '',
               email: user?.email || ''
          });
          setIsEditing(false);
     };

     const formatCurrency = (amount) => {
          return new Intl.NumberFormat('en-IN', {
               style: 'currency',
               currency: 'INR'
          }).format(amount);
     };

     const getAccountTypeColor = (type) => {
          return type === 'SAVINGS' ? 'text-green-600 bg-green-100' : 'text-blue-600 bg-blue-100';
     };

     return (
          <div className="min-h-screen bg-gray-50 py-4 sm:py-8 overflow-x-hidden">
               <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                         <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">Profile Settings</h1>
                         <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base break-words">
                              Manage your account information and settings
                         </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 w-full">
                         {/* Profile Information */}
                         <div className="lg:col-span-2 w-full min-w-0">
                              <div className="card w-full">
                                   <div className="flex items-center justify-between mb-4 sm:mb-6 w-full">
                                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 break-words min-w-0 flex-1">Personal Information</h2>
                                        {!isEditing && (
                                             <button
                                                  onClick={() => setIsEditing(true)}
                                                  className="flex items-center space-x-1 sm:space-x-2 text-banking-600 hover:text-banking-700 font-medium text-sm sm:text-base flex-shrink-0"
                                             >
                                                  <PencilIcon className="h-4 w-4" />
                                                  <span className="hidden sm:inline">Edit</span>
                                             </button>
                                        )}
                                   </div>

                                   {isEditing ? (
                                        <form onSubmit={handleUpdateProfile} className="space-y-4 sm:space-y-6 w-full">
                                             <div className="w-full">
                                                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                                                       Full Name
                                                  </label>
                                                  <div className="relative w-full">
                                                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                                       </div>
                                                       <input
                                                            type="text"
                                                            id="fullName"
                                                            name="fullName"
                                                            value={formData.fullName}
                                                            onChange={handleInputChange}
                                                            className="input-field pl-8 sm:pl-10 w-full"
                                                            placeholder="Enter your full name"
                                                            required
                                                       />
                                                  </div>
                                             </div>

                                             <div className="w-full">
                                                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                                       Email Address
                                                  </label>
                                                  <div className="relative w-full">
                                                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <EnvelopeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                                       </div>
                                                       <input
                                                            type="email"
                                                            id="email"
                                                            name="email"
                                                            value={formData.email}
                                                            onChange={handleInputChange}
                                                            className="input-field pl-8 sm:pl-10 w-full"
                                                            placeholder="Enter your email"
                                                            required
                                                       />
                                                  </div>
                                             </div>

                                             <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                                                  <button
                                                       type="submit"
                                                       disabled={loading}
                                                       className="btn-primary flex-1 flex items-center justify-center disabled:opacity-50 order-2 sm:order-1"
                                                  >
                                                       {loading ? (
                                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                       ) : (
                                                            'Save Changes'
                                                       )}
                                                  </button>
                                                  <button
                                                       type="button"
                                                       onClick={cancelEdit}
                                                       className="btn-secondary flex-1 order-1 sm:order-2"
                                                  >
                                                       Cancel
                                                  </button>
                                             </div>
                                        </form>
                                   ) : (
                                        <div className="space-y-4 sm:space-y-6 w-full">
                                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 w-full">
                                                  <div className="min-w-0">
                                                       <label className="block text-sm font-medium text-gray-600 mb-1">
                                                            Full Name
                                                       </label>
                                                       <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                                                            <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                                                            <span className="text-gray-900 font-medium text-sm sm:text-base break-words min-w-0">{user?.fullName}</span>
                                                       </div>
                                                  </div>

                                                  <div className="min-w-0">
                                                       <label className="block text-sm font-medium text-gray-600 mb-1">
                                                            Email Address
                                                       </label>
                                                       <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                                                            <EnvelopeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                                                            <span className="text-gray-900 font-medium text-sm sm:text-base break-all min-w-0">{user?.email}</span>
                                                       </div>
                                                  </div>

                                                  <div className="min-w-0">
                                                       <label className="block text-sm font-medium text-gray-600 mb-1">
                                                            User ID
                                                       </label>
                                                       <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                                                            <ShieldCheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                                                            <span className="text-gray-900 font-mono text-xs sm:text-sm break-all min-w-0">{user?.userId}</span>
                                                       </div>
                                                  </div>

                                                  <div className="min-w-0">
                                                       <label className="block text-sm font-medium text-gray-600 mb-1">
                                                            Role
                                                       </label>
                                                       <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                                                            <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-banking-100 text-banking-800">
                                                                 {user?.role}
                                                            </span>
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>
                                   )}
                              </div>
                         </div>

                         {/* Account Overview */}
                         <div className="space-y-3 sm:space-y-4 lg:space-y-6 w-full min-w-0">
                              {/* Account Summary - Only show for non-admin users */}
                              {user?.role !== 'ADMIN' && (
                                   <div className="card w-full">
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 break-words">Account Summary</h3>

                                        <div className="space-y-3 sm:space-y-4 w-full">
                                             <div className="min-w-0">
                                                  <label className="block text-sm font-medium text-gray-600 mb-1">
                                                       Account Number
                                                  </label>
                                                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                                                       <BanknotesIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                                                       <span className="text-gray-900 font-mono font-medium text-sm sm:text-base break-all min-w-0">{user?.accountNumber || 'N/A'}</span>
                                                  </div>
                                             </div>

                                             <div className="min-w-0">
                                                  <label className="block text-sm font-medium text-gray-600 mb-1">
                                                       Account Type
                                                  </label>
                                                  <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${getAccountTypeColor(user?.accountType)}`}>
                                                       {user?.accountType}
                                                  </span>
                                             </div>

                                             <div className="min-w-0">
                                                  <label className="block text-sm font-medium text-gray-600 mb-1">
                                                       Current Balance
                                                  </label>
                                                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 break-words">
                                                       {formatCurrency(user?.balance || 0)}
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                              )}

                              {/* Admin Info - Only show for admin users */}
                              {user?.role === 'ADMIN' && (
                                   <div className="card w-full">
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 break-words">Administrator Profile</h3>
                                        <div className="space-y-3 sm:space-y-4 w-full">
                                             <div className="min-w-0">
                                                  <label className="block text-sm font-medium text-gray-600 mb-1">
                                                       Role
                                                  </label>
                                                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                                                       <ShieldCheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0" />
                                                       <span className="text-gray-900 font-medium text-sm sm:text-base">Administrator</span>
                                                  </div>
                                             </div>
                                             <div className="min-w-0">
                                                  <label className="block text-sm font-medium text-gray-600 mb-1">
                                                       Permissions
                                                  </label>
                                                  <p className="text-sm text-gray-700">Full system access, user management, and administrative controls</p>
                                             </div>
                                        </div>
                                   </div>
                              )}

                              {/* Security Section */}
                              <div className="card">
                                   <h3 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Security</h3>

                                   <div className="space-y-2 sm:space-y-3">
                                        <button
                                             onClick={() => setShowPasswordModal(true)}
                                             className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                             <div className="flex items-center space-x-3">
                                                  <ShieldCheckIcon className="h-5 w-5 text-gray-600 flex-shrink-0" />
                                                  <div className="min-w-0">
                                                       <p className="font-medium text-gray-900 text-sm sm:text-base">Change Password</p>
                                                       <p className="text-xs sm:text-sm text-gray-600">Update your account password</p>
                                                  </div>
                                             </div>
                                        </button>

                                        <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                                             <div className="flex items-center space-x-3">
                                                  <ShieldCheckIcon className="h-5 w-5 text-gray-600 flex-shrink-0" />
                                                  <div className="min-w-0">
                                                       <p className="font-medium text-gray-900 text-sm sm:text-base">Two-Factor Auth</p>
                                                       <p className="text-xs sm:text-sm text-gray-600">Add extra security to your account</p>
                                                  </div>
                                             </div>
                                        </button>
                                   </div>
                              </div>

                              {/* Danger Zone */}
                              <div className="card border-red-200">
                                   <h3 className="text-lg font-semibold text-red-900 mb-3 sm:mb-4">Danger Zone</h3>

                                   <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                                        <div className="flex items-start space-x-2 sm:space-x-3">
                                             <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                             <div className="flex-1 min-w-0">
                                                  <h4 className="font-medium text-red-900 mb-1 text-sm sm:text-base">Delete Account</h4>
                                                  <p className="text-xs sm:text-sm text-red-700 mb-2 sm:mb-3">
                                                       Once you delete your account, there is no going back. Please be certain.
                                                  </p>
                                                  <button
                                                       onClick={() => setShowDeleteModal(true)}
                                                       className="btn-danger text-xs sm:text-sm flex items-center space-x-1 sm:space-x-2"
                                                  >
                                                       <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                                       <span>Delete Account</span>
                                                  </button>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Password Change Modal */}
               {showPasswordModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50 overflow-hidden">
                         <div className="bg-white rounded-xl w-full max-w-md mx-3 sm:mx-4 p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
                              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4 w-full">
                                   <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                                        <ShieldCheckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                                   </div>
                                   <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words min-w-0">Change Password</h3>
                              </div>

                              <form onSubmit={handleUpdatePassword} className="space-y-3 sm:space-y-4 w-full">
                                   <div className="w-full">
                                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                             Current Password
                                        </label>
                                        <input
                                             type="password"
                                             id="currentPassword"
                                             name="currentPassword"
                                             value={passwordData.currentPassword}
                                             onChange={handlePasswordChange}
                                             className="input-field w-full"
                                             placeholder="Enter current password"
                                             required
                                        />
                                   </div>

                                   <div className="w-full">
                                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                             New Password
                                        </label>
                                        <input
                                             type="password"
                                             id="newPassword"
                                             name="newPassword"
                                             value={passwordData.newPassword}
                                             onChange={handlePasswordChange}
                                             className="input-field w-full"
                                             placeholder="Enter new password"
                                             required
                                             minLength={6}
                                        />
                                   </div>

                                   <div className="w-full">
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                             Confirm New Password
                                        </label>
                                        <input
                                             type="password"
                                             id="confirmPassword"
                                             name="confirmPassword"
                                             value={passwordData.confirmPassword}
                                             onChange={handlePasswordChange}
                                             className="input-field w-full"
                                             placeholder="Confirm new password"
                                             required
                                             minLength={6}
                                        />
                                   </div>

                                   <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-6">
                                        <button
                                             type="button"
                                             onClick={() => {
                                                  setShowPasswordModal(false);
                                                  setPasswordData({
                                                       currentPassword: '',
                                                       newPassword: '',
                                                       confirmPassword: ''
                                                  });
                                             }}
                                             className="btn-secondary flex-1 order-2 sm:order-1"
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="submit"
                                             disabled={loading}
                                             className="btn-primary flex-1 flex items-center justify-center disabled:opacity-50 order-1 sm:order-2"
                                        >
                                             {loading ? (
                                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                             ) : (
                                                  'Update Password'
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
                                   <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words min-w-0">Delete Account</h3>
                              </div>

                              <div className="mb-4 sm:mb-6 w-full">
                                   <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base break-words">
                                        Are you absolutely sure you want to delete your account? This action cannot be undone.
                                   </p>
                                   <div className="bg-red-50 border border-red-200 rounded-lg p-3 w-full">
                                        <p className="text-xs sm:text-sm text-red-700">
                                             <strong>This will permanently:</strong>
                                        </p>
                                        <ul className="text-xs sm:text-sm text-red-700 mt-1 list-disc list-inside space-y-1 break-words">
                                             <li>Delete your account and all associated data</li>
                                             <li>Remove access to your banking services</li>
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
                                        onClick={handleDeleteAccount}
                                        disabled={loading}
                                        className="btn-danger flex-1 flex items-center justify-center disabled:opacity-50 order-1 sm:order-2"
                                   >
                                        {loading ? (
                                             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        ) : (
                                             'Delete Account'
                                        )}
                                   </button>
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
};

export default Profile;
