import { useEffect, useState } from "react";
import Badge from "../components/ui/badge";
import dashboardAPI from "../services/dashboardAPI";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SystemMetrics {
  timestamp: string;
  uptime: {
    process: number;
    system: number;
    formatted: string;
  };
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
    usagePercent: number;
  };
  cpu: {
    user: number;
    system: number;
    loadAverage: number[];
    cores: number;
  };
  api: {
    totalRequests: number;
    totalErrors: number;
    errorRate: number;
    averageResponseTime: number;
    topEndpoints: Array<{
      endpoint: string;
      requests: number;
      errors: number;
      errorRate: number;
      avgResponseTime: number;
    }>;
  };
  system: {
    platform: string;
    arch: string;
    hostname: string;
    release: string;
    totalMemory: number;
    freeMemory: number;
    memoryUsagePercent: number;
  };
}

interface HealthStatus {
  success: boolean;
  status: string;
  timestamp: string;
  services?: {
    database?: { status: string; responseTime: number; error: string | null };
    redis?: { status: string; responseTime: number; error: string | null };
  };
}

export default function Monitoring() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memoryHistory, setMemoryHistory] = useState<{ time: string; value: number }[]>([]);
  const [cpuHistory, setCpuHistory] = useState<{ time: string; value: number }[]>([]);

  const fetchMetrics = async () => {
    try {
      setError(null);
      const [metricsResponse, healthResponse] = await Promise.all([
        dashboardAPI.getSystemMetrics(),
        dashboardAPI.getSystemHealth(),
      ]);

      if (metricsResponse.success && metricsResponse.data) {
        const data = metricsResponse.data;
        setMetrics(data);
        
        // Update history for charts
        const now = new Date().toLocaleTimeString();
        const memoryUsage = data.memory.usagePercent;
        const cpuLoad = data.cpu.loadAverage[0] || 0;
        
        setMemoryHistory(prev => [...prev.slice(-29), { time: now, value: memoryUsage }]);
        setCpuHistory(prev => [...prev.slice(-29), { time: now, value: cpuLoad * 100 }]);
      }

      if (healthResponse.success) {
        setHealth(healthResponse);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load monitoring data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const memoryChartData = {
    labels: memoryHistory.map(d => d.time),
    datasets: [
      {
        label: "Memory Usage (%)",
        data: memoryHistory.map(d => d.value),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const cpuChartData = {
    labels: cpuHistory.map(d => d.time),
    datasets: [
      {
        label: "CPU Load (%)",
        data: cpuHistory.map(d => d.value),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + "%";
          },
        },
      },
    },
  };

  const getHealthBadgeColor = (status: string): "success" | "warning" | "dark" | "info" => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'online': return 'success';
      case 'degraded': return 'warning';
      case 'unhealthy': return 'info';
      default: return 'dark';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Monitoring</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Real-time system health, metrics, and performance monitoring
          </p>
        </div>
        <button
          onClick={fetchMetrics}
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

      {/* Health Status */}
      {health && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Overall Status</p>
            <Badge size="sm" color={getHealthBadgeColor(health.status)} className="mt-2">
              {health.status}
            </Badge>
          </div>
          {health.services?.database && (
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Database</p>
              <Badge size="sm" color={getHealthBadgeColor(health.services.database.status)} className="mt-2">
                {health.services.database.status}
              </Badge>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {health.services.database.responseTime}ms
              </p>
            </div>
          )}
          {health.services?.redis && (
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Redis</p>
              <Badge size="sm" color={getHealthBadgeColor(health.services.redis.status)} className="mt-2">
                {health.services.redis.status}
              </Badge>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {health.services.redis.responseTime}ms
              </p>
            </div>
          )}
          {metrics && (
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Uptime</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white mt-2">
                {metrics.uptime.formatted}
              </p>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">Loading monitoring data...</span>
        </div>
      ) : metrics ? (
        <>
          {/* System Information */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Memory Usage</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
                {metrics.memory.usagePercent.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {metrics.memory.heapUsed.toFixed(1)} MB / {metrics.memory.heapTotal.toFixed(1)} MB
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">CPU Load (1min)</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
                {metrics.cpu.loadAverage[0]?.toFixed(2) || "0.00"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {metrics.cpu.cores} cores
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Requests</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
                {metrics.api.totalRequests.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {metrics.api.errorRate.toFixed(2)}% error rate
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Response Time</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
                {metrics.api.averageResponseTime.toFixed(1)}ms
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {metrics.api.totalErrors} errors
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Memory Usage</h3>
              <div style={{ height: "300px" }}>
                {memoryHistory.length > 0 ? (
                  <Line data={memoryChartData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    Collecting data...
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">CPU Load</h3>
              <div style={{ height: "300px" }}>
                {cpuHistory.length > 0 ? (
                  <Line data={cpuChartData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    Collecting data...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* System Info & Top Endpoints */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Platform</span>
                  <span className="font-medium text-gray-900 dark:text-white">{metrics.system.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Architecture</span>
                  <span className="font-medium text-gray-900 dark:text-white">{metrics.system.arch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Hostname</span>
                  <span className="font-medium text-gray-900 dark:text-white">{metrics.system.hostname}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Kernel</span>
                  <span className="font-medium text-gray-900 dark:text-white">{metrics.system.release}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Total Memory</span>
                  <span className="font-medium text-gray-900 dark:text-white">{metrics.system.totalMemory} GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Free Memory</span>
                  <span className="font-medium text-gray-900 dark:text-white">{metrics.system.freeMemory} GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Memory Usage</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {metrics.system.memoryUsagePercent.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top API Endpoints</h3>
              <div className="space-y-3">
                {metrics.api.topEndpoints && metrics.api.topEndpoints.length > 0 ? (
                  metrics.api.topEndpoints.slice(0, 5).map((endpoint, index) => (
                    <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white break-all">
                          {endpoint.endpoint}
                        </span>
                        <Badge
                          size="sm"
                          color={endpoint.errorRate > 1 ? "info" : "success"}
                        >
                          {endpoint.errorRate.toFixed(2)}%
                        </Badge>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{endpoint.requests.toLocaleString()} requests</span>
                        <span>{endpoint.avgResponseTime.toFixed(1)}ms avg</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No endpoint data available</p>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

