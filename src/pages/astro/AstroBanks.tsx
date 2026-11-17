import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ApiError } from '../../services/api/base';
import { astroFinanceAPI, AstroBankItem, AstroBankStats } from '../../services/api/astroFinance';
import type { AstroPagination } from '../../services/api/astro';
import Badge from '../../components/ui/badge';
import {
  AstroAlert,
  AstroPageHeader,
  AstroPaginationBar,
  AstroStatCard,
  astroBtnOutline,
  astroCard,
  formatAstroDate,
  thClass,
  tdClass,
} from './components/astroUi';

export default function AstroBanks() {
  const [stats, setStats] = useState<AstroBankStats | null>(null);
  const [items, setItems] = useState<AstroBankItem[]>([]);
  const [pagination, setPagination] = useState<AstroPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [hasBank, setHasBank] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, listRes] = await Promise.all([
        astroFinanceAPI.getBankStats(),
        astroFinanceAPI.listBanks({
          page,
          limit: 20,
          search: search || undefined,
          hasBank: hasBank || undefined,
        }),
      ]);
      setStats(statsRes.data);
      setItems(listRes.data);
      setPagination(listRes.pagination);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load bank accounts');
    } finally {
      setLoading(false);
    }
  }, [page, search, hasBank]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <AstroPageHeader
        title="Bank accounts"
        description="Astrologer payout bank details."
      />

      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AstroStatCard label="Total astrologers" value={stats.totalAstrologers} />
          <AstroStatCard label="With bank details" value={stats.withBankDetails} />
          <AstroStatCard label="Missing bank" value={stats.missingBankDetails} accent="amber" />
          <AstroStatCard label="Active accounts" value={stats.activeBankAccounts} accent="sky" />
        </div>
      )}

      {error && <AstroAlert type="error" message={error} onDismiss={() => setError(null)} />}

      <div className={`${astroCard} p-4`}>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Name, phone, IFSC, account…"
            className="flex-1 min-w-[200px] rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          <select
            value={hasBank}
            onChange={(e) => { setHasBank(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">All</option>
            <option value="true">With bank</option>
            <option value="false">Missing bank</option>
          </select>
          <button onClick={() => void load()} className={astroBtnOutline}>Search</button>
        </div>
      </div>

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
                    <th className={thClass}>Astrologer</th>
                    <th className={thClass}>Account name</th>
                    <th className={thClass}>Account no.</th>
                    <th className={thClass}>IFSC</th>
                    <th className={thClass}>Status</th>
                    <th className={thClass}>Added</th>
                    <th className={thClass}></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-50 dark:divide-brand-900/20">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">
                        No records found
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => {
                      const bank = item.bankDetails ?? item;
                      const hasRecord = Boolean(bank.bankId || bank.accountNumber || bank.maskedAccountNumber);
                      return (
                        <tr key={item.astrologerUserId} className="hover:bg-brand-50/30 dark:hover:bg-brand-950/10">
                          <td className={tdClass}>
                            <Link
                              to={`/astro/astrologers/${item.astrologerUserId}`}
                              className="font-medium text-brand-700 hover:underline dark:text-brand-400"
                            >
                              {item.astrologerName}
                            </Link>
                            <p className="text-xs text-gray-400">{item.mobileNo}</p>
                          </td>
                          <td className={tdClass}>{bank.fullName ?? '—'}</td>
                          <td className={`${tdClass} font-mono text-xs`}>
                            {bank.maskedAccountNumber ?? bank.accountNumber ?? '—'}
                          </td>
                          <td className={`${tdClass} font-mono text-xs`}>{bank.ifscCode ?? '—'}</td>
                          <td className={tdClass}>
                            {hasRecord ? (
                              <Badge color={bank.status === 1 ? 'success' : 'warning'} size="sm">
                                {bank.status === 1 ? 'Active' : 'Inactive'}
                              </Badge>
                            ) : (
                              <Badge color="warning" size="sm">Missing</Badge>
                            )}
                          </td>
                          <td className={tdClass}>{formatAstroDate(bank.createdAt)}</td>
                          <td className={tdClass}>
                            <Link
                              to={`/astro/banks/${item.astrologerUserId}`}
                              className="text-sm text-brand-600 hover:underline dark:text-brand-400"
                            >
                              {hasRecord ? 'Edit' : 'Add'}
                            </Link>
                          </td>
                        </tr>
                      );
                    })
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
