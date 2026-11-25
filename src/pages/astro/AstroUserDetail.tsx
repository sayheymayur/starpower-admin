import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ApiError } from '../../services/api/base';
import { astroAPI, AstroUserDetail as UserDetail } from '../../services/api/astro';
import DeleteWithForceModal from './components/DeleteWithForceModal';
import EditAstroUserModal from './components/EditAstroUserModal';
import {
  AstroAlert,
  AstroAvatar,
  AstroBackLink,
  AstroInfoRow,
  AstroLoading,
  AstroQuickLink,
  AstroSectionCard,
  AstroStatCard,
  AstroStatusBadge,
  BookingStatusPill,
  PaymentStatusBadge,
  SessionTypeBadge,
  astroCard,
  formatAstroDate,
  formatINR,
  tdClass,
  thClass,
} from './components/astroUi';
import { useModal } from '../../hooks/useModal';
import { UserRatingsCard } from './components/SessionFeedbackCard';

export default function AstroUserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const deleteModal = useModal();
  const editModal = useModal();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    void (async () => {
      try {
        setLoading(true);
        const res = await astroAPI.getUser(Number(userId));
        setUser(res.data);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'Failed to load user');
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (loading) return <AstroLoading label="Loading user profile…" />;

  if (!user) {
    return (
      <div className="space-y-4">
        <AstroBackLink to="/astro/users">Back to users</AstroBackLink>
        <AstroAlert type="error" message={error ?? 'User not found'} />
      </div>
    );
  }

  const isActive = user.status === 1;
  const hasBirthProfile = Boolean(user.astroProfile);
  const recentBookings = user.recentBookings ?? [];
  const completedRecent = recentBookings.filter(
    (b) => b.displayStatus.toLowerCase() === 'completed'
  ).length;
  const totalPaid = recentBookings.reduce(
    (sum, b) => sum + (b.payment?.status === 'success' ? (b.payment.amount + (b.payment.gstAmount ?? 0)) : 0),
    0
  );

  return (
    <div className="space-y-6">
      <AstroBackLink to="/astro/users">Back to users</AstroBackLink>

      {success && (
        <AstroAlert type="success" message={success} onDismiss={() => setSuccess(null)} />
      )}
      {error && !loading && user && (
        <AstroAlert type="error" message={error} onDismiss={() => setError(null)} />
      )}

      {/* Hero */}
      <div className={`${astroCard} overflow-hidden`}>
        <div className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 px-6 py-8 sm:px-8">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0ySDEyVjIyaDEydi0ySDI0di0ySDM2di0ySDQ4djJIMzZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <AstroAvatar name={user.fullName} photo={user.profilePhoto} size="xl" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-white sm:text-3xl">{user.fullName}</h1>
                  <AstroStatusBadge active={isActive} />
                  {hasBirthProfile ? (
                    <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                      Birth profile
                    </span>
                  ) : (
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/70 backdrop-blur-sm">
                      Bookings only
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sky-100/90">
                  User #{user.userId}
                  {user.username && ` · @${user.username}`}
                </p>
                <p className="mt-0.5 font-mono text-sm text-sky-200/80">{user.mobileNo}</p>
                {user.email && (
                  <p className="mt-0.5 text-sm text-sky-200/70">{user.email}</p>
                )}
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={editModal.openModal}
                className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                Edit profile
              </button>
              <button
                type="button"
                onClick={deleteModal.openModal}
                className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:border-red-400/50 hover:bg-red-500/80"
              >
                Delete user
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AstroStatCard label="Total bookings" value={user.bookingCount} />
        <AstroStatCard
          label="Birth profile"
          value={hasBirthProfile ? 'Yes' : 'No'}
          accent={hasBirthProfile ? 'brand' : 'amber'}
        />
        <AstroStatCard
          label="Last booking"
          value={user.lastBookingAt ? formatAstroDate(user.lastBookingAt) : '—'}
          accent="sky"
        />
        <AstroStatCard
          label="Recent spend"
          value={totalPaid > 0 ? formatINR(totalPaid) : '—'}
          sub="From recent sessions"
          accent="amber"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <AstroSectionCard title="Contact & account">
              <div>
                <AstroInfoRow label="Phone" value={user.mobileNo} mono />
                <AstroInfoRow label="Email" value={user.email ?? '—'} />
                <AstroInfoRow label="Username" value={user.username ? `@${user.username}` : '—'} />
                <AstroInfoRow label="Gender" value={user.gender ?? '—'} />
                <AstroInfoRow label="User ID" value={user.userId} mono />
                <AstroInfoRow
                  label="Account status"
                  value={<AstroStatusBadge active={isActive} />}
                />
                <AstroInfoRow
                  label="Last booking"
                  value={formatAstroDate(user.lastBookingAt)}
                />
              </div>
            </AstroSectionCard>

            <AstroSectionCard
              title="Astro birth profile"
              description={hasBirthProfile ? 'Used for session charts' : 'Not set up yet'}
            >
              {user.astroProfile ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3 dark:border-sky-900/40 dark:bg-sky-950/20">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Date of birth</p>
                      <p className="mt-0.5 font-semibold text-gray-900 dark:text-white">
                        {user.astroProfile.dob ?? '—'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3 dark:border-sky-900/40 dark:bg-sky-950/20">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Birth place</p>
                      <p className="mt-0.5 font-semibold text-gray-900 dark:text-white">
                        {user.astroProfile.birthPlace ?? '—'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3 dark:border-sky-900/40 dark:bg-sky-950/20">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Birth time</p>
                      <p className="mt-0.5 font-semibold text-gray-900 dark:text-white">
                        {user.astroProfile.birthTime ?? '—'}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Profile since {formatAstroDate(user.astroProfile.createdAt)}
                    {user.astroProfile.astroUserId != null && (
                      <> · Astro user #{user.astroProfile.astroUserId}</>
                    )}
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No birth profile on file
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    This user may have booked without completing their chart details.
                  </p>
                </div>
              )}
            </AstroSectionCard>
          </div>

          {/* Recent bookings */}
          <div className={`${astroCard} overflow-hidden`}>
            <div className="flex items-center justify-between border-b border-brand-100 px-5 py-4 dark:border-brand-900/40">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Recent bookings</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Latest sessions with astrologers
                  {recentBookings.length > 0 && ` · ${completedRecent} completed in view`}
                </p>
              </div>
              <Link
                to={`/astro/bookings?search=${encodeURIComponent(user.fullName)}`}
                className="rounded-md border border-brand-300 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50 dark:border-brand-700 dark:text-brand-400 dark:hover:bg-brand-950/30"
              >
                All bookings
              </Link>
            </div>

            {recentBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-brand-50/50 dark:bg-brand-950/20">
                    <tr>
                      <th className={thClass}>Booking</th>
                      <th className={thClass}>Astrologer</th>
                      <th className={thClass}>Type</th>
                      <th className={thClass}>Status</th>
                      <th className={thClass}>Payment</th>
                      <th className={thClass}>Scheduled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-50 dark:divide-brand-900/20">
                    {recentBookings.map((b) => (
                      <tr
                        key={b.bookingId}
                        className="transition-colors hover:bg-brand-50/40 dark:hover:bg-brand-950/10"
                      >
                        <td className={tdClass}>
                          <Link
                            to={`/astro/bookings/${b.bookingId}`}
                            className="font-medium text-brand-600 hover:underline dark:text-brand-400"
                          >
                            #{b.bookingId}
                          </Link>
                        </td>
                        <td className={tdClass}>
                          {b.astrologer ? (
                            <Link
                              to={`/astro/astrologers/${b.astrologer.astrologerId}`}
                              className="hover:text-brand-700 hover:underline dark:hover:text-brand-400"
                            >
                              {b.astrologer.astrologerName}
                            </Link>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className={tdClass}>
                          <SessionTypeBadge type={b.sessionType} />
                        </td>
                        <td className={tdClass}>
                          <BookingStatusPill status={b.displayStatus} />
                        </td>
                        <td className={tdClass}>
                          <div className="space-y-0.5">
                            <PaymentStatusBadge status={b.payment?.status} />
                            {b.payment?.status === 'success' && (
                              <p className="text-xs text-gray-500">
                                {formatINR(b.payment.amount + (b.payment.gstAmount ?? 0))}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className={tdClass}>{formatAstroDate(b.startDateTime)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-5 py-12 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">No bookings yet</p>
                <Link
                  to="/astro/bookings"
                  className="mt-2 inline-block text-sm text-brand-600 hover:underline dark:text-brand-400"
                >
                  Browse all bookings
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <AstroSectionCard title="Activity snapshot">
            <div className="space-y-4">
              <div>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Bookings</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {user.bookingCount}
                  </span>
                </div>
                {user.bookingCount > 0 && recentBookings.length > 0 && (
                  <>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-500"
                        style={{
                          width: `${Math.min(100, Math.round((completedRecent / recentBookings.length) * 100))}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      {completedRecent} of {recentBookings.length} recent sessions completed
                    </p>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-sky-100 p-3 dark:border-sky-900/40">
                  <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                    {user.bookingCount}
                  </p>
                  <p className="text-xs text-gray-500">Bookings</p>
                </div>
                <div className="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                  <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                    {hasBirthProfile ? '✓' : '—'}
                  </p>
                  <p className="text-xs text-gray-500">Profile</p>
                </div>
              </div>
            </div>
          </AstroSectionCard>

          <UserRatingsCard userId={user.userId} />

          <AstroSectionCard title="Quick links">
            <div className="space-y-2">
              <AstroQuickLink
                to={`/astro/bookings?search=${encodeURIComponent(user.mobileNo)}`}
                label="User's bookings"
                description="Filter by phone"
              />
              <AstroQuickLink
                to={`/astro/ratings?astroUserId=${user.userId}`}
                label="Reviews & feedback"
                description="Ratings given and received"
              />
              <AstroQuickLink
                to={`/astro/transactions?userId=${user.userId}`}
                label="Payments"
                description="Booking transactions"
              />
              <AstroQuickLink
                to={`/astro/invoices?userId=${user.userId}`}
                label="GST invoices"
                description="Download PDFs"
              />
              <AstroQuickLink
                to={`/astro/notifications/user/${user.userId}`}
                label="Push notifications"
                description="Send history for this user"
              />
              <AstroQuickLink
                to="/astro/users"
                label="All users"
                description="Back to list"
              />
            </div>
          </AstroSectionCard>
        </div>
      </div>

      <EditAstroUserModal
        open={editModal.isOpen}
        user={user}
        onClose={editModal.closeModal}
        onSaved={(updated, message) => {
          setUser(updated);
          setSuccess(message);
          setError(null);
        }}
        onError={setError}
      />

      <DeleteWithForceModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        title="Delete astro user"
        label={user.fullName}
        onDelete={async (force) => {
          await astroAPI.deleteUser(user.userId, force);
          navigate('/astro/users');
        }}
      />
    </div>
  );
}
