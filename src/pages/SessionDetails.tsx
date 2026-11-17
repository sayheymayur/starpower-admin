import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import dashboardAPI from "../services/dashboardAPI";
import { formatLocalDate } from "../utils/dateUtils";
import useGoBack from "../hooks/useGoBack";

interface SessionDetails {
  sessionId: number;
  sessionType: number;
  sessionTypeText: string;
  status: string;
  startDateTime: string | null;
  endDateTime: string | null;
  duration: number | null;
  requestDateTime: string;
  canceled: boolean;
  isCancelledByServer: boolean;
  cancelledDateTime: string | null;
  cancellationType: number | null;
  remark: string | null;
  invoiceNo: number | null;
  financialYear: string | null;
  
  user: {
    userId: number;
    name: string;
    phoneNumber: string;
    email: string | null;
    profilePhoto: string | null;
    state: string | null;
  };
  
  listener: {
    userId: number;
    name: string;
    phoneNumber: string;
    email: string | null;
    profilePhoto: string | null;
    state: string | null;
    bio: string | null;
    perMinuteCost: number | null;
    chatPerMinuteCost: number | null;
    commissionPer: number | null;
    chatCommissionPer: number | null;
  };
  
  costs: {
    totalCost: number;
    perMinuteCost: number | null;
    chatPerMinuteCost: number | null;
    commissionAmount: number | null;
    chatCommissionAmount: number | null;
    netAmount: number | null;
  };
  
  ratings: {
    userToListener: {
      rating: number | null;
      comments: string | null;
      createdDateTime: string | null;
    };
    listenerToUser: {
      rating: number | null;
      comments: string | null;
      createdDateTime: string | null;
    };
  };
  
  walletTransactions: Array<{
    transactionId: number;
    amount: number;
    isCredit: boolean;
    isDebit: boolean;
    transactionType: string | null;
    description: string | null;
    orderId: string | null;
    clientRefId: string | null;
    createdDateTime: string;
    remark: string | null;
  }>;
  
  metadata: {
    createdDateTime: string;
    createdBy: number;
    recentAgoraEndDateTime: string | null;
  };
}

export default function SessionDetails() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const goBack = useGoBack();
  const sessionId = searchParams.get('sessionId');
  
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullUserComment, setShowFullUserComment] = useState(false);
  const [showFullListenerComment, setShowFullListenerComment] = useState(false);

  useEffect(() => {
    if (sessionId) {
      fetchSessionDetails();
    } else {
      setError('No session ID provided');
      setLoading(false);
    }
  }, [sessionId]);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await dashboardAPI.getSessionDetails(sessionId as string);

      if (response.success && response.data) {
        setSessionDetails(response.data as SessionDetails);
      } else {
        throw new Error(response.message || 'Failed to fetch session details');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching session details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'rejected': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'timeout': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getSessionTypeBadge = (type: number) => {
    switch (type) {
      case 1: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 2: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 3: return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getSessionTypeText = (type: number) => {
    switch (type) {
      case 1: return 'Call';
      case 2: return 'Chat';
      case 3: return 'Video Call';
      default: return 'Unknown';
    }
  };

  const getCancellationTypeText = (type: number | null) => {
    if (type === null) return null;
    switch (type) {
      case 1: return 'Cancelled by User';
      case 2: return 'Rejected by Listener';
      default: return 'Unknown';
    }
  };

  const getDisplayStatus = (details: SessionDetails) => {
    if (details.isCancelledByServer) return 'Timeout';
    if (details.cancellationType === 2) return 'Rejected';
    if (details.cancellationType === 1) return 'Cancelled';
    return details.status.charAt(0).toUpperCase() + details.status.slice(1);
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`text-lg ${
              i < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
            }`}
          >
            ★
          </span>
        ))}
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          ({rating}/5)
        </span>
      </div>
    );
  };

  const renderCommentWithToggle = (
    comment: string,
    isExpanded: boolean,
    toggle: () => void
  ) => {
    const MAX_LENGTH = 180;
    const needsTruncation = comment.length > MAX_LENGTH;
    const displayComment = !isExpanded && needsTruncation
      ? `${comment.slice(0, MAX_LENGTH).trimEnd()}…`
      : comment;

    return (
      <div className="mt-2 space-y-1">
        <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded">
          “{displayComment}”
        </p>
        {needsTruncation && (
          <button
            type="button"
            onClick={toggle}
            className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading session details...</p>
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
            Back to Sessions
          </button>
        </div>
      </div>
    );
  }

  if (!sessionDetails) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">📋</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Session Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The requested session could not be found.</p>
          <button
            onClick={goBack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Back to Sessions
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
              Session Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Session ID: {sessionDetails.sessionId}
            </p>
          </div>
          <button
            onClick={goBack}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium"
          >
            ← Back to Sessions
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Session Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Session Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Session Type
                  </label>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${getSessionTypeBadge(sessionDetails.sessionType)}`}>
                    {getSessionTypeText(sessionDetails.sessionType)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${getStatusBadge(getDisplayStatus(sessionDetails))}`}>
                    {getDisplayStatus(sessionDetails)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Duration
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {sessionDetails.duration ? `${sessionDetails.duration} minutes` : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Invoice Number
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {sessionDetails.invoiceNo || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Request Time
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {formatLocalDate(sessionDetails.requestDateTime)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Time
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {sessionDetails.startDateTime ? formatLocalDate(sessionDetails.startDateTime) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Time
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {sessionDetails.endDateTime ? formatLocalDate(sessionDetails.endDateTime) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Financial Year
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {sessionDetails.financialYear || 'N/A'}
                  </p>
                </div>
              </div>
              
              {sessionDetails.remark && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Remarks
                  </label>
                  <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    {sessionDetails.remark}
                  </p>
                </div>
              )}

              {/* Chat History Button - Show only for chat sessions */}
              {sessionDetails.sessionType === 2 && (
                <div className="mt-4">
                  <button
                    onClick={() => {
                      // Navigate to chat history with userId and listenerId
                      navigate(`/chat-history?userId=${sessionDetails.user.userId}&listenerId=${sessionDetails.listener.userId}`);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    View Chat History
                  </button>
                </div>
              )}

              {sessionDetails.canceled && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                  <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">Cancellation Details</h3>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    <strong>Type:</strong> {sessionDetails.isCancelledByServer ? 'Auto-Cancelled by server' : (getCancellationTypeText(sessionDetails.cancellationType) || 'Unknown')}
                  </p>
                  {sessionDetails.cancelledDateTime && (
                    <p className="text-sm text-red-700 dark:text-red-300">
                      <strong>Cancelled:</strong> {formatLocalDate(sessionDetails.cancelledDateTime)}
                    </p>
                  )}
                  {sessionDetails.isCancelledByServer && (
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Auto-Cancelled by server
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Participants */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Details */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Details</h3>
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={sessionDetails.user.profilePhoto || 'https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg'}
                    alt={sessionDetails.user.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {sessionDetails.user.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ID: {sessionDetails.user.userId}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Phone:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">{sessionDetails.user.phoneNumber}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">{sessionDetails.user.email || 'N/A'}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">State:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">{sessionDetails.user.state || 'N/A'}</span>
                  </p>
                </div>
              </div>

              {/* Listener Details */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Listener Details</h3>
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={sessionDetails.listener.profilePhoto || 'https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg'}
                    alt={sessionDetails.listener.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {sessionDetails.listener.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ID: {sessionDetails.listener.userId}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Phone:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">{sessionDetails.listener.phoneNumber}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">{sessionDetails.listener.email || 'N/A'}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">State:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">{sessionDetails.listener.state || 'N/A'}</span>
                  </p>
                  {sessionDetails.listener.bio && (
                    <p className="text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Bio:</span>
                      <span className="ml-2 text-gray-900 dark:text-gray-100">{sessionDetails.listener.bio}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Ratings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ratings & Feedback</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User to Listener Rating */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">User to Listener</h4>
                  {sessionDetails.ratings.userToListener.rating ? (
                    <div>
                      {renderStars(sessionDetails.ratings.userToListener.rating)}
                      {sessionDetails.ratings.userToListener.comments && (
                        renderCommentWithToggle(
                          sessionDetails.ratings.userToListener.comments,
                          showFullUserComment,
                          () => setShowFullUserComment((prev) => !prev)
                        )
                      )}
                      {sessionDetails.ratings.userToListener.createdDateTime && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {formatLocalDate(sessionDetails.ratings.userToListener.createdDateTime)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No rating provided</p>
                  )}
                </div>

                {/* Listener to User Rating */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Listener to User</h4>
                  {sessionDetails.ratings.listenerToUser.rating ? (
                    <div>
                      {renderStars(sessionDetails.ratings.listenerToUser.rating)}
                      {sessionDetails.ratings.listenerToUser.comments && (
                        renderCommentWithToggle(
                          sessionDetails.ratings.listenerToUser.comments,
                          showFullListenerComment,
                          () => setShowFullListenerComment((prev) => !prev)
                        )
                      )}
                      {sessionDetails.ratings.listenerToUser.createdDateTime && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {formatLocalDate(sessionDetails.ratings.listenerToUser.createdDateTime)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No rating provided</p>
                  )}
                </div>
              </div>
            </div>

            {/* Wallet Transactions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Wallet Transactions</h3>
              {sessionDetails.walletTransactions && sessionDetails.walletTransactions.length > 0 ? (
                <div className="space-y-3">
                  {sessionDetails.walletTransactions.map((transaction) => (
                    <div
                      key={transaction.transactionId}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            transaction.isCredit 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {transaction.isCredit ? 'Credit' : 'Debit'}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            ₹{transaction.amount.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {transaction.description || 'No description'}
                        </p>
                        {transaction.orderId && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Order: {transaction.orderId}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {formatLocalDate(transaction.createdDateTime)}
                        </p>
                        {transaction.remark && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {transaction.remark}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No wallet transactions found for this session
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cost Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cost Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Cost</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ₹{sessionDetails.costs.totalCost.toFixed(2)}
                  </span>
                </div>
                {sessionDetails.costs.perMinuteCost && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Per Minute Cost</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ₹{sessionDetails.costs.perMinuteCost.toFixed(2)}
                    </span>
                  </div>
                )}
                {sessionDetails.costs.chatPerMinuteCost && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Chat Per Minute</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ₹{sessionDetails.costs.chatPerMinuteCost.toFixed(2)}
                    </span>
                  </div>
                )}
                {sessionDetails.costs.commissionAmount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Commission</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ₹{sessionDetails.costs.commissionAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                {sessionDetails.costs.chatCommissionAmount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Chat Commission</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ₹{sessionDetails.costs.chatCommissionAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                {sessionDetails.costs.netAmount && (
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                    <span className="font-medium text-gray-900 dark:text-white">Net Amount</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      ₹{sessionDetails.costs.netAmount.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Listener Rates */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Listener Rates</h3>
              <div className="space-y-3">
                {sessionDetails.listener.perMinuteCost && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Call Rate</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ₹{sessionDetails.listener.perMinuteCost.toFixed(2)}/min
                    </span>
                  </div>
                )}
                {sessionDetails.listener.chatPerMinuteCost && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Chat Rate</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ₹{sessionDetails.listener.chatPerMinuteCost.toFixed(2)}/min
                    </span>
                  </div>
                )}
                {sessionDetails.listener.commissionPer && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Commission</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {sessionDetails.listener.commissionPer}%
                    </span>
                  </div>
                )}
                {sessionDetails.listener.chatCommissionPer && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Chat Commission</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {sessionDetails.listener.chatCommissionPer}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Session Metadata */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Session Metadata</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Created</span>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {formatLocalDate(sessionDetails.metadata.createdDateTime)}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Created By</span>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    User ID: {sessionDetails.metadata.createdBy}
                  </p>
                </div>
                {sessionDetails.metadata.recentAgoraEndDateTime && (
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Agora End Time</span>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {formatLocalDate(sessionDetails.metadata.recentAgoraEndDateTime)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
