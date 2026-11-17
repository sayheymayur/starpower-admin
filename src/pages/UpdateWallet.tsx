import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import dashboardAPI from "../services/dashboardAPI";
import useGoBack from "../hooks/useGoBack";

interface User {
  user_id_pk: number;
  full_name: string | null;
  email_id: string | null;
  mobile_no: string;
  is_doctor: number;
}

interface WalletUpdateForm {
  phoneNumber: string;
  amount: number;
  operationType: 'credit' | 'debit' | 'set';
  reason: string;
}

export default function UpdateWallet() {
  const [searchParams] = useSearchParams();
  const goBack = useGoBack();
  const userId = searchParams.get('userId');

  const [user, setUser] = useState<User | null>(null);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  // Form state
  const [form, setForm] = useState<WalletUpdateForm>({
    phoneNumber: '',
    amount: 0,
    operationType: 'credit',
    reason: ''
  });

  // Load user if userId is provided in URL
  useEffect(() => {
    if (userId) {
      fetchUserById(Number(userId));
    }
  }, [userId]);

  const fetchUserById = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardAPI.getUserById(id);
      
      if (response.success && response.data) {
        const userData = response.data as any;
        setUser(userData);
        setCurrentBalance(userData.walletBalance || 0);
        setForm(prev => ({ ...prev, phoneNumber: userData.mobile_no }));
      } else {
        setError('User not found');
      }
    } catch (err) {
      setError('Failed to fetch user details');
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchUserByPhone = async () => {
    if (!form.phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    try {
      setSearching(true);
      setError(null);
      setUser(null);
      
      // Search for user by phone number
      const response = await dashboardAPI.searchUsersByPhone(form.phoneNumber);
      
      if (response.success && response.data) {
        // Handle both array and single object responses
        let foundUser;
        if (Array.isArray(response.data)) {
          if (response.data.length > 0) {
            foundUser = response.data[0];
          } else {
            setError('No user found with this phone number');
            return;
          }
        } else {
          foundUser = response.data;
        }
        
        // Map the response data to our User interface
        const userData = {
          user_id_pk: foundUser.userId,
          full_name: foundUser.fullName,
          email_id: foundUser.emailId,
          mobile_no: foundUser.mobileNo,
          is_doctor: foundUser.isDoctor,
          walletBalance: foundUser.statistics?.walletBalance || 0
        };
        
        setUser(userData);
        setCurrentBalance(userData.walletBalance);
        setSuccess(`User found: ${userData.full_name || 'Anonymous'} (ID: ${userData.user_id_pk})`);
      } else {
        setError('No user found with this phone number');
      }
    } catch (err) {
      setError('Failed to search user');
      console.error('Error searching user:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleWalletUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please search and select a user first');
      return;
    }

    if (form.amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (!form.reason.trim()) {
      setError('Please provide a reason for this transaction');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      let response: any;
      
      switch (form.operationType) {
        case 'credit':
          response = await dashboardAPI.addWalletAmount(user.user_id_pk, form.amount);
          break;
        case 'debit':
          response = await dashboardAPI.deductWalletAmount(user.user_id_pk, form.amount);
          break;
        case 'set':
          response = await dashboardAPI.setWalletAmount(user.user_id_pk, form.amount);
          break;
        default:
          throw new Error('Invalid operation type');
      }

      if (response.success) {
        setCurrentBalance(response.data.newBalance);
        setSuccess(`Wallet updated successfully! New balance: ₹${response.data.newBalance.toLocaleString()}`);
        
        // Reset form
        setForm(prev => ({
          ...prev,
          amount: 0,
          reason: ''
        }));
      } else {
        setError(response.message || 'Failed to update wallet');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update wallet');
      console.error('Error updating wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      phoneNumber: '',
      amount: 0,
      operationType: 'credit',
      reason: ''
    });
    setUser(null);
    setCurrentBalance(0);
    setError(null);
    setSuccess(null);
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={goBack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Back to Wallet Management
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Update Wallet Balance
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Search user by phone number and update their wallet balance
            </p>
          </div>
          <button
            onClick={goBack}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium"
          >
            ← Back to Wallet Management
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* User Search Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Search User</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="Enter phone number (e.g., +1234567890)"
                value={form.phoneNumber}
                onChange={(e) => setForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                disabled={loading}
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={searchUserByPhone}
                disabled={searching || !form.phoneNumber.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded font-medium"
              >
                {searching ? 'Searching...' : 'Search User'}
              </button>
            </div>
          </div>
        </div>

        {/* User Information */}
        {user && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {user.full_name || 'Anonymous'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {user.email_id || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Mobile</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {user.mobile_no}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Balance</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ₹{currentBalance.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">User ID</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user.user_id_pk}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Update Form */}
        {user && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Update Wallet</h2>
            
            <form onSubmit={handleWalletUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Operation Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Operation Type
                  </label>
                  <select
                    value={form.operationType}
                    onChange={(e) => setForm(prev => ({ ...prev, operationType: e.target.value as 'credit' | 'debit' | 'set' }))}
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    required
                  >
                    <option value="credit">Credit (Add Money)</option>
                    <option value="debit">Debit (Deduct Money)</option>
                    <option value="set">Set Balance</option>
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter amount"
                    value={form.amount || ''}
                    onChange={(e) => setForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    required
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for Transaction
                </label>
                <textarea
                  placeholder="Enter reason for this wallet transaction..."
                  value={form.reason}
                  onChange={(e) => setForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 h-20 resize-none"
                  required
                />
              </div>

              {/* Preview */}
              {form.amount > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Transaction Preview</h3>
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p>Current Balance: ₹{currentBalance.toLocaleString()}</p>
                    <p>
                      {form.operationType === 'credit' && `After Credit: ₹${(currentBalance + form.amount).toLocaleString()}`}
                      {form.operationType === 'debit' && `After Debit: ₹${Math.max(0, currentBalance - form.amount).toLocaleString()}`}
                      {form.operationType === 'set' && `New Balance: ₹${form.amount.toLocaleString()}`}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading || form.amount <= 0 || !form.reason.trim()}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded font-medium"
                >
                  {loading ? 'Updating...' : 'Update Wallet'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded font-medium"
                >
                  Reset Form
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}