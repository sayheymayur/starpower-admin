import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ApiError } from '../../services/api/base';
import {
  astroFinanceAPI,
  AstroInvoiceItem,
  AstroInvoiceMonth,
  AstroInvoiceStats,
} from '../../services/api/astroFinance';
import type { AstroPagination } from '../../services/api/astro';
import Badge from '../../components/ui/badge';
import {
  AstroAlert,
  AstroPageHeader,
  AstroPaginationBar,
  AstroStatCard,
  PaymentStatusBadge,
  astroBtn,
  astroBtnOutline,
  astroBtnOutlineSm,
  astroCard,
  formatAstroDate,
  formatINR,
  thClass,
  tdClass,
} from './components/astroUi';
import InvoicePdfPreview from './components/InvoicePdfPreview';

export default function AstroInvoices() {
  const [stats, setStats] = useState<AstroInvoiceStats | null>(null);
  const [items, setItems] = useState<AstroInvoiceItem[]>([]);
  const [pagination, setPagination] = useState<AstroPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [hasInvoice, setHasInvoice] = useState<string>('');
  const [page, setPage] = useState(1);
  const [regenerating, setRegenerating] = useState<number | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<AstroInvoiceItem | null>(null);
  const [months, setMonths] = useState<AstroInvoiceMonth[]>([]);
  const [monthsLoading, setMonthsLoading] = useState(false);
  const [monthsYear, setMonthsYear] = useState('');
  const [selectedMonths, setSelectedMonths] = useState<Set<string>>(new Set());
  const [bulkDownloading, setBulkDownloading] = useState<string | null>(null);

  const loadMonths = useCallback(async () => {
    try {
      setMonthsLoading(true);
      const res = await astroFinanceAPI.getInvoiceMonths({
        year: monthsYear ? Number(monthsYear) : undefined,
      });
      setMonths(res.data.months);
      setSelectedMonths(new Set());
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load invoice months');
    } finally {
      setMonthsLoading(false);
    }
  }, [monthsYear]);

  useEffect(() => {
    void loadMonths();
  }, [loadMonths]);

  const toggleMonth = (month: string) => {
    setSelectedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(month)) next.delete(month);
      else next.add(month);
      return next;
    });
  };

  const downloadMonthZip = async (monthKeys: string[]) => {
    if (monthKeys.length === 0) return;
    const key = monthKeys.join(',');
    try {
      setBulkDownloading(key);
      setError(null);
      if (monthKeys.length === 1) {
        await astroFinanceAPI.downloadInvoicesBulk({ month: monthKeys[0] });
      } else {
        await astroFinanceAPI.downloadInvoicesBulk({ months: monthKeys });
      }
      setSuccess(
        monthKeys.length === 1
          ? `Downloaded invoices for ${monthKeys[0]}`
          : `Downloaded invoices for ${monthKeys.length} months`
      );
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Bulk download failed');
    } finally {
      setBulkDownloading(null);
    }
  };

  const formatMonthLabel = (m: AstroInvoiceMonth) => {
    const date = new Date(m.year, m.monthNumber - 1, 1);
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  const yearOptions = (() => {
    const current = new Date().getFullYear();
    const years = new Set<number>();
    for (let y = current; y >= current - 5; y -= 1) years.add(y);
    months.forEach((m) => years.add(m.year));
    return [...years].sort((a, b) => b - a);
  })();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, listRes] = await Promise.all([
        astroFinanceAPI.getInvoiceStats(),
        astroFinanceAPI.listInvoices({
          page,
          limit: 20,
          search: search || undefined,
          hasInvoice: hasInvoice || undefined,
        }),
      ]);
      setStats(statsRes.data);
      const nextItems = listRes.data;
      setItems(nextItems);
      setPagination(listRes.pagination);
      setPreviewInvoice((current) => {
        if (!current) return current;
        return nextItems.find((item) => item.transactionId === current.transactionId) ?? current;
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [page, search, hasInvoice]);

  useEffect(() => {
    void load();
  }, [load]);

  const downloadInvoice = async (transactionId: number, orderId: string) => {
    try {
      const blob = await astroFinanceAPI.downloadInvoice(transactionId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${orderId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Download failed');
    }
  };

  const regenerate = async (transactionId: number) => {
    try {
      setRegenerating(transactionId);
      setError(null);
      await astroFinanceAPI.regenerateInvoice(transactionId);
      setSuccess(`Invoice regenerated for transaction #${transactionId}`);
      void load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Regenerate failed');
    } finally {
      setRegenerating(null);
    }
  };

  return (
    <div className="space-y-6">
      <AstroPageHeader
        title="GST Invoices"
        description="PDF invoices for successful booking payments."
      />

      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AstroStatCard label="Successful payments" value={stats.totalSuccessfulPayments} />
          <AstroStatCard label="Invoices generated" value={stats.invoicesGenerated} />
          <AstroStatCard
            label="Missing PDFs"
            value={stats.invoicesMissing}
            accent="amber"
          />
          <AstroStatCard label="Total paid" value={formatINR(stats.totalPaidAmount)} accent="sky" />
        </div>
      )}

      {error && <AstroAlert type="error" message={error} onDismiss={() => setError(null)} />}
      {success && <AstroAlert type="success" message={success} onDismiss={() => setSuccess(null)} />}

      <div className={`${astroCard} p-4`}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Download by month</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ZIP archives of generated invoice PDFs per calendar month
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={monthsYear}
              onChange={(e) => setMonthsYear(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All years</option>
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            {selectedMonths.size > 0 && (
              <button
                type="button"
                disabled={bulkDownloading !== null}
                onClick={() => void downloadMonthZip([...selectedMonths].sort())}
                className={astroBtn}
              >
                {bulkDownloading ? 'Downloading…' : `Download ${selectedMonths.size} month${selectedMonths.size === 1 ? '' : 's'}`}
              </button>
            )}
          </div>
        </div>

        {monthsLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          </div>
        ) : months.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">No invoice months available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-brand-100 dark:divide-brand-900/40">
              <thead className="bg-brand-50/50 dark:bg-brand-950/20">
                <tr>
                  <th className={`${thClass} w-10`}>
                    <span className="sr-only">Select</span>
                  </th>
                  <th className={thClass}>Month</th>
                  <th className={thClass}>Payments</th>
                  <th className={thClass}>PDFs</th>
                  <th className={thClass}>Missing</th>
                  <th className={thClass}>Total paid</th>
                  <th className={thClass}></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-50 dark:divide-brand-900/20">
                {months.map((m) => (
                  <tr key={m.month} className="hover:bg-brand-50/30 dark:hover:bg-brand-950/10">
                    <td className={tdClass}>
                      <input
                        type="checkbox"
                        checked={selectedMonths.has(m.month)}
                        onChange={() => toggleMonth(m.month)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </td>
                    <td className={tdClass}>
                      <span className="font-medium text-gray-900 dark:text-white">{formatMonthLabel(m)}</span>
                      <p className="font-mono text-xs text-gray-400">{m.month}</p>
                    </td>
                    <td className={tdClass}>{m.paymentCount}</td>
                    <td className={tdClass}>{m.invoiceCount}</td>
                    <td className={tdClass}>
                      {m.missingCount > 0 ? (
                        <Badge color="warning" size="sm">{m.missingCount}</Badge>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    <td className={tdClass}>{formatINR(m.totalAmount)}</td>
                    <td className={tdClass}>
                      <button
                        type="button"
                        disabled={m.invoiceCount === 0 || bulkDownloading === m.month}
                        onClick={() => void downloadMonthZip([m.month])}
                        className={astroBtnOutlineSm}
                      >
                        {bulkDownloading === m.month ? '…' : 'Download ZIP'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={`${astroCard} p-4`}>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Order id, payment id, names…"
            className="flex-1 min-w-[200px] rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          <select
            value={hasInvoice}
            onChange={(e) => { setHasInvoice(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">All invoices</option>
            <option value="true">PDF exists</option>
            <option value="false">Missing PDF</option>
          </select>
          <button onClick={() => void load()} className={astroBtnOutline}>Search</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className={`${astroCard} overflow-hidden`}>
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-brand-100 dark:divide-brand-900/40">
                <thead className="bg-brand-50/50 dark:bg-brand-950/20">
                  <tr>
                    <th className={thClass}>Order</th>
                    <th className={thClass}>User</th>
                    <th className={thClass}>Astrologer</th>
                    <th className={thClass}>Amount</th>
                    <th className={thClass}>Status</th>
                    <th className={thClass}>Invoice</th>
                    <th className={thClass}>Paid</th>
                    <th className={thClass}></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-50 dark:divide-brand-900/20">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-500">
                        No invoices found
                      </td>
                    </tr>
                  ) : (
                    items.map((inv) => (
                      <tr
                        key={inv.transactionId}
                        onClick={() => setPreviewInvoice(inv)}
                        className={`cursor-pointer hover:bg-brand-50/30 dark:hover:bg-brand-950/10 ${
                          previewInvoice?.transactionId === inv.transactionId
                            ? 'bg-brand-50/60 dark:bg-brand-950/30'
                            : ''
                        }`}
                      >
                        <td className={tdClass}>
                          <span className="font-mono text-xs">{inv.orderId}</span>
                          <p className="text-xs text-gray-400">#{inv.transactionId}</p>
                        </td>
                        <td className={tdClass}>
                          <Link to={`/astro/users/${inv.userId}`} className="text-brand-600 hover:underline dark:text-brand-400">
                            {inv.userName}
                          </Link>
                        </td>
                        <td className={tdClass}>{inv.astrologerName}</td>
                        <td className={tdClass}>{formatINR(inv.payableAmount)}</td>
                        <td className={tdClass}><PaymentStatusBadge status={inv.status} /></td>
                        <td className={tdClass}>
                          {inv.invoice.exists ? (
                            <Badge color="success" size="sm">PDF ready</Badge>
                          ) : (
                            <Badge color="warning" size="sm">Missing</Badge>
                          )}
                        </td>
                        <td className={tdClass}>{formatAstroDate(inv.paidAt)}</td>
                        <td className={tdClass} onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setPreviewInvoice(inv)}
                              className={astroBtnOutlineSm}
                            >
                              Preview
                            </button>
                            {inv.invoice.exists && (
                              <button
                                type="button"
                                onClick={() => void downloadInvoice(inv.transactionId, inv.orderId)}
                                className="text-sm text-brand-600 hover:underline dark:text-brand-400"
                              >
                                Download
                              </button>
                            )}
                            {!inv.invoice.exists && inv.status === 'success' && (
                              <button
                                type="button"
                                disabled={regenerating === inv.transactionId}
                                onClick={() => void regenerate(inv.transactionId)}
                                className={astroBtn}
                              >
                                {regenerating === inv.transactionId ? '…' : 'Regenerate'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {pagination && <AstroPaginationBar pagination={pagination} onPage={setPage} />}
          </>
        )}
        </div>

        <div className={`${astroCard} overflow-hidden xl:sticky xl:top-4 xl:self-start xl:min-h-[640px]`}>
          {previewInvoice ? (
            <InvoicePdfPreview
              invoice={previewInvoice}
              onClose={() => setPreviewInvoice(null)}
              onRegenerate={(id) => void regenerate(id)}
              regenerating={regenerating === previewInvoice.transactionId}
            />
          ) : (
            <div className="flex min-h-[480px] flex-col items-center justify-center gap-2 p-8 text-center text-gray-500 dark:text-gray-400">
              <svg className="h-12 w-12 text-brand-300 dark:text-brand-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Invoice preview</p>
              <p className="text-xs">Select a row or click Preview to view the PDF</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
