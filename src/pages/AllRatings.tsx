import { useState, useEffect } from "react";
import dashboardAPI from "../services/dashboardAPI";
import { formatLocalDate } from "../utils/dateUtils";

interface Rating {
  ratingId: number;
  byUserId: number;
  toUserId: number;
  rating: number;
  comments: string | null;
  createdDateTime: string;
  createdBy: number;
  byUserName: string;
  byUserPhone: string;
  byUserPhoto: string | null;
  toUserName: string;
  toUserPhone: string;
  toUserPhoto: string | null;
}

interface RatingFilters {
  page?: number;
  limit?: number;
  byUserId?: number;
  toUserId?: number;
  minRating?: number;
  maxRating?: number;
  hasComments?: boolean;
  orderBy?: string;
  order?: string;
  startDate?: string;
  endDate?: string;
}

export default function AllRatings() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});

  // Filters
  const [byUserId, setByUserId] = useState("");
  const [toUserId, setToUserId] = useState("");
  const [minRating, setMinRating] = useState("");
  const [maxRating, setMaxRating] = useState("");
  const [hasComments, setHasComments] = useState("");
  const [orderBy, setOrderBy] = useState("createdDateTime");
  const [order, setOrder] = useState("desc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchRatings();
  }, [currentPage, pageSize]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: RatingFilters = {
        page: currentPage,
        limit: pageSize,
        orderBy,
        order,
      };

      if (byUserId) filters.byUserId = Number(byUserId);
      if (toUserId) filters.toUserId = Number(toUserId);
      if (minRating) filters.minRating = Number(minRating);
      if (maxRating) filters.maxRating = Number(maxRating);
      if (hasComments) filters.hasComments = hasComments === 'true';
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const response = await dashboardAPI.getAllRatings(filters);

      if (response.success && response.data) {
        const ratingsData = Array.isArray(response.data.ratings) ? response.data.ratings : [];
        setRatings(ratingsData as Rating[]);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages);
          setTotalRecords(response.data.pagination.total);
        }
      } else {
        setRatings([]);
        throw new Error(response.message || 'Failed to fetch ratings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching ratings:', err);
      setRatings([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchRatings();
  };

  const clearFilters = () => {
    setByUserId("");
    setToUserId("");
    setMinRating("");
    setMaxRating("");
    setHasComments("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
    fetchRatings();
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

  const renderComment = (rating: Rating) => {
    if (!rating.comments || !rating.comments.trim()) {
      return (
        <span className="text-gray-400 dark:text-gray-500 text-sm">
          No comments
        </span>
      );
    }

    const MAX_LENGTH = 60;
    const isExpanded = expandedComments[rating.ratingId] ?? false;
    const needsTruncation = rating.comments.length > MAX_LENGTH;
    const commentText = !isExpanded && needsTruncation
      ? `${rating.comments.slice(0, MAX_LENGTH).trimEnd()}…`
      : rating.comments;

    return (
      <div className="space-y-1">
        <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words bg-gray-50 dark:bg-gray-700/60 px-3 py-2 rounded">
          {commentText}
        </p>
        {needsTruncation && (
          <button
            type="button"
            onClick={() =>
              setExpandedComments((prev) => ({
                ...prev,
                [rating.ratingId]: !isExpanded,
              }))
            }
            className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Ratings</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage and view all user ratings and feedback
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rated By User ID
            </label>
            <input
              type="text"
              placeholder="User ID who gave rating..."
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={byUserId}
              onChange={(e) => setByUserId(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rated To User ID
            </label>
            <input
              type="text"
              placeholder="User ID who received rating..."
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={toUserId}
              onChange={(e) => setToUserId(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Min Rating
            </label>
            <select
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
            >
              <option value="">All Ratings</option>
              <option value="1">1+ Stars</option>
              <option value="2">2+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="5">5 Stars Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Rating
            </label>
            <select
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={maxRating}
              onChange={(e) => setMaxRating(e.target.value)}
            >
              <option value="">All Ratings</option>
              <option value="1">1 Star Only</option>
              <option value="2">2 Stars or Less</option>
              <option value="3">3 Stars or Less</option>
              <option value="4">4 Stars or Less</option>
              <option value="5">All Ratings</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Has Comments
            </label>
            <select
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={hasComments}
              onChange={(e) => setHasComments(e.target.value)}
            >
              <option value="">All Ratings</option>
              <option value="true">With Comments</option>
              <option value="false">Without Comments</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Order By
            </label>
            <select
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
            >
              <option value="createdDateTime">Date Created</option>
              <option value="rating">Rating Value</option>
              <option value="byUserId">Rated By</option>
              <option value="toUserId">Rated To</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Order
            </label>
            <select
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
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

        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Show
            </label>
            <select
              className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-1 px-2"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <label className="text-sm text-gray-700 dark:text-gray-300">
              entries
            </label>
          </div>

          <div className="flex gap-2">
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
      </div>

      {/* Ratings Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ratings</h2>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading ratings...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Rating ID
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Rated By
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Rated To
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Rating
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Comments
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {!ratings || !Array.isArray(ratings) || ratings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          No ratings found
                        </td>
                      </tr>
                    ) : (
                      ratings.map((rating) => (
                        <tr
                          key={rating.ratingId}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-4 py-3">
                            <span className="font-mono text-sm text-gray-900 dark:text-gray-100">
                              {rating.ratingId}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                {rating.byUserPhoto ? (
                                  <img
                                    src={rating.byUserPhoto}
                                    alt={rating.byUserName}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                    {rating.byUserName?.charAt(0)}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  {rating.byUserName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  ID: {rating.byUserId}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                {rating.toUserPhoto ? (
                                  <img
                                    src={rating.toUserPhoto}
                                    alt={rating.toUserName}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                    {rating.toUserName?.charAt(0)}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  {rating.toUserName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  ID: {rating.toUserId}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {getRatingStars(rating.rating)}
                              </div>
                              <span className={`font-medium ${getRatingColor(rating.rating)}`}>
                                {rating.rating}/5
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 max-w-md">
                            {renderComment(rating)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                            {formatLocalDate(rating.createdDateTime)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => window.open(`/enhanced-user-details?userId=${rating.byUserId}`, '_blank')}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-medium"
                              >
                                View Rater
                              </button>
                              <button
                                onClick={() => window.open(`/enhanced-user-details?userId=${rating.toUserId}`, '_blank')}
                                className="text-green-600 hover:text-green-800 dark:text-green-400 text-sm font-medium"
                              >
                                View Rated
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      if (pageNum > totalPages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            currentPage === pageNum
                              ? 'text-blue-600 bg-blue-50 border border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
