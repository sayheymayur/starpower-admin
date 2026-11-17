import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ApiError } from '../../services/api/base';
import {
  astroFinanceAPI,
  AstroEarningsAdjustment,
  AstroEarningsQueueItem,
  AstroPayoutRecord,
  AstroPayoutStats,
} from '../../services/api/astroFinance';
import { normalizeAstroPagination } from '../../services/api/astro';
import type { AstroPagination, ListParams } from '../../services/api/astro';
import RecordPayoutModal from './components/RecordPayoutModal';
import {
  AstroAlert,
  AstroPageHeader,
  AstroPaginationBar,
  AstroStatCard,
  astroBtnOutline,
  astroBtnOutlineSm,
  astroCard,
  formatAstroDate,
  formatCommissionRate,
  formatINR,
  formatPayoutRemark,
  thClass,
  tdClass,
} from './components/astroUi';

type Tab = 'earnings' | 'history' | 'adjustments';

const PAGE_SIZE = 20;

export default function AstroPayouts() {
  const [tab, setTab] = useState<Tab>('earnings');
  const [stats, setStats] = useState<AstroPayoutStats | null>(null);
  const [earnings, setEarnings] = useState<AstroEarningsQueueItem[]>([]);
  const [payouts, setPayouts] = useState<AstroPayoutRecord[]>([]);
  const [adjustments, setAdjustments] = useState<AstroEarningsAdjustment[]>([]);
  const [pagination, setPagination] = useState<AstroPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [hasPending, setHasPending] = useState(true);
  const [page, setPage] = useState(1);

  const [payoutModal, setPayoutModal] = useState<AstroEarningsQueueItem | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const statsRes = await astroFinanceAPI.getPayoutStats();
      setStats(statsRes.data);

      if (tab === 'earnings') {
        const res = await astroFinanceAPI.listEarnings({
          page,
          limit: PAGE_SIZE,
          search: search || undefined,
          hasPending: hasPending ? 'true' : undefined,
          sortBy: 'pendingBalance',
          sortOrder: 'desc',
        });
        setEarnings(res.data);
        setPagination(
          normalizeAstroPagination(res.pagination, {
            page,
            limit: PAGE_SIZE,
            itemCount: res.data.length,
          })
        );
      } else if (tab === 'history') {
        const res = await astroFinanceAPI.listPayouts({
          page,
          limit: PAGE_SIZE,
          search: search || undefined,
          sortBy: 'payout_date_time',
          sortOrder: 'desc',
        });
        setPayouts(res.data);
        setPagination(
          normalizeAstroPagination(res.pagination, {
            page,
            limit: PAGE_SIZE,
            itemCount: res.data.length,
          })
        );
      } else {
        const adjustmentParams: ListParams = { page, limit: PAGE_SIZE };
        if (search.trim() && /^\d+$/.test(search.trim())) {
          adjustmentParams.astrologerUserId = search.trim();
        }
        const res = await astroFinanceAPI.listEarningsAdjustments(adjustmentParams);
        setAdjustments(res.data);
        setPagination(
          normalizeAstroPagination(res.pagination, {
            page,
            limit: PAGE_SIZE,
            itemCount: res.data.length,
          })
        );
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load payouts');
    } finally {
      setLoading(false);
    }
  }, [tab, page, search, hasPending]);

  useEffect(() => {
    void load();
  }, [load]);

  const commissionLabel = stats
    ? `${formatCommissionRate(stats.commissionRate)} of pre-GST session amount`
    : '40% commission on completed sessions';

  return (
    <div className="space-y-6">
      <AstroPageHeader
        title="Payouts"
        description={`${commissionLabel} — review earnings, transfer offline, then record completion.`}
      />

      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AstroStatCard label="Pending balance" value={formatINR(stats.totalPendingBalance)} accent="amber" />
          <AstroStatCard label="Astrologers owed" value={stats.astrologersWithPendingBalance} />
          <AstroStatCard label="Total paid out" value={formatINR(stats.totalPaidOut)} accent="sky" />
          <AstroStatCard label="Payout records" value={stats.payoutCount} />
        </div>
      )}

      {error && <AstroAlert type="error" message={error} onDismiss={() => setError(null)} />}
      {success && <AstroAlert type="success" message={success} onDismiss={() => setSuccess(null)} />}

      <div className="flex flex-wrap gap-2">
        {(['earnings', 'history', 'adjustments'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); setPage(1); }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? 'bg-brand-600 text-white'
                : 'border border-brand-200 text-brand-700 hover:bg-brand-50 dark:border-brand-800 dark:text-brand-400'
            }`}
          >
            {t === 'earnings' ? 'Earnings queue' : t === 'history' ? 'Payout history' : 'Adjustments'}
          </button>
        ))}
      </div>

      <div className={`${astroCard} p-4`}>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={
              tab === 'earnings'
                ? 'Name, phone…'
                : tab === 'history'
                  ? 'Name, phone, payment ref…'
                  : 'Astrologer user ID (optional)…'
            }
            className="flex-1 min-w-[200px] rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          {tab === 'earnings' && (
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={hasPending}
                onChange={(e) => { setHasPending(e.target.checked); setPage(1); }}
                className="rounded border-gray-300 text-brand-600"
              />
              Only with pending balance
            </label>
          )}
          <button type="button" onClick={() => void load()} className={astroBtnOutline}>
            Search
          </button>
        </div>
      </div>

      <div className={`${astroCard} overflow-hidden`}>
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          </div>
        ) : tab === 'earnings' ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-brand-100 dark:divide-brand-900/40">
                <thead className="bg-brand-50/50 dark:bg-brand-950/20">
                  <tr>
                    <th className={thClass}>Astrologer</th>
                    <th className={thClass}>Sessions</th>
                    <th className={thClass}>Earned</th>
                    <th className={thClass}>Adj.</th>
                    <th className={thClass}>Paid</th>
                    <th className={thClass}>Pending</th>
                    <th className={thClass}>Bank</th>
                    <th className={thClass}></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-50 dark:divide-brand-900/20">
                  {earnings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-500">
                        No astrologers in queue
                      </td>
                    </tr>
                  ) : (
                    earnings.map((item) => (
                      <tr key={item.astrologerUserId} className="hover:bg-brand-50/30 dark:hover:bg-brand-950/10">
                        <td className={tdClass}>
                          <Link
                            to={`/astro/payouts/earnings/${item.astrologerUserId}`}
                            className="font-medium text-brand-700 hover:underline dark:text-brand-400"
                          >
                            {item.fullName ?? `User #${item.astrologerUserId}`}
                          </Link>
                          <p className="text-xs text-gray-400">{item.mobileNo ?? '—'}</p>
                        </td>
                        <td className={tdClass}>{item.earnings.completedSessions}</td>
                        <td className={tdClass}>{formatINR(item.earnings.totalEarned)}</td>
                        <td className={tdClass}>
                          {(item.earnings.totalAdjustments ?? 0) !== 0
                            ? formatINR(item.earnings.totalAdjustments ?? 0)
                            : '—'}
                        </td>
                        <td className={tdClass}>{formatINR(item.earnings.totalPaidOut)}</td>
                        <td className={tdClass}>
                          <span className="font-semibold text-amber-700 dark:text-amber-400">
                            {formatINR(item.earnings.pendingBalance)}
                          </span>
                        </td>
                        <td className={tdClass}>
                          {item.bankDetails?.ifscCode ? (
                            <span className="font-mono text-xs">{item.bankDetails.ifscCode}</span>
                          ) : (
                            <Link
                              to={`/astro/banks/${item.astrologerUserId}`}
                              className="text-xs text-amber-600 hover:underline dark:text-amber-400"
                            >
                              Missing
                            </Link>
                          )}
                        </td>
                        <td className={tdClass}>
                          <div className="flex flex-wrap gap-2">
                            <Link
                              to={`/astro/payouts/earnings/${item.astrologerUserId}`}
                              className={astroBtnOutlineSm}
                            >
                              Review
                            </Link>
                            {item.earnings.pendingBalance > 0 && (
                              <button
                                type="button"
                                onClick={() => setPayoutModal(item)}
                                className={astroBtnOutlineSm}
                              >
                                Record
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {pagination && <AstroPaginationBar pagination={pagination} onPage={setPage} />}
          </>
        ) : tab === 'history' ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-brand-100 dark:divide-brand-900/40">
                <thead className="bg-brand-50/50 dark:bg-brand-950/20">
                  <tr>
                    <th className={thClass}>Date</th>
                    <th className={thClass}>Astrologer</th>
                    <th className={thClass}>Amount</th>
                    <th className={thClass}>Payment ref</th>
                    <th className={thClass}>Remark</th>
                    <th className={thClass}></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-50 dark:divide-brand-900/20">
                  {payouts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                        No payout history
                      </td>
                    </tr>
                  ) : (
                    payouts.map((p) => (
                      <tr key={p.payoutId} className="hover:bg-brand-50/30 dark:hover:bg-brand-950/10">
                        <td className={tdClass}>{formatAstroDate(p.payoutDateTime)}</td>
                        <td className={tdClass}>
                          <Link
                            to={`/astro/payouts/earnings/${p.astrologerUserId}`}
                            className="text-brand-600 hover:underline dark:text-brand-400"
                          >
                            {p.astrologerName ?? p.astrologerUserId}
                          </Link>
                        </td>
                        <td className={tdClass}>{formatINR(p.totalAmount)}</td>
                        <td className={`${tdClass} font-mono text-xs`}>
                          {p.paymentId ?? p.maskedPaymentId ?? '—'}
                        </td>
                        <td className={tdClass}>{formatPayoutRemark(p.remark)}</td>
                        <td className={tdClass}>
                          <Link
                            to={`/astro/payouts/${p.payoutId}`}
                            className="text-sm text-brand-600 hover:underline dark:text-brand-400"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {pagination && <AstroPaginationBar pagination={pagination} onPage={setPage} />}
          </>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-brand-100 dark:divide-brand-900/40">
                <thead className="bg-brand-50/50 dark:bg-brand-950/20">
                  <tr>
                    <th className={thClass}>Date</th>
                    <th className={thClass}>Astrologer</th>
                    <th className={thClass}>Direction</th>
                    <th className={thClass}>Type</th>
                    <th className={thClass}>Amount</th>
                    <th className={thClass}>Booking</th>
                    <th className={thClass}>Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-50 dark:divide-brand-900/20">
                  {adjustments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">
                        No adjustments recorded
                      </td>
                    </tr>
                  ) : (
                    adjustments.map((a) => (
                      <tr key={a.adjustmentId} className="hover:bg-brand-50/30 dark:hover:bg-brand-950/10">
                        <td className={tdClass}>{formatAstroDate(a.createdAt)}</td>
                        <td className={tdClass}>
                          <Link
                            to={`/astro/payouts/earnings/${a.astrologerUserId}`}
                            className="text-brand-600 hover:underline dark:text-brand-400"
                          >
                            User #{a.astrologerUserId}
                          </Link>
                        </td>
                        <td className={tdClass}>
                          <span
                            className={
                              a.direction === 'add'
                                ? 'text-brand-700 dark:text-brand-400'
                                : 'text-red-600 dark:text-red-400'
                            }
                          >
                            {a.direction === 'add' ? 'Add' : 'Deduct'}
                          </span>
                        </td>
                        <td className={tdClass}>
                          {a.amountType === 'session' ? 'Session' : 'Custom'}
                        </td>
                        <td className={tdClass}>
                          <span
                            className={
                              a.signedAmount < 0
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-brand-700 dark:text-brand-400'
                            }
                          >
                            {formatINR(a.signedAmount)}
                          </span>
                        </td>
                        <td className={tdClass}>
                          {a.bookingId ? (
                            <Link
                              to={`/astro/bookings/${a.bookingId}`}
                              className="font-mono text-xs text-brand-600 hover:underline dark:text-brand-400"
                            >
                              #{a.bookingId}
                            </Link>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className={tdClass}>{a.remark ?? '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {pagination && <AstroPaginationBar pagination={pagination} onPage={setPage} />}
          </>
        )}
      </div>

      {payoutModal && (
        <RecordPayoutModal
          open
          onClose={() => setPayoutModal(null)}
          astrologerUserId={payoutModal.astrologerUserId}
          astrologerName={payoutModal.fullName ?? `Astrologer #${payoutModal.astrologerUserId}`}
          pendingBalance={payoutModal.earnings.pendingBalance}
          onSuccess={(_result, message) => {
            setSuccess(message);
            setPayoutModal(null);
            void load();
          }}
          onError={(message) => setError(message)}
        />
      )}
    </div>
  );
}
