import { useApi, usePaginatedApi, useSearchApi } from './useApi';
import { walletAPI } from '../services/api';
import type { WalletTransaction, WalletStats, UserWalletStats, TransactionListParams } from '../services/api';

// Hook for getting all wallet transactions
export function useWalletTransactions(params?: TransactionListParams) {
  return usePaginatedApi(
    (page, limit) => walletAPI.getTransactions({ ...params, page, limit }),
    { immediate: true }
  );
}

// Hook for getting user transactions
export function useUserTransactions(userId: number, params?: Omit<TransactionListParams, 'userId'>) {
  return usePaginatedApi(
    (page, limit) => walletAPI.getUserTransactions(userId, { ...params, page, limit }),
    { immediate: !!userId }
  );
}

// Hook for getting wallet statistics
export function useWalletStats() {
  return useApi(
    () => walletAPI.getWalletStatistics(),
    { immediate: true }
  );
}

// Hook for getting user wallet statistics
export function useUserWalletStats(userId: number) {
  return useApi(
    () => walletAPI.getUserWalletStatistics(userId),
    { immediate: !!userId }
  );
}

// Hook for getting overall wallet statistics
export function useOverallWalletStats() {
  return useApi(
    () => walletAPI.getOverallWalletStatistics(),
    { immediate: true }
  );
}

// Hook for getting user wallet balance
export function useUserBalance(userId: number) {
  return useApi(
    () => walletAPI.getUserBalance(userId),
    { immediate: !!userId }
  );
}

// Hook for getting total wallet balance
export function useTotalBalance() {
  return useApi(
    () => walletAPI.getTotalBalance(),
    { immediate: true }
  );
}

// Hook for searching transactions
export function useTransactionSearch() {
  return useSearchApi(
    (query) => walletAPI.searchTransactions(query),
    { minLength: 2, debounceMs: 300 }
  );
}

// Hook for getting transactions by type
export function useTransactionsByType(type: string, params?: Omit<TransactionListParams, 'type'>) {
  return usePaginatedApi(
    (page, limit) => walletAPI.getTransactionsByType(type, { ...params, page, limit }),
    { immediate: true }
  );
}

// Hook for getting transactions by status
export function useTransactionsByStatus(status: string, params?: Omit<TransactionListParams, 'status'>) {
  return usePaginatedApi(
    (page, limit) => walletAPI.getTransactionsByStatus(status, { ...params, page, limit }),
    { immediate: true }
  );
}

// Hook for getting transactions by date range
export function useTransactionsByDateRange(dateFrom: string, dateTo: string, params?: Omit<TransactionListParams, 'dateFrom' | 'dateTo'>) {
  return usePaginatedApi(
    (page, limit) => walletAPI.getTransactionsByDateRange(dateFrom, dateTo, { ...params, page, limit }),
    { immediate: true }
  );
}

// Hook for getting recent transactions
export function useRecentTransactions(params?: Omit<TransactionListParams, 'dateFrom' | 'dateTo'>) {
  return usePaginatedApi(
    (page, limit) => walletAPI.getRecentTransactions({ ...params, page, limit }),
    { immediate: true }
  );
}

// Hook for getting today's transactions
export function useTodaysTransactions(params?: Omit<TransactionListParams, 'dateFrom' | 'dateTo'>) {
  return usePaginatedApi(
    (page, limit) => walletAPI.getTodaysTransactions({ ...params, page, limit }),
    { immediate: true }
  );
}

// Hook for getting admin-paid transactions
export function useAdminPaidTransactions(params?: Omit<TransactionListParams, 'adminPaid'>) {
  return usePaginatedApi(
    (page, limit) => walletAPI.getAdminPaidTransactions({ ...params, page, limit }),
    { immediate: true }
  );
}

// Hook for getting recent user transactions
export function useRecentUserTransactions(userId: number, limit: number = 10) {
  return useApi(
    () => walletAPI.getRecentUserTransactions(userId, limit),
    { immediate: !!userId }
  );
}

// Hook for getting transaction by order ID
export function useTransactionByOrderId(orderId: string) {
  return useApi(
    () => walletAPI.getTransactionByOrderId(orderId),
    { immediate: !!orderId }
  );
}

// Hook for getting transaction by client reference ID
export function useTransactionByClientRefId(clientRefId: string) {
  return useApi(
    () => walletAPI.getTransactionByClientRefId(clientRefId),
    { immediate: !!clientRefId }
  );
}

// Hook for getting top users by volume
export function useTopUsersByVolume(limit: number = 10) {
  return useApi(
    () => walletAPI.getTopUsersByVolume(limit),
    { immediate: true }
  );
}

// Hook for getting transaction type breakdown
export function useTransactionTypeBreakdown() {
  return useApi(
    () => walletAPI.getTransactionTypeBreakdown(),
    { immediate: true }
  );
}

// Hook for getting status breakdown
export function useStatusBreakdown() {
  return useApi(
    () => walletAPI.getStatusBreakdown(),
    { immediate: true }
  );
}
