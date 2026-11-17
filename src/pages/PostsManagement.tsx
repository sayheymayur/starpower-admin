import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dashboardAPI from "../services/dashboardAPI";
import { formatLocalDate } from "../utils/dateUtils";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";

interface PostDetails {
  postId: number;
  userId: number;
  categoryId: number | null;
  description: string | null;
  shareWith: number;
  videoName: string | null;
  hashtag: string | null;
  isDelete: boolean;
  ageGroup: string | null;
  status: number;
  remark: string | null;
  appRejDateTime: string | null;
  videoThumbnail: string | null;
  taggedUserIds: string | null;
  isMood: boolean | null;
  lastUpdatedDateTime: string;
  createdDateTime: string;
  createdBy: number;
  allowComments: boolean | null;
  postAnonymously: boolean | null;
  
  user: {
    userId: number;
    name: string;
    phoneNumber: string;
    email: string | null;
    profilePhoto: string | null;
    state: string | null;
    isDoctor: boolean;
    status: number;
  };
  
  statistics: {
    likeCount: number;
    commentCount: number;
    viewCount: number;
    saveCount: number;
  };
  
  images: Array<{
    imageId: number;
    imageUrl: string;
    createdDateTime: string;
  }>;
  
  comments: Array<{
    commentId: number;
    userId: number;
    userName: string;
    userProfilePhoto: string | null;
    comment: string;
    isReply: boolean;
    parentCommentId: number | null;
    createdDateTime: string;
  }>;
  
  reports: Array<{
    reportId: number;
    userId: number;
    userName: string;
    reportMasterId: number;
    remark: string | null;
    createdDateTime: string;
  }>;
}

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

export default function PostsManagement() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostDetails[]>([]);
  const [stats, setStats] = useState<PostStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("created_date_time");
  const [sortOrder, setSortOrder] = useState("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  // View mode
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Delete confirmation
  const deleteModal = useModal();
  const [postToDelete, setPostToDelete] = useState<{ postId: number; description: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPosts();
    fetchStats();
  }, [currentPage, pageSize, sortBy, sortOrder]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {
        page: currentPage,
        limit: pageSize,
        sortBy,
        sortOrder,
      };

      if (searchTerm) filters.search = searchTerm;
      if (statusFilter) filters.status = statusFilter;
      if (categoryFilter) filters.categoryId = categoryFilter;
      if (userFilter) filters.userId = userFilter;
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;

      const response = await dashboardAPI.getPosts(filters);

      if (response.success && response.data) {
        const postsData = Array.isArray(response.data) ? response.data : [];
        setPosts(postsData as PostDetails[]);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalRecords(response.pagination.total);
        }
      } else {
        setPosts([]);
        throw new Error(response.message || 'Failed to fetch posts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching posts:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await dashboardAPI.getPostStatistics();

      if (response.success && response.data) {
        setStats(response.data as PostStats);
      }
    } catch (err) {
      console.error('Error fetching post stats:', err);
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0: return { text: 'Pending', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
      case 1: return { text: 'Published', class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
      case 2: return { text: 'Rejected', class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
      default: return { text: 'Unknown', class: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' };
    }
  };

  const getShareWithText = (shareWith: number) => {
    switch (shareWith) {
      case 1: return 'Public';
      case 2: return 'Friends';
      case 3: return 'Private';
      default: return 'Unknown';
    }
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchPosts();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setCategoryFilter("");
    setUserFilter("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
    fetchPosts();
  };

  const handleDeleteClick = (post: PostDetails) => {
    setPostToDelete({
      postId: post.postId,
      description: post.description || 'No description'
    });
    deleteModal.openModal();
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;
    
    try {
      setDeleting(true);
      const response = await dashboardAPI.deletePost(postToDelete.postId);
      
      if (response.success) {
        deleteModal.closeModal();
        setPostToDelete(null);
        // Refresh the posts list
        await fetchPosts();
        await fetchStats();
      } else {
        setError(response.message || 'Failed to delete post');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
      console.error('Error deleting post:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Posts Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage posts, comments, and content moderation
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/post-statistics')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
          >
            Statistics
          </button>
          <button
            onClick={() => navigate('/post-reports')}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
          >
            Reports
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Posts</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalPosts.toLocaleString()}</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              {stats.postsByStatus.find(s => s.status === 1)?.count || 0} published
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Likes</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.totalLikes.toLocaleString()}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              {stats.totalComments.toLocaleString()} comments
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Views</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalViews.toLocaleString()}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Average engagement
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending Review</p>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.postsByStatus.find(s => s.status === 0)?.count || 0}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              {stats.postsByStatus.find(s => s.status === 2)?.count || 0} rejected
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search posts, hashtags, users..."
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="0">Pending</option>
              <option value="1">Published</option>
              <option value="2">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date From
            </label>
            <input
              type="date"
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date To
            </label>
            <input
              type="date"
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-4">
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

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 dark:text-gray-300">View:</label>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}
              >
                List
              </button>
            </div>
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

      {/* Posts Display */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Posts</h2>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading posts...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {!posts || !Array.isArray(posts) || posts.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                      No posts found
                    </div>
                  ) : (
                    posts.map((post) => (
                      <div
                        key={post.postId}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/post-details?postId=${post.postId}`)}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <img
                            src={post.user.profilePhoto || 'https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg'}
                            alt={post.user.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 dark:text-white truncate">
                              {post.user.name}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatLocalDate(post.createdDateTime)}
                            </p>
                          </div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(post.status).class}`}>
                            {getStatusBadge(post.status).text}
                          </span>
                        </div>

                        <p className="text-sm text-gray-900 dark:text-gray-100 mb-3 line-clamp-3">
                          {post.description || 'No description'}
                        </p>

                        {post.images && post.images.length > 0 && (
                          <div className="mb-3">
                            <img
                              src={post.images[0].imageUrl}
                              alt="Post image"
                              className="w-full h-32 object-cover rounded"
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-4">
                            <span>❤️ {post.statistics.likeCount}</span>
                            <span>💬 {post.statistics.commentCount}</span>
                            <span>👁️ {post.statistics.viewCount}</span>
                          </div>
                          <span>{getShareWithText(post.shareWith)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                          Post
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                          Author
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                          Engagement
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                          Created
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {!posts || !Array.isArray(posts) || posts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                            No posts found
                          </td>
                        </tr>
                      ) : (
                        posts.map((post) => (
                          <tr
                            key={post.postId}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <td className="px-4 py-3">
                              <div className="max-w-xs">
                                <p className="text-sm text-gray-900 dark:text-gray-100 truncate">
                                  {post.description || 'No description'}
                                </p>
                                {post.hashtag && (
                                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                    {post.hashtag}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <img
                                  src={post.user.profilePhoto || 'https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg'}
                                  alt={post.user.name}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {post.user.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    ID: {post.user.userId}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(post.status).class}`}>
                                {getStatusBadge(post.status).text}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-xs space-y-1">
                                <p>❤️ {post.statistics.likeCount}</p>
                                <p>💬 {post.statistics.commentCount}</p>
                                <p>👁️ {post.statistics.viewCount}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                              {formatLocalDate(post.createdDateTime)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/post-details?postId=${post.postId}`);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-medium"
                                >
                                  View
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/enhanced-user-details?userId=${post.user.userId}`);
                                  }}
                                  className="text-green-600 hover:text-green-800 dark:text-green-400 text-sm font-medium"
                                >
                                  User
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(post);
                                  }}
                                  className="text-red-600 hover:text-red-800 dark:text-red-400 text-sm font-medium"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

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

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.closeModal} className="max-w-md m-4">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Confirm Delete</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete this post? This action cannot be undone.
          </p>
          {postToDelete && (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded mb-6">
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">Post ID: {postToDelete.postId}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{postToDelete.description}</p>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button
              onClick={deleteModal.closeModal}
              disabled={deleting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
