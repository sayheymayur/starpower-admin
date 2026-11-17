import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dashboardAPI from "../services/dashboardAPI";
import { formatLocalDate } from "../utils/dateUtils";
import GatewayLiveActivityPanel from "../components/GatewayLiveActivityPanel";
import { useGatewayLiveActivity } from "../hooks/useGatewayLiveActivity";

interface Activity {
  activityId: number;
  userId: number;
  type: string;
  description: string;
  metadata: any;
  createdDateTime: string;
  user: {
    userId: number;
    fullName: string;
    profilePhoto: string | null;
  };
}

export default function ActivityTracking() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [limit, setLimit] = useState(50);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const live = useGatewayLiveActivity();
  const liveUserFilter = selectedUserId.trim() ? Number(selectedUserId) : null;

  useEffect(() => {
    fetchActivities();

    if (autoRefresh) {
      const interval = setInterval(fetchActivities, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [selectedUserId, limit, autoRefresh]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (selectedUserId) {
        response = await dashboardAPI.getUserActivity(Number(selectedUserId), limit);
      } else {
        response = await dashboardAPI.getLatestActivity(limit);
      }

      if (response.success && response.data) {
        // Ensure we always set an array
        const activitiesData = Array.isArray(response.data) ? response.data : [];
        setActivities(activitiesData as Activity[]);
      } else {
        // Set empty array on error to prevent map errors
        setActivities([]);
        throw new Error(response.message || 'Failed to fetch activities');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching activities:', err);
      // Ensure activities is always an array even on error
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'session_started':
        return '🎯';
      case 'session_completed':
        return '✅';
      case 'session_cancelled':
        return '❌';
      case 'post_created':
        return '📝';
      case 'post_liked':
        return '❤️';
      case 'post_commented':
        return '💬';
      case 'wallet_topup':
        return '💰';
      case 'payout_requested':
        return '💸';
      case 'profile_updated':
        return '👤';
      case 'login':
        return '🔐';
      case 'logout':
        return '🚪';
      default:
        return '📌';
    }
  };

  const getActivityColor = (type: string) => {
    if (type.includes('session')) return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    if (type.includes('post')) return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
    if (type.includes('wallet') || type.includes('payout')) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (type.includes('login') || type.includes('logout')) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Tracking</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Live gateway commands and stored user activity history
          </p>
        </div>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto-refresh (30s)
          </label>
          <button
            onClick={fetchActivities}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
          >
            Refresh Now
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <GatewayLiveActivityPanel
          isConnected={live.isConnected}
          connectionStatus={live.connectionStatus}
          reconnect={live.reconnect}
          onlineUsers={live.onlineUsersArray}
          activities={live.activities}
          uniqueServices={live.uniqueServices}
          selectedUserId={live.selectedUserId}
          onSelectUserId={live.setSelectedUserId}
          filterService={live.filterService}
          onFilterService={live.setFilterService}
          externalUserFilter={Number.isFinite(liveUserFilter) ? liveUserFilter : null}
        />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              User ID (leave empty for all users)
            </label>
            <input
              type="text"
              placeholder="Enter user ID..."
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Limit
            </label>
            <select
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            >
              <option value="25">25 activities</option>
              <option value="50">50 activities</option>
              <option value="100">100 activities</option>
              <option value="200">200 activities</option>
            </select>
          </div>
        </div>

        <button
          onClick={fetchActivities}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
        >
          Apply Filters
        </button>
      </div>

      {/* Activity List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Stored activity history {selectedUserId && `(User ID: ${selectedUserId})`}
          </h2>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading activities...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-3">
              {!activities || !Array.isArray(activities) || activities.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No activities found
                </div>
              ) : (
                activities.map((activity) => (
                  <div
                    key={activity.activityId}
                    className={`p-4 rounded-lg border ${getActivityColor(activity.type)}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 text-2xl">
                        {getActivityIcon(activity.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <img
                                src={activity.user.profilePhoto || 'https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg'}
                                alt={activity.user.fullName}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                              <div>
                                <button
                                  onClick={() => navigate(`/enhanced-user-details?userId=${activity.user.userId}`)}
                                  className="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                  {activity.user.fullName}
                                </button>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  ID: {activity.user.userId}
                                </p>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-900 dark:text-gray-100 mb-1">
                              {activity.description}
                            </p>
                            
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                {activity.type}
                              </span>
                              
                              {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                                <details className="inline">
                                  <summary className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                                    View metadata
                                  </summary>
                                  <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-x-auto">
                                    {JSON.stringify(activity.metadata, null, 2)}
                                  </pre>
                                </details>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex-shrink-0 text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatLocalDate(activity.createdDateTime)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Activity Type Legend */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity Types</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { type: 'session_started', label: 'Session Started', icon: '🎯' },
            { type: 'session_completed', label: 'Session Completed', icon: '✅' },
            { type: 'session_cancelled', label: 'Session Cancelled', icon: '❌' },
            { type: 'post_created', label: 'Post Created', icon: '📝' },
            { type: 'post_liked', label: 'Post Liked', icon: '❤️' },
            { type: 'post_commented', label: 'Post Commented', icon: '💬' },
            { type: 'wallet_topup', label: 'Wallet Top-up', icon: '💰' },
            { type: 'payout_requested', label: 'Payout Requested', icon: '💸' },
            { type: 'profile_updated', label: 'Profile Updated', icon: '👤' },
            { type: 'login', label: 'Login', icon: '🔐' },
            { type: 'logout', label: 'Logout', icon: '🚪' },
          ].map((item) => (
            <div
              key={item.type}
              className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <span className="text-xl">{item.icon}</span>
              <div>
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{item.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

