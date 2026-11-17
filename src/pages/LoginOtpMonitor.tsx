import { useMemo, useState } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth';
import { useAdminOtpFeed } from '../hooks/useAdminOtpFeed';
import type { AdminOtpLog, OtpLogStatus } from '../services/websocket/adminOtp';
import Badge from '../components/ui/badge';
import { OTP_LIVE_SCOPES, OTP_PAGE_READ_SCOPES } from '../config/otpScopes';
import { canAny } from '../utils/scopes';
import { formatLocalDate } from '../utils/dateUtils';

function statusBadgeColor(
  status: OtpLogStatus
): 'success' | 'warning' | 'error' | 'info' | 'dark' {
  switch (status) {
    case 'verified':
      return 'success';
    case 'sent':
      return 'info';
    case 'failed':
      return 'error';
    case 'expired':
      return 'dark';
    default:
      return 'dark';
  }
}

function appLabel(row: AdminOtpLog): string {
  if (row.isListener === true) return 'Partner';
  if (row.isListener === false) return 'User';
  return '—';
}

function flowLabel(row: AdminOtpLog): string {
  if (row.newUser === true) return 'Registration';
  if (row.newUser === false) return 'Login';
  return '—';
}

function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < Date.now();
}

export default function LoginOtpMonitor() {
  const { scopes } = useAuth();
  const token = authService.getToken();
  const canReceiveLive = canAny([...OTP_LIVE_SCOPES], scopes);
  const {
    otps,
    pagination,
    connected,
    connecting,
    error,
    liveCount,
    fetchPage,
    reconnect,
    pageSize,
  } = useAdminOtpFeed(token, { liveUpdates: canReceiveLive });

  const [page, setPage] = useState(0);

  const pageInfo = useMemo(() => {
    if (!pagination) return null;
    const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
    return { currentPage, ...pagination };
  }, [pagination]);

  const goToPage = (nextPage: number) => {
    const offset = nextPage * pageSize;
    if (pagination && offset >= pagination.total) return;
    setPage(nextPage);
    fetchPage(pageSize, offset);
  };

  if (!canAny([...OTP_PAGE_READ_SCOPES], scopes)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Login OTP monitor</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Live OTPs from mobile login flows.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
              connected
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                : connecting
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                connected ? 'bg-emerald-500' : connecting ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
              }`}
            />
            {connected ? 'Connected' : connecting ? 'Connecting…' : 'Disconnected'}
          </span>
          {!connected && (
            <button
              type="button"
              onClick={reconnect}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Reconnect
            </button>
          )}
          {liveCount > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              +{liveCount} live since connect
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/60">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  OTP
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  App
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Flow
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Purpose
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Expires
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  IP
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {otps.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center text-sm text-gray-500">
                    {connected
                      ? 'No OTP records yet — waiting for send-otp events…'
                      : 'Connect to load OTP history'}
                  </td>
                </tr>
              ) : (
                otps.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {formatLocalDate(row.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-sm text-gray-900 dark:text-white">
                      {row.phone}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-lg font-bold tracking-widest text-gray-900 dark:text-white">
                      {row.otp}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {appLabel(row)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {flowLabel(row)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm capitalize text-gray-700 dark:text-gray-300">
                      {row.purpose}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge color={statusBadgeColor(row.status)} size="sm">
                        {row.status}
                      </Badge>
                    </td>
                    <td
                      className={`whitespace-nowrap px-4 py-3 text-sm ${
                        isExpired(row.expiresAt)
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {formatLocalDate(row.expiresAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-500">
                      {row.ipAddress ?? '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pageInfo && pageInfo.total > pageSize && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Page {pageInfo.currentPage} of {pageInfo.totalPages} · {pageInfo.total} total
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 0}
                onClick={() => goToPage(page - 1)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-gray-600"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page + 1 >= pageInfo.totalPages}
                onClick={() => goToPage(page + 1)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-gray-600"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500">
        New OTPs appear instantly via WebSocket push; use pagination to browse older rows.
      </p>
    </div>
  );
}
