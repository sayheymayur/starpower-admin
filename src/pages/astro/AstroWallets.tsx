import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ApiError } from '../../services/api/base';
import {
  astroWalletAPI,
  type AstroWallet,
  type AstroWalletStats,
} from '../../services/api/astroWallet';
import {
  AstroAlert,
  AstroPageHeader,
  AstroStatCard,
  astroBtnOutline,
  formatAstroDate,
  formatINR,
  thClass,
  tdClass,
  astroCard,
} from './components/astroUi';

export default function AstroWallets() {
  const [wallets, setWallets] = useState<AstroWallet[]>([]);
  const [stats, setStats] = useState<AstroWalletStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (userId.trim()) {
        const res = await astroWalletAPI.getWalletByUser(Number(userId));
        setWallets(res.data ? [res.data] : []);
        setTotalPages(1);
      } else {
        const [listRes, statsRes] = await Promise.all([
          astroWalletAPI.listWallets({ page, limit: 20 }),
          astroWalletAPI.getStats(),
        ]);
        setWallets(listRes.data ?? []);
        setTotalPages(listRes.pagination?.totalPages ?? 0);
        setStats(statsRes.data);
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load wallets');
    } finally {
      setLoading(false);
    }
  }, [page, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <AstroPageHeader
        title="Wallets"
        description="StarPower user wallet balances and lookup."
        action={
          <Link to="/astro/wallet-transactions" className={astroBtnOutline}>
            View transactions
          </Link>
        }
      />

      {error && <AstroAlert type="error" message={error} onDismiss={() => setError(null)} />}

      {stats && !userId && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AstroStatCard label="Wallets" value={stats.totalWallets ?? 0} />
          <AstroStatCard label="Total balance" value={formatINR(Number(stats.totalBalance ?? 0))} accent="sky" />
          <AstroStatCard label="Average" value={formatINR(Number(stats.averageBalance ?? 0))} accent="amber" />
          <AstroStatCard label="Max balance" value={formatINR(Number(stats.maxBalance ?? 0))} />
        </div>
      )}

      <div className={`${astroCard} p-4`}>
        <div className="flex flex-wrap gap-3">
          <input
            value={userId}
            onChange={(e) => { setUserId(e.target.value); setPage(1); }}
            placeholder="Lookup by user ID"
            className="min-w-[180px] flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          <button onClick={() => void load()} className={astroBtnOutline}>
            Search
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
                <th className={thClass}>User</th>
                <th className={thClass}>Mobile</th>
                <th className={thClass}>Balance</th>
                <th className={thClass}>Updated</th>
                <th className={thClass} />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {wallets.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`${tdClass} text-center text-gray-500`}>
                    No wallets found
                  </td>
                </tr>
              ) : (
                wallets.map((w) => (
                  <tr key={w.wallet_id_pk ?? w.user_id_fk} className="hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className={tdClass}>
                      {w.user?.full_name || `User #${w.user_id_fk}`}
                      <div className="text-xs text-gray-500">#{w.user_id_fk}</div>
                    </td>
                    <td className={tdClass}>{w.user?.mobile_no ?? '—'}</td>
                    <td className={`${tdClass} font-semibold`}>{formatINR(w.amount)}</td>
                    <td className={tdClass}>{formatAstroDate(w.last_updated_date_time)}</td>
                    <td className={tdClass}>
                      <Link
                        to={`/astro/wallets/${w.user_id_fk}`}
                        className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {!userId && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={astroBtnOutline}
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className={astroBtnOutline}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
