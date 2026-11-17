import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ApiError } from '../../services/api/base';
import {
  astroWalletAPI,
  type AstroAccountTransaction,
  type AstroWalletTransaction,
} from '../../services/api/astroWallet';
import {
  AstroAlert,
  AstroPageHeader,
  astroBtnOutline,
  formatAstroDate,
  formatINR,
  thClass,
  tdClass,
  astroCard,
} from './components/astroUi';

type Tab = 'payments' | 'account';

export default function AstroWalletTransactions() {
  const [tab, setTab] = useState<Tab>('payments');
  const [payments, setPayments] = useState<AstroWalletTransaction[]>([]);
  const [account, setAccount] = useState<AstroAccountTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: 20,
        ...(userId ? { userId: Number(userId) } : {}),
      };
      if (tab === 'payments') {
        const res = userId
          ? await astroWalletAPI.listUserTransactions(Number(userId), { page, limit: 20 })
          : await astroWalletAPI.listTransactions(params);
        setPayments(res.data ?? []);
        setTotalPages(res.pagination?.totalPages ?? 0);
      } else {
        const res = userId
          ? await astroWalletAPI.listUserAccountTransactions(Number(userId), { page, limit: 20 })
          : await astroWalletAPI.listAccountTransactions(params);
        setAccount(res.data ?? []);
        setTotalPages(res.pagination?.totalPages ?? 0);
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [page, tab, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <AstroPageHeader
        title="Wallet transactions"
        description="Payment credits and account ledger for StarPower wallets."
        action={
          <Link to="/astro/wallets" className={astroBtnOutline}>
            Wallets
          </Link>
        }
      />

      {error && <AstroAlert type="error" message={error} onDismiss={() => setError(null)} />}

      <div className="inline-flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
        {(['payments', 'account'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); setPage(1); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${
              tab === t
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-300'
            }`}
          >
            {t === 'payments' ? 'Payments' : 'Account ledger'}
          </button>
        ))}
      </div>

      <div className={`${astroCard} p-4`}>
        <div className="flex flex-wrap gap-3">
          <input
            value={userId}
            onChange={(e) => { setUserId(e.target.value); setPage(1); }}
            placeholder="Filter by user ID"
            className="min-w-[180px] flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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
        ) : tab === 'payments' ? (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className={thClass}>When</th>
                <th className={thClass}>User</th>
                <th className={thClass}>Amount</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`${tdClass} text-center text-gray-500`}>No payments</td>
                </tr>
              ) : (
                payments.map((t, i) => {
                  const uid = t.user_id_fk ?? t.user_id;
                  return (
                    <tr key={String(t.transaction_id_pk ?? t.transaction_id ?? i)}>
                      <td className={tdClass}>{formatAstroDate(t.created_date_time ?? t.payment_date_time)}</td>
                      <td className={tdClass}>
                        {uid != null ? (
                          <Link to={`/astro/wallets/${uid}`} className="text-brand-600 hover:underline dark:text-brand-400">
                            {t.user?.full_name || `#${uid}`}
                          </Link>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className={tdClass}>{formatINR(Number(t.amount))}</td>
                      <td className={tdClass}>{t.status ?? (t.is_credit ? 'credit' : 'debit')}</td>
                      <td className={`${tdClass} font-mono text-xs`}>{t.order_id ?? '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className={thClass}>When</th>
                <th className={thClass}>User</th>
                <th className={thClass}>Amount</th>
                <th className={thClass}>Type</th>
                <th className={thClass}>Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {account.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`${tdClass} text-center text-gray-500`}>No ledger rows</td>
                </tr>
              ) : (
                account.map((t, i) => (
                  <tr key={String(t.account_transaction_id_pk ?? i)}>
                    <td className={tdClass}>{formatAstroDate(t.created_date_time)}</td>
                    <td className={tdClass}>
                      {t.user_id_fk != null ? (
                        <Link
                          to={`/astro/wallets/${t.user_id_fk}`}
                          className="text-brand-600 hover:underline dark:text-brand-400"
                        >
                          {t.user?.full_name || `#${t.user_id_fk}`}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className={tdClass}>{formatINR(Number(t.amount))}</td>
                    <td className={tdClass}>{t.transaction_type ?? '—'}</td>
                    <td className={tdClass}>{t.remark ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className={astroBtnOutline}>
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className={astroBtnOutline}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
