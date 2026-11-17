import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import dashboardAPI from "../services/dashboardAPI";
import { formatLocalDate } from "../utils/dateUtils";
import useGoBack from "../hooks/useGoBack";
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

export default function PostDetails() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const goBack = useGoBack();
  const postId = searchParams.get('postId');
  
  const [postDetails, setPostDetails] = useState<PostDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Delete confirmation
  const deleteModal = useModal();
  const commentDeleteModal = useModal();
  const [deleting, setDeleting] = useState(false);
  const [deletingComment, setDeletingComment] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<PostDetails['comments'][number] | null>(null);

  useEffect(() => {
    if (postId) {
      fetchPostDetails();
    } else {
      setError('No post ID provided');
      setLoading(false);
    }
  }, [postId]);

  const fetchPostDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await dashboardAPI.getPostById(Number(postId));

      if (response.success && response.data) {
        setPostDetails(response.data as PostDetails);
      } else {
        throw new Error(response.message || 'Failed to fetch post details');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching post details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 1: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 2: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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

  const getShareWithText = (shareWith: number) => {
    switch (shareWith) {
      case 1: return 'Public';
      case 2: return 'Friends';
      case 3: return 'Private';
      default: return 'Unknown';
    }
  };

  const getReportTypeText = (reportMasterId: number) => {
    // This would typically come from a report types mapping
    const reportTypes: { [key: number]: string } = {
      1: 'Spam',
      2: 'Inappropriate Content',
      3: 'Harassment',
      4: 'Violence',
      5: 'Hate Speech',
      6: 'Other'
    };
    return reportTypes[reportMasterId] || 'Unknown';
  };

  const handleDeleteClick = () => {
    deleteModal.openModal();
  };

  const handleDeleteConfirm = async () => {
    if (!postId) return;
    
    try {
      setDeleting(true);
      const response = await dashboardAPI.deletePost(Number(postId));
      
      if (response.success) {
        deleteModal.closeModal();
        // Navigate back to posts list after successful deletion
        navigate('/posts-management');
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

  const countReplyTree = (
    comments: PostDetails['comments'],
    commentId: number
  ): number => {
    return comments
      .filter((c) => c.parentCommentId === commentId)
      .reduce((sum, reply) => sum + 1 + countReplyTree(comments, reply.commentId), 0);
  };

  const handleCommentDeleteClick = (comment: PostDetails['comments'][number]) => {
    setCommentToDelete(comment);
    commentDeleteModal.openModal();
  };

  const handleCommentDeleteConfirm = async () => {
    if (!postId || !commentToDelete) return;

    try {
      setDeletingComment(true);
      const response = await dashboardAPI.deleteComment(
        Number(postId),
        commentToDelete.commentId
      );

      if (response.success) {
        commentDeleteModal.closeModal();
        setCommentToDelete(null);
        await fetchPostDetails();
      } else {
        setError(response.message || 'Failed to delete comment');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
      console.error('Error deleting comment:', err);
    } finally {
      setDeletingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading post details...</p>
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

  if (!postDetails) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">📝</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Post Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The requested post could not be found.</p>
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
              Post Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Post ID: {postDetails.postId}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDeleteClick}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
            >
              Delete Post
            </button>
            <button
              onClick={goBack}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium"
            >
              ← Back to Posts
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Post Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={postDetails.user.profilePhoto || 'https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg'}
                  alt={postDetails.user.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {postDetails.user.name}
                    </h2>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(postDetails.status)}`}>
                      {getStatusText(postDetails.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatLocalDate(postDetails.createdDateTime)} • {getShareWithText(postDetails.shareWith)}
                  </p>
                </div>
              </div>

              {postDetails.description && (
                <div className="mb-4">
                  <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                    {postDetails.description}
                  </p>
                </div>
              )}

              {postDetails.hashtag && (
                <div className="mb-4">
                  <p className="text-blue-600 dark:text-blue-400 text-sm">
                    {postDetails.hashtag}
                  </p>
                </div>
              )}

              {/* Images */}
              {postDetails.images && postDetails.images.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Images ({postDetails.images.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {postDetails.images.map((image) => (
                      <img
                        key={image.imageId}
                        src={image.imageUrl}
                        alt="Post image"
                        className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80"
                        onClick={() => window.open(image.imageUrl, '_blank')}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Video */}
              {postDetails.videoName && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Video
                  </h3>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded p-4 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                      Video: {postDetails.videoName}
                    </p>
                    {postDetails.videoThumbnail && (
                      <img
                        src={postDetails.videoThumbnail}
                        alt="Video thumbnail"
                        className="w-full max-w-md mx-auto mt-2 rounded"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Engagement Stats */}
              <div className="flex items-center gap-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <span>❤️</span>
                  <span className="text-sm font-medium">{postDetails.statistics.likeCount}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <span>💬</span>
                  <span className="text-sm font-medium">{postDetails.statistics.commentCount}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <span>👁️</span>
                  <span className="text-sm font-medium">{postDetails.statistics.viewCount}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <span>🔖</span>
                  <span className="text-sm font-medium">{postDetails.statistics.saveCount}</span>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Comments ({postDetails.comments.length})
              </h3>
              {postDetails.comments.length > 0 ? (
                <div className="space-y-4">
                  {postDetails.comments.map((comment) => (
                    <div key={comment.commentId} className="flex gap-3">
                      <img
                        src={comment.userProfilePhoto || 'https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg'}
                        alt={comment.userName}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 dark:text-white text-sm">
                            {comment.userName}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatLocalDate(comment.createdDateTime)}
                          </span>
                          {comment.isReply && (
                            <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded">
                              Reply
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {comment.comment}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCommentDeleteClick(comment)}
                        className="shrink-0 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No comments yet
                </p>
              )}
            </div>

            {/* Reports */}
            {postDetails.reports.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Reports ({postDetails.reports.length})
                </h3>
                <div className="space-y-3">
                  {postDetails.reports.map((report) => (
                    <div key={report.reportId} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-red-800 dark:text-red-200 text-sm">
                          {report.userName}
                        </span>
                        <span className="text-xs text-red-600 dark:text-red-400">
                          {formatLocalDate(report.createdDateTime)}
                        </span>
                      </div>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        <strong>Type:</strong> {getReportTypeText(report.reportMasterId)}
                      </p>
                      {report.remark && (
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                          <strong>Remark:</strong> {report.remark}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Author</h3>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={postDetails.user.profilePhoto || 'https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg'}
                  alt={postDetails.user.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {postDetails.user.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ID: {postDetails.user.userId}
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Phone:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100">{postDetails.user.phoneNumber}</span>
                </p>
                <p>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100">{postDetails.user.email || 'N/A'}</span>
                </p>
                <p>
                  <span className="font-medium text-gray-700 dark:text-gray-300">State:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100">{postDetails.user.state || 'N/A'}</span>
                </p>
                <p>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100">
                    {postDetails.user.isDoctor ? 'Doctor' : 'User'}
                  </span>
                </p>
                <p>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                  <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    postDetails.user.status === 1 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {postDetails.user.status === 1 ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
              <button
                onClick={() => navigate(`/enhanced-user-details?userId=${postDetails.user.userId}`)}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
              >
                View User Profile
              </button>
            </div>

            {/* Post Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Post Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Post ID:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100 font-mono">{postDetails.postId}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Category:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100">{postDetails.categoryId || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Share Level:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100">{getShareWithText(postDetails.shareWith)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Age Group:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100">{postDetails.ageGroup || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Allow Comments:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100">
                    {postDetails.allowComments ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Anonymous:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100">
                    {postDetails.postAnonymously ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Mood Post:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100">
                    {postDetails.isMood ? 'Yes' : 'No'}
                  </span>
                </div>
                {postDetails.taggedUserIds && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Tagged Users:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">{postDetails.taggedUserIds}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Timestamps</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Created:</span>
                  <p className="text-gray-900 dark:text-gray-100">{formatLocalDate(postDetails.createdDateTime)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Last Updated:</span>
                  <p className="text-gray-900 dark:text-gray-100">{formatLocalDate(postDetails.lastUpdatedDateTime)}</p>
                </div>
                {postDetails.appRejDateTime && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Approved/Rejected:</span>
                    <p className="text-gray-900 dark:text-gray-100">{formatLocalDate(postDetails.appRejDateTime)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Remarks */}
            {postDetails.remark && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Admin Remarks</h3>
                <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  {postDetails.remark}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.closeModal} className="max-w-md m-4">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Confirm Delete</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete this post? This action cannot be undone.
          </p>
          {postDetails && (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded mb-6">
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">Post ID: {postDetails.postId}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {postDetails.description || 'No description'}
              </p>
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

      {/* Comment Delete Confirmation Modal */}
      <Modal
        isOpen={commentDeleteModal.isOpen}
        onClose={() => {
          if (!deletingComment) {
            commentDeleteModal.closeModal();
            setCommentToDelete(null);
          }
        }}
        className="max-w-md m-4"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            Delete Comment
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {(() => {
              const nestedReplyCount =
                commentToDelete && postDetails
                  ? countReplyTree(postDetails.comments, commentToDelete.commentId)
                  : 0;

              return (
                <>
                  Are you sure you want to delete this comment?
                  {nestedReplyCount > 0 && (
                    <>
                      {' '}
                      This will also delete {nestedReplyCount} nested{' '}
                      {nestedReplyCount === 1 ? 'reply' : 'replies'}.
                    </>
                  )}
                </>
              );
            })()}
          </p>
          {commentToDelete && (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded mb-6">
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">
                {commentToDelete.userName}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                {commentToDelete.comment}
              </p>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                commentDeleteModal.closeModal();
                setCommentToDelete(null);
              }}
              disabled={deletingComment}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleCommentDeleteConfirm}
              disabled={deletingComment}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deletingComment ? 'Deleting...' : 'Delete Comment'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
