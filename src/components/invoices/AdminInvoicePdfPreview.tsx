import { useEffect, useState } from 'react';
import { ApiError } from '../../services/api/base';
import {
  AdminInvoiceItem,
  InvoiceSource,
  formatInvoiceINR,
  invoicesAPI,
} from '../../services/api/invoices';
import { formatLocalDate } from '../../utils/dateUtils';
import {
  InvoiceSourceBadge,
  PdfStatusBadge,
  invoiceBtn,
  invoiceBtnOutlineSm,
  invoiceBtnSm,
} from './invoiceUi';

interface AdminInvoicePdfPreviewProps {
  invoice: AdminInvoiceItem;
  onClose?: () => void;
  onRegenerate?: (source: InvoiceSource, transactionId: number) => void;
  regenerating?: boolean;
}

export default function AdminInvoicePdfPreview({
  invoice,
  onClose,
  onRegenerate,
  regenerating,
}: AdminInvoicePdfPreviewProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!invoice.invoice.exists) {
      setPdfUrl(null);
      setError(null);
      setLoading(false);
      return;
    }

    let active = true;
    let objectUrl: string | null = null;

    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const blob = await invoicesAPI.download(invoice.source, invoice.transactionId);
        objectUrl = URL.createObjectURL(blob);
        if (active) setPdfUrl(objectUrl);
        else URL.revokeObjectURL(objectUrl);
      } catch (e) {
        if (active) {
          setError(e instanceof ApiError ? e.message : 'Failed to load invoice preview');
          setPdfUrl(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setPdfUrl(null);
    };
  }, [invoice.source, invoice.transactionId, invoice.invoice.exists]);

  const download = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `invoice_${invoice.orderId}.pdf`;
    a.click();
  };

  const openInTab = () => {
    if (!pdfUrl) return;
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex h-full min-h-[520px] flex-col">
      <div className="border-b border-indigo-50 bg-gradient-to-r from-indigo-50/80 via-white to-violet-50/50 px-5 py-4 dark:border-indigo-900/30 dark:from-indigo-950/30 dark:via-gray-900 dark:to-violet-950/20">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <InvoiceSourceBadge source={invoice.source} />
              <PdfStatusBadge exists={invoice.invoice.exists} />
            </div>
            <p className="truncate font-mono text-sm font-semibold text-gray-900 dark:text-white">
              {invoice.orderId}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              #{invoice.transactionId} · {formatInvoiceINR(invoice.payableAmount)} ·{' '}
              {invoice.paidAt ? formatLocalDate(invoice.paidAt) : '—'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {pdfUrl && (
              <>
                <button type="button" onClick={openInTab} className={invoiceBtnOutlineSm}>
                  Open tab
                </button>
                <button type="button" onClick={download} className={invoiceBtnOutlineSm}>
                  Download
                </button>
              </>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-2 py-1 text-sm text-gray-500 transition hover:bg-white/80 dark:hover:bg-gray-800"
                aria-label="Close preview"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="relative flex-1 bg-[linear-gradient(180deg,rgba(99,102,241,0.04),transparent)] dark:bg-gray-950">
        {!invoice.invoice.exists ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 dark:bg-amber-950/30">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">PDF not generated yet</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                This payment succeeded but no invoice file exists on disk.
              </p>
            </div>
            {invoice.status === 'success' && onRegenerate && (
              <button
                type="button"
                disabled={regenerating}
                onClick={() => onRegenerate(invoice.source, invoice.transactionId)}
                className={invoiceBtn}
              >
                {regenerating ? 'Regenerating…' : 'Regenerate invoice'}
              </button>
            )}
          </div>
        ) : loading ? (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            <p className="text-sm text-gray-500">Loading preview…</p>
          </div>
        ) : error ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            {onRegenerate && (
              <button
                type="button"
                disabled={regenerating}
                onClick={() => onRegenerate(invoice.source, invoice.transactionId)}
                className={invoiceBtnSm}
              >
                {regenerating ? 'Regenerating…' : 'Regenerate invoice'}
              </button>
            )}
          </div>
        ) : pdfUrl ? (
          <div className="absolute inset-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
            <iframe
              title={`Invoice ${invoice.orderId}`}
              src={pdfUrl}
              className="h-full w-full border-0"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
