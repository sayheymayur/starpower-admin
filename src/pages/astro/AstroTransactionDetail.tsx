import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ApiError } from '../../services/api/base';
import { astroFinanceAPI, AstroTransaction } from '../../services/api/astroFinance';
import {
  AstroAlert,
  AstroPageHeader,
  PaymentStatusBadge,
  SessionTypeBadge,
  astroBtnOutline,
  astroCard,
  formatAstroDate,
  formatINR,
} from './components/astroUi';

export default function AstroTransactionDetail() {
  const { transactionId } = useParams<{ transactionId: string }>();
  const [tx, setTx] = useState<AstroTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!transactionId) return;
    void (async () => {
      try {
        setLoading(true);
        const res = await astroFinanceAPI.getTransaction(Number(transactionId));
        setTx(res.data);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'Failed to load transaction');
      } finally {
        setLoading(false);
      }
    })();
  }, [transactionId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="space-y-4">
        {error && <AstroAlert type="error" message={error} />}
        <Link to="/astro/transactions" className={astroBtnOutline}>← Back to payments</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AstroPageHeader
        title={`Transaction #${tx.transactionId}`}
        description={tx.orderId}
        action={
          <Link to="/astro/transactions" className={astroBtnOutline}>← All payments</Link>
        }
      />

      {error && <AstroAlert type="error" message={error} onDismiss={() => setError(null)} />}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className={`${astroCard} p-5 space-y-4`}>
          <h3 className="font-semibold text-gray-900 dark:text-white">Payment</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-gray-500">Status</dt>
              <dd className="mt-0.5"><PaymentStatusBadge status={tx.status} /></dd>
            </div>
            <div>
              <dt className="text-gray-500">Payable</dt>
              <dd className="font-semibold">{formatINR(tx.payableAmount)}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Base amount</dt>
              <dd>{formatINR(tx.amount)}</dd>
            </div>
            <div>
              <dt className="text-gray-500">GST</dt>
              <dd>{formatINR(tx.gstAmount)}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Payment ID</dt>
              <dd className="font-mono text-xs break-all">{tx.paymentId ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Paid at</dt>
              <dd>{formatAstroDate(tx.paidAt)}</dd>
            </div>
            {tx.refundAmount != null && (
              <>
                <div>
                  <dt className="text-gray-500">Refund</dt>
                  <dd>{formatINR(tx.refundAmount)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Refunded at</dt>
                  <dd>{formatAstroDate(tx.refundAt)}</dd>
                </div>
              </>
            )}
          </dl>
        </div>

        <div className={`${astroCard} p-5 space-y-4`}>
          <h3 className="font-semibold text-gray-900 dark:text-white">Parties</h3>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-gray-500">User</dt>
              <dd>
                <Link to={`/astro/users/${tx.userId}`} className="text-brand-600 hover:underline dark:text-brand-400">
                  {tx.userName ?? `User ${tx.userId}`}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Astrologer</dt>
              <dd>
                <Link to={`/astro/astrologers/${tx.astrologerId}`} className="text-brand-600 hover:underline dark:text-brand-400">
                  {tx.astrologerName ?? `Astrologer ${tx.astrologerId}`}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Booking</dt>
              <dd>
                <Link to={`/astro/bookings/${tx.bookingId}`} className="text-brand-600 hover:underline dark:text-brand-400">
                  #{tx.bookingId}
                </Link>
                {tx.sessionType && (
                  <span className="ml-2"><SessionTypeBadge type={tx.sessionType} /></span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Created</dt>
              <dd>{formatAstroDate(tx.createdAt)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {tx.pricingDetails && (
        <div className={`${astroCard} p-5`}>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Pricing details</h3>
          <pre className="overflow-x-auto rounded-lg bg-gray-50 p-3 text-xs dark:bg-gray-800">
            {JSON.stringify(tx.pricingDetails, null, 2)}
          </pre>
        </div>
      )}

      <div className="flex gap-3">
        <Link to={`/astro/invoices?search=${tx.orderId}`} className={astroBtnOutline}>
          View invoice
        </Link>
      </div>
    </div>
  );
}
