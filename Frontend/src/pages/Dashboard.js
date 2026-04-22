/**
 * User Dashboard Component
 * 
 * This component provides the main dashboard interface for regular bank users.
 * It displays:
 * - Account balance with toggle visibility option
 * - Quick action buttons for deposit, withdraw, and transfer
 * - Recent transaction history (last 5 transactions)
 * - Account statistics and overview
 * 
 * Features:
 * - Real-time balance updates after transactions
 * - Modal-based transaction forms with validation
 * - Responsive design for mobile and desktop
 * - Loading states for better UX
 * - Error handling with toast notifications
 * 
 * Note: Admin users are automatically redirected to the admin dashboard
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import {
     BanknotesIcon,
     ArrowUpIcon,
     ArrowDownIcon,
     ArrowsRightLeftIcon,
     ChartBarIcon,
     EyeIcon,
     EyeSlashIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
     // Get authentication context and navigation function
     const { user, fetchUserData } = useAuth();
     const navigate = useNavigate();

     // State for storing recent transactions
     const [transactions, setTransactions] = useState([]);

     // Redirect admin users to admin dashboard - they don't need user dashboard
     useEffect(() => {
          if (user?.role === 'ADMIN') {
               navigate('/admin');
               return;
          }
     }, [user, navigate]);

     // Loading states for different operations to provide user feedback
     const [loading, setLoading] = useState({
          transactions: false,    // Loading recent transactions
          deposit: false,        // Processing deposit
          withdraw: false,       // Processing withdrawal
          transfer: false        // Processing transfer
     });

     // State to toggle balance visibility for privacy
     const [showBalance, setShowBalance] = useState(true);

     // Modal state for transaction forms (deposit, withdraw, transfer)
     const [transactionModal, setTransactionModal] = useState({ open: false, type: '' });

     // Form data for transaction inputs
     const [transactionData, setTransactionData] = useState({
          amount: '',
          receiverAccount: ''    // Only used for transfers
     });

     // Fetch recent transactions when component mounts
     useEffect(() => {
          fetchRecentTransactions();
     }, []);

     /**
      * Fetches the 5 most recent transactions for the user
      * Used to display recent activity on the dashboard
      */
     const fetchRecentTransactions = async () => {
          try {
               setLoading(prev => ({ ...prev, transactions: true }));
               const response = await api.getTransactionHistory(0, 5);
               setTransactions(response.data.content || []);
          } catch (error) {
               toast.error('Failed to load transactions');
          } finally {
               setLoading(prev => ({ ...prev, transactions: false }));
          }
     };

     /**
      * Handles all transaction operations (deposit, withdraw, transfer)
      * Validates input, makes API calls, and updates user data
      * 
      * @param {string} type - Type of transaction ('deposit', 'withdraw', 'transfer')
      */
     const handleTransaction = async (type) => {
          // Validate amount input
          if (!transactionData.amount || parseFloat(transactionData.amount) <= 0) {
               toast.error('Please enter a valid amount');
               return;
          }

          try {
               // Set loading state for the specific transaction type
               setLoading(prev => ({ ...prev, [type]: true }));

               // Handle different transaction types
               switch (type) {
                    case 'deposit':
                         await api.deposit(parseFloat(transactionData.amount));
                         toast.success('Deposit successful!');
                         break;

                    case 'withdraw':
                         await api.withdraw(parseFloat(transactionData.amount));
                         toast.success('Withdrawal successful!');
                         break;

                    case 'transfer':
                         // Additional validation for transfer - need receiver account
                         if (!transactionData.receiverAccount) {
                              toast.error('Please enter receiver account number');
                              return;
                         }
                         await api.transfer({
                              senderAccountNumber: user.accountNumber,
                              recieverAccountNumber: parseInt(transactionData.receiverAccount),
                              amount: parseFloat(transactionData.amount)
                         });
                         toast.success('Transfer successful!');
                         break;
                    default:
                         return;
               }

               // Reset form and close modal
               setTransactionData({ amount: '', receiverAccount: '' });
               setTransactionModal({ open: false, type: '' });

               // Refresh data
               await fetchUserData();
               await fetchRecentTransactions();

          } catch (error) {
               const errorMessage = error.response?.data?.message || `${type} failed. Please try again.`;
               toast.error(errorMessage);
          } finally {
               setLoading(prev => ({ ...prev, [type]: false }));
          }
     };

     const openTransactionModal = (type) => {
          setTransactionModal({ open: true, type });
          setTransactionData({ amount: '', receiverAccount: '' });
     };

     const closeTransactionModal = () => {
          setTransactionModal({ open: false, type: '' });
          setTransactionData({ amount: '', receiverAccount: '' });
     };

     const formatCurrency = (amount) => {
          return new Intl.NumberFormat('en-IN', {
               style: 'currency',
               currency: 'INR'
          }).format(amount);
     };

     const formatDate = (dateString) => {
          return new Date(dateString).toLocaleDateString('en-IN', {
               year: 'numeric',
               month: 'short',
               day: 'numeric',
               hour: '2-digit',
               minute: '2-digit'
          });
     };

     const getTransactionIcon = (type) => {
          switch (type) {
               case 'DEPOSIT':
               case 'CREDIT':
                    return <ArrowDownIcon className="h-5 w-5 text-green-600" />;
               case 'WITHDRAW':
               case 'DEBIT':
                    return <ArrowUpIcon className="h-5 w-5 text-red-600" />;
               case 'TRANSFER':
                    return <ArrowsRightLeftIcon className="h-5 w-5 text-blue-600" />;
               default:
                    return <BanknotesIcon className="h-5 w-5 text-gray-600" />;
          }
     };

     const getTransactionColor = (type) => {
          switch (type) {
               case 'DEPOSIT':
               case 'CREDIT':
                    return 'text-green-600';
               case 'WITHDRAW':
               case 'DEBIT':
                    return 'text-red-600';
               case 'TRANSFER':
                    return 'text-blue-600';
               default:
                    return 'text-gray-600';
          }
     };

     return (
          <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                         <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                              Welcome back, {user?.fullName}!
                         </h1>
                         <p className="text-gray-600 mt-2 text-sm sm:text-base">
                              Manage your finances with ease and security.
                         </p>
                    </div>

                    {/* Account Overview */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                         {/* Balance Card */}
                         <div className="lg:col-span-2">
                              <div className="card">
                                   <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-semibold text-gray-900">Account Balance</h2>
                                        <button
                                             onClick={() => setShowBalance(!showBalance)}
                                             className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                             {showBalance ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                        </button>
                                   </div>

                                   <div className="mb-4">
                                        <p className="text-sm text-gray-600 mb-1">Current Balance</p>
                                        <p className="text-3xl sm:text-4xl font-bold text-gray-900">
                                             {showBalance ? formatCurrency(user?.balance || 0) : '••••••••'}
                                        </p>
                                   </div>

                                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                                        <div>
                                             <p className="text-sm text-gray-600">Account Number</p>
                                             <p className="font-semibold text-gray-900 text-sm sm:text-base">{user?.accountNumber}</p>
                                        </div>
                                        <div>
                                             <p className="text-sm text-gray-600">Account Type</p>
                                             <p className="font-semibold text-gray-900 text-sm sm:text-base">{user?.accountType}</p>
                                        </div>
                                   </div>
                              </div>
                         </div>

                         {/* Quick Actions */}
                         <div className="card">
                              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                              <div className="space-y-3">
                                   <button
                                        onClick={() => openTransactionModal('deposit')}
                                        className="w-full flex items-center space-x-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
                                   >
                                        <div className="bg-green-600 p-2 rounded-lg group-hover:bg-green-700 transition-colors flex-shrink-0">
                                             <ArrowDownIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                        </div>
                                        <span className="font-medium text-green-700 text-sm sm:text-base">Deposit Money</span>
                                   </button>

                                   <button
                                        onClick={() => openTransactionModal('withdraw')}
                                        className="w-full flex items-center space-x-3 p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors group"
                                   >
                                        <div className="bg-red-600 p-2 rounded-lg group-hover:bg-red-700 transition-colors flex-shrink-0">
                                             <ArrowUpIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                        </div>
                                        <span className="font-medium text-red-700 text-sm sm:text-base">Withdraw Money</span>
                                   </button>

                                   <button
                                        onClick={() => openTransactionModal('transfer')}
                                        className="w-full flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                                   >
                                        <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-700 transition-colors flex-shrink-0">
                                             <ArrowsRightLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                        </div>
                                        <span className="font-medium text-blue-700 text-sm sm:text-base">Transfer Money</span>
                                   </button>
                              </div>
                         </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="card">
                         <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                              <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
                              <a
                                   href="/transactions"
                                   className="text-banking-600 hover:text-banking-700 font-medium text-sm"
                              >
                                   View All
                              </a>
                         </div>

                         {loading.transactions ? (
                              <div className="flex justify-center py-8">
                                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-banking-600"></div>
                              </div>
                         ) : transactions.length > 0 ? (
                              <div className="space-y-4">
                                   {transactions.map((transaction) => (
                                        <div
                                             key={transaction.transactionId}
                                             className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-3"
                                        >
                                             <div className="flex items-center space-x-3">
                                                  <div className="bg-white p-2 rounded-lg">
                                                       {getTransactionIcon(transaction.type)}
                                                  </div>
                                                  <div>
                                                       <p className="font-medium text-gray-900 text-sm sm:text-base">{transaction.type}</p>
                                                       <p className="text-sm text-gray-600">
                                                            {formatDate(transaction.time)}
                                                       </p>
                                                  </div>
                                             </div>
                                             <div className="text-left sm:text-right ml-11 sm:ml-0">
                                                  <p className={`font-semibold text-sm sm:text-base ${getTransactionColor(transaction.type)}`}>
                                                       {transaction.type === 'DEPOSIT' || transaction.type === 'CREDIT' ? '+' : '-'}
                                                       {formatCurrency(transaction.amount)}
                                                  </p>
                                                  <p className="text-sm text-gray-600">
                                                       ID: {transaction.transactionId.slice(-8)}
                                                  </p>
                                             </div>
                                        </div>
                                   ))}
                              </div>
                         ) : (
                              <div className="text-center py-8">
                                   <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                   <p className="text-gray-600">No recent transactions</p>
                                   <p className="text-sm text-gray-500 mt-1">Your transaction history will appear here</p>
                              </div>
                         )}
                    </div>
               </div>

               {/* Transaction Modal */}
               {transactionModal.open && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                         <div className="bg-white rounded-lg sm:rounded-xl max-w-md w-full p-4 sm:p-6 mx-4">
                              <div className="flex items-center justify-between mb-4">
                                   <h3 className="text-lg font-semibold text-gray-900 capitalize">
                                        {transactionModal.type} Money
                                   </h3>
                                   <button
                                        onClick={closeTransactionModal}
                                        className="text-gray-400 hover:text-gray-600 p-1"
                                   >
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                   </button>
                              </div>

                              <form
                                   onSubmit={(e) => {
                                        e.preventDefault();
                                        handleTransaction(transactionModal.type);
                                   }}
                                   className="space-y-4"
                              >
                                   {transactionModal.type === 'transfer' && (
                                        <div>
                                             <label className="block text-sm font-medium text-gray-700 mb-2">
                                                  Receiver Account Number
                                             </label>
                                             <input
                                                  type="number"
                                                  value={transactionData.receiverAccount}
                                                  onChange={(e) => setTransactionData(prev => ({ ...prev, receiverAccount: e.target.value }))}
                                                  className="input-field"
                                                  placeholder="Enter account number"
                                                  required
                                             />
                                        </div>
                                   )}

                                   <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                             Amount (₹)
                                        </label>
                                        <input
                                             type="number"
                                             min="1"
                                             step="0.01"
                                             value={transactionData.amount}
                                             onChange={(e) => setTransactionData(prev => ({ ...prev, amount: e.target.value }))}
                                             className="input-field"
                                             placeholder="Enter amount"
                                             required
                                        />
                                   </div>

                                   <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                                        <button
                                             type="button"
                                             onClick={closeTransactionModal}
                                             className="btn-secondary flex-1 order-2 sm:order-1"
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="submit"
                                             disabled={loading[transactionModal.type]}
                                             className="btn-primary flex-1 flex items-center justify-center disabled:opacity-50 order-1 sm:order-2"
                                        >
                                             {loading[transactionModal.type] ? (
                                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                             ) : (
                                                  `${transactionModal.type === 'transfer' ? 'Transfer' : transactionModal.type.charAt(0).toUpperCase() + transactionModal.type.slice(1)}`
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

export default Dashboard;
