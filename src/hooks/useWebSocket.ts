import { useEffect, useRef, useState, useCallback } from 'react';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp?: string;
}

/**
 * Parse pipe-delimited WebSocket message protocol
 * Format: |command|param1|param2|param3|...
 * Example: |gateway|test|test
 */
export const parseWebSocketMessage = (rawMessage: string): WebSocketMessage | null => {
  try {
    // Remove leading/trailing pipes and split by pipe
    const parts = rawMessage.trim().split('|').filter(part => part.length > 0);
    
    if (parts.length === 0) {
      return null;
    }

    const [command, ...params] = parts;
    
    // Try to parse the message based on the command
    // For now, return a structured message
    return {
      type: command,
      data: params.length > 0 ? params : {},
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to parse WebSocket message:', error);
    return null;
  }
};

export interface OnlineUser {
  userId: number;
  fullName: string;
  phoneNumber: string;
  stateName: string | null;
  userName?: string;
  currentScreen?: string;
  lastActivity?: string;
  lastService?: string;
  lastCommand?: string;
  lastCommandArgs?: string;
  isOnline: boolean;
}

export interface UserActivity {
  userId: number;
  userName?: string;
  activity: string;
  screen?: string;
  service?: string;
  command?: string;
  commandArgs?: string;
  timestamp: string;
}

interface UseWebSocketOptions {
  url: string;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
  autoConnect?: boolean;
}

export const useWebSocket = (options: UseWebSocketOptions) => {
  const {
    url,
    onMessage,
    onError,
    onOpen,
    onClose,
    autoConnect = true,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const lastConnectedUrlRef = useRef<string | null>(null);
  
  // Store URL and callbacks in refs to avoid recreating connect function
  const urlRef = useRef(url);
  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);
  const onOpenRef = useRef(onOpen);
  const onCloseRef = useRef(onClose);
  
  // Update refs when values change
  useEffect(() => {
    urlRef.current = url;
  }, [url]);
  
  useEffect(() => {
    onMessageRef.current = onMessage;
    onErrorRef.current = onError;
    onOpenRef.current = onOpen;
    onCloseRef.current = onClose;
  }, [onMessage, onError, onOpen, onClose]);

  // Internal function to create WebSocket connection
  const createConnection = useCallback(() => {
    if (!urlRef.current) {
      setIsConnected(false);
      setConnectionStatus('disconnected');
      return;
    }

    // Close existing connection if any
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }

    try {
      setConnectionStatus('connecting');
      const ws = new WebSocket(urlRef.current);
      lastConnectedUrlRef.current = urlRef.current;

      ws.onopen = () => {
        // Note: We don't check isMountedRef here because:
        // 1. If we're creating a connection, the component is mounted
        // 2. Closing the connection here causes continuous disconnect loops
        // 3. State updates are safe - React will ignore them if unmounted
        setIsConnected(true);
        setConnectionStatus('connected');
        onOpenRef.current?.();
      };

      ws.onmessage = (event) => {
        try {
          // Parse pipe-delimited protocol: |command|param1|param2|...
          console.log(`<< ${event.data}`);

            // If parsing fails, pass raw data as fallback
            onMessageRef.current?.(event.data);
    
        } catch (error) {
          console.error('Failed to process WebSocket message:', error);
          // Pass raw data as fallback
          onMessageRef.current?.({
            type: 'error',
            data: event.data,
            timestamp: new Date().toISOString(),
          });
        }
      };

      ws.onerror = (error) => {
        setConnectionStatus('error');
        onErrorRef.current?.(error);
      };

      ws.onclose = () => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
        onCloseRef.current?.();
        // No automatic reconnection - user must manually reconnect
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('WebSocket connection error:', error);
      setConnectionStatus('error');
      setIsConnected(false);
    }
  }, []);

  // Public connect function for manual reconnection
  const connect = useCallback(() => {
    createConnection();
  }, [createConnection]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  const sendMessage = useCallback((message: string | string[]) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // If message is an array, format it as pipe-delimited: |cmd|param1|param2
      // If it's already a string, send it as-is (should already be formatted)
      console.log(`>> ${message}`);

      const formattedMessage = Array.isArray(message)
        ? `|${message.join('|')}`
        : message;
      wsRef.current.send(formattedMessage);
      return true;
    }
    console.warn('WebSocket is not connected. Cannot send message.');
    return false;
  }, []);

  // Track if we've attempted initial connection to prevent infinite loops
  const hasAttemptedConnectionRef = useRef(false);

  // Only auto-connect once on mount
  useEffect(() => {
    if (autoConnect && !hasAttemptedConnectionRef.current) {
      hasAttemptedConnectionRef.current = true;
      createConnection();
    }

    return () => {
      // Clean up WebSocket connection on unmount
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setIsConnected(false);
      setConnectionStatus('disconnected');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Reconnect if the URL changes (e.g., token updated)
  useEffect(() => {
    if (!autoConnect) return;
    if (!hasAttemptedConnectionRef.current) return;
    if (!url) return;
    if (lastConnectedUrlRef.current === url) return;
    createConnection();
  }, [autoConnect, createConnection, url]);

  return {
    isConnected,
    connectionStatus,
    sendMessage,
    reconnect: connect,
    disconnect,
  };
};

