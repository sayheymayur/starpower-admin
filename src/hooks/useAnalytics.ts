import { useApi, useRealtimeApi } from './useApi';
import { analyticsAPI } from '../services/api';
import type { DashboardAnalytics, UserAnalytics, FinancialAnalytics, GrowthMetrics } from '../services/api';

// Hook for getting comprehensive dashboard analytics
export function useDashboardAnalytics() {
  return useApi(
    () => analyticsAPI.getDashboardAnalytics(),
    { immediate: true }
  );
}

// Hook for getting user analytics
export function useUserAnalytics() {
  return useApi(
    () => analyticsAPI.getUserAnalytics(),
    { immediate: true }
  );
}

// Hook for getting financial analytics
export function useFinancialAnalytics() {
  return useApi(
    () => analyticsAPI.getFinancialAnalytics(),
    { immediate: true }
  );
}

// Hook for getting growth metrics
export function useGrowthMetrics() {
  return useApi(
    () => analyticsAPI.getGrowthMetrics(),
    { immediate: true }
  );
}

// Hook for getting KPIs
export function useKPIs() {
  return useApi(
    () => analyticsAPI.getKPIs(),
    { immediate: true }
  );
}

// Hook for getting real-time metrics
export function useRealTimeMetrics() {
  return useApi(
    () => analyticsAPI.getRealTimeMetrics(),
    { immediate: true }
  );
}

// Hook for getting comparative analytics
export function useComparativeAnalytics(period: 'day' | 'week' | 'month' | 'quarter' | 'year') {
  return useApi(
    () => analyticsAPI.getComparativeAnalytics(period),
    { immediate: true }
  );
}

// Hook for getting performance insights
export function usePerformanceInsights() {
  return useApi(
    () => analyticsAPI.getPerformanceInsights(),
    { immediate: true }
  );
}

// Hook for getting export data
export function useExportData(type: 'dashboard' | 'users' | 'financial' | 'growth', format: 'json' | 'csv' = 'json') {
  return useApi(
    () => analyticsAPI.getExportData(type, format),
    { immediate: false }
  );
}

// Hook for real-time dashboard metrics
export function useDashboardRealtime(interval: number = 30000) {
  return useRealtimeApi(
    () => analyticsAPI.getRealTimeMetrics(),
    { interval, enabled: true }
  );
}

// Hook for real-time KPIs
export function useKPIsRealtime(interval: number = 60000) {
  return useRealtimeApi(
    () => analyticsAPI.getKPIs(),
    { interval, enabled: true }
  );
}
