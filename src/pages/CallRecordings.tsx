import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import Badge from '../components/ui/badge';
import { ApiError } from '../services/api/base';
import {
  CallRecording,
  CallRecordingPagination,
  CallRecordingStatus,
  RECORDING_STATUSES,
  RECORDING_STATUS_LABELS,
  callRecordingsAPI,
  formatRecordingDuration,
  recordingStatusColor,
} from '../services/api/callRecordings';
import { AstroPaginationBar } from './astro/components/astroUi';
import { normalizeAstroPagination } from '../services/api/astro';

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Created' },
  { value: 'started_at', label: 'Started' },
  { value: 'stopped_at', label: 'Stopped' },
  { value: 'status', label: 'Status' },
  { value: 'user_name', label: 'Caller name' },
  { value: 'listener_name', label: 'Listener name' },
];

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white';

export default function CallRecordings() {
  const [items, setItems] = useState<CallRecording[]>([]);
  const [pagination, setPagination] = useState<CallRecordingPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [userId, setUserId] = useState('');
  const [listenerId, setListenerId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const t = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await callRecordingsAPI.list({
        page,
        limit: PAGE_SIZE,
        sortBy,
        sortOrder,
        search: search || undefined,
        status: (status || undefined) as CallRecordingStatus,
        userId: userId ? Number(userId) : undefined,
        listenerId: listenerId ? Number(listenerId) : undefined,
        phoneNumber: phoneNumber || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setItems(res.data);
      setPagination(
        normalizeAstroPagination(res.pagination, {
          page,
          limit: PAGE_SIZE,
          itemCount: res.data.length,
        })
      );
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load call recordings');
    } finally {
      setLoading(false);
    }
  }, [endDate, listenerId, page, phoneNumber, search, sortBy, sortOrder, startDate, status, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setStatus('');
    setUserId('');
    setListenerId('');
    setPhoneNumber('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const hasFilters = Boolean(search || status || userId || listenerId || phoneNumber || startDate || endDate);
  const playableCount = items.filter((r) => r.status === 'completed' && r.recordingUrl).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Call Recordings</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Agora cloud recordings for user ↔ listener voice calls
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      )}

      {pagination && !loading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total recordings" value={pagination.total} />
          <StatCard label="This page" value={items.length} />
          <StatCard label="Playable" value={playableCount} hint="Completed with URL" />
          <StatCard
            label="In progress"
            value={items.filter((r) => r.status === 'recording').length}
            hint="On current page"
          />
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative lg:col-span-2">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="Search name, phone, session ID, channel…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={inputClass}>
            <option value="">All statuses</option>
            {RECORDING_STATUSES.map((s) => (
              <option key={s} value={s}>{RECORDING_STATUS_LABELS[s]}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Phone (caller or listener)"
            value={phoneNumber}
            onChange={(e) => { setPhoneNumber(e.target.value); setPage(1); }}
            className={inputClass}
          />
          <input
            type="number"
            placeholder="Caller user ID"
            value={userId}
            onChange={(e) => { setUserId(e.target.value); setPage(1); }}
            className={inputClass}
          />
          <input
            type="number"
            placeholder="Listener user ID"
            value={listenerId}
            onChange={(e) => { setListenerId(e.target.value); setPage(1); }}
            className={inputClass}
          />
          <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} className={inputClass} />
          <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} className={inputClass} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={`${inputClass} w-auto`}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>Sort: {o.label}</option>
            ))}
          </select>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')} className={`${inputClass} w-auto`}>
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
          {hasFilters && (
            <button type="button" onClick={clearFilters} className="text-sm text-gray-500 underline-offset-2 hover:underline">
              Clear filters
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {RECORDING_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setStatus(status === s ? '' : s); setPage(1); }}
              className={`rounded-full px-3 py-1 text-xs font-medium ring-1 transition-colors ${
                status === s
                  ? 'bg-blue-600 text-white ring-blue-600'
                  : 'bg-white text-gray-700 ring-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-700'
              }`}
            >
              {RECORDING_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="mt-3 h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-16 text-center dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950/40">
            <svg className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {hasFilters ? 'No recordings match your filters' : 'No call recordings yet'}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            Recordings appear when callsession captures Agora cloud recordings for voice calls.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((rec) => (
            <RecordingRow key={rec.recordingId} recording={rec} />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <AstroPaginationBar pagination={pagination} onPage={setPage} />
      )}
    </div>
  );
}

function RecordingRow({ recording }: { recording: CallRecording }) {
  const duration = formatRecordingDuration(recording.startedAt, recording.stoppedAt);
  const hasPlayback = recording.status === 'completed' && Boolean(recording.recordingUrl);

  return (
    <Link
      to={`/call-recordings/${recording.recordingId}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-blue-200 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-800"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
              #{recording.recordingId}
            </span>
            <Badge size="sm" color={recordingStatusColor(recording.status)}>
              {RECORDING_STATUS_LABELS[recording.status]}
            </Badge>
            {hasPlayback && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase text-green-700 dark:bg-green-950/50 dark:text-green-300">
                Playable
              </span>
            )}
            {recording.status === 'stopped' && (
              <span className="text-xs text-gray-400">No audio file</span>
            )}
          </div>

          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            <p className="text-sm text-gray-900 dark:text-white">
              <span className="text-gray-500">Caller:</span>{' '}
              {recording.user?.fullName ?? '—'}
              {recording.user?.phone && (
                <span className="ml-1 font-mono text-xs text-gray-400">{recording.user.phone}</span>
              )}
            </p>
            <p className="text-sm text-gray-900 dark:text-white">
              <span className="text-gray-500">Listener:</span>{' '}
              {recording.listener?.fullName ?? '—'}
              {recording.listener?.phone && (
                <span className="ml-1 font-mono text-xs text-gray-400">{recording.listener.phone}</span>
              )}
            </p>
          </div>

          <p className="mt-1 truncate font-mono text-xs text-gray-400" title={recording.channelName}>
            {recording.channelName}
          </p>
        </div>

        <div className="shrink-0 text-right text-sm">
          <p className="font-medium text-gray-900 dark:text-white">{duration}</p>
          <p className="text-xs text-gray-500">
            {recording.startedAt
              ? new Date(recording.startedAt).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '—'}
          </p>
          <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">View details →</p>
        </div>
      </div>
    </Link>
  );
}

function StatCard({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {hint && <p className="mt-0.5 text-[10px] text-gray-400">{hint}</p>}
    </div>
  );
}
