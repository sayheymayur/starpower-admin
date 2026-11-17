import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AdminOtpListResponse,
  AdminOtpLog,
  connectAdminOtpSocket,
  parseDashboardMessage,
  sendDashboardCommand,
  upsertOtpRow,
} from '../services/websocket/adminOtp';

const PAGE_SIZE = 50;
const MAX_RECONNECT_DELAY_MS = 30_000;

export interface UseAdminOtpFeedOptions {
  /** When false, otplog push events are ignored (requires otp.monitor.otplog:read). */
  liveUpdates?: boolean;
}

function detachSocket(ws: WebSocket) {
  ws.onclose = null;
  ws.onopen = null;
  ws.onmessage = null;
  ws.onerror = null;
}

export function useAdminOtpFeed(
  token: string | null,
  options: UseAdminOtpFeedOptions = {}
) {
  const { liveUpdates = true } = options;
  const liveUpdatesRef = useRef(liveUpdates);
  liveUpdatesRef.current = liveUpdates;

  const wsRef = useRef<WebSocket | null>(null);
  const connectionIdRef = useRef(0);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const [otps, setOtps] = useState<AdminOtpLog[]>([]);
  const [pagination, setPagination] = useState<
    AdminOtpListResponse['pagination'] | null
  >(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveCount, setLiveCount] = useState(0);

  const clearReconnectTimer = () => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  };

  const fetchPage = useCallback((limit = PAGE_SIZE, offset = 0) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      sendDashboardCommand(ws, '/getotps', [limit, offset]);
    }
  }, []);

  const connect = useCallback(() => {
    if (!token || !mountedRef.current) return;

    clearReconnectTimer();

    if (wsRef.current) {
      const prev = wsRef.current;
      wsRef.current = null;
      detachSocket(prev);
      if (prev.readyState === WebSocket.OPEN) {
        prev.close();
      }
    }

    setConnecting(true);
    setError(null);

    const connectionId = ++connectionIdRef.current;
    const ws = connectAdminOtpSocket(token);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current || connectionId !== connectionIdRef.current) {
        detachSocket(ws);
        if (ws.readyState === WebSocket.OPEN) ws.close();
        return;
      }
      reconnectAttemptRef.current = 0;
      setConnected(true);
      setConnecting(false);
      setError(null);
      sendDashboardCommand(ws, '/getotps', [PAGE_SIZE, 0]);
    };

    ws.onmessage = (event) => {
      if (connectionId !== connectionIdRef.current) return;

      const parsed = parseDashboardMessage(String(event.data));
      if (!parsed) return;

      if (parsed.type === 'otps') {
        setOtps(parsed.data.otps);
        setPagination(parsed.data.pagination);
        setError(null);
      }

      if (parsed.type === 'otplog' && !liveUpdatesRef.current) {
        return;
      }

      if (parsed.type === 'otplog') {
        setOtps((prev) => {
          const exists = prev.some((r) => r.id === parsed.data.id);
          if (!exists) {
            setPagination((p) => (p ? { ...p, total: p.total + 1 } : p));
          }
          return upsertOtpRow(prev, parsed.data);
        });
        setLiveCount((c) => c + 1);
      }

      if (parsed.type === 'error') {
        setError(parsed.message);
      }
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      setConnected(false);
      setConnecting(false);
      wsRef.current = null;

      const attempt = reconnectAttemptRef.current + 1;
      reconnectAttemptRef.current = attempt;
      const delay = Math.min(1000 * 2 ** (attempt - 1), MAX_RECONNECT_DELAY_MS);

      reconnectTimerRef.current = setTimeout(() => {
        if (mountedRef.current && token) connect();
      }, delay);
    };

    ws.onerror = () => {
      if (!mountedRef.current) return;
      setError('WebSocket connection failed');
      setConnecting(false);
    };
  }, [token]);

  useEffect(() => {
    mountedRef.current = true;
    if (!token) {
      setConnected(false);
      setConnecting(false);
      return undefined;
    }

    connect();

    return () => {
      mountedRef.current = false;
      connectionIdRef.current += 1;
      clearReconnectTimer();
      const ws = wsRef.current;
      wsRef.current = null;
      if (ws) {
        detachSocket(ws);
        // Avoid closing CONNECTING sockets — React Strict Mode cleanup otherwise
        // logs "WebSocket is closed before the connection is established".
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      }
    };
  }, [token, connect]);

  const reconnect = useCallback(() => {
    reconnectAttemptRef.current = 0;
    connect();
  }, [connect]);

  return {
    otps,
    pagination,
    connected,
    connecting,
    error,
    liveCount,
    fetchPage,
    reconnect,
    pageSize: PAGE_SIZE,
  };
}
