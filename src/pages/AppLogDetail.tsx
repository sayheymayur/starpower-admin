import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import Badge from '../components/ui/badge';
import { ApiError } from '../services/api/base';
import {
  AppLogEntry,
  appLogLevelColor,
  appLogsAPI,
  formatMetadata,
} from '../services/api/appLogs';
import { formatLocalDate } from '../utils/dateUtils';
import useGoBack from '../hooks/useGoBack';

export default function AppLogDetail() {
  const { id } = useParams<{ id: string }>();
  const goBack = useGoBack();
  const [log, setLog] = useState<AppLogEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await appLogsAPI.getById(Number(id));
        setLog(data);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'Failed to load log');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return <div className="py-16 text-center text-sm text-gray-500">Loading log…</div>;
  }

  if (error || !log) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={goBack} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
          ← Back
        </button>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
          {error ?? 'Log not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button type="button" onClick={goBack} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
          ← Back to logs
        </button>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Log #{log.app_log_id_pk}</h1>
          <Badge color={appLogLevelColor(log.level)} size="sm">{log.level}</Badge>
          <span className="text-sm text-gray-500">{log.source}</span>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <dl className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
          <Field label="Server time" value={formatLocalDate(log.created_date_time)} />
          <Field label="Device time" value={log.device_time_raw ?? log.device_time} />
          <Field label="Event" value={log.event} mono />
          <Field label="Screen" value={log.screen} />
          <Field label="Action" value={log.action} />
          <Field label="User">
            {log.user_id_fk ? (
              <Link to={`/enhanced-user-details?userId=${log.user_id_fk}`} className="text-blue-600 hover:underline dark:text-blue-400">
                {log.user_id_fk}
              </Link>
            ) : (
              '—'
            )}
          </Field>
          <Field label="Session" value={log.session_id} mono />
          <Field label="Request ID" value={log.request_id} mono />
          <Field label="Platform" value={log.platform} />
          <Field label="Environment" value={log.environment} />
          <Field label="App version" value={log.app_version ? `${log.app_version} (${log.build_number ?? '—'})` : null} />
          <Field label="Device" value={[log.device_brand, log.device_model].filter(Boolean).join(' ')} />
          <Field label="OS" value={log.os_version} />
          <Field label="Network" value={log.network_type} />
          <Field label="IP" value={log.ip_address} mono />
          <Field label="User agent" value={log.user_agent} className="col-span-2 md:col-span-3" />
        </dl>
      </div>

      {log.message && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-2 font-semibold text-gray-900 dark:text-white">Message</h2>
          <p className="text-sm text-gray-800 dark:text-gray-200">{log.message}</p>
        </div>
      )}

      {log.stack_trace && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-2 font-semibold text-gray-900 dark:text-white">Stack trace</h2>
          <pre className="overflow-auto rounded-lg bg-gray-50 p-4 text-xs text-red-800 dark:bg-gray-900 dark:text-red-300">
            {log.stack_trace}
          </pre>
        </div>
      )}

      {log.metadata != null && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-2 font-semibold text-gray-900 dark:text-white">Metadata</h2>
          <pre className="overflow-auto rounded-lg bg-gray-50 p-4 text-xs text-gray-800 dark:bg-gray-900 dark:text-gray-200">
            {formatMetadata(log.metadata)}
          </pre>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  mono,
  className = '',
  children,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={className}>
      <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className={`mt-0.5 text-sm text-gray-900 dark:text-gray-100 ${mono ? 'font-mono text-xs break-all' : ''}`}>
        {children ?? (value?.trim() ? value : '—')}
      </dd>
    </div>
  );
}
