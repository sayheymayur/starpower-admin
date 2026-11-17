import { useState, useEffect } from "react";
import dashboardAPI from "../services/dashboardAPI";

interface DashboardAnalytics {
  overview: {
    totalUsers: number;
    totalSessions: number;
    totalRevenue: number;
    activeUsers: number;
  };
  userGrowth: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    growthRate: number;
  };
  sessionMetrics: {
    totalSessions: number;
    completedSessions: number;
    cancelledSessions: number;
    averageDuration: number;
    sessionsByType: {
      call: number;
      chat: number;
      video: number;
    };
  };
  revenueMetrics: {
    totalRevenue: number;
    revenueToday: number;
    revenueThisWeek: number;
    revenueThisMonth: number;
    averageSessionValue: number;
  };
  userEngagement: {
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    totalViews: number;
  };
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

  useEffect(() => {
    fetchAnalytics();

    // Set up auto-refresh if interval is set
    if (refreshInterval) {
      const interval = setInterval(fetchAnalytics, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await dashboardAPI.getDashboardAnalytics();

      if (response.success && response.data) {
        setAnalytics(response.data as DashboardAnalytics);
      } else {
        throw new Error(response.message || 'Failed to fetch analytics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !analytics) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading analytics...</span>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Real-time insights and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <select
            className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 text-sm"
            value={refreshInterval || ''}
            onChange={(e) => setRefreshInterval(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">No auto-refresh</option>
            <option value="30">Refresh every 30s</option>
            <option value="60">Refresh every 1m</option>
            <option value="300">Refresh every 5m</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
          >
            Refresh Now
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.overview.totalUsers?.toLocaleString()}</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">
            {analytics.overview.activeUsers?.toLocaleString()} active
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</p>
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.overview.totalSessions.toLocaleString()}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            Avg: {analytics.sessionMetrics?.averageDuration?.toFixed(1)} min
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">₹{analytics.overview.totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            ₹{analytics.revenueMetrics?.revenueToday?.toLocaleString()} today
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</p>
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.userGrowth?.growthRate?.toFixed(1)}%</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            {analytics.userGrowth?.thisMonth?.toLocaleString()} new this month
          </p>
        </div>
      </div>

      {/* User Growth Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Growth</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Today</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{analytics.userGrowth?.today?.toLocaleString()}</p>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400 mb-1">This Week</p>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">{analytics.userGrowth?.thisWeek?.toLocaleString()}</p>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">This Month</p>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{analytics.userGrowth?.thisMonth?.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Session Metrics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Session Metrics</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{analytics.sessionMetrics?.totalSessions?.toLocaleString()}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">{analytics.sessionMetrics?.completedSessions?.toLocaleString()}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled</p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">{analytics.sessionMetrics?.cancelledSessions?.toLocaleString()}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Duration</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{analytics.sessionMetrics?.averageDuration?.toFixed(1)} min</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Sessions by Type</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Call</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{analytics.sessionMetrics?.sessionsByType?.call?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Chat</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{analytics.sessionMetrics?.sessionsByType?.chat?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Video</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{analytics.sessionMetrics?.sessionsByType?.video?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Metrics</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">₹{analytics.revenueMetrics?.totalRevenue?.toLocaleString()}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Today</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">₹{analytics.revenueMetrics?.revenueToday?.toLocaleString()}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">₹{analytics.revenueMetrics?.revenueThisWeek?.toLocaleString()}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">₹{analytics.revenueMetrics?.revenueThisMonth?.toLocaleString()}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Session Value</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">₹{analytics.revenueMetrics?.averageSessionValue?.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Engagement Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Engagement</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
            <p className="text-sm text-pink-600 dark:text-pink-400 mb-1">Total Posts</p>
            <p className="text-2xl font-bold text-pink-900 dark:text-pink-100">{analytics.userEngagement?.totalPosts?.toLocaleString()}</p>
          </div>
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400 mb-1">Total Likes</p>
            <p className="text-2xl font-bold text-red-900 dark:text-red-100">{analytics.userEngagement?.totalLikes?.toLocaleString()}</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-1">Total Comments</p>
            <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{analytics.userEngagement?.totalComments?.toLocaleString()}</p>
          </div>
          <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-1">Total Views</p>
            <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{analytics.userEngagement?.totalViews?.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

