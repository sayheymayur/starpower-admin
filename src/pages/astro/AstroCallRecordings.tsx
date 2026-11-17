import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import Badge from '../../components/ui/badge';
import { ApiError } from '../../services/api/base';
import {
  CallRecording,
  CallRecordingStatus,
  RECORDING_STATUSES,
  RECORDING_STATUS_LABELS,
  callRecordingsAPI,
  formatRecordingDuration,
  recordingStatusColor,
} from '../../services/api/callRecordings';
import {
  AstroAlert,
  AstroPageHeader,
  AstroPaginationBar,
  AstroStatCard,
  astroCard,
} from './components/astroUi';
import { normalizeAstroPagination, type AstroPagination } from '../../services/api/astro';

const PAGE_SIZE = 20;

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white';

export default function AstroCallRecordings() {
  const [items, setItems] = useState<CallRecording[]>([]);
  const [pagination, setPagination] = useState<AstroPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [userId, setUserId] = useState('');
  const [astrologerId, setAstrologerId] = useState('');
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
        listenerId: astrologerId ? Number(astrologerId) : undefined,
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
  }, [astrologerId, endDate, page, phoneNumber, search, sortBy, sortOrder, startDate, status, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setStatus('');
    setUserId('');
    setAstrologerId('');
    setPhoneNumber('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const hasFilters = Boolean(search || status || userId || astrologerId || phoneNumber || startDate || endDate);
  const playableCount = items.filter((r) => r.status === 'completed' && r.recordingUrl).length;

  return (
    <div className="space-y-6">
      <AstroPageHeader
        title="Call recordings"
        description="Agora cloud recordings for StarPower user ↔ astrologer booking calls."
      />

      {error && <AstroAlert type="error" message={error} onDismiss={() => setError(null)} />}

      {pagination && !loading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <AstroStatCard label="Total recordings" value={pagination.total} />
          <AstroStatCard label="This page" value={items.length} />
          <AstroStatCard label="Playable" value={playableCount} sub="Completed with URL" accent="sky" />
          <AstroStatCard
            label="In progress"
            value={items.filter((r) => r.status === 'recording').length}
            sub="On current page"
            accent="amber"
          />
        </div>
      )}

      <div className={`${astroCard} p-4`}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative lg:col-span-2">
            <input
              type="search"
              placeholder="Search name, phone, session, booking…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={inputClass}
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
            placeholder="Phone (user or astrologer)"
            value={phoneNumber}
            onChange={(e) => { setPhoneNumber(e.target.value); setPage(1); }}
            className={inputClass}
          />
          <input
            type="number"
            placeholder="User ID"
            value={userId}
            onChange={(e) => { setUserId(e.target.value); setPage(1); }}
            className={inputClass}
          />
          <input
            type="number"
            placeholder="Astrologer ID"
            value={astrologerId}
            onChange={(e) => { setAstrologerId(e.target.value); setPage(1); }}
            className={inputClass}
          />
          <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} className={inputClass} />
          <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} className={inputClass} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={`${inputClass} w-auto`}>
            <option value="created_at">Sort: Created</option>
            <option value="started_at">Sort: Started</option>
            <option value="stopped_at">Sort: Stopped</option>
            <option value="status">Sort: Status</option>
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
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <div className={`${astroCard} px-6 py-16 text-center`}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {hasFilters ? 'No recordings match your filters' : 'No booking call recordings yet'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Recordings appear when booking voice calls capture Agora cloud audio.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((rec) => (
            <RecordingRow key={rec.recordingId} recording={rec} />
          ))}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <AstroPaginationBar pagination={pagination} onPage={setPage} />
      )}
    </div>
  );
}

function RecordingRow({ recording }: { recording: CallRecording }) {
  const duration = formatRecordingDuration(recording.startedAt, recording.stoppedAt);
  const hasPlayback = recording.status === 'completed' && Boolean(recording.recordingUrl);
  const partner = recording.astrologer ?? recording.listener;

  return (
    <Link
      to={`/astro/call-recordings/${recording.recordingId}`}
      className={`${astroCard} block p-4 transition-all hover:border-brand-300 hover:shadow-sm dark:hover:border-brand-700`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold text-brand-600 dark:text-brand-400">
              #{recording.recordingId}
            </span>
            <Badge size="sm" color={recordingStatusColor(recording.status)}>
              {RECORDING_STATUS_LABELS[recording.status]}
            </Badge>
            {recording.bookingId != null && (
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                Booking #{recording.bookingId}
              </span>
            )}
            {hasPlayback && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase text-green-700 dark:bg-green-950/50 dark:text-green-300">
                Playable
              </span>
            )}
          </div>

          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            <p className="text-sm text-gray-900 dark:text-white">
              <span className="text-gray-500">User:</span>{' '}
              {recording.user?.fullName ?? '—'}
              {recording.user?.phone && (
                <span className="ml-1 font-mono text-xs text-gray-400">{recording.user.phone}</span>
              )}
            </p>
            <p className="text-sm text-gray-900 dark:text-white">
              <span className="text-gray-500">Astrologer:</span>{' '}
              {partner?.fullName ?? '—'}
              {partner?.phone && (
                <span className="ml-1 font-mono text-xs text-gray-400">{partner.phone}</span>
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
          <p className="mt-1 text-xs text-brand-600 dark:text-brand-400">View details →</p>
        </div>
      </div>
    </Link>
  );
}
