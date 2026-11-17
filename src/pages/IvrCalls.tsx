import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import Badge from '../components/ui/badge';
import { Modal } from '../components/ui/modal';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/api/base';
import {
  IvrCall,
  IvrCallType,
  IvrOutcome,
  IvrSource,
  IvrSourceFilter,
  IvrStats,
  TriggerIvrCallInput,
  formatIvrDuration,
  formatIvrPhone,
  ivrAPI,
  ivrOutcomeColor,
  ivrSourceLabel,
} from '../services/api/ivr';
import { User, userDataAPI } from '../services/api/userData';
import { formatLocalDate } from '../utils/dateUtils';

const PAGE_SIZE = 20;
const PENDING_POLL_MS = 30_000;
const PENDING_MAX_AGE_MS = 15 * 60 * 1000;

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white';

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: 'default' | 'success' | 'warning' | 'error';
}) {
  const colors = {
    default: 'text-gray-900 dark:text-white',
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    error: 'text-red-600 dark:text-red-400',
  };
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${colors[accent ?? 'default']}`}>
        {value.toLocaleString('en-IN')}
      </p>
    </div>
  );
}

function isRecentPending(call: IvrCall): boolean {
  if (call.outcome !== 'pending' || !call.cmiRequestId) return false;
  const age = Date.now() - new Date(call.createdAt).getTime();
  return age >= 0 && age <= PENDING_MAX_AGE_MS;
}

export default function IvrCalls() {
  const { can } = useAuth();
  const canWrite = can('ivr:write') || can('ivr.trigger:write');

  const [stats, setStats] = useState<IvrStats | null>(null);
  const [items, setItems] = useState<IvrCall[]>([]);
  const [pagination, setPagination] = useState<{ page: number; pages: number; total: number; hasNext: boolean; hasPrev: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [sourceFilter, setSourceFilter] = useState<IvrSourceFilter>('all');
  const [outcomeFilter, setOutcomeFilter] = useState<'' | IvrOutcome>('');
  const [callTypeFilter, setCallTypeFilter] = useState<'' | IvrCallType>('');
  const [phoneSearch, setPhoneSearch] = useState('');
  const [phoneQuery, setPhoneQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [detailCall, setDetailCall] = useState<IvrCall | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  const [triggerOpen, setTriggerOpen] = useState(false);
  const [triggerMode, setTriggerMode] = useState<'play' | 'bridge' | 'medibhai'>('play');
  const [triggerPhone, setTriggerPhone] = useState('');
  const [triggerRemark, setTriggerRemark] = useState('');
  const [triggerAudio, setTriggerAudio] = useState('');
  const [triggerListenerId, setTriggerListenerId] = useState('');
  const [triggerDuration, setTriggerDuration] = useState('10');
  const [triggerSubmitting, setTriggerSubmitting] = useState(false);
  const [listeners, setListeners] = useState<User[]>([]);
  const [listenersLoading, setListenersLoading] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setPhoneQuery(phoneSearch.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(t);
  }, [phoneSearch]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, listRes] = await Promise.all([
        ivrAPI.getStats({ source: sourceFilter }),
        ivrAPI.list({
          page,
          limit: PAGE_SIZE,
          source: sourceFilter,
          outcome: outcomeFilter || undefined,
          callType: callTypeFilter || undefined,
          phoneNumber: phoneQuery || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        }),
      ]);
      setStats(statsRes.data);
      setItems(listRes.data);
      setPagination(listRes.pagination);
      setDetailCall((current) => {
        if (!current) return current;
        return listRes.data.find((c) => c.source === current.source && c.id === current.id) ?? current;
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load IVR calls');
    } finally {
      setLoading(false);
    }
  }, [page, sourceFilter, outcomeFilter, callTypeFilter, phoneQuery, dateFrom, dateTo]);

  useEffect(() => {
    void load();
  }, [load]);

  const pendingOnPage = useMemo(() => items.filter(isRecentPending), [items]);

  useEffect(() => {
    if (pendingOnPage.length === 0) return;
    const interval = window.setInterval(() => {
      void load();
    }, PENDING_POLL_MS);
    return () => window.clearInterval(interval);
  }, [pendingOnPage.length, load]);

  const openDetail = async (call: IvrCall) => {
    setDetailCall(call);
    setDetailLoading(true);
    try {
      const res = await ivrAPI.get(call.source, call.id);
      setDetailCall(res.data);
    } catch {
      // keep list row data
    } finally {
      setDetailLoading(false);
    }
  };

  const refreshCall = async (call: IvrCall) => {
    const key = `${call.source}:${call.id}`;
    try {
      setRefreshingId(key);
      setError(null);
      const res = await ivrAPI.refresh(call.source, call.id);
      if (res.data) {
        setDetailCall((c) => (c?.id === call.id && c.source === call.source ? res.data! : c));
      }
      setSuccess('Call status refreshed');
      void load();
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setError('Call status not ready yet — try again in a minute.');
      } else {
        setError(e instanceof ApiError ? e.message : 'Refresh failed');
      }
    } finally {
      setRefreshingId(null);
    }
  };

  const loadListeners = async () => {
    if (listeners.length > 0) return;
    try {
      setListenersLoading(true);
      const res = await userDataAPI.getAllListeners({ page: 1, limit: 200, status: 1 });
      setListeners(res.data?.listeners ?? []);
    } catch {
      setListeners([]);
    } finally {
      setListenersLoading(false);
    }
  };

  const openTrigger = () => {
    setTriggerOpen(true);
    if (triggerMode !== 'play') void loadListeners();
  };

  const submitTrigger = async () => {
    const phone = triggerPhone.replace(/\D/g, '');
    if (phone.length < 10) {
      setError('Enter a valid phone number');
      return;
    }

    let body: TriggerIvrCallInput;
    if (triggerMode === 'play') {
      body = {
        phoneNumber: phone,
        callType: 'play',
        remark: triggerRemark || undefined,
        audioFileName: triggerAudio || undefined,
      };
    } else {
      const listenerId = Number(triggerListenerId);
      const durationMinutes = Number(triggerDuration);
      if (!listenerId) {
        setError('Select a listener');
        return;
      }
      if (!durationMinutes || durationMinutes < 1) {
        setError('Duration must be at least 1 minute');
        return;
      }
      body = {
        phoneNumber: phone,
        callType: 'bridge',
        listenerId,
        durationMinutes,
        remark: triggerRemark || undefined,
        ...(triggerMode === 'medibhai' ? { bridgeMode: 'medibhai' as const } : {}),
      };
    }

    try {
      setTriggerSubmitting(true);
      setError(null);
      await ivrAPI.trigger(body);
      setSuccess('Call triggered — new row will appear as pending');
      setTriggerOpen(false);
      setTriggerPhone('');
      setTriggerRemark('');
      setTriggerAudio('');
      setTriggerListenerId('');
      setPage(1);
      void load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to trigger call');
    } finally {
      setTriggerSubmitting(false);
    }
  };

  const displayDuration = (call: IvrCall) => {
    if (call.durationSeconds != null) return formatIvrDuration(call.durationSeconds);
    if (call.userDuration != null || call.listenerDuration != null) {
      const parts = [];
      if (call.userDuration != null) parts.push(`user ${formatIvrDuration(call.userDuration)}`);
      if (call.listenerDuration != null) parts.push(`listener ${formatIvrDuration(call.listenerDuration)}`);
      return parts.join(' · ');
    }
    return '—';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">IVR Calls</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            PSTN play alerts and listener bridge calls via TeleCMI
          </p>
        </div>
        {canWrite && (
          <button type="button" onClick={openTrigger} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
            Trigger call
          </button>
        )}
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total calls" value={stats.totalCalls} />
          <StatCard label="Success" value={stats.success} accent="success" />
          <StatCard label="Failed" value={stats.failed} accent="error" />
          <StatCard label="Pending" value={stats.pending} accent="warning" />
        </div>
      )}

      {error && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          <p>{error}</p>
          <button type="button" onClick={() => setError(null)} className="shrink-0 opacity-70 hover:opacity-100">×</button>
        </div>
      )}
      {success && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200">
          <p>{success}</p>
          <button type="button" onClick={() => setSuccess(null)} className="shrink-0 opacity-70 hover:opacity-100">×</button>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-6">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Source</label>
            <select
              value={sourceFilter}
              onChange={(e) => { setSourceFilter(e.target.value as IvrSourceFilter); setPage(1); }}
              className={inputClass}
            >
              <option value="all">All</option>
              <option value="ivr">IVR only</option>
              <option value="medibhai">Medibhai only</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Outcome</label>
            <select
              value={outcomeFilter}
              onChange={(e) => { setOutcomeFilter(e.target.value as '' | IvrOutcome); setPage(1); }}
              className={inputClass}
            >
              <option value="">All</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Type</label>
            <select
              value={callTypeFilter}
              onChange={(e) => { setCallTypeFilter(e.target.value as '' | IvrCallType); setPage(1); }}
              className={inputClass}
            >
              <option value="">All</option>
              <option value="play">Play alert</option>
              <option value="bridge">Bridge</option>
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className="mb-1 block text-xs font-medium text-gray-500">Phone</label>
            <input
              value={phoneSearch}
              onChange={(e) => setPhoneSearch(e.target.value)}
              placeholder="Search phone number…"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">From</label>
            <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">To</label>
            <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className={inputClass} />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/40">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Source</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Listener</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Outcome</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Request ID</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-500">
                        No IVR calls found
                      </td>
                    </tr>
                  ) : (
                    items.map((call) => {
                      const refreshKey = `${call.source}:${call.id}`;
                      const selected = detailCall?.id === call.id && detailCall.source === call.source;
                      return (
                        <tr
                          key={refreshKey}
                          onClick={() => void openDetail(call)}
                          className={`cursor-pointer transition hover:bg-gray-50 dark:hover:bg-gray-900/30 ${
                            selected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {formatLocalDate(call.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <Badge color={call.source === 'medibhai' ? 'info' : 'dark'} size="sm">
                              {ivrSourceLabel(call.source)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm capitalize">{call.callType}</td>
                          <td className="px-4 py-3 font-mono text-sm">{formatIvrPhone(call.toPhone)}</td>
                          <td className="px-4 py-3 text-sm">
                            {call.listenerName ?? (call.bridgePhone ? formatIvrPhone(call.bridgePhone) : '—')}
                          </td>
                          <td className="px-4 py-3">
                            <span title={call.rawStatus ?? undefined}>
                              <Badge color={ivrOutcomeColor(call.outcome)} size="sm">
                                {call.outcome}
                              </Badge>
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">{displayDuration(call)}</td>
                          <td className="max-w-[120px] truncate px-4 py-3 font-mono text-xs text-gray-500">
                            {call.cmiRequestId ?? '—'}
                          </td>
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            {call.outcome === 'pending' && call.cmiRequestId && canWrite && (
                              <button
                                type="button"
                                disabled={refreshingId === refreshKey}
                                onClick={() => void refreshCall(call)}
                                className="text-sm font-medium text-blue-600 hover:underline disabled:opacity-50 dark:text-blue-400"
                              >
                                {refreshingId === refreshKey ? '…' : 'Refresh'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700">
                <p className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={!pagination.hasPrev}
                    onClick={() => setPage((p) => p - 1)}
                    className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={!pagination.hasNext}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {detailCall && (
        <div className="fixed inset-0 z-[99990] flex justify-end">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setDetailCall(null)} />
          <aside className="relative flex h-full w-full max-w-md flex-col border-l border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">Call details</p>
                <p className="font-mono text-xs text-gray-500">#{detailCall.id}</p>
              </div>
              <button type="button" onClick={() => setDetailCall(null)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {detailLoading ? (
                <div className="flex justify-center py-12">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                </div>
              ) : (
                <dl className="space-y-4 text-sm">
                  <DetailRow label="Source" value={<Badge color={detailCall.source === 'medibhai' ? 'info' : 'dark'} size="sm">{ivrSourceLabel(detailCall.source)}</Badge>} />
                  <DetailRow label="Type" value={<span className="capitalize">{detailCall.callType}</span>} />
                  <DetailRow label="Outcome" value={<Badge color={ivrOutcomeColor(detailCall.outcome)} size="sm">{detailCall.outcome}</Badge>} />
                  <DetailRow label="To phone" value={formatIvrPhone(detailCall.toPhone)} mono />
                  <DetailRow label="Bridge phone" value={formatIvrPhone(detailCall.bridgePhone)} mono />
                  <DetailRow label="Listener" value={detailCall.listenerName ?? '—'} />
                  <DetailRow label="Request ID" value={detailCall.cmiRequestId ?? '—'} mono />
                  <DetailRow label="Session ID" value={detailCall.sessionId ?? '—'} mono />
                  {detailCall.audioFileName && <DetailRow label="Audio file" value={detailCall.audioFileName} mono />}
                  <DetailRow label="Duration" value={displayDuration(detailCall)} />
                  <DetailRow label="Remark" value={detailCall.remark ?? '—'} />
                  <DetailRow label="Triggered by admin" value={detailCall.triggeredByAdminId != null ? `#${detailCall.triggeredByAdminId}` : '—'} />
                  <DetailRow label="Created" value={formatLocalDate(detailCall.createdAt)} />
                  <DetailRow label="Completed" value={detailCall.completedAt ? formatLocalDate(detailCall.completedAt) : '—'} />
                  {detailCall.rawStatus && (
                    <DetailRow label="Raw status" value={detailCall.rawStatus} mono />
                  )}
                </dl>
              )}
            </div>
            {detailCall.outcome === 'pending' && detailCall.cmiRequestId && canWrite && (
              <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                <button
                  type="button"
                  disabled={refreshingId === `${detailCall.source}:${detailCall.id}`}
                  onClick={() => void refreshCall(detailCall)}
                  className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Refresh status
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      <Modal isOpen={triggerOpen} onClose={() => setTriggerOpen(false)} className="max-w-lg p-0">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Trigger IVR call</h2>
          <p className="mt-1 text-sm text-gray-500">Initiate a play alert or listener bridge call.</p>

          <div className="mt-4 flex rounded-lg border border-gray-200 p-1 dark:border-gray-700">
            {(
              [
                { id: 'play' as const, label: 'Play alert' },
                { id: 'bridge' as const, label: 'Bridge' },
                { id: 'medibhai' as const, label: 'Medibhai' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setTriggerMode(tab.id);
                  if (tab.id !== 'play') void loadListeners();
                }}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${
                  triggerMode === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Phone number</label>
              <input
                value={triggerPhone}
                onChange={(e) => setTriggerPhone(e.target.value)}
                placeholder="9876543210"
                className={inputClass}
              />
            </div>

            {triggerMode === 'play' ? (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Audio file (optional)</label>
                <input
                  value={triggerAudio}
                  onChange={(e) => setTriggerAudio(e.target.value)}
                  placeholder="Server default if empty"
                  className={inputClass}
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Listener</label>
                  <select
                    value={triggerListenerId}
                    onChange={(e) => setTriggerListenerId(e.target.value)}
                    className={inputClass}
                    disabled={listenersLoading}
                  >
                    <option value="">{listenersLoading ? 'Loading…' : 'Select listener'}</option>
                    {listeners.map((l) => (
                      <option key={l.user_id_pk} value={l.user_id_pk}>
                        {l.full_name ?? 'Unnamed'} · {formatIvrPhone(l.mobile_no)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Duration (minutes)</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={triggerDuration}
                    onChange={(e) => setTriggerDuration(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Remark (optional)</label>
              <input
                value={triggerRemark}
                onChange={(e) => setTriggerRemark(e.target.value)}
                placeholder="Admin note"
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setTriggerOpen(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={triggerSubmitting}
              onClick={() => void submitTrigger()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {triggerSubmitting ? 'Triggering…' : 'Trigger call'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3 last:border-0 dark:border-gray-800">
      <dt className="shrink-0 text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className={`text-right font-medium text-gray-900 dark:text-white ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </dd>
    </div>
  );
}
