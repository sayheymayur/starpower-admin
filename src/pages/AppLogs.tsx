import { Fragment, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import Badge from '../components/ui/badge';
import { ApiError } from '../services/api/base';
import {
  AppLogEntry,
  AppLogLevel,
  AppLogStats,
  APP_LOG_LEVELS,
  APP_LOG_LEVEL_LABELS,
  appLogLevelColor,
  appLogsAPI,
  formatMetadata,
} from '../services/api/appLogs';
import { formatLocalDate } from '../utils/dateUtils';

const PAGE_SIZE = 50;

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white';

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
    </div>
  );
}

function LogDetailPanel({ log }: { log: AppLogEntry }) {
  return (
    <div className="space-y-4 border-t border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-700 dark:bg-gray-900/40">
      <dl className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3 lg:grid-cols-4">
        <DetailField label="Event" value={log.event} />
        <DetailField label="Screen" value={log.screen} />
        <DetailField label="Action" value={log.action} />
        <DetailField label="Session" value={log.session_id} mono />
        <DetailField label="Request ID" value={log.request_id} mono />
        <DetailField label="Platform" value={log.platform} />
        <DetailField label="Environment" value={log.environment} />
        <DetailField label="App version" value={log.app_version ? `${log.app_version} (${log.build_number ?? '—'})` : null} />
        <DetailField label="Device" value={[log.device_brand, log.device_model].filter(Boolean).join(' ') || null} />
        <DetailField label="OS" value={log.os_version} />
        <DetailField label="Network" value={log.network_type} />
        <DetailField label="Locale" value={log.locale} />
        <DetailField label="Timezone" value={log.timezone} />
        <DetailField label="Device time" value={log.device_time_raw ?? log.device_time} />
        <DetailField label="Server time" value={formatLocalDate(log.created_date_time)} />
        <DetailField label="IP" value={log.ip_address} mono />
        <DetailField label="User agent" value={log.user_agent} className="col-span-2 lg:col-span-4" />
      </dl>

      {log.message && (
        <div>
          <p className="mb-1 text-xs font-medium uppercase text-gray-500">Message</p>
          <p className="rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
            {log.message}
          </p>
        </div>
      )}

      {log.stack_trace && (
        <div>
          <p className="mb-1 text-xs font-medium uppercase text-gray-500">Stack trace</p>
          <pre className="max-h-48 overflow-auto rounded-lg border border-gray-200 bg-white p-3 text-xs text-red-800 dark:border-gray-700 dark:bg-gray-800 dark:text-red-300">
            {log.stack_trace}
          </pre>
        </div>
      )}

      {log.metadata != null && (
        <div>
          <p className="mb-1 text-xs font-medium uppercase text-gray-500">Metadata</p>
          <pre className="max-h-48 overflow-auto rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
            {formatMetadata(log.metadata)}
          </pre>
        </div>
      )}

      <div className="flex gap-3">
        <Link
          to={`/app-logs/${log.app_log_id_pk}`}
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          Open full detail
        </Link>
        {log.user_id_fk && (
          <Link
            to={`/enhanced-user-details?userId=${log.user_id_fk}`}
            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            User {log.user_id_fk}
          </Link>
        )}
      </div>
    </div>
  );
}

function DetailField({
  label,
  value,
  mono,
  className = '',
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className={`mt-0.5 text-sm text-gray-900 dark:text-gray-100 ${mono ? 'font-mono text-xs break-all' : ''}`}>
        {value?.trim() ? value : '—'}
      </dd>
    </div>
  );
}

export default function AppLogs() {
  const [items, setItems] = useState<AppLogEntry[]>([]);
  const [stats, setStats] = useState<AppLogStats | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [q, setQ] = useState('');
  const [level, setLevel] = useState('');
  const [source, setSource] = useState('');
  const [platform, setPlatform] = useState('');
  const [environment, setEnvironment] = useState('');
  const [userId, setUserId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    const t = window.setTimeout(() => {
      setQ(searchInput.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const dateParams = { from: from || undefined, to: to || undefined };

  const loadStats = useCallback(async () => {
    try {
      const data = await appLogsAPI.stats(dateParams);
      setStats(data);
    } catch {
      // supplementary
    }
  }, [from, to]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await appLogsAPI.list({
        page,
        limit: PAGE_SIZE,
        q: q || undefined,
        level: (level || undefined) as AppLogLevel | undefined,
        source: source || undefined,
        platform: platform || undefined,
        environment: environment || undefined,
        userId: userId ? Number(userId) : undefined,
        from: from || undefined,
        to: to || undefined,
      });
      setItems(res.items);
      setPagination({
        page: res.page,
        limit: res.limit,
        total: res.total,
        totalPages: res.totalPages,
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load app logs');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [environment, from, level, page, platform, q, source, to, userId]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  useEffect(() => {
    void load();
  }, [load]);

  const clearFilters = () => {
    setSearchInput('');
    setQ('');
    setLevel('');
    setSource('');
    setPlatform('');
    setEnvironment('');
    setUserId('');
    setFrom('');
    setTo('');
    setPage(1);
  };

  const hasFilters = Boolean(q || level || source || platform || environment || userId || from || to);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">App logs</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Client app logs — device, screen, action, errors, and metadata
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      )}

      {stats && (
        <div className="space-y-3">
          <StatCard label="Total logs" value={stats.total} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {APP_LOG_LEVELS.map((lvl) => (
              <StatCard
                key={lvl}
                label={APP_LOG_LEVEL_LABELS[lvl]}
                value={stats.byLevel[lvl] ?? 0}
              />
            ))}
          </div>
          {Object.keys(stats.bySource).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.bySource).map(([src, count]) => (
                <span
                  key={src}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  {src}: <span className="font-semibold">{count.toLocaleString()}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <input
              type="search"
              placeholder="Search message, event, screen, metadata…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={inputClass}
            />
          </div>
          <select value={level} onChange={(e) => { setLevel(e.target.value); setPage(1); }} className={inputClass}>
            <option value="">All levels</option>
            {APP_LOG_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>{APP_LOG_LEVEL_LABELS[lvl]}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Source (e.g. user-app)"
            value={source}
            onChange={(e) => { setSource(e.target.value); setPage(1); }}
            className={inputClass}
          />
          <select value={platform} onChange={(e) => { setPlatform(e.target.value); setPage(1); }} className={inputClass}>
            <option value="">All platforms</option>
            <option value="android">Android</option>
            <option value="ios">iOS</option>
            <option value="web">Web</option>
          </select>
          <input
            type="text"
            placeholder="Environment"
            value={environment}
            onChange={(e) => { setEnvironment(e.target.value); setPage(1); }}
            className={inputClass}
          />
          <input
            type="number"
            placeholder="User ID"
            value={userId}
            onChange={(e) => { setUserId(e.target.value); setPage(1); }}
            className={inputClass}
          />
          <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className={inputClass} />
          <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className={inputClass} />
        </div>
        {hasFilters && (
          <button type="button" onClick={clearFilters} className="mt-3 text-sm text-blue-600 hover:underline dark:text-blue-400">
            Clear filters
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/40">
              <tr>
                <th className="w-8 px-2 py-3" />
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Server time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Level</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Source</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Event / screen</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">Loading…</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">No logs found</td>
                </tr>
              ) : (
                items.map((log) => {
                  const expanded = expandedId === log.app_log_id_pk;
                  return (
                    <Fragment key={log.app_log_id_pk}>
                      <tr
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        onClick={() => setExpandedId(expanded ? null : log.app_log_id_pk)}
                      >
                        <td className="px-2 py-3 text-center text-gray-400">
                          {expanded ? '▼' : '▶'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                          <div>{formatLocalDate(log.created_date_time)}</div>
                          {log.device_time_raw && (
                            <div className="text-gray-400" title="Device time">
                              dev: {log.device_time_raw}
                            </div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <Badge color={appLogLevelColor(log.level)} size="sm">
                            {log.level}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {log.source}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          <div className="font-mono text-xs">{log.event ?? '—'}</div>
                          {log.screen && <div className="text-xs text-gray-500">{log.screen}</div>}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm">
                          {log.user_id_fk ? (
                            <Link
                              to={`/enhanced-user-details?userId=${log.user_id_fk}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-600 hover:underline dark:text-blue-400"
                            >
                              {log.user_id_fk}
                            </Link>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="max-w-xs truncate px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {log.message ?? '—'}
                        </td>
                      </tr>
                      {expanded && (
                        <tr>
                          <td colSpan={7} className="p-0">
                            <LogDetailPanel log={log} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700">
            <p className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages} · {pagination.total.toLocaleString()} total
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-gray-600"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-gray-600"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
