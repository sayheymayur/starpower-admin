import { useApi, usePaginatedApi, useSearchApi, useRealtimeApi } from './useApi';
import { sessionsAPI } from '../services/api';
import type { Session, SessionStats, SessionDetails, SessionListParams } from '../services/api';

// Hook for getting all sessions
export function useSessions(params?: SessionListParams) {
  return usePaginatedApi(
    (page, limit) => sessionsAPI.getAllSessions({ ...params, page, limit }),
    { immediate: true }
  );
}

// Hook for getting sessions by user
export function useSessionsByUser(userId: number, params?: Omit<SessionListParams, 'userId'>) {
  return usePaginatedApi(
    (page, limit) => sessionsAPI.getSessionsByUser(userId, { ...params, page, limit }),
    { immediate: !!userId }
  );
}

// Hook for getting sessions by listener
export function useSessionsByListener(listenerId: number, params?: Omit<SessionListParams, 'listenerId'>) {
  return usePaginatedApi(
    (page, limit) => sessionsAPI.getSessionsByListener(listenerId, { ...params, page, limit }),
    { immediate: !!listenerId }
  );
}

// Hook for getting session statistics
export function useSessionStats() {
  return useApi(
    () => sessionsAPI.getSessionStats(),
    { immediate: true }
  );
}

// Hook for getting a specific session by ID
export function useSession(sessionId: string) {
  return useApi(
    () => sessionsAPI.getSessionById(sessionId),
    { immediate: !!sessionId }
  );
}

// Hook for getting detailed session information
export function useSessionDetails(sessionId: string) {
  return useApi(
    () => sessionsAPI.getSessionDetails(sessionId),
    { immediate: !!sessionId }
  );
}

// Hook for searching sessions
export function useSessionSearch() {
  return useSearchApi(
    (query) => sessionsAPI.searchSessions(query),
    { minLength: 2, debounceMs: 300 }
  );
}

// Hook for getting sessions by status
export function useSessionsByStatus(status: string, params?: Omit<SessionListParams, 'status'>) {
  return usePaginatedApi(
    (page, limit) => sessionsAPI.getSessionsByStatus(status, { ...params, page, limit }),
    { immediate: true }
  );
}

// Hook for getting sessions by type
export function useSessionsByType(sessionType: number, params?: Omit<SessionListParams, 'sessionType'>) {
  return usePaginatedApi(
    (page, limit) => sessionsAPI.getSessionsByType(sessionType, { ...params, page, limit }),
    { immediate: true }
  );
}

// Hook for getting active sessions
export function useActiveSessions(params?: Omit<SessionListParams, 'status'>) {
  return usePaginatedApi(
    (page, limit) => sessionsAPI.getActiveSessions({ ...params, page, limit }),
    { immediate: true }
  );
}

// Hook for getting completed sessions
export function useCompletedSessions(params?: Omit<SessionListParams, 'status'>) {
  return usePaginatedApi(
    (page, limit) => sessionsAPI.getCompletedSessions({ ...params, page, limit }),
    { immediate: true }
  );
}

// Hook for getting cancelled sessions
export function useCancelledSessions(params?: Omit<SessionListParams, 'status'>) {
  return usePaginatedApi(
    (page, limit) => sessionsAPI.getCancelledSessions({ ...params, page, limit }),
    { immediate: true }
  );
}

// Hook for getting missed sessions (never started)
export function useMissedSessions(params?: SessionListParams) {
  return usePaginatedApi(
    (page, limit) => sessionsAPI.getMissedSessions({ ...params, page, limit }),
    { immediate: true }
  );
}

// Hook for getting recent sessions
export function useRecentSessions(params?: Omit<SessionListParams, 'dateFrom' | 'dateTo'>) {
  return usePaginatedApi(
    (page, limit) => sessionsAPI.getRecentSessions({ ...params, page, limit }),
    { immediate: true }
  );
}

// Hook for getting today's sessions
export function useTodaysSessions(params?: Omit<SessionListParams, 'dateFrom' | 'dateTo'>) {
  return usePaginatedApi(
    (page, limit) => sessionsAPI.getTodaysSessions({ ...params, page, limit }),
    { immediate: true }
  );
}

// Hook for getting sessions by date range
export function useSessionsByDateRange(dateFrom: string, dateTo: string, params?: Omit<SessionListParams, 'dateFrom' | 'dateTo'>) {
  return usePaginatedApi(
    (page, limit) => sessionsAPI.getSessionsByDateRange(dateFrom, dateTo, { ...params, page, limit }),
    { immediate: true }
  );
}

// Hook for getting top users
export function useTopUsers(limit: number = 10) {
  return useApi(
    () => sessionsAPI.getTopUsers(limit),
    { immediate: true }
  );
}

// Hook for getting top listeners
export function useTopListeners(limit: number = 10) {
  return useApi(
    () => sessionsAPI.getTopListeners(limit),
    { immediate: true }
  );
}

// Hook for real-time active sessions monitoring
export function useActiveSessionsRealtime(interval: number = 10000) {
  return useRealtimeApi(
    () => sessionsAPI.getActiveSessions({ limit: 100 }),
    { interval, enabled: true }
  );
}

// Hook for real-time session statistics
export function useSessionStatsRealtime(interval: number = 30000) {
  return useRealtimeApi(
    () => sessionsAPI.getSessionStats(),
    { interval, enabled: true }
  );
}
