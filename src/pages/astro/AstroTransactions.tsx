import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ApiError } from '../../services/api/base';
import {
  astroFinanceAPI,
  AstroTransaction,
  AstroTransactionStats,
  TransactionListEndpoint,
} from '../../services/api/astroFinance';
import type { AstroPagination } from '../../services/api/astro';
import {
  AstroAlert,
  AstroPageHeader,
  AstroPaginationBar,
  AstroStatCard,
  PaymentStatusBadge,
  SessionTypeBadge,
  astroBtnOutline,
  astroCard,
  formatAstroDate,
  formatINR,
  thClass,
  tdClass,
} from './components/astroUi';

const TABS: { key: string; label: string; endpoint: TransactionListEndpoint }[] = [
  { key: 'all', label: 'All', endpoint: '/transactions' },
  { key: 'pending', label: 'Pending', endpoint: '/transactions/pending' },
  { key: 'success', label: 'Success', endpoint: '/transactions/success' },
  { key: 'failed', label: 'Failed', endpoint: '/transactions/failed' },
  { key: 'refunded', label: 'Refunded', endpoint: '/transactions/refunded' },
];

export default function AstroTransactions() {
  const [tab, setTab] = useState('all');
  const [stats, setStats] = useState<AstroTransactionStats | null>(null);
  const [items, setItems] = useState<AstroTransaction[]>([]);
  const [pagination, setPagination] = useState<AstroPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const endpoint = TABS.find((t) => t.key === tab)?.endpoint ?? '/transactions';

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, listRes] = await Promise.all([
        astroFinanceAPI.getTransactionStats(),
        astroFinanceAPI.listTransactions(endpoint, {
          page,
          limit: 20,
          search: search || undefined,
        }),
      ]);
      setStats(statsRes.data);
      setItems(listRes.data);
      setPagination(listRes.pagination);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, search]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <AstroPageHeader
        title="Payments"
        description="Razorpay booking payments — distinct from listener wallet top-ups."
      />

      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AstroStatCard label="Total transactions" value={stats.total} />
          <AstroStatCard
            label="Paid revenue"
            value={formatINR(stats.paidRevenue)}
            accent="sky"
          />
          <AstroStatCard
            label="Successful"
            value={stats.byStatus.success}
            sub={`${stats.byStatus.pending} pending · ${stats.byStatus.failed} failed`}
          />
          <AstroStatCard label="Today" value={stats.transactionsToday} accent="amber" />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setPage(1); }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-brand-600 text-white'
                : 'border border-brand-200 text-brand-700 hover:bg-brand-50 dark:border-brand-800 dark:text-brand-400 dark:hover:bg-brand-950/30'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={`${astroCard} p-4`}>
        <div className="flex flex-wrap gap-3">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Order id, payment id, user or astrologer…"
            className="flex-1 min-w-[200px] rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          <button onClick={() => void load()} className={astroBtnOutline}>Search</button>
        </div>
      </div>

      {error && <AstroAlert type="error" message={error} onDismiss={() => setError(null)} />}

      <div className={`${astroCard} overflow-hidden`}>
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-brand-100 dark:divide-brand-900/40">
                <thead className="bg-brand-50/50 dark:bg-brand-950/20">
                  <tr>
                    <th className={thClass}>ID</th>
                    <th className={thClass}>User</th>
                    <th className={thClass}>Astrologer</th>
                    <th className={thClass}>Amount</th>
                    <th className={thClass}>Status</th>
                    <th className={thClass}>Session</th>
                    <th className={thClass}>Paid at</th>
                    <th className={thClass}></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-50 dark:divide-brand-900/20">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-500">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    items.map((tx) => (
                      <tr key={tx.transactionId} className="hover:bg-brand-50/30 dark:hover:bg-brand-950/10">
                        <td className={tdClass}>
                          <span className="font-mono text-xs">{tx.transactionId}</span>
                          <p className="text-xs text-gray-400 truncate max-w-[120px]">{tx.orderId}</p>
                        </td>
                        <td className={tdClass}>{tx.userName ?? tx.userId}</td>
                        <td className={tdClass}>{tx.astrologerName ?? tx.astrologerId}</td>
                        <td className={tdClass}>
                          <span className="font-medium">{formatINR(tx.payableAmount)}</span>
                          {tx.gstAmount > 0 && (
                            <p className="text-xs text-gray-400">incl. GST {formatINR(tx.gstAmount)}</p>
                          )}
                        </td>
                        <td className={tdClass}><PaymentStatusBadge status={tx.status} /></td>
                        <td className={tdClass}>
                          {tx.sessionType ? <SessionTypeBadge type={tx.sessionType} /> : '—'}
                        </td>
                        <td className={tdClass}>{formatAstroDate(tx.paidAt ?? tx.createdAt)}</td>
                        <td className={tdClass}>
                          <Link
                            to={`/astro/transactions/${tx.transactionId}`}
                            className="text-brand-600 hover:underline dark:text-brand-400 text-sm"
                          >
                            View
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
        )}
      </div>
    </div>
  );
}
