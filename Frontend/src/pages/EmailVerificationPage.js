import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const EmailVerificationPage = () => {
     const [searchParams] = useSearchParams();
     const [verificationStatus, setVerificationStatus] = useState('loading'); // 'loading', 'success', 'error', 'expired'
     const [message, setMessage] = useState('');
     const token = searchParams.get('token');
     const status = searchParams.get('status'); // Get status from URL parameters

     useEffect(() => {
          const verifyEmail = async () => {
               // If status is provided in URL, use it directly (from backend redirect)
               if (status) {
                    if (status === 'success') {
                         setVerificationStatus('success');
                         setMessage('Your email has been verified successfully!');
                         toast.success('Email verified! You can now log in to your account.');
                    } else if (status === 'error') {
                         setVerificationStatus('error');
                         setMessage('Email verification failed. The token may be invalid or expired.');
                         toast.error('Email verification failed');
                    }
                    return;
               }

               // Fallback: Make API call if no status in URL
               if (!token) {
                    setVerificationStatus('error');
                    setMessage('No verification token found.');
                    return;
               }

               try {
                    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/user/verify?token=${token}`, {
                         method: 'GET',
                         headers: {
                              'Content-Type': 'application/json'
                         }
                    });

                    if (response.ok) {
                         const data = await response.text();
                         setVerificationStatus('success');
                         setMessage(data || 'Your email has been verified successfully!');
                         toast.success('Email verified! You can now log in to your account.');
                    } else {
                         const errorData = await response.text();
                         if (errorData.includes('expired')) {
                              setVerificationStatus('expired');
                              setMessage('Your verification token has expired. Please register again.');
                         } else {
                              setVerificationStatus('error');
                              setMessage(errorData || 'Email verification failed. Please try again.');
                         }
                         toast.error(errorData || 'Email verification failed');
                    }
               } catch (error) {
                    console.error('Email verification error:', error);
                    setVerificationStatus('error');
                    setMessage('Network error. Please check your connection and try again.');
                    toast.error('Network error during verification');
               }
          };

          verifyEmail();
     }, [token, status]); // Add status to dependency array

     const getStatusIcon = () => {
          switch (verificationStatus) {
               case 'loading':
                    return <ClockIcon className="h-16 w-16 text-blue-500 animate-pulse" />;
               case 'success':
                    return <CheckCircleIcon className="h-16 w-16 text-green-500" />;
               case 'expired':
               case 'error':
               default:
                    return <XCircleIcon className="h-16 w-16 text-red-500" />;
          }
     };

     const getStatusColor = () => {
          switch (verificationStatus) {
               case 'loading':
                    return 'text-blue-600';
               case 'success':
                    return 'text-green-600';
               case 'expired':
               case 'error':
               default:
                    return 'text-red-600';
          }
     };

     const getStatusTitle = () => {
          switch (verificationStatus) {
               case 'loading':
                    return 'Verifying Your Email...';
               case 'success':
                    return 'Email Verified Successfully!';
               case 'expired':
                    return 'Verification Token Expired';
               case 'error':
               default:
                    return 'Verification Failed';
          }
     };

     return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
               <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                         {/* Logo */}
                         <div className="flex justify-center mb-6">
                              <img
                                   src="/logo.png"
                                   alt="SecureBank"
                                   className="h-12 w-auto"
                              />
                         </div>

                         {/* Status Icon */}
                         <div className="flex justify-center mb-6">
                              {getStatusIcon()}
                         </div>

                         {/* Status Title */}
                         <h2 className={`mt-6 text-center text-3xl font-bold ${getStatusColor()}`}>
                              {getStatusTitle()}
                         </h2>

                         {/* Status Message */}
                         <p className="mt-4 text-center text-gray-600 text-lg">
                              {message}
                         </p>

                         {/* Action Buttons */}
                         <div className="mt-8 space-y-4">
                              {verificationStatus === 'success' && (
                                   <Link
                                        to="/login"
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-gradient-to-r from-banking-500 to-banking-600 hover:from-banking-600 hover:to-banking-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-banking-500 font-medium transition-all duration-200"
                                   >
                                        Go to Login
                                   </Link>
                              )}

                              {(verificationStatus === 'expired' || verificationStatus === 'error') && (
                                   <div className="space-y-3">
                                        <Link
                                             to="/register"
                                             className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-gradient-to-r from-banking-500 to-banking-600 hover:from-banking-600 hover:to-banking-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-banking-500 font-medium transition-all duration-200"
                                        >
                                             {verificationStatus === 'expired' ? 'Register Again' : 'Try Again'}
                                        </Link>
                                        <Link
                                             to="/"
                                             className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-banking-500 font-medium transition-all duration-200"
                                        >
                                             Back to Home
                                        </Link>
                                   </div>
                              )}

                              {verificationStatus === 'loading' && (
                                   <div className="flex justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-banking-500"></div>
                                   </div>
                              )}
                         </div>
                    </div>

                    {/* Help Text */}
                    <div className="text-center text-sm text-gray-500">
                         <p>
                              Need help?{' '}
                              <Link to="/contact" className="text-banking-500 hover:text-banking-600 font-medium">
                                   Contact support
                              </Link>
                         </p>
                    </div>
               </div>
          </div>
     );
};

export default EmailVerificationPage;
