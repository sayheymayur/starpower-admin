import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ApiError } from '../../services/api/base';
import { astroFinanceAPI, AstroEarningsDetail } from '../../services/api/astroFinance';
import RecordPayoutModal from './components/RecordPayoutModal';
import RecordEarningsAdjustmentModal from './components/RecordEarningsAdjustmentModal';
import { FreeFeeBadge } from './components/AstrologerFeeCard';
import {
  AstroAlert,
  AstroBackLink,
  AstroInfoRow,
  AstroLoading,
  AstroPageHeader,
  AstroSectionCard,
  AstroStatCard,
  SessionTypeBadge,
  astroBtn,
  astroBtnOutlineSm,
  astroCard,
  formatAstroDate,
  formatCommissionRate,
  formatINR,
  formatPayoutRemark,
  thClass,
  tdClass,
} from './components/astroUi';

export default function AstroEarningsDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const [detail, setDetail] = useState<AstroEarningsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [adjustmentOpen, setAdjustmentOpen] = useState<'add' | 'deduct' | null>(null);
  const [prefillBookingId, setPrefillBookingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await astroFinanceAPI.getEarningsDetail(Number(userId));
      setDetail(res.data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load earnings detail');
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <AstroLoading label="Loading earnings…" />;

  if (!detail) {
    return (
      <div className="space-y-4">
        {error && <AstroAlert type="error" message={error} />}
        <AstroBackLink to="/astro/payouts">Back to payouts</AstroBackLink>
      </div>
    );
  }

  const { earnings, bankDetails } = detail;
  const totalAdjustments = earnings.totalAdjustments ?? 0;
  const effectiveTotalEarned = earnings.effectiveTotalEarned ?? earnings.totalEarned;
  const adjustmentHistory = detail.adjustmentHistory ?? [];
  const overpaid = earnings.overpaidAmount ?? 0;
  const freeSessions = earnings.freeSessions ?? 0;

  return (
    <div className="space-y-6">
      <AstroPageHeader
        title={detail.fullName ?? `Astrologer #${detail.astrologerUserId}`}
        description={`${detail.mobileNo ?? '—'} · ${formatCommissionRate(earnings.commissionRate)} commission on pre-GST session amount`}
        action={
          <div className="flex flex-wrap gap-2">
            <AstroBackLink to="/astro/payouts">All payouts</AstroBackLink>
            <button
              type="button"
              onClick={() => {
                setPrefillBookingId(null);
                setAdjustmentOpen('add');
              }}
              className={astroBtnOutlineSm}
            >
              Add adjustment
            </button>
            <button
              type="button"
              onClick={() => {
                setPrefillBookingId(null);
                setAdjustmentOpen('deduct');
              }}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              Deduct adjustment
            </button>
            {earnings.pendingBalance > 0 && (
              <button type="button" onClick={() => setPayoutOpen(true)} className={astroBtn}>
                Record payout
              </button>
            )}
          </div>
        }
      />

      {error && <AstroAlert type="error" message={error} onDismiss={() => setError(null)} />}
      {success && <AstroAlert type="success" message={success} onDismiss={() => setSuccess(null)} />}

      {overpaid > 0 && (
        <AstroAlert
          type="error"
          message={`Overpaid by ${formatINR(overpaid)}: a session fee was marked free after it was paid out. New payouts are blocked until future earnings offset this amount.`}
        />
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <AstroStatCard
          label="Sessions"
          value={earnings.totalSessions ?? earnings.completedSessions}
          sub={freeSessions > 0 ? `${freeSessions} free` : undefined}
        />
        <AstroStatCard label="Session earnings" value={formatINR(earnings.totalEarned)} accent="sky" />
        <AstroStatCard
          label="Adjustments"
          value={formatINR(totalAdjustments)}
          accent={totalAdjustments < 0 ? 'amber' : totalAdjustments > 0 ? 'brand' : undefined}
        />
        <AstroStatCard label="Paid out" value={formatINR(earnings.totalPaidOut)} />
        <AstroStatCard
          label="Pending balance"
          value={formatINR(earnings.pendingBalance)}
          accent="amber"
          sub={overpaid > 0 ? `Overpaid ${formatINR(overpaid)}` : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AstroSectionCard title="Earnings breakdown">
          <dl className="divide-y divide-brand-50 dark:divide-brand-900/20">
            <AstroInfoRow
              label="Session earnings"
              value={formatINR(earnings.totalEarned)}
            />
            <AstroInfoRow
              label="Admin adjustments"
              value={
                <span
                  className={
                    totalAdjustments < 0
                      ? 'text-red-600 dark:text-red-400'
                      : totalAdjustments > 0
                        ? 'text-brand-600 dark:text-brand-400'
                        : ''
                  }
                >
                  {formatINR(totalAdjustments)}
                </span>
              }
            />
            <AstroInfoRow
              label="Effective total earned"
              value={formatINR(effectiveTotalEarned)}
            />
            <AstroInfoRow label="Paid out" value={formatINR(earnings.totalPaidOut)} />
            {freeSessions > 0 && (
              <AstroInfoRow
                label="Free sessions"
                value={
                  <span className="inline-flex items-center gap-2">
                    <FreeFeeBadge /> {freeSessions}
                    {(earnings.waivedAmount ?? 0) > 0 && (
                      <span className="text-xs text-gray-500">
                        (waived {formatINR(earnings.waivedAmount ?? 0)})
                      </span>
                    )}
                  </span>
                }
              />
            )}
            {overpaid > 0 && (
              <AstroInfoRow
                label="Overpaid (carried forward)"
                value={<span className="text-red-600 dark:text-red-400">{formatINR(overpaid)}</span>}
              />
            )}
            <AstroInfoRow
              label="Pending balance"
              value={formatINR(earnings.pendingBalance)}
            />
            <AstroInfoRow label="Pre-GST collected" value={formatINR(earnings.totalPaidExGst)} />
            <AstroInfoRow
              label="Avg earning / session"
              value={formatINR(earnings.averageSessionEarning)}
            />
            <AstroInfoRow
              label="Commission rate"
              value={formatCommissionRate(earnings.commissionRate)}
            />
            <AstroInfoRow label="Last payout" value={formatAstroDate(detail.lastPayoutAt)} />
          </dl>
        </AstroSectionCard>

        <AstroSectionCard
          title="Bank account"
          description="Transfer destination before recording payout"
          action={
            <Link
              to={`/astro/banks/${detail.astrologerUserId}`}
              className={astroBtnOutlineSm}
            >
              {bankDetails ? 'Edit bank' : 'Add bank'}
            </Link>
          }
        >
          {bankDetails ? (
            <dl className="divide-y divide-brand-50 dark:divide-brand-900/20">
              <AstroInfoRow label="Account holder" value={bankDetails.fullName ?? '—'} />
              <AstroInfoRow label="Account no." value={bankDetails.accountNo ?? '—'} mono />
              <AstroInfoRow label="IFSC" value={bankDetails.ifscCode ?? '—'} mono />
              <AstroInfoRow label="MICR" value={bankDetails.micr ?? '—'} />
            </dl>
          ) : (
            <p className="text-sm text-amber-700 dark:text-amber-400">
              No bank details on file. Add bank account before transferring funds.
            </p>
          )}
        </AstroSectionCard>
      </div>

      <AstroSectionCard
        title="Recent completed sessions"
        description="Paid sessions contribute to earnings; sessions marked Free earn nothing"
      >
        {detail.recentCompletedSessions.length === 0 ? (
          <p className="text-sm text-gray-500">No completed sessions yet.</p>
        ) : (
          <div className={`${astroCard} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-brand-100 dark:divide-brand-900/40">
                <thead className="bg-brand-50/50 dark:bg-brand-950/20">
                  <tr>
                    <th className={thClass}>Booking</th>
                    <th className={thClass}>Type</th>
                    <th className={thClass}>User</th>
                    <th className={thClass}>Ended</th>
                    <th className={thClass}>Pre-GST</th>
                    <th className={thClass}>Earning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-50 dark:divide-brand-900/20">
                  {detail.recentCompletedSessions.map((s) => (
                    <tr key={`${s.kind ?? 'booking'}-${s.bookingId ?? s.sessionId}`}>
                      <td className={tdClass}>
                        {s.kind === 'instant' || s.bookingId == null ? (
                          <Link
                            to={`/astro/instant-sessions/${encodeURIComponent(s.sessionId ?? '')}`}
                            className="font-mono text-xs text-brand-600 hover:underline dark:text-brand-400"
                          >
                            Instant
                          </Link>
                        ) : (
                          <Link
                            to={`/astro/bookings/${s.bookingId}`}
                            className="font-mono text-xs text-brand-600 hover:underline dark:text-brand-400"
                          >
                            #{s.bookingId}
                          </Link>
                        )}
                      </td>
                      <td className={tdClass}>
                        {s.sessionType === 1 || s.sessionType === 2 ? (
                          <SessionTypeBadge type={s.sessionType} />
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className={tdClass}>{s.userName}</td>
                      <td className={tdClass}>{formatAstroDate(s.endDateTime)}</td>
                      <td className={tdClass}>{formatINR(s.paidAmountExGst)}</td>
                      <td className={tdClass}>
                        <div className="flex flex-wrap items-center gap-2">
                          {s.isFree ? (
                            <>
                              <FreeFeeBadge source={s.freeSource} />
                              <span>{formatINR(0)}</span>
                              {s.waivedAmount != null && s.waivedAmount > 0 && (
                                <span className="text-xs text-gray-500 line-through">
                                  {formatINR(s.waivedAmount)}
                                </span>
                              )}
                            </>
                          ) : (
                            <span>{formatINR(s.earning)}</span>
                          )}
                          {!s.isFree && s.kind !== 'instant' && s.bookingId != null && (
                          <button
                            type="button"
                            onClick={() => {
                              setPrefillBookingId(s.bookingId);
                              setAdjustmentOpen('deduct');
                            }}
                            className="text-xs text-red-600 hover:underline dark:text-red-400"
                            title="Deduct this session's earning"
                          >
                            Deduct
                          </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </AstroSectionCard>

      <AstroSectionCard title="Payout history" description="Completed transfers recorded in admin">
        {detail.payoutHistory.length === 0 ? (
          <p className="text-sm text-gray-500">No payouts recorded yet.</p>
        ) : (
          <div className={`${astroCard} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-brand-100 dark:divide-brand-900/40">
                <thead className="bg-brand-50/50 dark:bg-brand-950/20">
                  <tr>
                    <th className={thClass}>Date</th>
                    <th className={thClass}>Amount</th>
                    <th className={thClass}>Reference</th>
                    <th className={thClass}>Remark</th>
                    <th className={thClass}></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-50 dark:divide-brand-900/20">
                  {detail.payoutHistory.map((p) => (
                    <tr key={p.payoutId}>
                      <td className={tdClass}>{formatAstroDate(p.payoutDateTime)}</td>
                      <td className={tdClass}>{formatINR(p.totalAmount)}</td>
                      <td className={`${tdClass} font-mono text-xs`}>
                        {p.paymentId ?? p.maskedPaymentId ?? '—'}
                      </td>
                      <td className={tdClass}>{formatPayoutRemark(p.remark)}</td>
                      <td className={tdClass}>
                        <Link
                          to={`/astro/payouts/${p.payoutId}`}
                          className="text-sm text-brand-600 hover:underline dark:text-brand-400"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </AstroSectionCard>

      <AstroSectionCard
        title="Adjustment history"
        description="Admin add/deduct credits and clawbacks"
      >
        {adjustmentHistory.length === 0 ? (
          <p className="text-sm text-gray-500">No adjustments recorded yet.</p>
        ) : (
          <div className={`${astroCard} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-brand-100 dark:divide-brand-900/40">
                <thead className="bg-brand-50/50 dark:bg-brand-950/20">
                  <tr>
                    <th className={thClass}>Date</th>
                    <th className={thClass}>Direction</th>
                    <th className={thClass}>Type</th>
                    <th className={thClass}>Amount</th>
                    <th className={thClass}>Booking</th>
                    <th className={thClass}>Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-50 dark:divide-brand-900/20">
                  {adjustmentHistory.map((a) => (
                    <tr key={a.adjustmentId}>
                      <td className={tdClass}>{formatAstroDate(a.createdAt)}</td>
                      <td className={tdClass}>
                        <span
                          className={
                            a.direction === 'add'
                              ? 'text-brand-700 dark:text-brand-400'
                              : 'text-red-600 dark:text-red-400'
                          }
                        >
                          {a.direction === 'add' ? 'Add' : 'Deduct'}
                        </span>
                      </td>
                      <td className={tdClass}>
                        {a.amountType === 'session' ? 'Session' : 'Custom'}
                      </td>
                      <td className={tdClass}>
                        <span
                          className={
                            a.signedAmount < 0
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-brand-700 dark:text-brand-400'
                          }
                        >
                          {formatINR(a.signedAmount)}
                        </span>
                      </td>
                      <td className={tdClass}>
                        {a.bookingId ? (
                          <Link
                            to={`/astro/bookings/${a.bookingId}`}
                            className="font-mono text-xs text-brand-600 hover:underline dark:text-brand-400"
                          >
                            #{a.bookingId}
                          </Link>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className={tdClass}>{a.remark ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </AstroSectionCard>

      <RecordPayoutModal
        open={payoutOpen}
        onClose={() => setPayoutOpen(false)}
        astrologerUserId={detail.astrologerUserId}
        astrologerName={detail.fullName ?? `Astrologer #${detail.astrologerUserId}`}
        pendingBalance={earnings.pendingBalance}
        onSuccess={(_result, message) => {
          setSuccess(message);
          void load();
        }}
        onError={(message) => setError(message)}
      />

      {adjustmentOpen && (
        <RecordEarningsAdjustmentModal
          open
          onClose={() => {
            setAdjustmentOpen(null);
            setPrefillBookingId(null);
          }}
          astrologerUserId={detail.astrologerUserId}
          astrologerName={detail.fullName ?? `Astrologer #${detail.astrologerUserId}`}
          direction={adjustmentOpen}
          sessions={detail.recentCompletedSessions}
          initialBookingId={prefillBookingId}
          onSuccess={(_result, message) => {
            setSuccess(message);
            setPrefillBookingId(null);
            void load();
          }}
          onError={(message) => setError(message)}
        />
      )}
    </div>
  );
}
