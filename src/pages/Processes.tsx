import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../components/ui/table";
import Badge from "../components/ui/badge";
import dashboardAPI from "../services/dashboardAPI";

interface PM2Process {
  pmId: number;
  name: string;
  pid: number;
  status: string;
  restarts: number;
  uptime: number;
  memory: number;
  cpu: number;
  instances: number;
  mode: string;
  script: string;
  error: string | null;
}

const formatUptime = (ms: number) => {
  const seconds = Math.floor(ms / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
};

const formatMemory = (bytes: number) => {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
};

const getStatusBadgeColor = (status: string): "success" | "warning" | "dark" | "info" => {
  switch (status.toLowerCase()) {
    case 'online': return 'success';
    case 'stopped': return 'dark';
    case 'errored': return 'info';
    case 'restarting': return 'warning';
    default: return 'dark';
  }
};

export default function Processes() {
  const navigate = useNavigate();
  const [processes, setProcesses] = useState<PM2Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProcesses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardAPI.getPM2Processes();
      if (response.success && response.data) {
        setProcesses(Array.isArray(response.data) ? response.data : []);
      } else {
        throw new Error(response.message || "Failed to fetch processes");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load PM2 processes");
      setProcesses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses();
    const interval = setInterval(fetchProcesses, 25000); // Refresh every 25 seconds
    return () => clearInterval(interval);
  }, []);

  const openLogsPage = (process: PM2Process) => {
    navigate(`/processes/${process.pmId}/logs`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">PM2 Processes</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Monitor and view logs for all PM2 processes running on the server
          </p>
        </div>
        <button
          onClick={fetchProcesses}
          className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">Loading processes...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-100 dark:bg-gray-700">
              <TableRow>
                <TableCell isHeader className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Process</TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">PID</TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">CPU</TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Memory</TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Uptime</TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Restarts</TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
              {processes.length === 0 ? (
                <TableRow>
                  <td colSpan={8} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    No processes found
                  </td>
                </TableRow>
              ) : (
                processes.map((process) => (
                  <TableRow key={process.pmId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <TableCell className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      <div className="font-medium">{process.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{process.script}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {process.instances} instance{process.instances !== 1 ? 's' : ''} • {process.mode}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge size="sm" color={getStatusBadgeColor(process.status)}>
                        {process.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-mono">
                      {process.pid}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {process.cpu.toFixed(1)}%
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {formatMemory(process.memory)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {formatUptime(process.uptime)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {process.restarts}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <button
                        onClick={() => openLogsPage(process)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-medium"
                      >
                        View Logs
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

