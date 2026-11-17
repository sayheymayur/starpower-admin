import { serviceLabel, serviceBadgeClass } from '../utils/gatewayUserCmd';
import type { UserActivity } from '../hooks/useWebSocket';
import type { OnlineUser } from '../hooks/useWebSocket';

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatRelativeTime(timestamp: string) {
  const diffSecs = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
  return `${Math.floor(diffSecs / 3600)}h ago`;
}

interface GatewayLiveActivityPanelProps {
  isConnected: boolean;
  connectionStatus: string;
  reconnect: () => void;
  onlineUsers: OnlineUser[];
  activities: UserActivity[];
  uniqueServices: string[];
  selectedUserId: number | null;
  onSelectUserId: (id: number | null) => void;
  filterService: string;
  onFilterService: (service: string) => void;
  externalUserFilter?: number | null;
  compact?: boolean;
}

export default function GatewayLiveActivityPanel({
  isConnected,
  connectionStatus,
  reconnect,
  onlineUsers,
  activities,
  uniqueServices,
  selectedUserId,
  onSelectUserId,
  filterService,
  onFilterService,
  externalUserFilter = null,
  compact = false,
}: GatewayLiveActivityPanelProps) {
  const activeUserFilter = externalUserFilter ?? selectedUserId;

  const filteredActivities = activities.filter((a) => {
    if (activeUserFilter !== null && a.userId !== activeUserFilter) return false;
    if (filterService !== 'all' && a.service !== filterService) return false;
    return true;
  });

  const filteredOnlineUsers =
    activeUserFilter !== null
      ? onlineUsers.filter((u) => u.userId === activeUserFilter)
      : onlineUsers;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Live gateway activity</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Real-time service commands from connected users
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`h-2.5 w-2.5 rounded-full ${
                isConnected
                  ? 'bg-green-500 animate-pulse'
                  : connectionStatus === 'connecting'
                    ? 'bg-yellow-500 animate-pulse'
                    : 'bg-red-500'
              }`}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isConnected ? 'Connected' : connectionStatus === 'connecting' ? 'Connecting…' : 'Disconnected'}
            </span>
          </div>
          {!isConnected && (
            <button
              type="button"
              onClick={reconnect}
              className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Reconnect
            </button>
          )}
        </div>
      </div>

      {!isConnected && connectionStatus !== 'connecting' && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          WebSocket disconnected — live commands will not appear until reconnected.
        </div>
      )}

      <div className={`grid gap-6 ${compact ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-white">Active users</h3>
            <span className="text-sm text-gray-500">{filteredOnlineUsers.length}</span>
          </div>
          {filteredOnlineUsers.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">No active users yet</p>
          ) : (
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {filteredOnlineUsers.map((user) => (
                <button
                  key={user.userId}
                  type="button"
                  onClick={() =>
                    onSelectUserId(selectedUserId === user.userId ? null : user.userId)
                  }
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    selectedUserId === user.userId
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {user.fullName || `User ${user.userId}`}
                      </p>
                      {user.lastService && user.lastCommand && (
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${serviceBadgeClass(user.lastService)}`}
                          >
                            {serviceLabel(user.lastService)}
                          </span>
                          <code className="text-xs text-gray-500 dark:text-gray-400">
                            {user.lastCommand}
                            {user.lastCommandArgs ? ` ${user.lastCommandArgs}` : ''}
                          </code>
                        </div>
                      )}
                    </div>
                    <span className="shrink-0 text-xs text-gray-400">#{user.userId}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-medium text-gray-900 dark:text-white">Command feed</h3>
            <div className="flex items-center gap-2">
              {selectedUserId !== null && !externalUserFilter && (
                <button
                  type="button"
                  onClick={() => onSelectUserId(null)}
                  className="rounded border border-blue-300 bg-blue-50 px-2 py-0.5 text-xs text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  User {selectedUserId} ×
                </button>
              )}
              <select
                className="rounded border border-gray-300 bg-white py-1 px-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={filterService}
                onChange={(e) => onFilterService(e.target.value)}
              >
                <option value="all">All services</option>
                {uniqueServices.map((service) => (
                  <option key={service} value={service}>
                    {serviceLabel(service)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {filteredActivities.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">
              Waiting for gateway commands…
            </p>
          ) : (
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {filteredActivities.map((activity, index) => (
                <div
                  key={`${activity.userId}-${activity.timestamp}-${index}`}
                  className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectUserId(activity.userId)}
                      className="text-sm font-medium text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                    >
                      User {activity.userId}
                    </button>
                    {activity.service && (
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${serviceBadgeClass(activity.service)}`}
                      >
                        {serviceLabel(activity.service)}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {formatTime(activity.timestamp)} · {formatRelativeTime(activity.timestamp)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{activity.activity}</p>
                  {activity.command && (
                    <p className="mt-1 font-mono text-xs text-gray-500">
                      {activity.command}
                      {activity.commandArgs ? ` ${activity.commandArgs}` : ''}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
