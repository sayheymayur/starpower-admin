import { useApi, usePaginatedApi, useSearchApi } from './useApi';
import { userDataAPI } from '../services/api';
import type { User, UserStats, UserListParams } from '../services/api';

// Hook for getting all users
export function useUsers(params?: UserListParams) {
  return usePaginatedApi(
    (page, limit) => userDataAPI.getAllUsers({ ...params, page, limit }),
    { immediate: true }
  );
}

// Hook for getting all listeners/doctors
export function useListeners(params?: UserListParams) {
  return usePaginatedApi(
    (page, limit) => userDataAPI.getAllListeners({ ...params, page, limit }),
    { immediate: true }
  );
}

// Hook for getting user statistics
export function useUserStats() {
  return useApi(
    () => userDataAPI.getStats(),
    { immediate: true }
  );
}

// Hook for getting a specific user by ID
export function useUser(userId: number) {
  return useApi(
    () => userDataAPI.getUserById(userId),
    { immediate: !!userId }
  );
}

// Hook for searching users
export function useUserSearch() {
  return useSearchApi(
    (query) => userDataAPI.searchUsers(query),
    { minLength: 2, debounceMs: 300 }
  );
}

// Hook for getting users by status
export function useUsersByStatus(status: number, params?: Omit<UserListParams, 'status'>) {
  return usePaginatedApi(
    (page, limit) => userDataAPI.getUsersByStatus(status, { ...params, page, limit }),
    { immediate: true }
  );
}

// Hook for getting doctors by status
export function useDoctorsByStatus(status: number, params?: Omit<UserListParams, 'status'>) {
  return usePaginatedApi(
    (page, limit) => userDataAPI.getDoctorsByStatus(status, { ...params, page, limit }),
    { immediate: true }
  );
}

// Hook for getting users by KYC status
export function useUsersByKycStatus(kycStatus: number, params?: Omit<UserListParams, 'kycStatus'>) {
  return usePaginatedApi(
    (page, limit) => userDataAPI.getUsersByKycStatus(kycStatus, { ...params, page, limit }),
    { immediate: true }
  );
}

// Hook for getting users by state
export function useUsersByState(stateId: number, params?: Omit<UserListParams, 'stateId'>) {
  return usePaginatedApi(
    (page, limit) => userDataAPI.getUsersByState(stateId, { ...params, page, limit }),
    { immediate: true }
  );
}

// Hook for getting users by date range
export function useUsersByDateRange(dateFrom: string, dateTo: string, params?: Omit<UserListParams, 'dateFrom' | 'dateTo'>) {
  return usePaginatedApi(
    (page, limit) => userDataAPI.getUsersByDateRange(dateFrom, dateTo, { ...params, page, limit }),
    { immediate: true }
  );
}

// Hook for getting recent users
export function useRecentUsers(params?: Omit<UserListParams, 'dateFrom' | 'dateTo'>) {
  return usePaginatedApi(
    (page, limit) => userDataAPI.getRecentUsers({ ...params, page, limit }),
    { immediate: true }
  );
}

// Hook for getting top users
export function useTopUsers(limit: number = 10) {
  return useApi(
    () => userDataAPI.getTopUsers(limit),
    { immediate: true }
  );
}
