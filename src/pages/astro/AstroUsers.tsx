import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ApiError } from '../../services/api/base';
import { astroAPI, AstroPagination, AstroUserSummary } from '../../services/api/astro';
import {
  AstroAlert,
  AstroPageHeader,
  AstroPaginationBar,
  astroBtnOutline,
  formatAstroDate,
  thClass,
  tdClass,
  astroCard,
} from './components/astroUi';

export default function AstroUsers() {
  const [users, setUsers] = useState<AstroUserSummary[]>([]);
  const [pagination, setPagination] = useState<AstroPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await astroAPI.listUsers({
        page,
        limit: 20,
        search: search || undefined,
      });
      setUsers(res.data);
      setPagination(res.pagination);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <AstroPageHeader title="Astro users" description="Customers with birth profiles or booking history." />

      <div className={`${astroCard} p-4`}>
        <div className="flex flex-wrap gap-3">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name, phone, email…"
            className="flex-1 min-w-[200px] rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          <button onClick={() => void load()} className={astroBtnOutline}>Search</button>
        </div>
      </div>

      {error && <AstroAlert type="error" message={error} onDismiss={() => setError(null)} />}

      <div className={`${astroCard} overflow-hidden`}>
        {loading ? (
          <p className="p-8 text-center text-gray-500">Loading…</p>
        ) : users.length === 0 ? (
          <p className="p-8 text-center text-gray-500">No astro users found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-brand-100 dark:divide-brand-900/40">
                <thead className="bg-brand-50/80 dark:bg-brand-950/30">
                  <tr>
                    <th className={thClass}>User</th>
                    <th className={thClass}>Contact</th>
                    <th className={thClass}>Bookings</th>
                    <th className={thClass}>Last booking</th>
                    <th className={thClass}>Birth profile</th>
                    <th className={thClass}></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-50 dark:divide-brand-900/20">
                  {users.map((u) => (
                    <tr key={u.userId} className="hover:bg-brand-50/50 dark:hover:bg-brand-950/20">
                      <td className={tdClass}>
                        <p className="font-medium text-gray-900 dark:text-white">{u.fullName}</p>
                        <p className="text-xs text-gray-500">@{u.username ?? '—'}</p>
                      </td>
                      <td className={tdClass}>
                        <p>{u.mobileNo}</p>
                        <p className="text-xs text-gray-500">{u.email ?? '—'}</p>
                      </td>
                      <td className={tdClass}>{u.bookingCount}</td>
                      <td className={tdClass}>{formatAstroDate(u.lastBookingAt)}</td>
                      <td className={tdClass}>
                        {u.astroProfile ? (
                          <span className="text-brand-600 text-xs dark:text-brand-400">
                            {u.astroProfile.birthPlace ?? 'Profile set'}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">None</span>
                        )}
                      </td>
                      <td className={tdClass}>
                        <Link
                          to={`/astro/users/${u.userId}`}
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
            {pagination && <AstroPaginationBar pagination={pagination} onPage={setPage} />}
          </>
        )}
      </div>
    </div>
  );
}
