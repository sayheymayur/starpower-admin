import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { FreeFeeBadge } from './components/AstrologerFeeCard';
import { ApiError } from '../../services/api/base';
import {
  astroAPI,
  AstroPagination,
  type AstroInstantSession,
  type AstroInstantSessionStats,
} from '../../services/api/astro';
import {
  AstroAlert,
  AstroPageHeader,
  AstroPaginationBar,
  AstroStatCard,
  InstantSessionStatusBadge,
  astroBtnOutline,
  formatAstroDate,
  formatCallDuration,
  formatINR,
  thClass,
  tdClass,
  astroCard,
} from './components/astroUi';

export default function InstantSessions() {
  const [rows, setRows] = useState<AstroInstantSession[]>([]);
  const [pagination, setPagination] = useState<AstroPagination | null>(null);
  const [stats, setStats] = useState<AstroInstantSessionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [userId, setUserId] = useState('');
  const [astrologerId, setAstrologerId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sessionType, setSessionType] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: 20,
        userId: userId ? Number(userId) : undefined,
        astrologerId: astrologerId ? Number(astrologerId) : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sessionType: sessionType ? Number(sessionType) : undefined,
      };
      const [listRes, statsRes] = await Promise.all([
        astroAPI.listInstantSessions(params),
        astroAPI.getInstantSessionStats({
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
      ]);
      setRows(listRes.data);
      setPagination(listRes.pagination);
      setStats(statsRes.data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load instant sessions');
    } finally {
      setLoading(false);
    }
  }, [page, userId, astrologerId, startDate, endDate, sessionType]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <AstroPageHeader
        title="Instant sessions"
        description="Instant call and chat history across StarPower, including free first sessions."
      />

      {error && <AstroAlert type="error" message={error} onDismiss={() => setError(null)} />}

      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AstroStatCard label="Sessions" value={stats.totalSessions ?? 0} />
          <AstroStatCard label="Billed amount" value={formatINR(stats.totalAmount ?? 0)} accent="sky" />
          <AstroStatCard
            label="Astrologer earnings"
            value={formatINR(stats.totalEarning ?? 0)}
            accent="amber"
            sub={stats.freeSessions ? `${stats.freeSessions} free session(s) excluded` : undefined}
          />
          <AstroStatCard label="Billed minutes" value={stats.totalBilledMinutes ?? 0} />
        </div>
      )}

      <div className={`${astroCard} p-4`}>
        <div className="flex flex-wrap gap-3">
          <input
            value={userId}
            onChange={(e) => { setUserId(e.target.value); setPage(1); }}
            placeholder="User ID"
            className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          <input
            value={astrologerId}
            onChange={(e) => { setAstrologerId(e.target.value); setPage(1); }}
            placeholder="Astrologer ID"
            className="w-36 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          <select
            value={sessionType}
            onChange={(e) => { setSessionType(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">All types</option>
            <option value="1">Call</option>
            <option value="2">Chat</option>
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          <button onClick={() => void load()} className={astroBtnOutline}>
            Apply
          </button>
        </div>
      </div>

      <div className={`${astroCard} overflow-x-auto`}>
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className={thClass}>Session</th>
                <th className={thClass}>User</th>
                <th className={thClass}>Astrologer</th>
                <th className={thClass}>Type</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Duration</th>
                <th className={thClass}>Billed min</th>
                <th className={thClass}>Amount</th>
                <th className={thClass}>Earning</th>
                <th className={thClass}>Ended</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className={`${tdClass} text-center text-gray-500`}>
                    No instant sessions found
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.sessionId ?? String(row.txnId)} className="hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className={tdClass}>
                      {row.sessionId ? (
                        <Link
                          to={`/astro/instant-sessions/${encodeURIComponent(row.sessionId)}`}
                          className="font-medium text-brand-600 hover:underline dark:text-brand-400"
                        >
                          {row.sessionId.slice(0, 12)}…
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className={tdClass}>
                      {row.userId != null ? (
                        <Link to={`/astro/users/${row.userId}`} className="text-brand-600 hover:underline dark:text-brand-400">
                          {row.userName || `#${row.userId}`}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className={tdClass}>
                      {row.astrologerId != null ? (
                        <Link
                          to={`/astro/astrologers/${row.astrologerId}`}
                          className="text-brand-600 hover:underline dark:text-brand-400"
                        >
                          {row.astrologerName || `#${row.astrologerId}`}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className={tdClass}>{row.sessionTypeLabel ?? (row.sessionType === 2 ? 'chat' : 'call')}</td>
                    <td className={tdClass}><InstantSessionStatusBadge status={row.status} /></td>
                    <td className={tdClass}>{formatCallDuration(row.durationSeconds)}</td>
                    <td className={tdClass}>{row.billedMinutes}</td>
                    <td className={tdClass}>{formatINR(row.amount)}</td>
                    <td className={tdClass}>
                      {row.isFree ? (
                        <span className="inline-flex items-center gap-2">
                          <FreeFeeBadge source={row.freeSource ?? 'admin'} /> {formatINR(0)}
                        </span>
                      ) : (
                        formatINR(row.earning)
                      )}
                    </td>
                    <td className={tdClass}>{formatAstroDate(row.endDateTime)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {pagination && <AstroPaginationBar pagination={pagination} onPage={setPage} />}
    </div>
  );
}
