import { useEffect, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router';
import AdminInvoicePdfPreview from '../components/invoices/AdminInvoicePdfPreview';
import {
  InvoiceAlert,
  InvoiceBackLink,
  InvoiceLoading,
  InvoicePageHeader,
  InvoiceSectionCard,
  InvoiceSourceBadge,
  PdfStatusBadge,
  invoiceBtn,
  invoiceBtnOutline,
  invoiceCard,
} from '../components/invoices/invoiceUi';
import { ApiError } from '../services/api/base';
import {
  AdminInvoiceItem,
  InvoiceSource,
  formatInvoiceINR,
  invoicesAPI,
} from '../services/api/invoices';
import { formatLocalDate } from '../utils/dateUtils';

export default function InvoiceDetails() {
  const [searchParams] = useSearchParams();
  const userIdParam = searchParams.get('userId');
  const orderIdParam = searchParams.get('orderId');
  const sourceParam = searchParams.get('source') as InvoiceSource | null;
  const transactionIdParam = searchParams.get('transactionId');

  const [invoice, setInvoice] = useState<AdminInvoiceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        setError(null);

        if (sourceParam && transactionIdParam) {
          const res = await invoicesAPI.get(sourceParam, Number(transactionIdParam));
          setInvoice(res.data);
          return;
        }

        if (!orderIdParam) {
          throw new Error('Order ID or source + transaction ID required');
        }

        const res = await invoicesAPI.list({
          search: orderIdParam,
          userId: userIdParam ? Number(userIdParam) : undefined,
          limit: 5,
        });

        const match =
          res.data.find((item) => item.orderId === orderIdParam) ?? res.data[0] ?? null;

        if (!match) {
          throw new Error('Invoice not found for this order');
        }

        setInvoice(match);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Failed to load invoice');
        setInvoice(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [userIdParam, orderIdParam, sourceParam, transactionIdParam]);

  const download = async () => {
    if (!invoice) return;
    try {
      const blob = await invoicesAPI.download(invoice.source, invoice.transactionId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${invoice.orderId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Download failed');
    }
  };

  const regenerate = async () => {
    if (!invoice) return;
    try {
      setRegenerating(true);
      setError(null);
      await invoicesAPI.regenerate(invoice.source, invoice.transactionId);
      const res = await invoicesAPI.get(invoice.source, invoice.transactionId);
      setInvoice(res.data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Regenerate failed');
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <InvoiceBackLink>Back to invoices</InvoiceBackLink>

      <InvoicePageHeader
        title="Invoice details"
        description={orderIdParam ? `Order ${orderIdParam}` : 'View payment and PDF details for a single invoice.'}
      />

      {error && <InvoiceAlert type="error" message={error} />}

      {loading ? (
        <InvoiceLoading label="Loading invoice…" />
      ) : invoice ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <div className="space-y-6 xl:col-span-2">
            <InvoiceSectionCard title="Payment summary" noPadding>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                <InfoRow label="Source" value={<InvoiceSourceBadge source={invoice.source} />} />
                <InfoRow label="Transaction" value={`#${invoice.transactionId}`} mono />
                <InfoRow label="Order ID" value={invoice.orderId} mono />
                <InfoRow label="Payment ID" value={invoice.paymentId ?? '—'} mono />
                <InfoRow label="User" value={`${invoice.userName} (#${invoice.userId})`} />
                <InfoRow label="Phone" value={invoice.userMobileNo ?? '—'} />
                <InfoRow label="Amount" value={formatInvoiceINR(invoice.payableAmount)} />
                <InfoRow label="GST" value={formatInvoiceINR(invoice.gstAmount)} />
                <InfoRow label="Paid at" value={invoice.paidAt ? formatLocalDate(invoice.paidAt) : '—'} />
                {invoice.astrologerName && <InfoRow label="Astrologer" value={invoice.astrologerName} />}
                {invoice.invoiceVoucherNo && <InfoRow label="Voucher" value={invoice.invoiceVoucherNo} mono />}
                <InfoRow label="PDF status" value={<PdfStatusBadge exists={invoice.invoice.exists} />} />
              </div>
            </InvoiceSectionCard>

            <div className={`${invoiceCard} flex flex-wrap gap-3 p-5`}>
              {invoice.invoice.exists && (
                <button type="button" onClick={() => void download()} className={invoiceBtn}>
                  Download PDF
                </button>
              )}
              {!invoice.invoice.exists && invoice.status === 'success' && (
                <button
                  type="button"
                  disabled={regenerating}
                  onClick={() => void regenerate()}
                  className={invoiceBtn}
                >
                  {regenerating ? 'Regenerating…' : 'Regenerate PDF'}
                </button>
              )}
              <Link
                to={`/all-invoices?search=${encodeURIComponent(invoice.orderId)}`}
                className={invoiceBtnOutline}
              >
                View in ledger
              </Link>
            </div>
          </div>

          <div className={`${invoiceCard} min-h-[640px] overflow-hidden xl:col-span-3`}>
            <AdminInvoicePdfPreview
              invoice={invoice}
              onRegenerate={() => void regenerate()}
              regenerating={regenerating}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-3.5">
      <span className="shrink-0 text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span
        className={`text-right text-sm font-medium text-gray-900 dark:text-white ${
          mono ? 'font-mono text-xs' : ''
        }`}
      >
        {value}
      </span>
    </div>
  );
}
