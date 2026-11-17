import { useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import dashboardAPI from "../services/dashboardAPI";
import { formatLocalDate } from "../utils/dateUtils";

interface SessionReportMetrics {
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  rejectedSessions: number;
  timedOutSessions: number;
  pendingSessions: number;
  completionRate: number;
  cancellationRate: number;
  rejectionRate: number;
  timeoutRate: number;
  averageDurationMinutes: number;
  sessionTypes?: Record<string, number>;
}

interface SessionReportTimeBucket {
  hour: number;
  label: string;
  count: number;
}

interface SessionReportTrendItem {
  date: string;
  total: number;
  completed: number;
  cancelled: number;
  rejected: number;
  timedOut: number;
}

interface SessionReportRegionItem {
  state: string;
  count: number;
}

interface SessionReportRepeatItem {
  userId: number;
  userName: string;
  listenerId: number;
  listenerName: string;
  sessionCount: number;
  firstSession: string;
  lastSession: string;
}

interface SessionReportInsights {
  periodSummary?: string;
  mostActivePeriod?: string;
  peakHour?: string;
  repeatPairs?: number;
}

interface SessionReportData {
  period?: {
    type: string;
    start: string;
    end: string;
  };
  metrics?: SessionReportMetrics;
  timeOfDay?: SessionReportTimeBucket[];
  trend?: SessionReportTrendItem[];
  regions?: {
    initiatingUsers?: SessionReportRegionItem[];
    listeners?: SessionReportRegionItem[];
  };
  repeatSessions?: SessionReportRepeatItem[];
  insights?: SessionReportInsights;
}

const formatNumber = (value?: number | null) => {
  if (value === undefined || value === null) {
    return "—";
  }
  return value.toLocaleString();
};

const formatPercentage = (value?: number | null) => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "—";
  }
  return `${value.toFixed(2)}%`;
};

export default function SessionReports() {
  const [reportPeriod, setReportPeriod] = useState<"daily" | "weekly" | "monthly" | "custom">("weekly");
  const [reportStartDate, setReportStartDate] = useState<string>("");
  const [reportEndDate, setReportEndDate] = useState<string>("");
  const [reportData, setReportData] = useState<SessionReportData | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const fetchSessionReport = async () => {
    if (reportPeriod === "custom" && (!reportStartDate || !reportEndDate)) {
      setReportData(null);
      setReportError("Select start and end dates to generate a custom report.");
      return;
    }

    try {
      setReportLoading(true);
      setReportError(null);

      const response = await dashboardAPI.getSessionReports({
        period: reportPeriod,
        startDate: reportStartDate || undefined,
        endDate: reportPeriod === "custom" ? reportEndDate || undefined : undefined,
      });

      if (response.success && response.data) {
        setReportData(response.data as SessionReportData);
      } else {
        throw new Error(response.message || "Failed to fetch session report");
      }
    } catch (err) {
      setReportData(null);
      setReportError(err instanceof Error ? err.message : "An error occurred while fetching the session report");
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportPeriod, reportStartDate, reportEndDate]);

  const trendChart = useMemo(() => {
    if (!reportData?.trend || reportData.trend.length === 0) {
      return null;
    }

    const categories = reportData.trend.map((item) =>
      new Date(item.date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    );

    const options: ApexOptions = {
      chart: {
        type: "area",
        height: 320,
        toolbar: { show: false },
        fontFamily: "Outfit, sans-serif",
      },
      colors: ["#2563eb", "#16a34a", "#dc2626", "#f59e0b"],
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 2 },
      fill: {
        type: "gradient",
        gradient: { opacityFrom: 0.55, opacityTo: 0, stops: [0, 95] },
      },
      xaxis: {
        categories,
        labels: { style: { colors: "#6b7280" } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: { style: { colors: "#6b7280" } },
      },
      legend: {
        position: "top",
        horizontalAlign: "left",
      },
      tooltip: {
        shared: true,
        intersect: false,
      },
    };

    const series = [
      {
        name: "Total",
        data: reportData.trend.map((item) => item.total),
      },
      {
        name: "Completed",
        data: reportData.trend.map((item) => item.completed),
      },
      {
        name: "Cancelled",
        data: reportData.trend.map((item) => item.cancelled),
      },
      {
        name: "Timed Out",
        data: reportData.trend.map((item) => item.timedOut),
      },
    ];

    return { options, series };
  }, [reportData?.trend]);

  const sessionTypeChart = useMemo(() => {
    const entries = reportData?.metrics?.sessionTypes
      ? Object.entries(reportData.metrics.sessionTypes)
      : [];

    if (entries.length === 0) {
      return null;
    }

    const categories = entries.map(([type]) =>
      type.charAt(0).toUpperCase() + type.slice(1)
    );
    const counts = entries.map(([, value]) => value);

    const options: ApexOptions = {
      chart: {
        type: "bar",
        height: 280,
        toolbar: { show: false },
        fontFamily: "Outfit, sans-serif",
      },
      colors: ["#9333ea"],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "45%",
          borderRadius: 6,
        },
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories,
        labels: { style: { colors: "#6b7280" } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: { style: { colors: "#6b7280" } },
      },
      tooltip: {
        y: {
          formatter: (value) => `${value} sessions`,
        },
      },
    };

    const series = [
      {
        name: "Sessions",
        data: counts,
      },
    ];

    return { options, series };
  }, [reportData?.metrics?.sessionTypes]);

  const timeOfDayChart = useMemo(() => {
    if (!reportData?.timeOfDay || reportData.timeOfDay.length === 0) {
      return null;
    }

    const categories = reportData.timeOfDay.map((bucket) => bucket.label);
    const counts = reportData.timeOfDay.map((bucket) => bucket.count);

    const options: ApexOptions = {
      chart: {
        type: "bar",
        height: 280,
        toolbar: { show: false },
        fontFamily: "Outfit, sans-serif",
      },
      colors: ["#0ea5e9"],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          borderRadius: 4,
        },
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories,
        labels: {
          rotate: -45,
          style: { colors: "#6b7280" },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: { style: { colors: "#6b7280" } },
      },
      tooltip: {
        y: {
          formatter: (value) => `${value} sessions`,
        },
      },
    };

    const series = [
      {
        name: "Sessions",
        data: counts,
      },
    ];

    return { options, series };
  }, [reportData?.timeOfDay]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Session Reports</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            High-level analytics across sessions for the selected timeframe.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchSessionReport}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className={`grid gap-4 ${reportPeriod === "custom" ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
        <div className="space-y-1">
          <label htmlFor="report-period" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Period
          </label>
          <select
            id="report-period"
            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
            value={reportPeriod}
            onChange={(e) => setReportPeriod(e.target.value as typeof reportPeriod)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom range</option>
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="report-start" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Start date {reportPeriod === "custom" ? <span className="text-red-500">*</span> : <span className="text-xs text-gray-400">(optional)</span>}
          </label>
          <input
            id="report-start"
            type="date"
            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
            value={reportStartDate}
            onChange={(e) => setReportStartDate(e.target.value)}
          />
        </div>

        {reportPeriod === "custom" && (
          <div className="space-y-1">
            <label htmlFor="report-end" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              End date <span className="text-red-500">*</span>
            </label>
            <input
              id="report-end"
              type="date"
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={reportEndDate}
              onChange={(e) => setReportEndDate(e.target.value)}
            />
          </div>
        )}
      </div>

      {reportPeriod === "custom" && (!reportStartDate || !reportEndDate) && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          Select both start and end dates to generate a custom report.
        </p>
      )}

      {reportError && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          {reportError}
        </div>
      )}

      {reportLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Generating report...</span>
        </div>
      ) : (
        reportData && (
          <div className="space-y-6">
            {reportData.period && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Report period: <span className="font-medium text-gray-900 dark:text-white">{reportData.period.type.toUpperCase()}</span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatLocalDate(reportData.period.start)} → {formatLocalDate(reportData.period.end)}
                </p>
              </div>
            )}

            {reportData.metrics && (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Sessions</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {formatNumber(reportData.metrics.totalSessions)}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Completed Sessions</p>
                  <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatNumber(reportData.metrics.completedSessions)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Completion rate: {formatPercentage(reportData.metrics.completionRate)}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Cancelled Sessions</p>
                  <p className="text-2xl font-semibold text-red-600 dark:text-red-400">
                    {formatNumber(reportData.metrics.cancelledSessions)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Cancellation rate: {formatPercentage(reportData.metrics.cancellationRate)}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Average Duration</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {formatNumber(reportData.metrics.averageDurationMinutes)} min
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Timeout rate: {formatPercentage(reportData.metrics.timeoutRate)}
                  </p>
                </div>
              </div>
            )}

            {sessionTypeChart && (
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Session types</h4>
                <Chart options={sessionTypeChart.options} series={sessionTypeChart.series} type="bar" height={280} />
              </div>
            )}

            {timeOfDayChart && (
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Peak hours (session start time)</h4>
                <Chart options={timeOfDayChart.options} series={timeOfDayChart.series} type="bar" height={280} />
              </div>
            )}

            {trendChart && (
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Daily trend</h4>
                <Chart options={trendChart.options} series={trendChart.series} type="area" height={320} />
              </div>
            )}

            {reportData.regions && (
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Initiating users by state</h4>
                  {(reportData.regions.initiatingUsers ?? []).length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No data available.</p>
                  ) : (
                    <div className="space-y-2">
                      {reportData.regions.initiatingUsers?.map((item) => (
                        <div
                          key={item.state}
                          className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm dark:bg-gray-900"
                        >
                          <span className="text-gray-700 dark:text-gray-200">{item.state}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{formatNumber(item.count)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Listeners by state</h4>
                  {(reportData.regions.listeners ?? []).length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No data available.</p>
                  ) : (
                    <div className="space-y-2">
                      {reportData.regions.listeners?.map((item) => (
                        <div
                          key={item.state}
                          className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm dark:bg-gray-900"
                        >
                          <span className="text-gray-700 dark:text-gray-200">{item.state}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{formatNumber(item.count)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {reportData.repeatSessions && reportData.repeatSessions.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Repeat user-listener pairs</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">User</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Listener</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Sessions</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">First session</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Last session</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {reportData.repeatSessions.map((item) => (
                        <tr key={`${item.userId}-${item.listenerId}`}>
                          <td className="px-3 py-2 text-gray-700 dark:text-gray-200">
                            <span className="block font-medium text-gray-900 dark:text-white">{item.userName}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">ID: {item.userId}</span>
                          </td>
                          <td className="px-3 py-2 text-gray-700 dark:text-gray-200">
                            <span className="block font-medium text-gray-900 dark:text-white">{item.listenerName}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">ID: {item.listenerId}</span>
                          </td>
                          <td className="px-3 py-2 text-blue-600 dark:text-blue-400">{formatNumber(item.sessionCount)}</td>
                          <td className="px-3 py-2 text-gray-700 dark:text-gray-200">{formatLocalDate(item.firstSession)}</td>
                          <td className="px-3 py-2 text-gray-700 dark:text-gray-200">{formatLocalDate(item.lastSession)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {reportData.insights && (
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Insights</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  {reportData.insights.periodSummary && <li>• {reportData.insights.periodSummary}</li>}
                  {reportData.insights.mostActivePeriod && (
                    <li>• Most active day: {formatLocalDate(reportData.insights.mostActivePeriod)}</li>
                  )}
                  {reportData.insights.peakHour && <li>• Peak hour: {reportData.insights.peakHour}</li>}
                  {reportData.insights.repeatPairs !== undefined && (
                    <li>• Repeat user-listener pairs: {formatNumber(reportData.insights.repeatPairs)}</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
