import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ApiError } from '../../services/api/base';
import { astroAPI, AstrologerDetail } from '../../services/api/astro';
import DeleteWithForceModal from './components/DeleteWithForceModal';
import EditAstrologerProfileModal from './components/EditAstrologerProfileModal';
import AadhaarProfileCard from '../../components/aadhaar/AadhaarProfileCard';
import AstrologerVerificationActions from './components/AstrologerVerificationActions';
import {
  AstroAlert,
  AstroAvatar,
  AstroBackLink,
  AstroDocumentsPanel,
  AstroInfoRow,
  AstroLoading,
  AstroQuickLink,
  AstroSectionCard,
  AstroStatCard,
  AstroStatusBadge,
  BookingStatusPill,
  PaymentStatusBadge,
  SessionTypeBadge,
  VerificationBadge,
  TestAstrologerBadge,
  astroBtnOutline,
  astroCard,
  formatAstrologerBookings,
  formatAstroDate,
  formatINR,
  tdClass,
  thClass,
} from './components/astroUi';
import { useModal } from '../../hooks/useModal';

export default function AstroAstrologerDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const deleteModal = useModal();
  const editModal = useModal();
  const [astro, setAstro] = useState<AstrologerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadAstrologer = async (id: number) => {
    const res = await astroAPI.getAstrologer(id);
    setAstro(res.data);
  };

  useEffect(() => {
    if (!userId) return;
    void (async () => {
      try {
        setLoading(true);
        await loadAstrologer(Number(userId));
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'Failed to load astrologer');
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (loading) return <AstroLoading label="Loading astrologer profile…" />;

  if (!astro) {
    return (
      <div className="space-y-4">
        <AstroBackLink to="/astro/astrologers">Back to astrologers</AstroBackLink>
        <AstroAlert type="error" message={error ?? 'Astrologer not found'} />
      </div>
    );
  }

  const isActive = astro.status === 1;
  const completed = astro.stats?.completedBookings ?? 0;
  const total = astro.stats?.totalBookings ?? 0;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <AstroBackLink to="/astro/astrologers">Back to astrologers</AstroBackLink>

      {success && (
        <AstroAlert type="success" message={success} onDismiss={() => setSuccess(null)} />
      )}
      {error && !loading && astro && (
        <AstroAlert type="error" message={error} onDismiss={() => setError(null)} />
      )}

      {/* Profile hero */}
      <div className={`${astroCard} overflow-hidden`}>
        <div className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 px-6 py-8 sm:px-8">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0ySDEyVjIyaDEydi0ySDI0di0ySDM2di0ySDQ4djJIMzZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <AstroAvatar name={astro.fullName} photo={astro.profilePhoto} size="xl" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-white sm:text-3xl">{astro.fullName}</h1>
                  <AstroStatusBadge active={isActive} />
                  <VerificationBadge status={astro.doctorProfileStatus} />
                  <TestAstrologerBadge
                    isTest={astro.isTestAstrologer}
                    viewerCount={astro.testViewerUserIds?.length}
                  />
                </div>
                <p className="mt-1 text-brand-100/90">
                  Astrologer #{astro.astrologerRecordId} · User ID {astro.userId}
                </p>
                <p className="mt-0.5 font-mono text-sm text-brand-200/80">{astro.mobileNo}</p>
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
                className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-red-500/80 hover:border-red-400/50"
              >
                Delete astrologer
              </button>
            </div>
          </div>
        </div>

        {/* Specialities strip */}
        {(astro.specialities?.length ?? 0) > 0 && (
          <div className="border-b border-brand-100 px-6 py-4 dark:border-brand-900/40">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Specialities
            </p>
            <div className="flex flex-wrap gap-2">
              {astro.specialities?.map((s) => (
                <span
                  key={s.id}
                  className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-800 ring-1 ring-brand-200/80 dark:bg-brand-950/40 dark:text-brand-300 dark:ring-brand-800/60"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AstroStatCard
          label="Total bookings"
          value={total}
          sub={`${completed} completed`}
        />
        <AstroStatCard
          label="Completion rate"
          value={`${completionRate}%`}
          accent="sky"
        />
        <AstroStatCard
          label="Experience"
          value={astro.yearsOfExperience != null ? `${astro.yearsOfExperience} yrs` : '—'}
          accent="amber"
        />
        <AstroStatCard
          label="Sessions"
          value={formatAstrologerBookings(astro.stats)}
          sub="completed / total"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left column — profile details */}
        <div className="space-y-6 xl:col-span-2">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <AstroSectionCard title="Contact & account">
              <div>
                <AstroInfoRow label="Phone" value={astro.mobileNo} mono />
                <AstroInfoRow label="Email" value={astro.email ?? '—'} />
                <AstroInfoRow label="Username" value={astro.username ? `@${astro.username}` : '—'} />
                <AstroInfoRow label="User ID" value={astro.userId} mono />
                <AstroInfoRow label="Record ID" value={astro.astrologerRecordId} mono />
                <AstroInfoRow
                  label="Account status"
                  value={<AstroStatusBadge active={isActive} />}
                />
                <AstroInfoRow
                  label="Verification"
                  value={<VerificationBadge status={astro.doctorProfileStatus} />}
                />
                <AstroInfoRow
                  label="Test profile"
                  value={
                    astro.isTestAstrologer ? (
                      <TestAstrologerBadge
                        isTest
                        viewerCount={astro.testViewerUserIds?.length}
                      />
                    ) : (
                      'Public'
                    )
                  }
                />
              </div>
            </AstroSectionCard>

            {astro.isTestAstrologer && (
              <AstroSectionCard title="Test visibility">
                <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                  Hidden from public app lists. Only these app user IDs can see this astrologer.
                </p>
                {(astro.testViewerUserIds?.length ?? 0) > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {astro.testViewerUserIds?.map((id) => (
                      <Link
                        key={id}
                        to={`/enhanced-user-details?userId=${id}`}
                        className="rounded-md bg-violet-50 px-2.5 py-1 font-mono text-xs font-medium text-violet-800 ring-1 ring-violet-200 hover:bg-violet-100 dark:bg-violet-950/40 dark:text-violet-300 dark:ring-violet-800"
                      >
                        {id}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    No viewer user IDs configured — edit profile to add allowlist.
                  </p>
                )}
              </AstroSectionCard>
            )}

            <AstroSectionCard title="Rates & pricing">
              <div>
                <AstroInfoRow
                  label="Call rate"
                  value={
                    astro.callRate != null ? (
                      <span>{formatINR(astro.callRate)}<span className="text-gray-400 font-normal">/min</span></span>
                    ) : (
                      '—'
                    )
                  }
                />
                <AstroInfoRow
                  label="Chat rate"
                  value={
                    astro.chatRate != null ? (
                      <span>{formatINR(astro.chatRate)}<span className="text-gray-400 font-normal">/min</span></span>
                    ) : (
                      '—'
                    )
                  }
                />
                <AstroInfoRow
                  label="Experience"
                  value={
                    astro.yearsOfExperience != null
                      ? `${astro.yearsOfExperience} years`
                      : '—'
                  }
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-brand-50 px-4 py-3 text-center dark:bg-brand-950/30">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Call</p>
                  <p className="mt-0.5 text-lg font-bold text-brand-700 dark:text-brand-400">
                    {astro.callRate != null ? formatINR(astro.callRate) : '—'}
                  </p>
                  <p className="text-[10px] text-gray-400">per minute</p>
                </div>
                <div className="rounded-xl bg-sky-50 px-4 py-3 text-center dark:bg-sky-950/30">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Chat</p>
                  <p className="mt-0.5 text-lg font-bold text-sky-700 dark:text-sky-400">
                    {astro.chatRate != null ? formatINR(astro.chatRate) : '—'}
                  </p>
                  <p className="text-[10px] text-gray-400">per minute</p>
                </div>
              </div>
            </AstroSectionCard>

            <AstroSectionCard title="Bio">
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {astro.bio?.trim() ? astro.bio : 'No bio yet'}
              </p>
            </AstroSectionCard>
          </div>

          <AstroDocumentsPanel documents={astro.documents} variant="astrologer" />

          <AadhaarProfileCard aadhaar={astro.aadhaar} userId={astro.userId} />

          {/* Recent bookings */}
          <div className={`${astroCard} overflow-hidden`}>
            <div className="flex items-center justify-between border-b border-brand-100 px-5 py-4 dark:border-brand-900/40">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Recent bookings</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Latest sessions with this astrologer</p>
              </div>
              <Link to={`/astro/bookings?search=${encodeURIComponent(astro.fullName)}`} className={astroBtnOutline}>
                All bookings
              </Link>
            </div>

            {astro.recentBookings && astro.recentBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-brand-50/50 dark:bg-brand-950/20">
                    <tr>
                      <th className={thClass}>Booking</th>
                      <th className={thClass}>Customer</th>
                      <th className={thClass}>Type</th>
                      <th className={thClass}>Status</th>
                      <th className={thClass}>Payment</th>
                      <th className={thClass}>Scheduled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-50 dark:divide-brand-900/20">
                    {astro.recentBookings.map((b) => (
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
                          {b.user ? (
                            <div>
                              <p className="font-medium">{b.user.userName}</p>
                              {b.user.mobileNo && (
                                <p className="text-xs text-gray-400">{b.user.mobileNo}</p>
                              )}
                            </div>
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
                          <PaymentStatusBadge status={b.payment?.status} />
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

        {/* Right column — verification & quick links */}
        <div className="space-y-6">
          <AstrologerVerificationActions
            userId={astro.userId}
            fullName={astro.fullName}
            doctorProfileStatus={astro.doctorProfileStatus}
            onUpdated={(status) => {
              setAstro((prev) =>
                prev
                  ? {
                      ...prev,
                      doctorProfileStatus: status,
                      status: status === 1 ? 1 : prev.status,
                      documents: prev.documents
                        ? {
                            ...prev.documents,
                            kycStatus: status === 1 ? 1 : status === 2 ? 2 : prev.documents.kycStatus,
                          }
                        : prev.documents,
                    }
                  : prev
              );
              void loadAstrologer(astro.userId);
            }}
          />

          <AstroSectionCard title="Quick actions" description="Finance & feedback">
            <div className="space-y-2">
              <AstroQuickLink
                to={`/astro/payouts/earnings/${astro.userId}`}
                label="Payouts & earnings"
                description="Sessions, bank, and payout history"
              />
              <AstroQuickLink
                to={`/astro/banks/${astro.userId}`}
                label="Bank account"
                description="Payout bank details"
              />
              <AstroQuickLink
                to={`/astro/ratings?astrologerUserId=${astro.userId}`}
                label="Reviews"
                description="Ratings from customers"
              />
              <AstroQuickLink
                to={`/astro/notifications/user/${astro.userId}`}
                label="Push notifications"
                description="Send history & campaigns"
              />
              <AstroQuickLink
                to={`/astro/bookings`}
                label="All bookings"
                description="Filter by this astrologer"
              />
            </div>
          </AstroSectionCard>

          <AstroSectionCard title="Performance snapshot">
            <div className="space-y-4">
              <div>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Completion rate</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{completionRate}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  {completed} of {total} bookings completed
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-lg border border-brand-100 p-3 dark:border-brand-900/40">
                  <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{completed}</p>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
                <div className="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                  <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                    {total - completed}
                  </p>
                  <p className="text-xs text-gray-500">Other</p>
                </div>
              </div>
            </div>
          </AstroSectionCard>

          {(astro.specialities?.length ?? 0) === 0 && (
            <div className={`${astroCard} border-dashed p-5 text-center`}>
              <p className="text-sm text-gray-500 dark:text-gray-400">No specialities listed</p>
            </div>
          )}
        </div>
      </div>

      <EditAstrologerProfileModal
        open={editModal.isOpen}
        astro={astro}
        onClose={editModal.closeModal}
        onSaved={(updated, message) => {
          setAstro(updated);
          setSuccess(message);
          setError(null);
        }}
        onError={setError}
      />

      <DeleteWithForceModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        title="Delete astrologer"
        label={astro.fullName}
        onDelete={async (force) => {
          await astroAPI.deleteAstrologer(astro.userId, force);
          navigate('/astro/astrologers');
        }}
      />
    </div>
  );
}
