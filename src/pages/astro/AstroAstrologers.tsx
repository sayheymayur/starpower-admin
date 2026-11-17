import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ApiError } from '../../services/api/base';
import {
  astroAPI,
  AstroPagination,
  AstroVerificationStats,
  AstrologerSummary,
  normalizeAstroPagination,
} from '../../services/api/astro';
import PendingVerificationCard from './components/PendingVerificationCard';
import {
  AstroAlert,
  AstroPageHeader,
  AstroPaginationBar,
  AstroStatCard,
  AstroAvatar,
  DocIcons,
  KycBadge,
  VerificationBadge,
  TestAstrologerBadge,
  formatAstrologerBookings,
  astroBtnOutlineSm,
  astroCard,
  thClass,
  tdClass,
} from './components/astroUi';

type VerificationFilter = 'all' | 'pending' | 'verified' | 'rejected';

const PAGE_SIZE = 50;

const FILTER_TABS: { key: VerificationFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'verified', label: 'Verified' },
  { key: 'rejected', label: 'Rejected' },
];

function verificationCount(stats: AstroVerificationStats | null, key: string, fallback = 0) {
  if (!stats) return fallback;
  if (stats.byStatus && stats.byStatus[key] != null) return stats.byStatus[key];
  if (key === '0' || key === 'pending') return stats.pending ?? fallback;
  if (key === '1' || key === 'verified') return stats.verified ?? fallback;
  if (key === '2' || key === 'rejected') return stats.rejected ?? fallback;
  return fallback;
}

function parseFilter(value: string | null): VerificationFilter {
  if (value === 'pending' || value === 'verified' || value === 'rejected') return value;
  return 'all';
}

export default function AstroAstrologers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = parseFilter(searchParams.get('filter'));
  const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const testOnly = searchParams.get('isTestAstrologer') === 'true';

  const [items, setItems] = useState<AstrologerSummary[]>([]);
  const [pagination, setPagination] = useState<AstroPagination | null>(null);
  const [verificationStats, setVerificationStats] = useState<AstroVerificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const setPage = (next: number) => {
    const safePage = Math.max(1, next);
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      if (safePage <= 1) nextParams.delete('page');
      else nextParams.set('page', String(safePage));
      return nextParams;
    });
  };

  const setFilter = (next: VerificationFilter) => {
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams();
      if (next !== 'all') nextParams.set('filter', next);
      if (prev.get('isTestAstrologer') === 'true') {
        nextParams.set('isTestAstrologer', 'true');
      }
      return nextParams;
    });
  };

  const setTestOnly = (next: boolean) => {
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      nextParams.delete('page');
      if (next) nextParams.set('isTestAstrologer', 'true');
      else nextParams.delete('isTestAstrologer');
      return nextParams;
    });
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string | number | boolean | undefined> = {
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        isTestAstrologer: testOnly ? true : undefined,
      };

      let listRes;
      if (filter === 'pending') {
        listRes = await astroAPI.listPendingAstrologers(params);
      } else {
        if (filter === 'verified') {
          params.doctorProfileStatus = 4;
        } else if (filter === 'rejected') {
          params.doctorProfileStatus = 2;
        } else {
          // Without an explicit status filter, the API returns pending-only until search is used
          params.doctorProfileStatus = '2,3,4';
        }
        listRes = await astroAPI.listAstrologers(params);
      }

      const statsRes = await astroAPI.getVerificationStats().catch(() => null);
      setItems(listRes.data);
      setPagination(
        normalizeAstroPagination(listRes.pagination, {
          page,
          limit: PAGE_SIZE,
          itemCount: listRes.data.length,
        })
      );
      if (statsRes) setVerificationStats(statsRes.data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load astrologers');
    } finally {
      setLoading(false);
    }
  }, [page, search, filter, testOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleVerificationUpdated = (updatedUserId: number, status: number) => {
    setItems((prev) =>
      prev.map((a) =>
        a.userId === updatedUserId ? { ...a, doctorProfileStatus: status } : a
      )
    );
    if (filter === 'pending' && status !== 0) {
      setItems((prev) => prev.filter((a) => a.userId !== updatedUserId));
    }
    void astroAPI.getVerificationStats().then((res) => setVerificationStats(res.data)).catch(() => {});
  };

  const pendingCount = verificationCount(verificationStats, '0') || verificationCount(verificationStats, 'pending');
  const verifiedCount = verificationCount(verificationStats, '1') || verificationCount(verificationStats, 'verified');
  const rejectedCount = verificationCount(verificationStats, '2') || verificationCount(verificationStats, 'rejected');

  return (
    <div className="space-y-6">
      <AstroPageHeader
        title={filter === 'pending' ? 'Pending verification' : 'Astrologers'}
        description={
          filter === 'all'
            ? 'All registered astrologers — every verification status.'
            : filter === 'pending'
              ? 'Review documents and approve or reject from the queue.'
              : filter === 'verified'
                ? 'Approved and active astrologers.'
                : 'Rejected astrologer profiles.'
        }
      />

      {verificationStats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <AstroStatCard label="Pending review" value={pendingCount} accent="amber" />
          <AstroStatCard label="Verified" value={verifiedCount} />
          <AstroStatCard label="Rejected" value={rejectedCount} accent="sky" />
          <AstroStatCard
            label="Total"
            value={verificationStats.total ?? pendingCount + verifiedCount + rejectedCount}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === tab.key
                ? 'bg-brand-600 text-white'
                : 'border border-brand-200 bg-white text-brand-700 hover:bg-brand-50 dark:border-brand-800 dark:bg-gray-900 dark:text-brand-400'
            }`}
          >
            {tab.label}
            {tab.key === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-400 px-1.5 py-0.5 text-xs font-bold text-amber-950">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setTestOnly(!testOnly)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            testOnly
              ? 'bg-violet-600 text-white'
              : 'border border-violet-200 bg-white text-violet-700 hover:bg-violet-50 dark:border-violet-800 dark:bg-gray-900 dark:text-violet-400'
          }`}
        >
          Test only
        </button>
      </div>

      <div className={`${astroCard} p-4`}>
        <div className="flex flex-wrap gap-3">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name or phone…"
            className="flex-1 min-w-[200px] rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          <button type="button" onClick={() => void load()} className={astroBtnOutlineSm}>Search</button>
        </div>
      </div>

      {error && <AstroAlert type="error" message={error} onDismiss={() => setError(null)} />}

      {loading ? (
        <p className="py-12 text-center text-gray-500">Loading…</p>
      ) : (
        <>
          {items.length === 0 ? (
            <div className={`${astroCard} p-8 text-center text-gray-500`}>
              {filter === 'pending'
                ? 'No astrologers awaiting verification.'
                : filter === 'all'
                  ? 'No astrologers found.'
                  : `No ${filter} astrologers found.`}
            </div>
          ) : filter === 'pending' ? (
            <div className="space-y-3">
              {items.map((a) => (
                <PendingVerificationCard
                  key={a.userId}
                  astrologer={a}
                  onUpdated={(status) => handleVerificationUpdated(a.userId, status)}
                />
              ))}
            </div>
          ) : (
            <div className={`${astroCard} overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-brand-100 dark:divide-brand-900/40">
                  <thead className="bg-brand-50/80 dark:bg-brand-950/30">
                    <tr>
                      <th className={thClass}>Astrologer</th>
                      <th className={thClass}>Verification</th>
                      <th className={thClass}>Experience</th>
                      <th className={thClass}>Rates</th>
                      <th className={thClass}>Bookings</th>
                      <th className={thClass}>Docs</th>
                      <th className={thClass}>KYC</th>
                      <th className={thClass}></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-50 dark:divide-brand-900/20">
                    {items.map((a) => (
                      <tr key={a.userId} className="hover:bg-brand-50/50 dark:hover:bg-brand-950/20">
                        <td className={tdClass}>
                          <div className="flex items-center gap-3">
                            <AstroAvatar name={a.fullName} photo={a.profilePhoto} size="md" />
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium text-gray-900 dark:text-white">{a.fullName}</p>
                                <TestAstrologerBadge
                                  isTest={a.isTestAstrologer}
                                  viewerCount={a.testViewerUserIds?.length}
                                />
                              </div>
                              <p className="text-xs text-gray-500">{a.mobileNo}</p>
                            </div>
                          </div>
                        </td>
                        <td className={tdClass}>
                          <VerificationBadge status={a.doctorProfileStatus} />
                        </td>
                        <td className={tdClass}>{a.yearsOfExperience ?? '—'} yrs</td>
                        <td className={tdClass}>
                          <span className="text-xs">Call ₹{a.callRate ?? '—'}</span>
                          <br />
                          <span className="text-xs">Chat ₹{a.chatRate ?? '—'}</span>
                        </td>
                        <td className={tdClass}>{formatAstrologerBookings(a.stats)}</td>
                        <td className={tdClass}><DocIcons documents={a.documents} variant="astrologer" /></td>
                        <td className={tdClass}>
                          <KycBadge status={a.documents?.kycStatus ?? null} />
                        </td>
                        <td className={tdClass}>
                          <Link
                            to={`/astro/astrologers/${a.userId}`}
                            className="text-sm font-medium text-brand-600 hover:text-brand-800 dark:text-brand-400"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {pagination && (
            <div className={`${astroCard} overflow-hidden`}>
              <AstroPaginationBar pagination={pagination} onPage={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
