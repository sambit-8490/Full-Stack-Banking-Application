import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const LoginPage = () => {
     const [formData, setFormData] = useState({
          email: '',
          password: ''
     });
     const [showPassword, setShowPassword] = useState(false);
     const [errors, setErrors] = useState({});

     const { login, loading } = useAuth();
     const navigate = useNavigate();
     const location = useLocation();

     // Show registration success message if redirected from registration
     useEffect(() => {
          if (location.state?.message) {
               toast.info(location.state.message, {
                    autoClose: 8000,
                    position: "top-center"
               });
               if (location.state?.email) {
                    setFormData(prev => ({ ...prev, email: location.state.email }));
               }
          }
     }, [location.state]);

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

          if (!formData.email) {
               newErrors.email = 'Email is required';
          } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
               newErrors.email = 'Please enter a valid email';
          }

          if (!formData.password) {
               newErrors.password = 'Password is required';
          }

          setErrors(newErrors);
          return Object.keys(newErrors).length === 0;
     };

     const handleSubmit = async (e) => {
          e.preventDefault();

          if (!validateForm()) return;

          const result = await login(formData.email, formData.password);

          if (result.success) {
               // Redirect based on user role
               if (result.user?.role === 'ADMIN') {
                    navigate('/admin');
               } else {
                    navigate('/dashboard');
               }
          }
     };

     return (
          <div className="min-h-screen flex flex-col lg:flex-row overflow-x-hidden">
               {/* Left Side - Form */}
               <div className="flex-1 flex items-center justify-center px-3 sm:px-4 lg:px-6 xl:px-8 py-8 lg:py-12 w-full min-w-0">
                    <div className="max-w-md w-full space-y-6 sm:space-y-8 min-w-0">
                         <div className="text-center">
                              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">
                                   Welcome Back
                              </h2>
                              <p className="mt-2 text-sm sm:text-base text-gray-600 break-words">
                                   Sign in to your SecureBank account
                              </p>
                         </div>

                         <form className="space-y-4 sm:space-y-6 w-full" onSubmit={handleSubmit}>
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

                              <div className="w-full">
                                   <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                        Password
                                   </label>
                                   <div className="relative w-full">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                             <LockClosedIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                        </div>
                                        <input
                                             id="password"
                                             name="password"
                                             type={showPassword ? 'text' : 'password'}
                                             autoComplete="current-password"
                                             value={formData.password}
                                             onChange={handleChange}
                                             className={`input-field pl-8 sm:pl-10 pr-10 w-full ${errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                                             placeholder="Enter your password"
                                        />
                                        <button
                                             type="button"
                                             className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                             onClick={() => setShowPassword(!showPassword)}
                                        >
                                             {showPassword ? (
                                                  <EyeSlashIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
                                             ) : (
                                                  <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
                                             )}
                                        </button>
                                   </div>
                                   {errors.password && (
                                        <p className="mt-1 text-sm text-red-600 break-words">{errors.password}</p>
                                   )}
                              </div>

                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                                   <div className="flex items-center">
                                        <input
                                             id="remember-me"
                                             name="remember-me"
                                             type="checkbox"
                                             className="h-4 w-4 text-banking-600 focus:ring-banking-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                             Remember me
                                        </label>
                                   </div>

                                   <div className="text-sm">
                                        <button type="button" className="font-medium text-banking-600 hover:text-banking-500">
                                             Forgot your password?
                                        </button>
                                   </div>
                              </div>

                              <button
                                   type="submit"
                                   disabled={loading}
                                   className="btn-primary w-full flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                   {loading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                   ) : (
                                        'Sign In'
                                   )}
                              </button>

                              <div className="text-center">
                                   <p className="text-sm text-gray-600">
                                        Don't have an account?{' '}
                                        <Link
                                             to="/register"
                                             className="font-medium text-banking-600 hover:text-banking-500"
                                        >
                                             Create one now
                                        </Link>
                                   </p>
                              </div>
                         </form>
                    </div>
               </div>

               {/* Right Side - Image/Branding */}
               <div className="hidden lg:block flex-1 gradient-bg relative">
                    <div className="absolute inset-0 flex items-center justify-center p-12">
                         <div className="text-center text-white">
                              <h3 className="text-4xl font-bold mb-4">
                                   Secure Banking
                              </h3>
                              <p className="text-xl text-banking-100 mb-8">
                                   Experience the future of banking with enterprise-grade security and user-friendly interface.
                              </p>
                              <div className="grid grid-cols-1 gap-6 max-w-sm mx-auto">
                                   <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                                        <h4 className="font-semibold mb-2">Bank-Grade Security</h4>
                                        <p className="text-sm text-banking-100">End-to-end encryption protects your data</p>
                                   </div>
                                   <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                                        <h4 className="font-semibold mb-2">24/7 Availability</h4>
                                        <p className="text-sm text-banking-100">Access your account anytime, anywhere</p>
                                   </div>
                                   <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                                        <h4 className="font-semibold mb-2">Instant Transfers</h4>
                                        <p className="text-sm text-banking-100">Send money instantly to any account</p>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
};

export default LoginPage;
