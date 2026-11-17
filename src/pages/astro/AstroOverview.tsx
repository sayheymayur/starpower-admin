import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ApiError } from '../../services/api/base';
import { astroAPI, type AstroOverview as AstroOverviewData } from '../../services/api/astro';
import {
  AstroAlert,
  AstroPageHeader,
  AstroStatCard,
  BookingStatusPill,
  astroBtn,
  formatINR,
} from './components/astroUi';

export default function AstroOverviewPage() {
  const [data, setData] = useState<AstroOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        const res = await astroAPI.getOverview();
        setData(res.data);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'Failed to load overview');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <AstroPageHeader
        title="Overview"
        description="Users, astrologers, bookings, instant sessions, and revenue at a glance."
      />

      {error && <AstroAlert type="error" message={error} onDismiss={() => setError(null)} />}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AstroStatCard
              label="Users with profile"
              value={data.users.totalWithProfile}
              sub={`+${data.users.newProfilesThisWeek} this week`}
            />
            <AstroStatCard
              label="Users with bookings"
              value={data.users.usersWithBookings}
              accent="sky"
            />
            <AstroStatCard
              label="Active astrologers"
              value={data.astrologers.active}
              sub={`${data.astrologers.pendingVerification} pending verification`}
              accent="amber"
            />
            <AstroStatCard
              label="Total revenue"
              value={formatINR(data.revenue.totalPaid)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-brand-100 bg-white p-5 dark:border-brand-900/40 dark:bg-gray-900">
              <h3 className="font-semibold text-gray-900 dark:text-white">Bookings today</h3>
              <p className="mt-2 text-3xl font-bold text-brand-600">{data.bookings.today}</p>
              <p className="mt-1 text-sm text-gray-500">{data.bookings.activeNow} active now</p>
            </div>
            <div className="md:col-span-2 rounded-xl border border-brand-100 bg-white p-5 dark:border-brand-900/40 dark:bg-gray-900">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">By status</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(data.bookings.byStatus).map(([status, count]) => (
                  <span key={status} className="inline-flex items-center gap-1.5">
                    <BookingStatusPill status={status} />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{count}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/astro/users" className={astroBtn}>Manage users</Link>
            <Link to="/astro/astrologers?filter=pending" className={astroBtn}>
              Review pending ({data.astrologers.pendingVerification})
            </Link>
            <Link to="/astro/bookings" className={astroBtn}>View bookings</Link>
            <Link to="/astro/instant-sessions" className={astroBtn}>Instant sessions</Link>
            <Link to="/astro/call-recordings" className={astroBtn}>Call recordings</Link>
            <Link to="/astro/wallets" className={astroBtn}>Wallets</Link>
            <Link to="/astro/transactions" className={astroBtn}>Payments</Link>
            <Link to="/astro/payouts" className={astroBtn}>Payouts</Link>
            <Link to="/astro/invoices" className={astroBtn}>Invoices</Link>
            <Link to="/astro/ratings" className={astroBtn}>Reviews</Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
