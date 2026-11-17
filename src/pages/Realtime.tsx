import { useGatewayLiveActivity } from '../hooks/useGatewayLiveActivity';
import GatewayLiveActivityPanel from '../components/GatewayLiveActivityPanel';
import { serviceLabel } from '../utils/gatewayUserCmd';

export default function Realtime() {
  const live = useGatewayLiveActivity();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Realtime Monitoring</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Live gateway commands — see which users are active and what service actions they trigger
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Online Users</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{live.totalOnline}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Commands tracked</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{live.activities.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active services</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{live.uniqueServices.length}</p>
          {live.uniqueServices.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {live.uniqueServices.map(serviceLabel).join(', ')}
            </p>
          )}
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
        />
      </div>
    </div>
  );
}
