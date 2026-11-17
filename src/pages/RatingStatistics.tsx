import { useState, useEffect } from "react";
import dashboardAPI from "../services/dashboardAPI";
import { formatLocalDate } from "../utils/dateUtils";

interface RatingStats {
  totalRatings: number;
  averageRating: number;
  ratingDistribution: Array<{
    rating: number;
    count: number;
  }>;
  recentRatings: Array<{
    ratingId: number;
    rating: number;
    comments: string | null;
    createdDateTime: string;
    byUserName: string;
    byUserPhone: string;
  }>;
}

export default function RatingStatistics() {
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [userId, setUserId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {};
      if (userId) filters.userId = Number(userId);
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const response = await dashboardAPI.getRatingStats(filters);

      if (response.success && response.data) {
        setStats(response.data as RatingStats);
      } else {
        throw new Error(response.message || 'Failed to fetch rating statistics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching rating statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    fetchStats();
  };

  const clearFilters = () => {
    setUserId("");
    setStartDate("");
    setEndDate("");
    fetchStats();
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${
          i < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
        }`}
      >
        ★
      </span>
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600 dark:text-green-400';
    if (rating >= 3) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getDistributionPercentage = (count: number) => {
    if (!stats || stats.totalRatings === 0) return 0;
    return ((count / stats.totalRatings) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rating Statistics</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          View comprehensive rating analytics and trends
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              User ID (Optional)
            </label>
            <input
              type="text"
              placeholder="Filter by specific user..."
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
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

        <div className="flex gap-2 mt-4">
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

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading statistics...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {!loading && !error && stats && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Ratings</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalRatings?.toLocaleString()}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Rating</p>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {getRatingStars(Math.round(stats.averageRating))}
                </div>
                <span className={`text-3xl font-bold ${getRatingColor(stats.averageRating)}`}>
                  {stats.averageRating?.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Rating Quality</p>
              <p className={`text-2xl font-bold ${
                stats.averageRating >= 4 ? 'text-green-600 dark:text-green-400' :
                stats.averageRating >= 3 ? 'text-yellow-600 dark:text-yellow-400' :
                'text-red-600 dark:text-red-400'
              }`}>
                {stats.averageRating >= 4 ? 'Excellent' :
                 stats.averageRating >= 3 ? 'Good' : 'Needs Improvement'}
              </p>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Rating Distribution
            </h2>
            <div className="space-y-4">
              {stats.ratingDistribution?.map((item) => (
                <div key={item.rating} className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-16">
                    <div className="flex">
                      {getRatingStars(item.rating)}
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {item.rating}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {item.count} ratings
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {getDistributionPercentage(item.count)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          item.rating >= 4 ? 'bg-green-500' :
                          item.rating >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${getDistributionPercentage(item.count)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Ratings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Ratings
            </h2>
            <div className="space-y-4">
              {stats.recentRatings?.length > 0 ? (
                stats.recentRatings.map((rating) => (
                  <div
                    key={rating.ratingId}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex">
                        {getRatingStars(rating.rating)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {rating.byUserName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {rating.byUserPhone}
                        </p>
                        {rating.comments && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            "{rating.comments}"
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatLocalDate(rating.createdDateTime)}
                      </p>
                      <span className={`text-lg font-bold ${getRatingColor(rating.rating)}`}>
                        {rating.rating}/5
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No recent ratings found
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
