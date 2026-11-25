import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ApiError } from '../../services/api/base';
import {
  astroAPI,
  AstroBooking,
  CancelAstroBookingBody,
  CancelAstroBookingData,
  SetAstrologerFeeBody,
} from '../../services/api/astro';
import CancelBookingModal, {
  formatCancelNotificationSummary,
} from './components/CancelBookingModal';
import AstrologerFeeCard from './components/AstrologerFeeCard';
import { SessionFeedbackCard } from './components/SessionFeedbackCard';
import { useModal } from '../../hooks/useModal';
import {
  AstroAlert,
  AstroAvatar,
  AstroBackLink,
  AstroInfoRow,
  AstroLoading,
  AstroQuickLink,
  AstroSectionCard,
  BookingStatusPill,
  PaymentStatusBadge,
  SessionTypeBadge,
  astroCard,
  formatAstroDate,
  formatINR,
  tdClass,
  thClass,
  EndedByText,
} from './components/astroUi';

const TERMINAL_CANCEL_STATUSES = new Set([
  'cancelled',
  'canceled',
  'rejected',
  'completed',
  'ended',
  'expired',
]);

function canAdminCancel(booking: AstroBooking): boolean {
  const statuses = [booking.displayStatus, booking.status]
    .filter(Boolean)
    .map((s) => s.toLowerCase().trim());
  return statuses.every((s) => !TERMINAL_CANCEL_STATUSES.has(s));
}

function normalizeCancelResponse(
  data: CancelAstroBookingData | AstroBooking
): { booking: AstroBooking; meta?: CancelAstroBookingData } {
  if (data && typeof data === 'object' && 'booking' in data && data.booking) {
    return { booking: data.booking, meta: data };
  }
  const booking = data as AstroBooking;
  const maybeMeta = data as CancelAstroBookingData;
  const hasNotify =
    maybeMeta.notifications != null ||
    maybeMeta.sendResults != null ||
    maybeMeta.customer != null ||
    maybeMeta.astrologer != null;
  return {
    booking,
    meta: hasNotify ? { ...maybeMeta, booking } : undefined,
  };
}

function formatDuration(start: string | null, end: string | null): string | null {
  if (!start || !end) return null;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms <= 0) return null;
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function TimelineStep({
  label,
  value,
  active,
  done,
}: {
  label: string;
  value: string;
  active?: boolean;
  done?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`h-3 w-3 rounded-full ring-4 ${
            active
              ? 'bg-violet-500 ring-violet-200 dark:ring-violet-900/50'
              : done
                ? 'bg-brand-500 ring-brand-200 dark:ring-brand-900/50'
                : 'bg-gray-300 ring-gray-100 dark:bg-gray-600 dark:ring-gray-800'
          }`}
        />
        <div className="mt-1 w-px flex-1 bg-gray-200 dark:bg-gray-700 last:hidden" />
      </div>
      <div className="pb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function PartyCard({
  role,
  name,
  photo,
  mobile,
  profileLink,
}: {
  role: string;
  name: string;
  photo?: string | null;
  mobile?: string | null;
  profileLink: string;
}) {
  return (
    <div className={`${astroCard} p-5`}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {role}
      </p>
      <div className="flex items-center gap-4">
        <AstroAvatar name={name} photo={photo} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold text-gray-900 dark:text-white">{name}</p>
          {mobile && (
            <p className="mt-0.5 font-mono text-sm text-gray-500 dark:text-gray-400">{mobile}</p>
          )}
          <Link
            to={profileLink}
            className="mt-2 inline-flex text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            View profile →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AstroBookingDetailPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const cancelModal = useModal();
  const [booking, setBooking] = useState<AstroBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadBooking = async (id: number) => {
    const res = await astroAPI.getBooking(id);
    setBooking(res.data);
  };

  useEffect(() => {
    if (!bookingId) return;
    void (async () => {
      try {
        setLoading(true);
        await loadBooking(Number(bookingId));
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'Failed to load booking');
      } finally {
        setLoading(false);
      }
    })();
  }, [bookingId]);

  const handleCancel = async (body: CancelAstroBookingBody) => {
    if (!booking) return;
    const res = await astroAPI.cancelBooking(booking.bookingId, body);
    const { booking: updated, meta } = normalizeCancelResponse(res.data);
    setBooking(updated);
    const notifySummary = formatCancelNotificationSummary(meta);
    setSuccess(
      notifySummary
        ? `Booking cancelled. ${notifySummary}`
        : res.message ?? 'Booking cancelled and parties notified.'
    );
    return meta;
  };

  const handleFeeChange = async (body: SetAstrologerFeeBody) => {
    if (!booking) return;
    const res = await astroAPI.setBookingAstrologerFee(booking.bookingId, body);
    await loadBooking(booking.bookingId);
    setSuccess(res.message ?? (body.free ? 'Astrologer fee marked as free.' : 'Astrologer fee restored.'));
  };

  if (loading) return <AstroLoading label="Loading booking…" />;

  if (!booking) {
    return (
      <div className="space-y-4">
        <AstroBackLink to="/astro/bookings">Back to bookings</AstroBackLink>
        <AstroAlert type="error" message={error ?? 'Booking not found'} />
      </div>
    );
  }

  const duration = formatDuration(booking.startDateTime, booking.endDateTime);
  const isCall = booking.sessionType === 1;
  const payable = booking.payment?.payableAmount ?? (booking.payment
    ? booking.payment.amount + (booking.payment.gstAmount ?? 0)
    : null);
  const transactions = booking.transactions ?? (booking.payment ? [booking.payment] : []);
  const statusNorm = booking.displayStatus.toLowerCase();
  const isActive = statusNorm === 'active' || statusNorm === 'started';
  const isCompleted = statusNorm === 'completed' || statusNorm === 'ended';
  const showCancel = canAdminCancel(booking);
  const cancelledByServer =
    booking.isCancelledByServer === true ||
    booking.isCancelledByServer === 1;

  return (
    <div className="space-y-6">
      <AstroBackLink to="/astro/bookings">Back to bookings</AstroBackLink>

      {success && (
        <AstroAlert type="success" message={success} onDismiss={() => setSuccess(null)} />
      )}
      {error && booking && (
        <AstroAlert type="error" message={error} onDismiss={() => setError(null)} />
      )}

      {/* Hero */}
      <div className={`${astroCard} overflow-hidden`}>
        <div
          className={`relative px-6 py-8 sm:px-8 ${
            isCall
              ? 'bg-gradient-to-br from-sky-600 via-sky-700 to-indigo-800'
              : 'bg-gradient-to-br from-violet-600 via-purple-700 to-fuchsia-800'
          }`}
        >
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <SessionTypeBadge type={booking.sessionType} />
                <BookingStatusPill status={booking.displayStatus} />
                {cancelledByServer && (
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                    Cancelled by server
                  </span>
                )}
                {booking.payment && (
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium capitalize text-white backdrop-blur-sm">
                    {booking.payment.status}
                  </span>
                )}
              </div>
              <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
                Booking #{booking.bookingId}
              </h1>
              <p className="mt-1 text-sm text-white/80">
                Requested {formatAstroDate(booking.requestDateTime)}
                {duration && ` · ${duration} session`}
              </p>
              {booking.sessionId && (
                <p className="mt-2 font-mono text-xs text-white/60 break-all">{booking.sessionId}</p>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-stretch gap-2 self-start sm:items-end sm:self-auto">
              {payable != null && (
                <div className="rounded-xl bg-white/15 px-5 py-3 text-right backdrop-blur-sm">
                  <p className="text-xs text-white/70">Amount paid</p>
                  <p className="text-2xl font-bold text-white">{formatINR(payable)}</p>
                </div>
              )}
              {showCancel && (
                <button
                  type="button"
                  onClick={cancelModal.openModal}
                  className="rounded-lg border border-white/30 bg-red-500/80 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-red-600"
                >
                  Cancel booking
                </button>
              )}
            </div>
          </div>
        </div>

        {booking.remark && (
          <div className="border-t border-brand-100 px-6 py-4 dark:border-brand-900/40">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Remark
            </p>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{booking.remark}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          {/* Parties */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {booking.user ? (
              <PartyCard
                role="Customer"
                name={booking.user.userName}
                photo={booking.user.profilePhoto}
                mobile={booking.user.mobileNo}
                profileLink={`/astro/users/${booking.user.userId}`}
              />
            ) : (
              <div className={`${astroCard} p-5 text-sm text-gray-500`}>No customer data</div>
            )}
            {booking.astrologer ? (
              <PartyCard
                role="Astrologer"
                name={booking.astrologer.astrologerName}
                photo={booking.astrologer.profilePhoto}
                profileLink={`/astro/astrologers/${booking.astrologer.astrologerId}`}
              />
            ) : (
              <div className={`${astroCard} p-5 text-sm text-gray-500`}>No astrologer assigned</div>
            )}
          </div>

          {/* Timeline */}
          <AstroSectionCard title="Session timeline" description="Request through completion">
            <div className="pl-1">
              <TimelineStep
                label="Requested"
                value={formatAstroDate(booking.requestDateTime)}
                done
              />
              <TimelineStep
                label="Scheduled start"
                value={formatAstroDate(booking.startDateTime)}
                done={Boolean(booking.startDateTime)}
                active={isActive}
              />
              <TimelineStep
                label="Ended"
                value={formatAstroDate(booking.endDateTime)}
                done={Boolean(booking.endDateTime)}
                active={isCompleted}
              />
              {duration && (
                <div className="ml-6 rounded-lg bg-brand-50 px-4 py-2 text-sm text-brand-800 dark:bg-brand-950/30 dark:text-brand-300">
                  Session duration: <strong>{duration}</strong>
                </div>
              )}
            </div>
          </AstroSectionCard>

          {/* Birth details */}
          {booking.userBirthDetails && (
            <AstroSectionCard
              title="Birth details"
              description="From customer profile — for support reference"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-4 dark:border-brand-900/40 dark:bg-brand-950/20">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Date of birth</p>
                  <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {booking.userBirthDetails.dob ?? '—'}
                  </p>
                </div>
                <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-4 dark:border-brand-900/40 dark:bg-brand-950/20">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Birth place</p>
                  <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {booking.userBirthDetails.birthPlace ?? '—'}
                  </p>
                </div>
                <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-4 dark:border-brand-900/40 dark:bg-brand-950/20">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Birth time</p>
                  <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {booking.userBirthDetails.birthTime ?? '—'}
                  </p>
                </div>
              </div>
            </AstroSectionCard>
          )}

          {/* Payment */}
          {(booking.payment || transactions.length > 0) && (
            <div className={`${astroCard} overflow-hidden`}>
              <div className="border-b border-brand-100 px-5 py-4 dark:border-brand-900/40">
                <h3 className="font-semibold text-gray-900 dark:text-white">Payment</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Razorpay booking transaction</p>
              </div>
              {booking.payment && (
                <div className="border-b border-brand-50 px-5 py-4 dark:border-brand-900/20">
                  <div className="flex flex-wrap items-center gap-3">
                    <PaymentStatusBadge status={booking.payment.status} />
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatINR(payable ?? booking.payment.amount)}
                    </span>
                    {booking.payment.gstAmount > 0 && (
                      <span className="text-sm text-gray-500">
                        incl. GST {formatINR(booking.payment.gstAmount)}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <AstroInfoRow label="Order ID" value={booking.payment.orderId} mono />
                    <AstroInfoRow label="Payment ID" value={booking.payment.paymentId ?? '—'} mono />
                    <AstroInfoRow label="Paid at" value={formatAstroDate(booking.payment.paidAt)} />
                    <AstroInfoRow
                      label="Transaction"
                      value={
                        <Link
                          to={`/astro/transactions/${booking.payment.transactionId}`}
                          className="text-brand-600 hover:underline dark:text-brand-400"
                        >
                          #{booking.payment.transactionId}
                        </Link>
                      }
                    />
                  </div>
                </div>
              )}
              {transactions.length > 1 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-brand-50/50 dark:bg-brand-950/20">
                      <tr>
                        <th className={thClass}>Attempt</th>
                        <th className={thClass}>Order</th>
                        <th className={thClass}>Amount</th>
                        <th className={thClass}>Status</th>
                        <th className={thClass}>Paid</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-50 dark:divide-brand-900/20">
                      {transactions.map((tx) => (
                        <tr key={tx.transactionId}>
                          <td className={tdClass}>
                            <Link
                              to={`/astro/transactions/${tx.transactionId}`}
                              className="text-brand-600 hover:underline dark:text-brand-400"
                            >
                              #{tx.transactionId}
                            </Link>
                          </td>
                          <td className={`${tdClass} font-mono text-xs`}>{tx.orderId}</td>
                          <td className={tdClass}>
                            {formatINR(tx.payableAmount ?? tx.amount)}
                          </td>
                          <td className={tdClass}>
                            <PaymentStatusBadge status={tx.status} />
                          </td>
                          <td className={tdClass}>{formatAstroDate(tx.paidAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <AstroSectionCard title="Booking summary">
            <div>
              <AstroInfoRow label="Booking ID" value={`#${booking.bookingId}`} mono />
              <AstroInfoRow label="Status" value={<BookingStatusPill status={booking.displayStatus} />} />
              <AstroInfoRow label="Session" value={<SessionTypeBadge type={booking.sessionType} />} />
              <AstroInfoRow label="DB status" value={<BookingStatusPill status={booking.status} />} />
              {cancelledByServer && (
                <AstroInfoRow label="Cancel source" value="Admin / server" />
              )}
              {duration && <AstroInfoRow label="Duration" value={duration} />}
              {isCompleted && (
                <AstroInfoRow label="Ended by" value={<EndedByText endedBy={booking.endedBy} endReason={booking.endReason} />} />
              )}
            </div>
          </AstroSectionCard>

          <SessionFeedbackCard feedback={booking.feedback} />

          <AstrologerFeeCard
            fee={booking.astrologerFee}
            subject={`booking #${booking.bookingId}`}
            onChange={handleFeeChange}
          />

          {showCancel && (
            <AstroSectionCard
              title="Admin actions"
              description="Cancel notifies both parties. Refunds are a separate Razorpay flow."
            >
              <button
                type="button"
                onClick={cancelModal.openModal}
                className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Cancel booking
              </button>
            </AstroSectionCard>
          )}

          <AstroSectionCard title="Quick links">
            <div className="space-y-2">
              {booking.user && (
                <AstroQuickLink
                  to={`/astro/users/${booking.user.userId}`}
                  label="Customer profile"
                  description={booking.user.userName}
                />
              )}
              {booking.astrologer && (
                <AstroQuickLink
                  to={`/astro/astrologers/${booking.astrologer.astrologerId}`}
                  label="Astrologer profile"
                  description={booking.astrologer.astrologerName}
                />
              )}
              {booking.payment && (
                <>
                  <AstroQuickLink
                    to={`/astro/transactions/${booking.payment.transactionId}`}
                    label="Payment details"
                    description={booking.payment.orderId}
                  />
                  <AstroQuickLink
                    to={`/astro/invoices?search=${encodeURIComponent(booking.payment.orderId)}`}
                    label="GST invoice"
                    description="View or download PDF"
                  />
                </>
              )}
              <AstroQuickLink
                to="/astro/bookings"
                label="All bookings"
                description="Back to list"
              />
            </div>
          </AstroSectionCard>
        </div>
      </div>

      <CancelBookingModal
        isOpen={cancelModal.isOpen}
        bookingId={booking.bookingId}
        onClose={cancelModal.closeModal}
        onCancel={handleCancel}
      />
    </div>
  );
}
