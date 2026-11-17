import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ApiError } from '../../services/api/base';
import { astroFinanceAPI, AstroPayoutDetailData } from '../../services/api/astroFinance';
import {
  AstroAlert,
  AstroBackLink,
  AstroInfoRow,
  AstroLoading,
  AstroPageHeader,
  AstroSectionCard,
  AstroStatCard,
  formatAstroDate,
  formatCommissionRate,
  formatINR,
  formatPayoutRemark,
} from './components/astroUi';

export default function AstroPayoutDetail() {
  const { payoutId } = useParams<{ payoutId: string }>();
  const [payout, setPayout] = useState<AstroPayoutDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!payoutId) return;
    void (async () => {
      try {
        setLoading(true);
        const res = await astroFinanceAPI.getPayout(Number(payoutId));
        setPayout(res.data);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'Failed to load payout');
      } finally {
        setLoading(false);
      }
    })();
  }, [payoutId]);

  if (loading) return <AstroLoading label="Loading payout…" />;

  if (!payout) {
    return (
      <div className="space-y-4">
        {error && <AstroAlert type="error" message={error} />}
        <AstroBackLink to="/astro/payouts">Back to payouts</AstroBackLink>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AstroPageHeader
        title={`Payout #${payout.payoutId}`}
        description={formatAstroDate(payout.payoutDateTime)}
        action={<AstroBackLink to="/astro/payouts">All payouts</AstroBackLink>}
      />

      {error && <AstroAlert type="error" message={error} onDismiss={() => setError(null)} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AstroStatCard label="Amount paid" value={formatINR(payout.totalAmount)} accent="sky" />
        <AstroStatCard
          label="Pending balance now"
          value={formatINR(payout.earnings?.pendingBalance ?? 0)}
          accent="amber"
        />
        <AstroStatCard
          label="Total earned"
          value={formatINR(payout.earnings?.totalEarned ?? 0)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AstroSectionCard title="Payout record">
          <dl className="divide-y divide-brand-50 dark:divide-brand-900/20">
            <AstroInfoRow
              label="Astrologer"
              value={
                <Link
                  to={`/astro/astrologers/${payout.astrologerUserId}`}
                  className="text-brand-600 hover:underline dark:text-brand-400"
                >
                  {payout.astrologerName ?? `#${payout.astrologerUserId}`}
                </Link>
              }
            />
            <AstroInfoRow label="Phone" value={payout.mobileNo ?? '—'} />
            <AstroInfoRow
              label="Payment reference"
              value={payout.paymentId ?? payout.maskedPaymentId ?? '—'}
              mono
            />
            <AstroInfoRow label="Remark" value={formatPayoutRemark(payout.remark)} />
            <AstroInfoRow label="Recorded at" value={formatAstroDate(payout.createdAt)} />
            <AstroInfoRow
              label="Earnings detail"
              value={
                <Link
                  to={`/astro/payouts/earnings/${payout.astrologerUserId}`}
                  className="text-brand-600 hover:underline dark:text-brand-400"
                >
                  View astrologer earnings →
                </Link>
              }
            />
          </dl>
        </AstroSectionCard>

        {payout.earnings && (
          <AstroSectionCard title="Current earnings snapshot">
            <dl className="divide-y divide-brand-50 dark:divide-brand-900/20">
              <AstroInfoRow
                label="Completed sessions"
                value={String(payout.earnings.completedSessions)}
              />
              <AstroInfoRow
                label="Commission"
                value={formatCommissionRate(payout.earnings.commissionRate)}
              />
              <AstroInfoRow
                label="Total paid out"
                value={formatINR(payout.earnings.totalPaidOut)}
              />
              <AstroInfoRow
                label="Pending balance"
                value={formatINR(payout.earnings.pendingBalance)}
              />
            </dl>
          </AstroSectionCard>
        )}

        {payout.bankDetails && (
          <AstroSectionCard
            title="Bank account"
            action={
              <Link
                to={`/astro/banks/${payout.astrologerUserId}`}
                className="text-sm text-brand-600 hover:underline dark:text-brand-400"
              >
                Manage bank →
              </Link>
            }
          >
            <dl className="divide-y divide-brand-50 dark:divide-brand-900/20">
              <AstroInfoRow label="Account holder" value={payout.bankDetails.fullName ?? '—'} />
              <AstroInfoRow
                label="Account no."
                value={payout.bankDetails.accountNo ?? '—'}
                mono
              />
              <AstroInfoRow label="IFSC" value={payout.bankDetails.ifscCode ?? '—'} mono />
            </dl>
          </AstroSectionCard>
        )}
      </div>
    </div>
  );
}
