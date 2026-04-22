import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import {
     BanknotesIcon,
     ArrowUpIcon,
     ArrowDownIcon,
     ArrowsRightLeftIcon,
     MagnifyingGlassIcon,
     FunnelIcon,
     DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

const TransactionHistory = () => {
     const [transactions, setTransactions] = useState([]);
     const [loading, setLoading] = useState(false);
     const [pagination, setPagination] = useState({
          currentPage: 0,
          totalPages: 0,
          totalElements: 0,
          size: 10
     });
     const [filters, setFilters] = useState({
          type: 'all',
          search: ''
     });

     useEffect(() => {
          fetchTransactions();
     }, [pagination.currentPage, pagination.size]); // eslint-disable-line react-hooks/exhaustive-deps

     const fetchTransactions = async () => {
          try {
               setLoading(true);
               const response = await api.getTransactionHistory(pagination.currentPage, pagination.size);
               const data = response.data;

               setTransactions(data.content || []);
               setPagination(prev => ({
                    ...prev,
                    totalPages: data.totalPages || 0,
                    totalElements: data.totalElements || 0
               }));
          } catch (error) {
               toast.error('Failed to load transaction history');
          } finally {
               setLoading(false);
          }
     };

     const handlePageChange = (newPage) => {
          setPagination(prev => ({ ...prev, currentPage: newPage }));
     };

     const handleSizeChange = (newSize) => {
          setPagination(prev => ({ ...prev, size: newSize, currentPage: 0 }));
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

     const getTransactionBg = (type) => {
          switch (type) {
               case 'DEPOSIT':
               case 'CREDIT':
                    return 'bg-green-50';
               case 'WITHDRAW':
               case 'DEBIT':
                    return 'bg-red-50';
               case 'TRANSFER':
                    return 'bg-blue-50';
               default:
                    return 'bg-gray-50';
          }
     };

     const filteredTransactions = transactions.filter(transaction => {
          const matchesType = filters.type === 'all' || transaction.type.toLowerCase() === filters.type.toLowerCase();
          const matchesSearch = transaction.transactionId.toLowerCase().includes(filters.search.toLowerCase()) ||
               transaction.type.toLowerCase().includes(filters.search.toLowerCase());
          return matchesType && matchesSearch;
     });

     const exportTransactions = () => {
          // Simple CSV export functionality
          const csvContent = [
               ['Date', 'Type', 'Amount', 'Transaction ID'],
               ...filteredTransactions.map(t => [
                    formatDate(t.time),
                    t.type,
                    t.amount,
                    t.transactionId
               ])
          ].map(row => row.join(',')).join('\n');

          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'transaction-history.csv';
          a.click();
          window.URL.revokeObjectURL(url);
     };

     return (
          <div className="min-h-screen bg-gray-50 py-4 sm:py-8 overflow-x-hidden">
               <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                         <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">Transaction History</h1>
                         <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base break-words">
                              View and manage all your banking transactions
                         </p>
                    </div>

                    {/* Filters and Search */}
                    <div className="card mb-4 sm:mb-6 w-full">
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
                              {/* Search */}
                              <div className="relative w-full min-w-0">
                                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                   </div>
                                   <input
                                        type="text"
                                        placeholder="Search transactions..."
                                        value={filters.search}
                                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                        className="input-field pl-8 sm:pl-10 w-full"
                                   />
                              </div>

                              {/* Type Filter */}
                              <div className="relative w-full min-w-0">
                                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FunnelIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                   </div>
                                   <select
                                        value={filters.type}
                                        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                                        className="input-field pl-8 sm:pl-10 w-full"
                                   >
                                        <option value="all">All Types</option>
                                        <option value="deposit">Deposit</option>
                                        <option value="withdraw">Withdraw</option>
                                        <option value="transfer">Transfer</option>
                                        <option value="credit">Credit</option>
                                        <option value="debit">Debit</option>
                                   </select>
                              </div>

                              {/* Export Button */}
                              <div className="flex items-end w-full min-w-0">
                                   <button
                                        onClick={exportTransactions}
                                        className="btn-secondary flex items-center justify-center space-x-1 sm:space-x-2 w-full"
                                   >
                                        <DocumentArrowDownIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                        <span className="text-xs sm:text-sm">Export CSV</span>
                                   </button>
                              </div>
                         </div>
                    </div>

                    {/* Transaction List */}
                    <div className="card">
                         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                                   All Transactions ({pagination.totalElements})
                              </h2>

                              {/* Page Size Selector */}
                              <div className="flex items-center space-x-2">
                                   <span className="text-xs sm:text-sm text-gray-600">Show:</span>
                                   <select
                                        value={pagination.size}
                                        onChange={(e) => handleSizeChange(Number(e.target.value))}
                                        className="border border-gray-300 rounded px-2 py-1 text-xs sm:text-sm"
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
                                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-banking-600"></div>
                              </div>
                         ) : filteredTransactions.length > 0 ? (
                              <>
                                   {/* Desktop Table */}
                                   <div className="hidden md:block overflow-x-auto table-responsive w-full">
                                        <table className="min-w-full divide-y divide-gray-200">
                                             <thead className="bg-gray-50">
                                                  <tr>
                                                       <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Transaction
                                                       </th>
                                                       <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Date & Time
                                                       </th>
                                                       <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Amount
                                                       </th>
                                                       <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Transaction ID
                                                       </th>
                                                  </tr>
                                             </thead>
                                             <tbody className="bg-white divide-y divide-gray-200">
                                                  {filteredTransactions.map((transaction) => (
                                                       <tr key={transaction.transactionId} className="hover:bg-gray-50">
                                                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                                                 <div className="flex items-center">
                                                                      <div className={`p-1.5 sm:p-2 rounded-lg ${getTransactionBg(transaction.type)}`}>
                                                                           {getTransactionIcon(transaction.type)}
                                                                      </div>
                                                                      <div className="ml-2 sm:ml-3 min-w-0">
                                                                           <div className="text-xs sm:text-sm font-medium text-gray-900 break-words">
                                                                                {transaction.type}
                                                                           </div>
                                                                      </div>
                                                                 </div>
                                                            </td>
                                                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                                                                 {formatDate(transaction.time)}
                                                            </td>
                                                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                                                 <span className={`text-xs sm:text-sm font-semibold ${getTransactionColor(transaction.type)}`}>
                                                                      {transaction.type === 'DEPOSIT' || transaction.type === 'CREDIT' ? '+' : '-'}
                                                                      {formatCurrency(transaction.amount)}
                                                                 </span>
                                                            </td>
                                                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 font-mono break-all">
                                                                 {transaction.transactionId}
                                                            </td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                        </table>
                                   </div>

                                   {/* Mobile Cards */}
                                   <div className="md:hidden space-y-4">
                                        {filteredTransactions.map((transaction) => (
                                             <div
                                                  key={transaction.transactionId}
                                                  className={`p-4 rounded-lg border ${getTransactionBg(transaction.type)}`}
                                             >
                                                  <div className="flex items-center justify-between mb-2">
                                                       <div className="flex items-center space-x-3">
                                                            <div className="bg-white p-2 rounded-lg">
                                                                 {getTransactionIcon(transaction.type)}
                                                            </div>
                                                            <div>
                                                                 <p className="font-medium text-gray-900">{transaction.type}</p>
                                                                 <p className="text-sm text-gray-600">
                                                                      {formatDate(transaction.time)}
                                                                 </p>
                                                            </div>
                                                       </div>
                                                       <div className="text-right">
                                                            <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                                                                 {transaction.type === 'DEPOSIT' || transaction.type === 'CREDIT' ? '+' : '-'}
                                                                 {formatCurrency(transaction.amount)}
                                                            </p>
                                                       </div>
                                                  </div>
                                                  <div className="text-xs text-gray-500 font-mono bg-white px-2 py-1 rounded">
                                                       ID: {transaction.transactionId}
                                                  </div>
                                             </div>
                                        ))}
                                   </div>

                                   {/* Pagination */}
                                   {pagination.totalPages > 1 && (
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 space-y-3 sm:space-y-0">
                                             <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                                                  Showing {pagination.currentPage * pagination.size + 1} to{' '}
                                                  {Math.min((pagination.currentPage + 1) * pagination.size, pagination.totalElements)} of{' '}
                                                  {pagination.totalElements} results
                                             </div>

                                             <div className="flex items-center justify-center space-x-1 sm:space-x-2 overflow-x-auto">
                                                  <button
                                                       onClick={() => handlePageChange(pagination.currentPage - 1)}
                                                       disabled={pagination.currentPage === 0}
                                                       className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                                  >
                                                       Previous
                                                  </button>

                                                  {/* Page Numbers */}
                                                  <div className="flex space-x-1 sm:space-x-2">
                                                       {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                                            const pageNum = Math.max(0, pagination.currentPage - 2) + i;
                                                            if (pageNum >= pagination.totalPages) return null;

                                                            return (
                                                                 <button
                                                                      key={pageNum}
                                                                      onClick={() => handlePageChange(pageNum)}
                                                                      className={`px-2 sm:px-3 py-1 text-xs sm:text-sm border rounded-md ${pageNum === pagination.currentPage
                                                                           ? 'bg-banking-600 text-white border-banking-600'
                                                                           : 'border-gray-300 hover:bg-gray-50'
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
                                                       className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                                  >
                                                       Next
                                                  </button>
                                             </div>
                                        </div>
                                   )}
                              </>
                         ) : (
                              <div className="text-center py-12">
                                   <BanknotesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                   <p className="text-gray-600">No transactions found</p>
                                   <p className="text-sm text-gray-500 mt-1">
                                        {filters.search || filters.type !== 'all'
                                             ? 'Try adjusting your filters'
                                             : 'Your transactions will appear here once you start banking'}
                                   </p>
                              </div>
                         )}
                    </div>
               </div>
          </div>
     );
};

export default TransactionHistory;
