import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import dashboardAPI from "../services/dashboardAPI";
import { AngleLeftIcon } from "../icons";

interface PM2Process {
  pmId: number;
  name: string;
  pid: number;
  status: string;
}

export default function ProcessLogs() {
  const { processId } = useParams<{ processId: string }>();
  const navigate = useNavigate();
  const [process, setProcess] = useState<PM2Process | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!processId) {
      setError("Process ID is required");
      setLoading(false);
      return;
    }

    // Fetch process details
    const fetchProcess = async () => {
      try {
        const response = await dashboardAPI.getPM2Process(processId);
        if (response.success && response.data) {
          setProcess(response.data);
        } else {
          throw new Error(response.message || "Process not found");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load process");
      } finally {
        setLoading(false);
      }
    };

    fetchProcess();
  }, [processId]);

  useEffect(() => {
    if (!processId || !process) return;

    const url = `https://paapi.sayhey.co.in/api/dashboard/api/monitoring/pm2/logs/${processId}?lines=100`;
    const eventSource = new EventSource(url, { withCredentials: false });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'connected':
            setConnected(true);
            setLogs(prev => [...prev, `[Connected] ${data.message}`]);
            break;
          case 'log':
            setLogs(prev => [...prev.slice(-999), data.data]);
            break;
          case 'error':
            setLogs(prev => [...prev.slice(-999), `[ERROR] ${data.data}`]);
            break;
          case 'heartbeat':
            // Silent heartbeat
            break;
        }
      } catch (err) {
        console.error('Error parsing log data:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      setConnected(false);
      setLogs(prev => [...prev, `[Error] Connection lost. Attempting to reconnect...`]);
    };

    eventSourceRef.current = eventSource;

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [processId, process]);

  const goBack = () => {
    navigate('/processes');
  };

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        goBack();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        setLogs([]);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">Loading process details...</span>
      </div>
    );
  }

  if (error && !process) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <AngleLeftIcon className="w-4 h-4" />
            Back to Processes
          </button>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <AngleLeftIcon className="w-4 h-4" />
              Back to Processes
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Process Logs: {process?.name || processId}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Real-time log stream from PM2 process
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {process && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>PID: {process.pid}</span>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <span>Status: {process.status}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logs Container - Fixed height with internal scrolling */}
      <div className="flex-1 flex flex-col bg-black overflow-hidden min-h-0">
        {/* Terminal-style Header Bar */}
        <div className="bg-gray-900 border-b border-gray-700 px-4 py-2 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-xs text-gray-400 font-mono ml-2">PM2 Logs — {process?.name || processId}</span>
          </div>
          <div className="text-xs text-gray-500 font-mono">
            {connected ? '● LIVE' : '○ DISCONNECTED'}
          </div>
        </div>

        {/* Logs Viewer - Scrollable area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-black p-4 font-mono text-sm leading-relaxed min-h-0">
          {logs.length === 0 ? (
            <div className="text-gray-500 font-mono">
              <span className="text-gray-600">[SYSTEM]</span> Waiting for logs...
            </div>
          ) : (
            <div className="space-y-0.5">
              {logs.map((log, index) => {
                const isError = log.includes('[ERROR]') || log.toLowerCase().includes('error');
                const isWarning = log.includes('[WARN]') || log.toLowerCase().includes('warning');
                const isConnected = log.includes('[Connected]') || log.includes('[SYSTEM]');
                const isErrorMsg = log.includes('[Error]') && !isError;
                const isInfo = log.includes('[INFO]') || log.includes('[INFO:');
                const isDebug = log.includes('[DEBUG]') || log.includes('[DEBUG:');
                
                // Extract timestamp if present
                const timestampMatch = log.match(/\[?(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[^\]]*)\]?/);
                const timestamp = timestampMatch ? timestampMatch[1] : null;
                const logContent = timestamp ? log.replace(/\[?\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[^\]]*\]?\s*/, '') : log;

                // Determine color based on log type
                let textColor = 'text-gray-300';
                let prefixColor = 'text-gray-500';
                
                if (isError) {
                  textColor = 'text-red-400';
                  prefixColor = 'text-red-500';
                } else if (isWarning || isErrorMsg) {
                  textColor = 'text-yellow-400';
                  prefixColor = 'text-yellow-500';
                } else if (isConnected) {
                  textColor = 'text-green-400';
                  prefixColor = 'text-green-500';
                } else if (isInfo) {
                  textColor = 'text-blue-400';
                  prefixColor = 'text-blue-500';
                } else if (isDebug) {
                  textColor = 'text-purple-400';
                  prefixColor = 'text-purple-500';
                }

                return (
                  <div
                    key={index}
                    className={`flex items-start gap-2 hover:bg-gray-900/50 px-2 py-0.5 -mx-2 rounded ${textColor}`}
                  >
                    {/* Line number */}
                    <span className="text-gray-700 text-xs font-mono tabular-nums select-none flex-shrink-0 w-12 text-right">
                      {String(index + 1).padStart(4, '0')}
                    </span>
                    
                    {/* Timestamp */}
                    {timestamp && (
                      <span className="text-gray-700 text-xs font-mono tabular-nums select-none flex-shrink-0 w-24">
                        {new Date(timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    )}
                    
                    {/* Log content */}
                    <span className={`flex-1 whitespace-pre-wrap break-words ${textColor}`}>
                      <span className={prefixColor}>
                        {logContent.match(/^\[?([A-Z]+(?::\s*[^\]]+)?)\]?\s*/)?.[0] || ''}
                      </span>
                      <span>{logContent.replace(/^\[?([A-Z]+(?::\s*[^\]]+)?)\]?\s*/, '')}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <div ref={logsEndRef} className="h-4" />
        </div>

        {/* Footer */}
        <div className="bg-gray-900 border-t border-gray-700 px-4 py-2 flex items-center justify-between flex-shrink-0 font-mono text-xs">
          <div className="flex items-center gap-4 text-gray-400">
            <span className="text-green-400">●</span>
            <span>{logs.length.toLocaleString()} lines</span>
            <span className="text-gray-600">|</span>
            <span className="text-blue-400">●</span>
            <span>Streaming {connected ? 'ON' : 'OFF'}</span>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            <button
              onClick={() => {
                setLogs([]);
              }}
              className="hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-800 transition-colors"
            >
              Clear (Ctrl+L)
            </button>
            <span className="text-gray-600">|</span>
            <span>ESC to exit</span>
          </div>
        </div>
      </div>
    </div>
  );
}

