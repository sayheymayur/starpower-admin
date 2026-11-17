import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dashboardAPI from "../services/dashboardAPI";
import { formatLocalDate } from "../utils/dateUtils";
import useGoBack from "../hooks/useGoBack";

interface AccountTransaction {
  user_account_id_pk: number;
  user_id_fk: number;
  transaction_type: string;
  amount: number;
  client_ref_id: string | null;
  description: string | null;
  is_debit: boolean;
  is_credit: boolean;
  paid_by_admin: boolean;
  order_id: string | null;
  created_date_time: string;
  created_by: number;
  user: {
    user_id_pk: number;
    full_name: string | null;
    email_id: string | null;
    mobile_no: string;
    is_doctor: number;
  };
  transactionType: string;
}

interface AccountStats {
  totalTransactions: number;
  totalCredited: number;
  totalDebited: number;
  netBalance: number;
  creditCount: number;
  debitCount: number;
}

interface AccountFilters {
  page?: number;
  limit?: number;
  userId?: number;
  transactionType?: string;
  isCredit?: boolean;
  isDebit?: boolean;
  paidByAdmin?: boolean;
  startDate?: string;
  endDate?: string;
}

export default function AccountTransactions() {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [transactions, setTransactions] = useState<AccountTransaction[]>([]);
  const [stats, setStats] = useState<AccountStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchUserId, setSearchUserId] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("");
  const [transactionDirectionFilter, setTransactionDirectionFilter] = useState("");
  const [paidByAdminFilter, setPaidByAdminFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, [currentPage, pageSize]);

  useEffect(() => {
    if (transactions.length > 0) {
      calculateStatsFromTransactions();
    }
  }, [transactions]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: AccountFilters = {
        page: currentPage,
        limit: pageSize,
      };

      if (searchUserId) filters.userId = Number(searchUserId);
      if (transactionTypeFilter) filters.transactionType = transactionTypeFilter;
      if (transactionDirectionFilter === 'credit') filters.isCredit = true;
      if (transactionDirectionFilter === 'debit') filters.isDebit = true;
      if (paidByAdminFilter === 'yes') filters.paidByAdmin = true;
      if (paidByAdminFilter === 'no') filters.paidByAdmin = false;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const response = await dashboardAPI.getAccountTransactions(filters);

      if (response.success && response.data) {
        const transactionsData = Array.isArray(response.data) ? response.data : [];
        setTransactions(transactionsData as AccountTransaction[]);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalRecords(response.pagination.total);
        }
      } else {
        setTransactions([]);
        throw new Error(response.message || 'Failed to fetch account transactions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching account transactions:', err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const filters: any = {};
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      if (searchUserId) filters.userId = Number(searchUserId);

      const response = await dashboardAPI.getAccountStats(filters);

      if (response.success && response.data) {
        setStats(response.data as AccountStats);
      }
    } catch (err) {
      console.error('Error fetching account stats:', err);
    }
  };

  const calculateStatsFromTransactions = () => {
    if (transactions.length === 0) return;

    const totalTransactions = transactions.length;
    const totalCredited = transactions.filter(t => t.is_credit).reduce((sum, t) => sum + t.amount, 0);
    const totalDebited = transactions.filter(t => t.is_debit).reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalCredited - totalDebited;
    const creditCount = transactions.filter(t => t.is_credit).length;
    const debitCount = transactions.filter(t => t.is_debit).length;

    setStats({
      totalTransactions,
      totalCredited,
      totalDebited,
      netBalance,
      creditCount,
      debitCount,
    });
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchTransactions();
    fetchStats();
  };

  const clearFilters = () => {
    setSearchUserId("");
    setTransactionTypeFilter("");
    setTransactionDirectionFilter("");
    setPaidByAdminFilter("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
    fetchTransactions();
    fetchStats();
  };

  const getTransactionTypeBadge = (transactionType: string) => {
    const badgeClasses: { [key: string]: string } = {
      'razorpay-topup': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'session-payment': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'refund': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'admin-credit': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'admin-debit': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return badgeClasses[transactionType] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const getTransactionTypeText = (transactionType: string) => {
    const typeMap: { [key: string]: string } = {
      'razorpay-topup': 'Razorpay Top-up',
      'session-payment': 'Session Payment',
      'refund': 'Refund',
      'admin-credit': 'Admin Credit',
      'admin-debit': 'Admin Debit',
    };
    return typeMap[transactionType] || transactionType;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Transactions</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Internal account transactions and financial movements
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={goBack}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium"
          >
            Back to Wallet Management
          </button>
          <button
            onClick={() => navigate('/update-wallet')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
          >
            Update Wallet
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Transactions</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalTransactions?.toLocaleString()}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              {stats.creditCount} credits, {stats.debitCount} debits
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Credited</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">₹{stats.totalCredited?.toLocaleString()}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              {stats.creditCount} transactions
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Debited</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">₹{stats.totalDebited?.toLocaleString()}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              {stats.debitCount} transactions
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Net Balance</p>
            <p className={`text-3xl font-bold ${stats.netBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              ₹{stats.netBalance?.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              {stats.netBalance >= 0 ? 'Positive' : 'Negative'}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              User ID
            </label>
            <input
              type="text"
              placeholder="Search by user ID..."
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Transaction Type
            </label>
            <select
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={transactionTypeFilter}
              onChange={(e) => setTransactionTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="razorpay-topup">Razorpay Top-up</option>
              <option value="session-payment">Session Payment</option>
              <option value="refund">Refund</option>
              <option value="admin-credit">Admin Credit</option>
              <option value="admin-debit">Admin Debit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Direction
            </label>
            <select
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={transactionDirectionFilter}
              onChange={(e) => setTransactionDirectionFilter(e.target.value)}
            >
              <option value="">All Directions</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Paid by Admin
            </label>
            <select
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={paidByAdminFilter}
              onChange={(e) => setPaidByAdminFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Show
            </label>
            <select
              className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-1 px-2"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <label className="text-sm text-gray-700 dark:text-gray-300">
              entries
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={clearFilters}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium"
            >
              Clear Filters
            </button>
            <button
              onClick={applyFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Transactions</h2>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading transactions...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Transaction ID
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Direction
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Admin Paid
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Created
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {!transactions || !Array.isArray(transactions) || transactions.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          No account transactions found
                        </td>
                      </tr>
                    ) : (
                      transactions.map((transaction) => (
                        <tr
                          key={transaction.user_account_id_pk}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-4 py-3">
                            <span className="font-mono text-sm text-gray-900 dark:text-gray-100">
                              {transaction.user_account_id_pk}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  {transaction.user.full_name || 'Anonymous'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  ID: {transaction.user.user_id_pk}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTransactionTypeBadge(transaction.transaction_type)}`}>
                              {getTransactionTypeText(transaction.transaction_type)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`font-medium ${transaction.is_credit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {transaction.is_credit ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              transaction.is_credit 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {transaction.is_credit ? 'Credit' : 'Debit'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              transaction.paid_by_admin 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            }`}>
                              {transaction.paid_by_admin ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                              {transaction.description || 'No description'}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                            {formatLocalDate(transaction.created_date_time)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => navigate(`/enhanced-user-details?userId=${transaction.user_id_fk}`)}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-medium"
                              >
                                View User
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      if (pageNum > totalPages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            currentPage === pageNum
                              ? 'text-blue-600 bg-blue-50 border border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
