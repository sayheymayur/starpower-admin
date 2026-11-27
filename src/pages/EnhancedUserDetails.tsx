import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import dashboardAPI from "../services/dashboardAPI";
import { formatLocalDate } from "../utils/dateUtils";
import UserUpdateForm from "../components/UserUpdateForm";
import AadhaarProfileCard from "../components/aadhaar/AadhaarProfileCard";
import type { AdminAadhaarProfile } from "../services/api/aadhaar";
import useGoBack from "../hooks/useGoBack";
import { API_ORIGIN, PUBLIC_URL_PREFIX_RE } from '../config/apiOrigin';

interface ComprehensiveUser {
  userId: number;
  username: string;
  mobileNo: string;
  emailId: string | null;
  fullName: string;
  dob: string | null;
  gender: string | null;
  profilePhoto: string | null;
  bio: string | null;
  status: number;
  isDoctor: number;
  kycStatus: number;
  createdDateTime: string;
  state: {
    stateId: number;
    stateCode: string;
    stateName: string;
  } | null;
  referrer: {
    userId: number;
    name: string;
    phoneNumber: string;
  } | null;
  statistics: {
    totalSessions: number;
    completedSessions: number;
    cancelledSessions: number;
    totalSpent: number;
    totalEarned: number;
    walletBalance: number;
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    lastActivityDate: string | null;
  };
  professionalData?: {
    specializations: Array<{
      topicId: number;
      topicName: string;
    }>;
    bankDetails: Array<{
      bankId: number;
      bankName: string;
      accountNumber: string;
      ifscCode: string;
      status: number;
    }>;
    payoutHistory: Array<{
      payoutId: number;
      amount: number;
      status: number;
      requestDate: string;
      processedDate: string | null;
    }>;
  };
  recentActivity: Array<{
    activityId: number;
    type: string;
    description: string;
    createdDateTime: string;
  }>;
  recentSessions: Array<{
    sessionId: number;
    sessionType: number;
    sessionTypeText: string;
    status: string;
    duration: number;
    cost: number;
    createdDateTime: string;
    participant: {
      userId: number;
      name: string;
      phoneNumber: string;
    };
  }>;
  recentPosts: Array<{
    postId: number;
    description: string;
    likeCount: number;
    commentCount: number;
    viewCount: number;
    createdDateTime: string;
  }>;
  recentWalletTransactions: Array<{
    transactionId: number;
    amount: number;
    isCredit: boolean;
    description: string;
    transactionType: string;
    createdDateTime: string;
  }>;
  ratings: {
    given: Array<{
      ratingId: number;
      toUserName: string;
      rating: number;
      comments: string;
      createdDateTime: string;
    }>;
    received: Array<{
      ratingId: number;
      fromUserName: string;
      rating: number;
      comments: string;
      createdDateTime: string;
    }>;
    averageRating: number;
    totalRatings: number;
  };
  assessmentCerti?: string | null;
  qualificationProof?: string | null;
  aadhaar?: AdminAadhaarProfile | null;
}

export default function EnhancedUserDetails() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const goBack = useGoBack();
  const userId = searchParams.get('userId');

  const [user, setUser] = useState<ComprehensiveUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'wallet' | 'posts' | 'activity' | 'professional' | 'documents'>('overview');

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await dashboardAPI.getEnhancedUserDetails(Number(userId));

      if (response.success && response.data) {
        const userData = response.data as ComprehensiveUser;
        console.log('Recent sessions data:', userData.recentSessions);
        
        // Deduplicate sessions based on sessionId
        if (userData.recentSessions) {
          const originalCount = userData.recentSessions.length;
          const uniqueSessions = userData.recentSessions.filter((session, index, self) => 
            index === self.findIndex(s => s.sessionId === session.sessionId)
          );
          userData.recentSessions = uniqueSessions;
          console.log(`Sessions deduplication: ${originalCount} -> ${uniqueSessions.length} (removed ${originalCount - uniqueSessions.length} duplicates)`);
        }
        
        setUser(userData);
      } else {
        throw new Error(response.message || 'Failed to fetch user details');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching user details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserUpdate = (updatedUser: any) => {
    // Update the user state with the new data
    if (user) {
      setUser({
        ...user,
        ...updatedUser,
        // Map the updated fields to match our interface
        userId: updatedUser.user_id_pk || user.userId,
        username: updatedUser.username || user.username,
        mobileNo: updatedUser.mobile_no || user.mobileNo,
        emailId: updatedUser.email_id || user.emailId,
        fullName: updatedUser.full_name || user.fullName,
        dob: updatedUser.dob || user.dob,
        gender: updatedUser.gender || user.gender,
        profilePhoto: updatedUser.profile_photo || user.profilePhoto,
        bio: updatedUser.bio || user.bio,
        status: updatedUser.status !== undefined ? updatedUser.status : user.status,
        isDoctor: updatedUser.is_doctor !== undefined ? updatedUser.is_doctor : user.isDoctor,
        kycStatus: updatedUser.kyc_status !== undefined ? updatedUser.kyc_status : user.kycStatus,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading user details...</span>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-sm text-red-800 dark:text-red-200">{error || 'User not found'}</p>
        <button
          onClick={goBack}
          className="mt-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-medium"
        >
          ← Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-start mb-4">
          <button
            onClick={goBack}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-medium"
          >
            ← Back to Users
          </button>
          <button
            onClick={() => setShowUpdateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
          >
            Update User
          </button>
        </div>

        <div className="flex items-start gap-6">
          <img
            src={user.profilePhoto || 'https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg'}
            alt={user.fullName}
            className="h-24 w-24 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.fullName}
              </h1>
              {user.isDoctor === 1 && (
                <span className="px-2 py-1 rounded text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Doctor
                </span>
              )}
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                user.status === 1
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {user.status === 1 ? 'Active' : 'Inactive'}
              </span>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-1">@{user.username}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.mobileNo}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">User ID</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.userId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">State</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.state?.stateName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Joined</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatLocalDate(user.createdDateTime)}</p>
              </div>
            </div>

            {user.bio && (
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{user.bio}</p>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Total Sessions</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{user.statistics.totalSessions}</p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">{user.statistics.completedSessions} completed</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <p className="text-xs text-green-600 dark:text-green-400 mb-1">Wallet Balance</p>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">₹{user.statistics.walletBalance.toFixed(2)}</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">₹{user.statistics.totalSpent.toFixed(2)}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mb-1">Total Posts</p>
            <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{user.statistics.totalPosts}</p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">{user.statistics.totalLikes} likes</p>
          </div>
          <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4">
            <p className="text-xs text-pink-600 dark:text-pink-400 mb-1">Average Rating</p>
            <p className="text-2xl font-bold text-pink-900 dark:text-pink-100">{user.ratings.averageRating.toFixed(1)}</p>
            <p className="text-xs text-pink-700 dark:text-pink-300 mt-1">{user.ratings.totalRatings} ratings</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'sessions', label: 'Sessions' },
              { id: 'wallet', label: 'Wallet' },
              { id: 'posts', label: 'Posts' },
              { id: 'activity', label: 'Activity' },
              { id: 'professional', label: 'Professional' },
              { id: 'documents', label: 'Documents' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Gender</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.gender || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Date of Birth</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.dob ? formatLocalDate(user.dob) : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">KYC Status</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {['Not Verified', 'Pending', 'Verified', 'Rejected'][user.kycStatus] || 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Referral Information */}
                {user.referrer && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Referred By</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.referrer.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.referrer.phoneNumber}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <AadhaarProfileCard aadhaar={user.aadhaar} userId={user.userId} compact />

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {user.recentActivity.slice(0, 5).map((activity) => (
                    <div key={activity.activityId} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatLocalDate(activity.createdDateTime)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Sessions</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {user.recentSessions.length} session{user.recentSessions.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="space-y-3">
                {user.recentSessions.map((session) => (
                  <div 
                    key={session.sessionId} 
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                    onClick={() => navigate(`/session-details?sessionId=${session.sessionId}`)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {session.sessionTypeText} Session
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          with {session.participant.name}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        session.status === 'Completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
                      <span>Duration: {session.duration} min</span>
                      <span>Cost: ₹{session.cost?.toFixed(2)}</span>
                      <span>{formatLocalDate(session.createdDateTime)}</span>
                    </div>
                    <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                      Click to view details →
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wallet Tab */}
          {activeTab === 'wallet' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Transactions</h3>
              <div className="space-y-3">
                {user.recentWalletTransactions.map((transaction) => (
                  <div key={transaction.transactionId} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {transaction.transactionType}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatLocalDate(transaction.createdDateTime)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          transaction.isCredit
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {transaction.isCredit ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Posts</h3>
              <div className="space-y-3">
                {user.recentPosts.map((post) => (
                  <div key={post.postId} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-900 dark:text-gray-100 mb-2">{post.description}</p>
                    <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400">
                      <span>❤️ {post.likeCount} likes</span>
                      <span>💬 {post.commentCount} comments</span>
                      <span>👁️ {post.viewCount} views</span>
                      <span className="ml-auto">{formatLocalDate(post.createdDateTime)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">All Activity</h3>
              <div className="space-y-3">
                {user.recentActivity.map((activity) => (
                  <div key={activity.activityId} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Type: {activity.type}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatLocalDate(activity.createdDateTime)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Professional Tab */}
          {activeTab === 'professional' && user.professionalData && (
            <div className="space-y-6">
              {/* Specializations */}
              {user.professionalData.specializations && user.professionalData.specializations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.professionalData.specializations.map((spec) => (
                      <span
                        key={spec.topicId}
                        className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {spec.topicName}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bank Details */}
              {user.professionalData.bankDetails && user.professionalData.bankDetails.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bank Details</h3>
                  <div className="space-y-3">
                    {user.professionalData.bankDetails.map((bank) => (
                      <div key={bank.bankId} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{bank.bankName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Account: {bank.accountNumber}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">IFSC: {bank.ifscCode}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            bank.status === 1
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {bank.status === 1 ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payout History */}
              {user.professionalData.payoutHistory && user.professionalData.payoutHistory.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payout History</h3>
                  <div className="space-y-3">
                    {user.professionalData.payoutHistory.map((payout) => (
                      <div key={payout.payoutId} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">₹{payout.amount.toFixed(2)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Requested: {formatLocalDate(payout.requestDate)}
                            </p>
                            {payout.processedDate && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Processed: {formatLocalDate(payout.processedDate)}
                              </p>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            payout.status === 1
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {payout.status === 1 ? 'Processed' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assessment Certificate */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assessment Certificate</h3>
                  {user.assessmentCerti ? (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="mb-4">
                        <img
                          src={user.assessmentCerti.startsWith('http') 
                            ? user.assessmentCerti 
                            : `${API_ORIGIN}/public/${user.assessmentCerti.replace(PUBLIC_URL_PREFIX_RE, '')}`
                          }
                          alt="Assessment Certificate"
                          className="w-full h-auto rounded-lg border border-gray-200 dark:border-gray-600 max-h-[500px] object-contain cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => {
                            const imageUrl = user.assessmentCerti!.startsWith('http') 
                              ? user.assessmentCerti 
                              : `${API_ORIGIN}/public/${user.assessmentCerti!.replace(PUBLIC_URL_PREFIX_RE, '')}`;
                            window.open(imageUrl, '_blank');
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                          }}
                        />
                      </div>
                      <a
                        href={user.assessmentCerti.startsWith('http') 
                          ? user.assessmentCerti 
                          : `${API_ORIGIN}/public/${user.assessmentCerti.replace(PUBLIC_URL_PREFIX_RE, '')}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Open in New Tab
                      </a>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">No assessment certificate uploaded</p>
                    </div>
                  )}
                </div>

                {/* Qualification Proof */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Qualification Proof</h3>
                  {user.qualificationProof ? (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="mb-4">
                        <img
                          src={user.qualificationProof.startsWith('http') 
                            ? user.qualificationProof 
                            : `${API_ORIGIN}/public/${user.qualificationProof.replace(PUBLIC_URL_PREFIX_RE, '')}`
                          }
                          alt="Qualification Proof"
                          className="w-full h-auto rounded-lg border border-gray-200 dark:border-gray-600 max-h-[500px] object-contain cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => {
                            const imageUrl = user.qualificationProof!.startsWith('http') 
                              ? user.qualificationProof 
                              : `${API_ORIGIN}/public/${user.qualificationProof!.replace(PUBLIC_URL_PREFIX_RE, '')}`;
                            window.open(imageUrl, '_blank');
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                          }}
                        />
                      </div>
                      <a
                        href={user.qualificationProof.startsWith('http') 
                          ? user.qualificationProof 
                          : `${API_ORIGIN}/public/${user.qualificationProof.replace(PUBLIC_URL_PREFIX_RE, '')}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Open in New Tab
                      </a>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">No qualification proof uploaded</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Update Form Modal */}
      {showUpdateForm && user && (
        <UserUpdateForm
          user={user}
          onUpdate={handleUserUpdate}
          onClose={() => setShowUpdateForm(false)}
        />
      )}
    </div>
  );
}

