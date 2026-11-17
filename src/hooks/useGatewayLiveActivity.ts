import { useState, useCallback, useMemo } from 'react';
import { useWebSocket, OnlineUser, UserActivity } from './useWebSocket';
import { authService } from '../services/auth';
import {
  parseGatewayUserCmd,
  serviceLabel,
  formatUserCommandActivity,
} from '../utils/gatewayUserCmd';

const GATEWAY_WS =
  import.meta.env.VITE_GATEWAY_WS_URL?.replace(/\/$/, '') ?? 'wss://paapi.sayhey.co.in';

const MAX_ACTIVITIES = 200;

export function useGatewayLiveActivity() {
  const [onlineUsers, setOnlineUsers] = useState<Map<number, OnlineUser>>(new Map());
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [filterService, setFilterService] = useState<string>('all');

  const token = authService.getToken();
  const wsUrl = token ? `${GATEWAY_WS}/ws/admin?token=${token}` : '';

  const recordUserCommand = useCallback((cmd: NonNullable<ReturnType<typeof parseGatewayUserCmd>>) => {
    const activity: UserActivity = {
      userId: cmd.userId,
      userName: `User ${cmd.userId}`,
      activity: formatUserCommandActivity(cmd),
      service: cmd.service,
      command: cmd.command,
      commandArgs: cmd.commandArgs,
      timestamp: cmd.timestamp,
    };

    setActivities((prev) => [activity, ...prev].slice(0, MAX_ACTIVITIES));

    setOnlineUsers((prev) => {
      const updated = new Map(prev);
      const existing = updated.get(cmd.userId);
      updated.set(cmd.userId, {
        userId: cmd.userId,
        fullName: existing?.fullName ?? `User ${cmd.userId}`,
        phoneNumber: existing?.phoneNumber ?? '—',
        stateName: existing?.stateName ?? null,
        userName: existing?.userName,
        isOnline: true,
        lastActivity: cmd.timestamp,
        lastService: cmd.service,
        lastCommand: cmd.command,
        lastCommandArgs: cmd.commandArgs,
        currentScreen: `${serviceLabel(cmd.service)} · ${cmd.command}`,
      });
      return updated;
    });
  }, []);

  const handleWebSocketMessage = useCallback(
    (message: unknown) => {
      try {
        const raw = typeof message === 'string' ? message : (message as { data?: string })?.data;
        if (typeof raw !== 'string') return;

        const userCmd = parseGatewayUserCmd(raw);
        if (userCmd) {
          recordUserCommand(userCmd);
          return;
        }

        const parsed = raw.split('|');
        const gateway = parsed[1];
        const event = parsed[2];
        const args = parsed.slice(3);
        if (gateway !== 'gateway') return;

        switch (event) {
          case 'users': {
            const users = JSON.parse(args[0]) as OnlineUser[];
            setOnlineUsers(new Map(users.map((user) => [user.userId, user])));
            break;
          }
          case 'user_online':
          case 'connected': {
            const data = JSON.parse(args[0]) as OnlineUser;
            setOnlineUsers((prev) => {
              const updated = new Map(prev);
              updated.set(data.userId, {
                userId: data.userId,
                fullName: data.fullName,
                currentScreen: 'Unknown',
                lastActivity: new Date().toISOString(),
                isOnline: true,
                phoneNumber: data.phoneNumber,
                stateName: data.stateName,
              });
              return updated;
            });
            break;
          }
          case 'user_offline':
          case 'disconnected': {
            const data = JSON.parse(args[0]) as OnlineUser;
            setOnlineUsers((prev) => {
              const updated = new Map(prev);
              updated.delete(data.userId);
              return updated;
            });
            break;
          }
          default:
            break;
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    },
    [recordUserCommand]
  );

  const { isConnected, connectionStatus, reconnect } = useWebSocket({
    url: wsUrl,
    onMessage: handleWebSocketMessage,
    onError: (error) => {
      console.error('WebSocket error:', error);
    },
  });

  const uniqueServices = useMemo(
    () => Array.from(new Set(activities.map((a) => a.service).filter(Boolean) as string[])),
    [activities]
  );

  const filteredActivities = useMemo(
    () =>
      activities.filter((a) => {
        if (selectedUserId !== null && a.userId !== selectedUserId) return false;
        if (filterService !== 'all' && a.service !== filterService) return false;
        return true;
      }),
    [activities, selectedUserId, filterService]
  );

  const onlineUsersArray = useMemo(() => Array.from(onlineUsers.values()), [onlineUsers]);

  return {
    activities,
    filteredActivities,
    onlineUsersArray,
    uniqueServices,
    selectedUserId,
    setSelectedUserId,
    filterService,
    setFilterService,
    isConnected,
    connectionStatus,
    reconnect,
    totalOnline: onlineUsers.size,
  };
}
