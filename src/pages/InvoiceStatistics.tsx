import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  InvoiceAlert,
  InvoiceCoverageRing,
  InvoiceLoading,
  InvoicePageHeader,
  InvoiceScopeToggle,
  InvoiceSectionCard,
  InvoiceStatCard,
  invoiceCard,
} from '../components/invoices/invoiceUi';
import { ApiError } from '../services/api/base';
import {
  AdminInvoiceStats,
  InvoiceScope,
  formatInvoiceINR,
  invoicesAPI,
} from '../services/api/invoices';

export default function InvoiceStatistics() {
  const [scope, setScope] = useState<InvoiceScope>('all');
  const [stats, setStats] = useState<AdminInvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await invoicesAPI.getStats({ scope });
        setStats(res.data);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'Failed to load invoice statistics');
        setStats(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [scope]);

  return (
    <div className="space-y-6">
      <InvoicePageHeader
        title="Invoice statistics"
        description="Track GST invoice coverage, payment volume, and missing PDFs across wallet and astro payments."
        action={<InvoiceScopeToggle scope={scope} onChange={setScope} />}
      />

      {error && <InvoiceAlert type="error" message={error} />}

      {loading ? (
        <InvoiceLoading label="Loading statistics…" />
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <InvoiceCoverageRing
              generated={stats.invoicesGenerated}
              total={stats.totalSuccessfulPayments}
              label="Invoice coverage"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
              <InvoiceStatCard
                label="Successful payments"
                value={stats.totalSuccessfulPayments}
                accent="indigo"
                sub={scope === 'all' ? `${stats.walletPayments} wallet · ${stats.astroPayments} astro` : 'Wallet top-ups only'}
              />
              <InvoiceStatCard label="Unique payers" value={stats.uniquePayers} accent="violet" />
              <InvoiceStatCard label="Missing PDFs" value={stats.invoicesMissing} accent="amber" />
              <InvoiceStatCard label="Total paid amount" value={formatInvoiceINR(stats.totalPaidAmount)} accent="emerald" />
            </div>
          </div>

          {scope === 'all' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className={`${invoiceCard} p-5`}>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Wallet payments</p>
                <p className="mt-2 text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {stats.walletPayments.toLocaleString('en-IN')}
                </p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{
                      width: `${stats.totalSuccessfulPayments > 0 ? (stats.walletPayments / stats.totalSuccessfulPayments) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div className={`${invoiceCard} p-5`}>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Astro bookings</p>
                <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.astroPayments.toLocaleString('en-IN')}
                </p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{
                      width: `${stats.totalSuccessfulPayments > 0 ? (stats.astroPayments / stats.totalSuccessfulPayments) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {stats.invoicesMissing > 0 && (
            <InvoiceSectionCard title="Action needed">
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {stats.invoicesMissing.toLocaleString('en-IN')}
                </span>{' '}
                successful payment{stats.invoicesMissing === 1 ? '' : 's'}{' '}
                {stats.invoicesMissing === 1 ? 'has' : 'have'} no PDF on disk. You can regenerate them from the{' '}
                <Link to="/all-invoices?hasInvoice=false" className="font-medium text-indigo-600 underline dark:text-indigo-400">
                  invoice list
                </Link>
                .
              </p>
            </InvoiceSectionCard>
          )}
        </>
      ) : null}
    </div>
  );
}
