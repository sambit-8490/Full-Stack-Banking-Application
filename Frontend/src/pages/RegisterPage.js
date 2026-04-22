import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
     EyeIcon,
     EyeSlashIcon,
     EnvelopeIcon,
     LockClosedIcon,
     UserIcon,
     CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const RegisterPage = () => {
     const [formData, setFormData] = useState({
          fullName: '',
          email: '',
          password: '',
          confirmPassword: '',
          balance: '',
          accountType: 'SAVINGS',
          role: 'USER'
     });
     const [showPassword, setShowPassword] = useState(false);
     const [showConfirmPassword, setShowConfirmPassword] = useState(false);
     const [errors, setErrors] = useState({});

     const { register, loading } = useAuth();
     const navigate = useNavigate();

     const handleChange = (e) => {
          const { name, value } = e.target;
          setFormData(prev => ({
               ...prev,
               [name]: value
          }));
          // Clear error when user starts typing
          if (errors[name]) {
               setErrors(prev => ({
                    ...prev,
                    [name]: ''
               }));
          }
     };

     const validateForm = () => {
          const newErrors = {};

          if (!formData.fullName.trim()) {
               newErrors.fullName = 'Full name is required';
          }

          if (!formData.email) {
               newErrors.email = 'Email is required';
          } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
               newErrors.email = 'Please enter a valid email';
          }

          if (!formData.password) {
               newErrors.password = 'Password is required';
          } else if (formData.password.length < 6) {
               newErrors.password = 'Password must be at least 6 characters';
          }

          if (!formData.confirmPassword) {
               newErrors.confirmPassword = 'Please confirm your password';
          } else if (formData.password !== formData.confirmPassword) {
               newErrors.confirmPassword = 'Passwords do not match';
          }

          if (formData.balance && (isNaN(formData.balance) || parseFloat(formData.balance) < 0)) {
               newErrors.balance = 'Please enter a valid amount';
          }

          setErrors(newErrors);
          return Object.keys(newErrors).length === 0;
     };

     const handleSubmit = async (e) => {
          e.preventDefault();

          if (!validateForm()) return;

          const registerData = {
               fullName: formData.fullName.trim(),
               email: formData.email.toLowerCase(),
               password: formData.password,
               balance: parseFloat(formData.balance) || 0,
               accountType: formData.accountType,
               role: formData.role
          };

          console.log('Attempting registration with data:', registerData);

          try {
               const result = await register(registerData);
               console.log('Registration result:', result);

               if (result && result.success) {
                    // Show success message and redirect to login
                    setTimeout(() => {
                         navigate('/login', {
                              state: {
                                   message: 'Registration successful! Please check your email and verify your account before logging in.',
                                   email: formData.email
                              }
                         });
                    }, 2000); // Give time for the toast to be seen
               } else {
                    console.error('Registration failed:', result?.error || 'Unknown error');
               }
          } catch (error) {
               console.error('Registration error:', error);
          }
     };

     return (
          <div className="min-h-screen flex flex-col lg:flex-row overflow-x-hidden">
               {/* Left Side - Image/Branding */}
               <div className="hidden lg:block flex-1 gradient-bg relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center p-12">
                         <div className="text-center text-white max-w-lg">
                              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 break-words">
                                   Join SecureBank Today
                              </h3>
                              <p className="text-base sm:text-lg lg:text-xl text-banking-100 mb-6 sm:mb-8 break-words">
                                   Create your account and start managing your finances with confidence.
                              </p>
                              <div className="grid grid-cols-1 gap-4 sm:gap-6 max-w-sm mx-auto w-full">
                                   <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                                        <h4 className="font-semibold mb-2">Free Account</h4>
                                        <p className="text-sm text-banking-100">No monthly fees or hidden charges</p>
                                   </div>
                                   <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                                        <h4 className="font-semibold mb-2">Email Verification</h4>
                                        <p className="text-sm text-banking-100">Secure account activation via email</p>
                                   </div>
                                   <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                                        <h4 className="font-semibold mb-2">Instant Setup</h4>
                                        <p className="text-sm text-banking-100">Your account is ready after verification</p>
                                   </div>
                                   <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                                        <h4 className="font-semibold mb-2">Full Features</h4>
                                        <p className="text-sm text-banking-100">All banking features included</p>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Right Side - Form */}
               <div className="flex-1 flex items-center justify-center px-3 sm:px-4 lg:px-6 xl:px-8 py-8 lg:py-12 w-full min-w-0">
                    <div className="max-w-md w-full space-y-6 sm:space-y-8 min-w-0">
                         <div className="text-center">
                              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">
                                   Create Your Account
                              </h2>
                              <p className="mt-2 text-sm sm:text-base text-gray-600 break-words">
                                   Join thousands of satisfied customers
                              </p>
                         </div>

                         <form className="space-y-4 sm:space-y-6 w-full" onSubmit={handleSubmit}>
                              <div className="w-full">
                                   <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                   </label>
                                   <div className="relative w-full">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                             <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                        </div>
                                        <input
                                             id="fullName"
                                             name="fullName"
                                             type="text"
                                             value={formData.fullName}
                                             onChange={handleChange}
                                             className={`input-field pl-8 sm:pl-10 w-full ${errors.fullName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                                             placeholder="Enter your full name"
                                        />
                                   </div>
                                   {errors.fullName && (
                                        <p className="mt-1 text-sm text-red-600 break-words">{errors.fullName}</p>
                                   )}
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
                                             id="email"
                                             name="email"
                                             type="email"
                                             autoComplete="email"
                                             value={formData.email}
                                             onChange={handleChange}
                                             className={`input-field pl-8 sm:pl-10 w-full ${errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                                             placeholder="Enter your email"
                                        />
                                   </div>
                                   {errors.email && (
                                        <p className="mt-1 text-sm text-red-600 break-words">{errors.email}</p>
                                   )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                   <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                             Password
                                        </label>
                                        <div className="relative">
                                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                                             </div>
                                             <input
                                                  id="password"
                                                  name="password"
                                                  type={showPassword ? 'text' : 'password'}
                                                  value={formData.password}
                                                  onChange={handleChange}
                                                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                                                  placeholder="Create password"
                                             />
                                             <button
                                                  type="button"
                                                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                  onClick={() => setShowPassword(!showPassword)}
                                             >
                                                  {showPassword ? (
                                                       <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                                  ) : (
                                                       <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                                  )}
                                             </button>
                                        </div>
                                        {errors.password && (
                                             <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                        )}
                                   </div>

                                   <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                             Confirm Password
                                        </label>
                                        <div className="relative">
                                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                                             </div>
                                             <input
                                                  id="confirmPassword"
                                                  name="confirmPassword"
                                                  type={showConfirmPassword ? 'text' : 'password'}
                                                  value={formData.confirmPassword}
                                                  onChange={handleChange}
                                                  className={`input-field pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                                                  placeholder="Confirm password"
                                             />
                                             <button
                                                  type="button"
                                                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                             >
                                                  {showConfirmPassword ? (
                                                       <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                                  ) : (
                                                       <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                                  )}
                                             </button>
                                        </div>
                                        {errors.confirmPassword && (
                                             <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                                        )}
                                   </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                   <div>
                                        <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-2">
                                             Initial Deposit (Optional)
                                        </label>
                                        <div className="relative">
                                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                  <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                                             </div>
                                             <input
                                                  id="balance"
                                                  name="balance"
                                                  type="number"
                                                  min="0"
                                                  step="0.01"
                                                  value={formData.balance}
                                                  onChange={handleChange}
                                                  className={`input-field pl-10 ${errors.balance ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                                                  placeholder="0.00"
                                             />
                                        </div>
                                        {errors.balance && (
                                             <p className="mt-1 text-sm text-red-600">{errors.balance}</p>
                                        )}
                                   </div>

                                   <div>
                                        <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 mb-2">
                                             Account Type
                                        </label>
                                        <select
                                             id="accountType"
                                             name="accountType"
                                             value={formData.accountType}
                                             onChange={handleChange}
                                             className="input-field"
                                        >
                                             <option value="SAVINGS">Savings Account</option>
                                             <option value="CURRENT">Current Account</option>
                                        </select>
                                   </div>
                              </div>

                              <div className="flex items-center">
                                   <input
                                        id="terms"
                                        name="terms"
                                        type="checkbox"
                                        required
                                        className="h-4 w-4 text-banking-600 focus:ring-banking-500 border-gray-300 rounded"
                                   />
                                   <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                                        I agree to the{' '}
                                        <button type="button" className="text-banking-600 hover:text-banking-500 font-medium">
                                             Terms of Service
                                        </button>{' '}
                                        and{' '}
                                        <button type="button" className="text-banking-600 hover:text-banking-500 font-medium">
                                             Privacy Policy
                                        </button>
                                   </label>
                              </div>

                              <button
                                   type="submit"
                                   disabled={loading}
                                   className="btn-primary w-full flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                   {loading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                   ) : (
                                        'Create Account'
                                   )}
                              </button>

                              <div className="text-center">
                                   <p className="text-sm text-gray-600">
                                        Already have an account?{' '}
                                        <Link
                                             to="/login"
                                             className="font-medium text-banking-600 hover:text-banking-500"
                                        >
                                             Sign in here
                                        </Link>
                                   </p>
                              </div>
                         </form>
                    </div>
               </div>
          </div>
     );
};

export default RegisterPage;
