/**
 * Landing Page Component
 * 
 * This is the main landing page that serves as the entry point for new visitors.
 * It showcases the bank's features and services with a modern, responsive design.
 * 
 * Features:
 * - Hero section with call-to-action buttons
 * - Feature grid showcasing bank capabilities
 * - Responsive design for all device sizes
 * - Dynamic content based on authentication status
 * - Professional banking theme with icons and animations
 * 
 * The page adapts its content based on whether the user is logged in:
 * - Authenticated users see "Go to Dashboard" button
 * - New visitors see "Get Started" and "Login" buttons
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
     ShieldCheckIcon,
     CurrencyDollarIcon,
     ChartBarIcon,
     DevicePhoneMobileIcon,
     ClockIcon,
     GlobeAltIcon,
     BanknotesIcon,
     ArrowRightIcon
} from '@heroicons/react/24/outline';

const LandingPage = () => {
     // Check if user is currently authenticated
     const { isAuthenticated } = useAuth();

     // Array of features to display in the features section
     // Each feature has an icon, title, and description
     const features = [
          {
               icon: ShieldCheckIcon,
               title: 'Bank-Grade Security',
               description: 'Your money and data are protected with enterprise-level encryption and security protocols.'
          },
          {
               icon: CurrencyDollarIcon,
               title: 'Easy Transactions',
               description: 'Send, receive, and manage your money with just a few clicks. Fast and reliable transfers.'
          },
          {
               icon: ChartBarIcon,
               title: 'Financial Insights',
               description: 'Track your spending patterns and get detailed transaction history with smart analytics.'
          },
          {
               icon: DevicePhoneMobileIcon,
               title: 'Mobile Friendly',
               description: 'Access your account anywhere, anytime with our responsive web application.'
          },
          {
               icon: ClockIcon,
               title: '24/7 Availability',
               description: 'Banking services available round the clock. No more waiting for business hours.'
          },
          {
               icon: GlobeAltIcon,
               title: 'Global Access',
               description: 'Manage your finances from anywhere in the world with secure online banking.'
          }
     ];

     // const stats = [
     //      { number: '10K+', label: 'Happy Customers' },
     //      { number: '₹50M+', label: 'Total Transactions' },
     //      { number: '99.9%', label: 'Uptime' },
     //      { number: '24/7', label: 'Support' }
     // ];

     return (
          <div className="min-h-screen">
               {/* Hero Section */}
               <section className="gradient-bg text-white py-12 sm:py-16 lg:py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                              <div>
                                   <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                                        Modern Banking
                                        <span className="block text-banking-200">Made Simple</span>
                                   </h1>
                                   <p className="text-lg sm:text-xl text-banking-100 mb-8 leading-relaxed">
                                        Experience the future of banking with SecureBank. Fast, secure, and user-friendly
                                        online banking platform built with cutting-edge technology.
                                   </p>
                                   <div className="flex flex-col sm:flex-row gap-4">
                                        {isAuthenticated ? (
                                             <Link
                                                  to="/dashboard"
                                                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-banking-600 font-semibold rounded-lg hover:bg-banking-50 transition-colors group"
                                             >
                                                  Go to Dashboard
                                                  <ArrowRightIcon className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                                             </Link>
                                        ) : (
                                             <>
                                                  <Link
                                                       to="/register"
                                                       className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-banking-600 font-semibold rounded-lg hover:bg-banking-50 transition-colors group"
                                                  >
                                                       Get Started Free
                                                       <ArrowRightIcon className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                                                  </Link>
                                                  <Link
                                                       to="/login"
                                                       className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-banking-600 transition-colors"
                                                  >
                                                       Sign In
                                                  </Link>
                                             </>
                                        )}
                                   </div>
                              </div>

                              <div className="relative lg:mt-0 mt-8">
                                   <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20">
                                        <div className="flex items-center justify-between mb-6">
                                             <div className="flex items-center space-x-3">
                                                  <div className="bg-white/20 p-2 rounded-lg flex items-center justify-center">
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
                                                  <span className="font-semibold text-base sm:text-lg">Account Overview</span>
                                             </div>
                                             <span className="text-banking-200 text-sm">Demo</span>
                                        </div>

                                        <div className="space-y-4">
                                             <div className="bg-white/10 rounded-lg p-4">
                                                  <p className="text-banking-200 text-sm">Current Balance</p>
                                                  <p className="text-2xl sm:text-3xl font-bold">₹1,25,450.00</p>
                                             </div>

                                             <div className="grid grid-cols-2 gap-4">
                                                  <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                                                       <p className="text-banking-200 text-xs sm:text-sm">Income</p>
                                                       <p className="text-base sm:text-lg font-semibold text-green-300">+₹25,000</p>
                                                  </div>
                                                  <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                                                       <p className="text-banking-200 text-xs sm:text-sm">Expenses</p>
                                                       <p className="text-base sm:text-lg font-semibold text-red-300">-₹8,450</p>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </section>

               {/* Stats Section
               <section className="py-12 sm:py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                              {stats.map((stat, index) => (
                                   <div key={index} className="text-center">
                                        <div className="text-2xl sm:text-3xl font-bold text-banking-600 mb-2">
                                             {stat.number}
                                        </div>
                                        <div className="text-sm sm:text-base text-gray-600 font-medium">
                                             {stat.label}
                                        </div>
                                   </div>
                              ))}
                         </div>
                    </div>
               </section> */}

               {/* Features Section */}
               <section className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                         <div className="text-center mb-16">
                              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                   Why Choose SecureBank?
                              </h2>
                              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                   Built with the latest technology and security standards to provide you
                                   with the best banking experience.
                              </p>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                              {features.map((feature, index) => (
                                   <div key={index} className="card hover:shadow-xl transition-shadow duration-300">
                                        <div className="flex items-start space-x-4">
                                             <div className="bg-banking-100 p-3 rounded-lg flex-shrink-0">
                                                  <feature.icon className="h-6 w-6 text-banking-600" />
                                             </div>
                                             <div>
                                                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                                       {feature.title}
                                                  </h3>
                                                  <p className="text-gray-600 leading-relaxed">
                                                       {feature.description}
                                                  </p>
                                             </div>
                                        </div>
                                   </div>
                              ))}
                         </div>
                    </div>
               </section>

               {/* CTA Section */}
               <section className="py-20 gradient-bg text-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                         <h2 className="text-3xl md:text-4xl font-bold mb-4">
                              Ready to Get Started?
                         </h2>
                         <p className="text-xl text-banking-100 mb-8">
                              Join thousands of users who trust SecureBank for their financial needs.
                         </p>
                         {!isAuthenticated && (
                              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                   <Link
                                        to="/register"
                                        className="inline-flex items-center justify-center px-8 py-4 bg-white text-banking-600 font-semibold rounded-lg hover:bg-banking-50 transition-colors group"
                                   >
                                        Create Free Account
                                        <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                   </Link>
                                   <Link
                                        to="/login"
                                        className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-banking-600 transition-colors"
                                   >
                                        Sign In
                                   </Link>
                              </div>
                         )}
                    </div>
               </section>
          </div>
     );
};

export default LandingPage;
