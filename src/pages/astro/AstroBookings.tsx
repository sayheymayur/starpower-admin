import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ApiError } from '../../services/api/base';
import {
  astroAPI,
  AstroBooking,
  AstroPagination,
  BookingListEndpoint,
} from '../../services/api/astro';
import {
  AstroAlert,
  AstroPageHeader,
  AstroPaginationBar,
  BookingStatusPill,
  PaymentStatusBadge,
  SessionTypeBadge,
  astroBtnOutline,
  astroCard,
  formatAstroDate,
  formatINR,
  thClass,
  tdClass,
} from './components/astroUi';
import { getBookingStatusLabel } from './bookingLabels';

const TABS: { key: string; label: string; endpoint: BookingListEndpoint }[] = [
  { key: 'all', label: 'All', endpoint: '/bookings' },
  { key: 'failed', label: getBookingStatusLabel('failed'), endpoint: '/bookings/failed' },
  { key: 'upcoming', label: getBookingStatusLabel('upcoming'), endpoint: '/bookings/upcoming' },
  { key: 'active', label: getBookingStatusLabel('active'), endpoint: '/bookings/active' },
  { key: 'completed', label: getBookingStatusLabel('completed'), endpoint: '/bookings/completed' },
  { key: 'cancelled', label: getBookingStatusLabel('cancelled'), endpoint: '/bookings/cancelled' },
];

export default function AstroBookings() {
  const [tab, setTab] = useState('all');
  const [bookings, setBookings] = useState<AstroBooking[]>([]);
  const [pagination, setPagination] = useState<AstroPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const endpoint = TABS.find((t) => t.key === tab)?.endpoint ?? '/bookings';

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await astroAPI.listBookings(endpoint, {
        page,
        limit: 20,
        search: search || undefined,
      });
      setBookings(res.data);
      setPagination(res.pagination);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, search]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <AstroPageHeader title="Bookings" description="Session requests, payments, and birth details." />

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
            placeholder="Search user or astrologer…"
            className="flex-1 min-w-[200px] rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          <button onClick={() => void load()} className={astroBtnOutline}>Search</button>
        </div>
      </div>

      {error && <AstroAlert type="error" message={error} onDismiss={() => setError(null)} />}

      <div className={`${astroCard} overflow-hidden`}>
        {loading ? (
          <p className="p-8 text-center text-gray-500">Loading…</p>
        ) : bookings.length === 0 ? (
          <p className="p-8 text-center text-gray-500">No bookings in this tab.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-brand-100 dark:divide-brand-900/40">
                <thead className="bg-brand-50/80 dark:bg-brand-950/30">
                  <tr>
                    <th className={thClass}>ID</th>
                    <th className={thClass}>Customer</th>
                    <th className={thClass}>Astrologer</th>
                    <th className={thClass}>Type</th>
                    <th className={thClass}>Status</th>
                    <th className={thClass}>Scheduled</th>
                    <th className={thClass}>Payment</th>
                    <th className={thClass}></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-50 dark:divide-brand-900/20">
                  {bookings.map((b) => (
                    <tr key={b.bookingId} className="hover:bg-brand-50/50 dark:hover:bg-brand-950/20">
                      <td className={tdClass}>#{b.bookingId}</td>
                      <td className={tdClass}>{b.user?.userName ?? '—'}</td>
                      <td className={tdClass}>{b.astrologer?.astrologerName ?? '—'}</td>
                      <td className={tdClass}><SessionTypeBadge type={b.sessionType} /></td>
                      <td className={tdClass}>
                        <BookingStatusPill status={b.displayStatus} />
                      </td>
                      <td className={tdClass}>{formatAstroDate(b.startDateTime)}</td>
                      <td className={tdClass}>
                        {b.payment ? (
                          <div>
                            <PaymentStatusBadge status={b.payment.status} />
                            <p className="text-xs text-gray-500 mt-0.5">
                              {formatINR(b.payment.amount)}
                            </p>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className={tdClass}>
                        <Link
                          to={`/astro/bookings/${b.bookingId}`}
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
