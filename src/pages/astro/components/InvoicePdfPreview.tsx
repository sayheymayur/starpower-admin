import { useEffect, useState } from 'react';
import { ApiError } from '../../../services/api/base';
import { astroFinanceAPI, AstroInvoiceItem } from '../../../services/api/astroFinance';
import { astroBtnOutlineSm, formatAstroDate, formatINR } from './astroUi';

interface InvoicePdfPreviewProps {
  invoice: AstroInvoiceItem;
  onClose?: () => void;
  onRegenerate?: (transactionId: number) => void;
  regenerating?: boolean;
}

export default function InvoicePdfPreview({
  invoice,
  onClose,
  onRegenerate,
  regenerating,
}: InvoicePdfPreviewProps) {
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
        const blob = await astroFinanceAPI.downloadInvoice(invoice.transactionId);
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
  }, [invoice.transactionId, invoice.invoice.exists]);

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
    <div className="flex h-full min-h-[480px] flex-col">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-brand-100 px-4 py-3 dark:border-brand-900/40">
        <div className="min-w-0">
          <p className="truncate font-mono text-sm font-medium text-gray-900 dark:text-white">
            {invoice.orderId}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            #{invoice.transactionId} · {formatINR(invoice.payableAmount)} · {formatAstroDate(invoice.paidAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {pdfUrl && (
            <>
              <button type="button" onClick={openInTab} className={astroBtnOutlineSm}>
                Open tab
              </button>
              <button type="button" onClick={download} className={astroBtnOutlineSm}>
                Download
              </button>
            </>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close preview"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="relative flex-1 bg-gray-100 dark:bg-gray-950">
        {!invoice.invoice.exists ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">No PDF generated for this payment yet.</p>
            {invoice.status === 'success' && onRegenerate && (
              <button
                type="button"
                disabled={regenerating}
                onClick={() => onRegenerate(invoice.transactionId)}
                className={astroBtnOutlineSm}
              >
                {regenerating ? 'Regenerating…' : 'Regenerate invoice'}
              </button>
            )}
          </div>
        ) : loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            {onRegenerate && (
              <button
                type="button"
                disabled={regenerating}
                onClick={() => onRegenerate(invoice.transactionId)}
                className={astroBtnOutlineSm}
              >
                {regenerating ? 'Regenerating…' : 'Regenerate invoice'}
              </button>
            )}
          </div>
        ) : pdfUrl ? (
          <iframe
            title={`Invoice ${invoice.orderId}`}
            src={pdfUrl}
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : null}
      </div>
    </div>
  );
}
