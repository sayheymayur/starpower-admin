import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import Badge from '../components/ui/badge';
import { ApiError } from '../services/api/base';
import {
  AdminAadhaarProfile,
  AadhaarStats,
  AadhaarListParams,
  AadhaarVerificationStatus,
  AADHAAR_STATUS_LABELS,
  aadhaarAPI,
  aadhaarStatusColor,
  partnerTypeLabel,
} from '../services/api/aadhaar';
import { formatLocalDate } from '../utils/dateUtils';
import { AstroPaginationBar } from './astro/components/astroUi';
import { normalizeAstroPagination } from '../services/api/astro';

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
  { value: 'verifiedAt', label: 'Verified at' },
  { value: 'createdAt', label: 'Created' },
  { value: 'fullName', label: 'Name' },
  { value: 'mobileNo', label: 'Mobile' },
  { value: 'userId', label: 'User ID' },
];

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white';

function StatCard({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

export default function AadhaarVerifications() {
  const [items, setItems] = useState<AdminAadhaarProfile[]>([]);
  const [stats, setStats] = useState<AadhaarStats | null>(null);
  const [pagination, setPagination] = useState<ReturnType<typeof normalizeAstroPagination> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [verified, setVerified] = useState('');
  const [isDoctor, setIsDoctor] = useState('');
  const [isAstrologer, setIsAstrologer] = useState('');
  const [sortBy, setSortBy] = useState('verifiedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const t = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const loadStats = useCallback(async () => {
    try {
      const data = await aadhaarAPI.stats();
      setStats(data);
    } catch {
      // stats are supplementary
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aadhaarAPI.list({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        sortBy: sortBy as AadhaarListParams['sortBy'],
        sortOrder,
        verificationStatus: (verificationStatus || undefined) as AadhaarVerificationStatus | undefined,
        verified: verified === '' ? undefined : verified === 'true',
        isDoctor: isDoctor === '' ? undefined : isDoctor === 'true',
        isAstrologer: isAstrologer === '' ? undefined : isAstrologer === 'true',
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
      setError(e instanceof ApiError ? e.message : 'Failed to load Aadhaar records');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAstrologer, isDoctor, page, search, sortBy, sortOrder, verificationStatus, verified]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  useEffect(() => {
    void load();
  }, [load]);

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setVerificationStatus('');
    setVerified('');
    setIsDoctor('');
    setIsAstrologer('');
    setPage(1);
  };

  const hasFilters = Boolean(search || verificationStatus || verified || isDoctor || isAstrologer);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Aadhaar verifications</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          DigiLocker Aadhaar records from partner verification flow
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Verified" value={stats.verified} />
          <StatCard label="Pending" value={stats.pending} />
          <StatCard label="Failed" value={stats.failed} />
          <StatCard label="Listeners" value={stats.listeners} />
          <StatCard label="Astrologers" value={stats.astrologers} />
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative lg:col-span-2">
            <input
              type="search"
              placeholder="Search name, mobile, masked Aadhaar, username…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={inputClass}
            />
          </div>
          <select
            value={verificationStatus}
            onChange={(e) => { setVerificationStatus(e.target.value); setPage(1); }}
            className={inputClass}
          >
            <option value="">All statuses</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <select value={verified} onChange={(e) => { setVerified(e.target.value); setPage(1); }} className={inputClass}>
            <option value="">Verified flag (any)</option>
            <option value="true">Verified = true</option>
            <option value="false">Verified = false</option>
          </select>
          <select value={isDoctor} onChange={(e) => { setIsDoctor(e.target.value); setPage(1); }} className={inputClass}>
            <option value="">Partner: any</option>
            <option value="true">Listeners only</option>
            <option value="false">Not listener</option>
          </select>
          <select value={isAstrologer} onChange={(e) => { setIsAstrologer(e.target.value); setPage(1); }} className={inputClass}>
            <option value="">Astrologer: any</option>
            <option value="true">Astrologers only</option>
            <option value="false">Not astrologer</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={inputClass}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')} className={inputClass}>
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </div>
        {hasFilters && (
          <button type="button" onClick={clearFilters} className="mt-3 text-sm text-blue-600 hover:underline dark:text-blue-400">
            Clear filters
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Account</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Aadhaar name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Masked ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Verified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                    No Aadhaar records found
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr key={row.userId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="whitespace-nowrap px-4 py-3">
                      <Link
                        to={`/aadhaar/${row.userId}`}
                        className="flex items-center gap-3 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {row.accountProfilePhoto ? (
                          <img
                            src={row.accountProfilePhoto}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-medium dark:bg-gray-700">
                            {(row.accountName ?? row.fullName ?? 'U').charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {row.accountName ?? row.fullName ?? `User ${row.userId}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            #{row.userId}
                            {row.accountUsername ? ` · @${row.accountUsername}` : ''}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {row.fullName ?? '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-sm text-gray-700 dark:text-gray-300">
                      {row.maskedAadhaar ?? '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {partnerTypeLabel(row)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge color={aadhaarStatusColor(row.verificationStatus)} size="sm">
                        {AADHAAR_STATUS_LABELS[row.verificationStatus]}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {row.verifiedAt ? formatLocalDate(row.verifiedAt) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pagination && (
          <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700">
            <AstroPaginationBar pagination={pagination} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
