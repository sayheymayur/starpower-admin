import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dashboardAPI from "../services/dashboardAPI";
import useGoBack from "../hooks/useGoBack";

interface PostStats {
  totalPosts: number;
  postsByStatus: Array<{
    status: number;
    count: number;
  }>;
  postsByCategory: Array<{
    categoryName: string;
    count: number;
  }>;
  topUsers: Array<{
    userName: string;
    count: number;
  }>;
  totalLikes: number;
  totalComments: number;
  totalViews: number;
}

export default function PostStatistics() {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [stats, setStats] = useState<PostStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetchStats();
  }, [dateFrom, dateTo]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {};
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;

      const response = await dashboardAPI.getPostStatistics(filters);

      if (response.success && response.data) {
        setStats(response.data as PostStats);
      } else {
        throw new Error(response.message || 'Failed to fetch post statistics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching post statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Published';
      case 2: return 'Rejected';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'text-yellow-600 dark:text-yellow-400';
      case 1: return 'text-green-600 dark:text-green-400';
      case 2: return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusBgColor = (status: number) => {
    switch (status) {
      case 0: return 'bg-yellow-100 dark:bg-yellow-900/20';
      case 1: return 'bg-green-100 dark:bg-green-900/20';
      case 2: return 'bg-red-100 dark:bg-red-900/20';
      default: return 'bg-gray-100 dark:bg-gray-900/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
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
            Back to Posts
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">📊</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Data</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">No statistics available.</p>
          <button
            onClick={goBack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Back to Posts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Post Statistics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Comprehensive analytics and insights for posts
            </p>
          </div>
          <button
            onClick={goBack}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium"
          >
            ← Back to Posts
          </button>
        </div>

        {/* Date Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Date Range Filter</h2>
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                From Date
              </label>
              <input
                type="date"
                className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                To Date
              </label>
              <input
                type="date"
                className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <button
              onClick={() => {
                setDateFrom("");
                setDateTo("");
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <span className="text-2xl">📝</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalPosts.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <span className="text-2xl">❤️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Likes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalLikes.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <span className="text-2xl">💬</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Comments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalComments.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <span className="text-2xl">👁️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalViews.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Posts by Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Posts by Status
            </h3>
            <div className="space-y-4">
              {stats.postsByStatus.map((statusData) => {
                const percentage = (statusData.count / stats.totalPosts) * 100;
                return (
                  <div key={statusData.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusBgColor(statusData.status)}`}></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {getStatusText(statusData.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getStatusBgColor(statusData.status)}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-bold ${getStatusColor(statusData.status)}`}>
                        {statusData.count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Posts by Category */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Posts by Category
            </h3>
            {stats.postsByCategory.length > 0 ? (
              <div className="space-y-4">
                {stats.postsByCategory.map((categoryData, index) => {
                  const percentage = (categoryData.count / stats.totalPosts) * 100;
                  const colors = [
                    'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
                    'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
                    'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
                    'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
                    'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
                  ];
                  const colorClass = colors[index % colors.length];
                  
                  return (
                    <div key={categoryData.categoryName} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${colorClass}`}></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {categoryData.categoryName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${colorClass}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-bold ${colorClass.split(' ')[1]}`}>
                          {categoryData.count.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No category data available
              </p>
            )}
          </div>

          {/* Top Users */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Top Users by Posts
            </h3>
            {stats.topUsers.length > 0 ? (
              <div className="space-y-3">
                {stats.topUsers.map((userData, index) => (
                  <div key={userData.userName} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                          {index + 1}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {userData.userName}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {userData.count.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No user data available
              </p>
            )}
          </div>

          {/* Engagement Metrics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Engagement Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Average Likes per Post
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats.totalPosts > 0 ? (stats.totalLikes / stats.totalPosts).toFixed(1) : '0'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Average Comments per Post
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats.totalPosts > 0 ? (stats.totalComments / stats.totalPosts).toFixed(1) : '0'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Average Views per Post
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats.totalPosts > 0 ? (stats.totalViews / stats.totalPosts).toFixed(1) : '0'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Engagement Rate
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats.totalViews > 0 ? (((stats.totalLikes + stats.totalComments) / stats.totalViews) * 100).toFixed(2) : '0'}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalPosts > 0 ? (stats.totalLikes / stats.totalPosts).toFixed(1) : '0'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Likes per Post</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.totalPosts > 0 ? (stats.totalComments / stats.totalPosts).toFixed(1) : '0'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Comments per Post</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.totalPosts > 0 ? (stats.totalViews / stats.totalPosts).toFixed(1) : '0'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Views per Post</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
