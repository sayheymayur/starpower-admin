import { useState } from "react";
import dashboardAPI from "../services/dashboardAPI";
import { formatLocalDate } from "../utils/dateUtils";

interface UserRatingSummary {
  ratingsGiven: {
    total: number;
    average: number;
    min: number;
    max: number;
    recent: Array<{
      rating: number;
      comments: string | null;
      createdDateTime: string;
      toUserName: string;
    }>;
  };
  ratingsReceived: {
    total: number;
    average: number;
    min: number;
    max: number;
    recent: Array<{
      rating: number;
      comments: string | null;
      createdDateTime: string;
      byUserName: string;
    }>;
  };
}

export default function UserRatingSummary() {
  const [summary, setSummary] = useState<UserRatingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState("");
  const [searchUserId, setSearchUserId] = useState("");

  const fetchUserSummary = async (targetUserId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await dashboardAPI.getUserRatingSummary(targetUserId);

      if (response.success && response.data) {
        setSummary(response.data as UserRatingSummary);
      } else {
        throw new Error(response.message || 'Failed to fetch user rating summary');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching user rating summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchUserId.trim()) {
      const userIdNum = Number(searchUserId);
      if (!isNaN(userIdNum)) {
        setUserId(searchUserId);
        fetchUserSummary(userIdNum);
      } else {
        setError('Please enter a valid user ID');
      }
    }
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


  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Rating Summary</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          View comprehensive rating summary for a specific user
        </p>
      </div>

      {/* User Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Search User</h2>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              User ID
            </label>
            <input
              type="text"
              placeholder="Enter user ID to view rating summary..."
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-sm font-medium"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading user summary...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {!loading && !error && summary && userId && (
        <>
          {/* User Info Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              User ID: {userId}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Complete rating summary for this user
            </p>
          </div>

          {/* Ratings Given Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Ratings Given by User
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Given</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.ratingsGiven.total}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Given</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="flex">
                    {getRatingStars(Math.round(summary.ratingsGiven.average))}
                  </div>
                  <span className={`text-xl font-bold ${getRatingColor(summary.ratingsGiven.average)}`}>
                    {summary.ratingsGiven.average.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Highest Given</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {summary.ratingsGiven.max}/5
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Lowest Given</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {summary.ratingsGiven.min}/5
                </p>
              </div>
            </div>

            <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
              Recent Ratings Given
            </h3>
            <div className="space-y-3">
              {summary.ratingsGiven.recent?.length > 0 ? (
                summary.ratingsGiven.recent.map((rating, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex">
                        {getRatingStars(rating.rating)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Rated: {rating.toUserName}
                        </p>
                        {rating.comments && (
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            "{rating.comments}"
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatLocalDate(rating.createdDateTime)}
                      </p>
                      <span className={`font-bold ${getRatingColor(rating.rating)}`}>
                        {rating.rating}/5
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No ratings given yet
                </p>
              )}
            </div>
          </div>

          {/* Ratings Received Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Ratings Received by User
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Received</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.ratingsReceived.total}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Received</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="flex">
                    {getRatingStars(Math.round(summary.ratingsReceived.average))}
                  </div>
                  <span className={`text-xl font-bold ${getRatingColor(summary.ratingsReceived.average)}`}>
                    {summary.ratingsReceived.average.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Highest Received</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {summary.ratingsReceived.max}/5
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Lowest Received</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {summary.ratingsReceived.min}/5
                </p>
              </div>
            </div>

            <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
              Recent Ratings Received
            </h3>
            <div className="space-y-3">
              {summary.ratingsReceived.recent?.length > 0 ? (
                summary.ratingsReceived.recent.map((rating, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex">
                        {getRatingStars(rating.rating)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          From: {rating.byUserName}
                        </p>
                        {rating.comments && (
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            "{rating.comments}"
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatLocalDate(rating.createdDateTime)}
                      </p>
                      <span className={`font-bold ${getRatingColor(rating.rating)}`}>
                        {rating.rating}/5
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No ratings received yet
                </p>
              )}
            </div>
          </div>

          {/* Overall Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Overall Rating Behavior
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Rating Generosity</p>
                <p className={`text-2xl font-bold ${
                  summary.ratingsGiven.average > summary.ratingsReceived.average ? 
                  'text-green-600 dark:text-green-400' : 
                  summary.ratingsGiven.average < summary.ratingsReceived.average ?
                  'text-yellow-600 dark:text-yellow-400' :
                  'text-blue-600 dark:text-blue-400'
                }`}>
                  {summary.ratingsGiven.average > summary.ratingsReceived.average ? 'Generous' :
                   summary.ratingsGiven.average < summary.ratingsReceived.average ? 'Conservative' : 'Balanced'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Gives: {summary.ratingsGiven.average.toFixed(1)} | Receives: {summary.ratingsReceived.average.toFixed(1)}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Activity Level</p>
                <p className={`text-2xl font-bold ${
                  summary.ratingsGiven.total > summary.ratingsReceived.total ? 
                  'text-blue-600 dark:text-blue-400' : 
                  summary.ratingsGiven.total < summary.ratingsReceived.total ?
                  'text-purple-600 dark:text-purple-400' :
                  'text-gray-600 dark:text-gray-400'
                }`}>
                  {summary.ratingsGiven.total > summary.ratingsReceived.total ? 'Active Rater' :
                   summary.ratingsGiven.total < summary.ratingsReceived.total ? 'Popular User' : 'Balanced'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Given: {summary.ratingsGiven.total} | Received: {summary.ratingsReceived.total}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {!loading && !error && !summary && userId && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            No rating data found for user ID: {userId}
          </p>
        </div>
      )}
    </div>
  );
}
