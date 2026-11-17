import { apiClient, ApiError } from './base';
import { API_ENDPOINTS, PaginationParams, DateRangeParams, SearchParams, ApiResponse } from './config';

// Wallet interfaces
export interface WalletTransaction {
  transaction_id: string;
  user_id: number;
  amount: number;
  transaction_type: string;
  status: string;
  remark: string | null;
  order_id: string | null;
  client_ref_id: string | null;
  admin_paid: number;
  created_date_time: string;
  updated_date_time: string;
  user: {
    user_id_pk: number;
    full_name: string | null;
    mobile_no: string;
    email_id: string | null;
  };
}

export interface WalletBalance {
  user_id: number;
  balance: number;
  total_credit: number;
  total_debit: number;
  last_transaction_date: string | null;
  user: {
    user_id_pk: number;
    full_name: string | null;
    mobile_no: string;
    email_id: string | null;
  };
}

export interface WalletStats {
  totalTransactions: number;
  totalCredit: number;
  totalDebit: number;
  totalBalance: number;
  transactionsToday: number;
  transactionsThisWeek: number;
  transactionsThisMonth: number;
  averageTransactionAmount: number;
  topUsers: Array<{ user_id: number; full_name: string; total_amount: number; transaction_count: number }>;
  transactionTypes: Array<{ type: string; count: number; total_amount: number }>;
  statusBreakdown: Array<{ status: string; count: number; total_amount: number }>;
}

export interface UserWalletStats {
  userId: number;
  totalTransactions: number;
  totalCredit: number;
  totalDebit: number;
  currentBalance: number;
  transactionsToday: number;
  transactionsThisWeek: number;
  transactionsThisMonth: number;
  averageTransactionAmount: number;
  lastTransactionDate: string | null;
  user: {
    user_id_pk: number;
    full_name: string | null;
    mobile_no: string;
    email_id: string | null;
  };
}

export interface OverallWalletStats {
  totalUsers: number;
  totalTransactions: number;
  totalCredit: number;
  totalDebit: number;
  totalBalance: number;
  averageBalancePerUser: number;
  averageTransactionAmount: number;
  transactionsToday: number;
  transactionsThisWeek: number;
  transactionsThisMonth: number;
  creditTransactionsToday: number;
  debitTransactionsToday: number;
  netFlowToday: number;
  netFlowThisWeek: number;
  netFlowThisMonth: number;
}

export interface TransactionListParams extends PaginationParams, DateRangeParams, SearchParams {
  userId?: number;
  type?: string;
  status?: string;
  remark?: string;
  orderId?: string;
  clientRefId?: string;
  adminPaid?: number;
}

// Wallet API class
export class WalletAPI {
  // Get all wallet transactions
  async getTransactions(params?: TransactionListParams): Promise<ApiResponse<{ transactions: WalletTransaction[]; stats: WalletStats }>> {
    try {
      return await apiClient.get(API_ENDPOINTS.WALLET.GET_TRANSACTIONS, params);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch wallet transactions');
    }
  }

  // Get user transactions
  async getUserTransactions(userId: number, params?: Omit<TransactionListParams, 'userId'>): Promise<ApiResponse<{ transactions: WalletTransaction[]; stats: UserWalletStats }>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.WALLET.GET_USER_TRANSACTIONS, { userId });
      return await apiClient.get(endpoint, params);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch transactions for user ${userId}`);
    }
  }

  // Get transactions by date range
  async getTransactionsByDateRange(dateFrom: string, dateTo: string, params?: Omit<TransactionListParams, 'dateFrom' | 'dateTo'>): Promise<ApiResponse<{ transactions: WalletTransaction[]; stats: WalletStats }>> {
    try {
      return await apiClient.get(API_ENDPOINTS.WALLET.GET_TRANSACTIONS_BY_DATE, { ...params, dateFrom, dateTo });
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch transactions by date range');
    }
  }

  // Get user transactions by date range
  async getUserTransactionsByDateRange(userId: number, dateFrom: string, dateTo: string, params?: Omit<TransactionListParams, 'userId' | 'dateFrom' | 'dateTo'>): Promise<ApiResponse<{ transactions: WalletTransaction[]; stats: UserWalletStats }>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.WALLET.GET_USER_TRANSACTIONS_BY_DATE, { userId });
      return await apiClient.get(endpoint, { ...params, dateFrom, dateTo });
    } catch (error) {
      throw this.handleError(error, `Failed to fetch user transactions by date range for user ${userId}`);
    }
  }

  // Get transactions by type
  async getTransactionsByType(type: string, params?: Omit<TransactionListParams, 'type'>): Promise<ApiResponse<{ transactions: WalletTransaction[]; stats: WalletStats }>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.WALLET.GET_TRANSACTIONS_BY_TYPE, { type });
      return await apiClient.get(endpoint, params);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch transactions with type ${type}`);
    }
  }

  // Get user transactions by type
  async getUserTransactionsByType(userId: number, type: string, params?: Omit<TransactionListParams, 'userId' | 'type'>): Promise<ApiResponse<{ transactions: WalletTransaction[]; stats: UserWalletStats }>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.WALLET.GET_USER_TRANSACTIONS_BY_TYPE, { userId, type });
      return await apiClient.get(endpoint, params);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch user transactions with type ${type} for user ${userId}`);
    }
  }

  // Get transactions by remark
  async getTransactionsByRemark(remark: string, params?: Omit<TransactionListParams, 'remark'>): Promise<ApiResponse<{ transactions: WalletTransaction[]; stats: WalletStats }>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.WALLET.GET_TRANSACTIONS_BY_REMARK, { remark });
      return await apiClient.get(endpoint, params);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch transactions with remark ${remark}`);
    }
  }

  // Get user transactions by remark
  async getUserTransactionsByRemark(userId: number, remark: string, params?: Omit<TransactionListParams, 'userId' | 'remark'>): Promise<ApiResponse<{ transactions: WalletTransaction[]; stats: UserWalletStats }>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.WALLET.GET_USER_TRANSACTIONS_BY_REMARK, { userId, remark });
      return await apiClient.get(endpoint, params);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch user transactions with remark ${remark} for user ${userId}`);
    }
  }

  // Get transaction by order ID
  async getTransactionByOrderId(orderId: string): Promise<ApiResponse<WalletTransaction>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.WALLET.GET_TRANSACTION_BY_ORDER, { orderId });
      return await apiClient.get(endpoint);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch transaction with order ID ${orderId}`);
    }
  }

  // Get transaction by client reference ID
  async getTransactionByClientRefId(clientRefId: string): Promise<ApiResponse<WalletTransaction>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.WALLET.GET_TRANSACTION_BY_CLIENT_REF, { clientRefId });
      return await apiClient.get(endpoint);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch transaction with client reference ID ${clientRefId}`);
    }
  }

  // Get admin-paid transactions
  async getAdminPaidTransactions(params?: Omit<TransactionListParams, 'adminPaid'>): Promise<ApiResponse<{ transactions: WalletTransaction[]; stats: WalletStats }>> {
    try {
      return await apiClient.get(API_ENDPOINTS.WALLET.GET_ADMIN_PAID, params);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch admin-paid transactions');
    }
  }

  // Get recent user transactions
  async getRecentUserTransactions(userId: number, limit: number = 10): Promise<ApiResponse<{ transactions: WalletTransaction[]; stats: UserWalletStats }>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.WALLET.GET_RECENT_USER, { userId });
      return await apiClient.get(endpoint, { limit });
    } catch (error) {
      throw this.handleError(error, `Failed to fetch recent transactions for user ${userId}`);
    }
  }

  // Get all transactions (unpaginated)
  async getAllTransactions(): Promise<ApiResponse<{ transactions: WalletTransaction[]; stats: WalletStats }>> {
    try {
      return await apiClient.get(API_ENDPOINTS.WALLET.GET_ALL);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch all transactions');
    }
  }

  // Get user wallet balance
  async getUserBalance(userId: number): Promise<ApiResponse<WalletBalance>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.WALLET.GET_BALANCE_USER, { userId });
      return await apiClient.get(endpoint);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch balance for user ${userId}`);
    }
  }

  // Get total wallet balance
  async getTotalBalance(): Promise<ApiResponse<{ totalBalance: number; totalUsers: number; averageBalance: number }>> {
    try {
      return await apiClient.get(API_ENDPOINTS.WALLET.GET_BALANCE_TOTAL);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch total wallet balance');
    }
  }

  // Get wallet statistics
  async getWalletStatistics(): Promise<ApiResponse<WalletStats>> {
    try {
      return await apiClient.get(API_ENDPOINTS.WALLET.GET_STATISTICS);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch wallet statistics');
    }
  }

  // Get user wallet statistics
  async getUserWalletStatistics(userId: number): Promise<ApiResponse<UserWalletStats>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.WALLET.GET_USER_STATISTICS, { userId });
      return await apiClient.get(endpoint);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch wallet statistics for user ${userId}`);
    }
  }

  // Get overall wallet statistics
  async getOverallWalletStatistics(): Promise<ApiResponse<OverallWalletStats>> {
    try {
      return await apiClient.get(API_ENDPOINTS.WALLET.GET_OVERALL_STATISTICS);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch overall wallet statistics');
    }
  }

  // Search transactions
  async searchTransactions(query: string, params?: Omit<TransactionListParams, 'search'>): Promise<ApiResponse<{ transactions: WalletTransaction[]; stats: WalletStats }>> {
    try {
      return await this.getTransactions({ ...params, search: query });
    } catch (error) {
      throw this.handleError(error, 'Failed to search transactions');
    }
  }

  // Get transactions by status
  async getTransactionsByStatus(status: string, params?: Omit<TransactionListParams, 'status'>): Promise<ApiResponse<{ transactions: WalletTransaction[]; stats: WalletStats }>> {
    try {
      return await this.getTransactions({ ...params, status });
    } catch (error) {
      throw this.handleError(error, `Failed to fetch transactions with status ${status}`);
    }
  }

  // Get recent transactions (last 7 days)
  async getRecentTransactions(params?: Omit<TransactionListParams, 'dateFrom' | 'dateTo'>): Promise<ApiResponse<{ transactions: WalletTransaction[]; stats: WalletStats }>> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const today = new Date().toISOString().split('T')[0];
      const dateFrom = sevenDaysAgo.toISOString().split('T')[0];
      
      return await this.getTransactionsByDateRange(dateFrom, today, params);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch recent transactions');
    }
  }

  // Get today's transactions
  async getTodaysTransactions(params?: Omit<TransactionListParams, 'dateFrom' | 'dateTo'>): Promise<ApiResponse<{ transactions: WalletTransaction[]; stats: WalletStats }>> {
    try {
      const today = new Date().toISOString().split('T')[0];
      return await this.getTransactionsByDateRange(today, today, params);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch today\'s transactions');
    }
  }

  // Get top users by transaction volume
  async getTopUsersByVolume(limit: number = 10): Promise<ApiResponse<{ users: Array<{ user_id: number; full_name: string; total_amount: number; transaction_count: number }> }>> {
    try {
      const response = await this.getWalletStatistics();
      return {
        success: true,
        message: 'Top users by volume fetched successfully',
        data: {
          users: response.data.topUsers.slice(0, limit)
        }
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch top users by volume');
    }
  }

  // Get transaction type breakdown
  async getTransactionTypeBreakdown(): Promise<ApiResponse<{ types: Array<{ type: string; count: number; total_amount: number }> }>> {
    try {
      const response = await this.getWalletStatistics();
      return {
        success: true,
        message: 'Transaction type breakdown fetched successfully',
        data: {
          types: response.data.transactionTypes
        }
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch transaction type breakdown');
    }
  }

  // Get status breakdown
  async getStatusBreakdown(): Promise<ApiResponse<{ statuses: Array<{ status: string; count: number; total_amount: number }> }>> {
    try {
      const response = await this.getWalletStatistics();
      return {
        success: true,
        message: 'Status breakdown fetched successfully',
        data: {
          statuses: response.data.statusBreakdown
        }
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch status breakdown');
    }
  }

  // Error handling
  private handleError(error: any, message: string): ApiError {
    if (error instanceof ApiError) {
      return error;
    }
    return new ApiError(message, 0, error);
  }
}

// Export singleton instance
export const walletAPI = new WalletAPI();

