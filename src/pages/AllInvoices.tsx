import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import AdminInvoicePdfPreview from '../components/invoices/AdminInvoicePdfPreview';
import {
  InvoiceAlert,
  InvoiceEmptyState,
  InvoiceLoading,
  InvoicePageHeader,
  InvoicePaginationBar,
  InvoiceScopeToggle,
  InvoiceSearchField,
  InvoiceSectionCard,
  InvoiceSourceBadge,
  InvoiceStatCard,
  PdfStatusBadge,
  invoiceBtn,
  invoiceBtnOutlineSm,
  invoiceBtnSm,
  invoiceCard,
  invoiceInput,
  tdClass,
  thClass,
} from '../components/invoices/invoiceUi';
import { ApiError } from '../services/api/base';
import {
  AdminInvoiceItem,
  AdminInvoiceMonth,
  AdminInvoicePagination,
  AdminInvoiceStats,
  InvoiceScope,
  InvoiceSource,
  formatInvoiceINR,
  invoicesAPI,
} from '../services/api/invoices';
import { formatLocalDate } from '../utils/dateUtils';

function StatIcons() {
  return {
    payments: (
      <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    generated: (
      <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    missing: (
      <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    revenue: (
      <svg className="h-5 w-5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };
}

export default function AllInvoices() {
  const icons = StatIcons();
  const [searchParams] = useSearchParams();
  const [scope, setScope] = useState<InvoiceScope>('all');
  const [stats, setStats] = useState<AdminInvoiceStats | null>(null);
  const [items, setItems] = useState<AdminInvoiceItem[]>([]);
  const [pagination, setPagination] = useState<AdminInvoicePagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState(() => searchParams.get('search') ?? '');
  const [sourceFilter, setSourceFilter] = useState<'' | InvoiceSource>('');
  const [hasInvoice, setHasInvoice] = useState(() => searchParams.get('hasInvoice') ?? '');
  const [page, setPage] = useState(1);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<AdminInvoiceItem | null>(null);

  const [months, setMonths] = useState<AdminInvoiceMonth[]>([]);
  const [monthsLoading, setMonthsLoading] = useState(false);
  const [monthsYear, setMonthsYear] = useState('');
  const [selectedMonths, setSelectedMonths] = useState<Set<string>>(new Set());
  const [bulkDownloading, setBulkDownloading] = useState<string | null>(null);

  const loadMonths = useCallback(async () => {
    try {
      setMonthsLoading(true);
      const res = await invoicesAPI.getMonths({
        scope,
        year: monthsYear ? Number(monthsYear) : undefined,
      });
      setMonths(res.data.months);
      setSelectedMonths(new Set());
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load invoice months');
    } finally {
      setMonthsLoading(false);
    }
  }, [scope, monthsYear]);

  useEffect(() => {
    void loadMonths();
  }, [loadMonths]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, listRes] = await Promise.all([
        invoicesAPI.getStats({ scope }),
        invoicesAPI.list({
          page,
          limit: 20,
          scope,
          source: sourceFilter || undefined,
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
        return (
          nextItems.find(
            (item) =>
              item.source === current.source && item.transactionId === current.transactionId
          ) ?? current
        );
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [page, search, hasInvoice, scope, sourceFilter]);

  useEffect(() => {
    void load();
  }, [load]);

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
        await invoicesAPI.downloadBulk({ scope, month: monthKeys[0] });
      } else {
        await invoicesAPI.downloadBulk({ scope, months: monthKeys });
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

  const formatMonthLabel = (m: AdminInvoiceMonth) => {
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

  const downloadInvoice = async (source: InvoiceSource, transactionId: number, orderId: string) => {
    try {
      const blob = await invoicesAPI.download(source, transactionId);
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

  const regenerate = async (source: InvoiceSource, transactionId: number) => {
    const key = `${source}:${transactionId}`;
    try {
      setRegenerating(key);
      setError(null);
      await invoicesAPI.regenerate(source, transactionId);
      setSuccess(`Invoice regenerated for ${source} transaction #${transactionId}`);
      void load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Regenerate failed');
    } finally {
      setRegenerating(null);
    }
  };

  const changeScope = (next: InvoiceScope) => {
    setScope(next);
    setPage(1);
    setSourceFilter('');
  };

  const coveragePct =
    stats && stats.totalSuccessfulPayments > 0
      ? Math.round((stats.invoicesGenerated / stats.totalSuccessfulPayments) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <InvoicePageHeader
        title="GST Invoices"
        description="Manage wallet top-up and astro booking GST invoices — preview PDFs, regenerate missing files, and export monthly ZIP archives."
        action={<InvoiceScopeToggle scope={scope} onChange={changeScope} />}
      />

      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <InvoiceStatCard
            label="Successful payments"
            value={stats.totalSuccessfulPayments}
            accent="indigo"
            icon={icons.payments}
            sub={scope === 'all' ? `${stats.walletPayments} wallet · ${stats.astroPayments} astro` : undefined}
          />
          <InvoiceStatCard
            label="PDFs generated"
            value={stats.invoicesGenerated}
            accent="emerald"
            icon={icons.generated}
            sub={`${coveragePct}% coverage`}
          />
          <InvoiceStatCard
            label="Missing PDFs"
            value={stats.invoicesMissing}
            accent="amber"
            icon={icons.missing}
          />
          <InvoiceStatCard
            label="Total paid"
            value={formatInvoiceINR(stats.totalPaidAmount)}
            accent="violet"
            icon={icons.revenue}
            sub={`${stats.uniquePayers.toLocaleString('en-IN')} unique payers`}
          />
        </div>
      )}

      {error && <InvoiceAlert type="error" message={error} onDismiss={() => setError(null)} />}
      {success && <InvoiceAlert type="success" message={success} onDismiss={() => setSuccess(null)} />}

      <InvoiceSectionCard
        title="Download by month"
        description="Select one or more months to export invoice PDFs as a ZIP archive."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={monthsYear}
              onChange={(e) => setMonthsYear(e.target.value)}
              className={invoiceInput}
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
                className={invoiceBtn}
              >
                {bulkDownloading ? 'Downloading…' : `Download ${selectedMonths.size} month${selectedMonths.size === 1 ? '' : 's'}`}
              </button>
            )}
          </div>
        }
        noPadding
      >
        {monthsLoading ? (
          <InvoiceLoading label="Loading months…" />
        ) : months.length === 0 ? (
          <InvoiceEmptyState title="No invoice months available" description="Months appear once successful payments exist." />
        ) : (
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
            {months.map((m) => {
              const coverage = m.paymentCount > 0 ? Math.round((m.invoiceCount / m.paymentCount) * 100) : 0;
              const selected = selectedMonths.has(m.month);
              return (
                <div
                  key={m.month}
                  className={`rounded-2xl border p-4 transition ${
                    selected
                      ? 'border-indigo-300 bg-indigo-50/60 shadow-sm dark:border-indigo-700 dark:bg-indigo-950/20'
                      : 'border-gray-200 bg-gray-50/50 hover:border-indigo-200 hover:bg-white dark:border-gray-700 dark:bg-gray-800/40 dark:hover:border-indigo-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleMonth(m.month)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{formatMonthLabel(m)}</p>
                        <p className="font-mono text-xs text-gray-400">{m.month}</p>
                      </div>
                    </label>
                    <button
                      type="button"
                      disabled={m.invoiceCount === 0 || bulkDownloading === m.month}
                      onClick={() => void downloadMonthZip([m.month])}
                      className={invoiceBtnOutlineSm}
                    >
                      {bulkDownloading === m.month ? '…' : 'ZIP'}
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Payments</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{m.paymentCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total paid</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{formatInvoiceINR(m.totalAmount)}</p>
                    </div>
                    {scope === 'all' && (
                      <>
                        <div>
                          <p className="text-xs text-gray-500">Wallet</p>
                          <p className="font-medium">{m.walletCount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Astro</p>
                          <p className="font-medium">{m.astroCount}</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-gray-500">{m.invoiceCount} PDFs · {m.missingCount} missing</span>
                      <span className="font-medium text-indigo-600 dark:text-indigo-400">{coverage}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                        style={{ width: `${coverage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </InvoiceSectionCard>

      <InvoiceSectionCard title="Search invoices" description="Filter by order, payment ID, user name, or phone number.">
        <div className="flex flex-wrap items-center gap-3">
          <InvoiceSearchField
            value={search}
            onChange={(value) => { setSearch(value); setPage(1); }}
            placeholder="Order id, payment id, names, phone…"
          />
          {scope === 'all' && (
            <select
              value={sourceFilter}
              onChange={(e) => { setSourceFilter(e.target.value as '' | InvoiceSource); setPage(1); }}
              className={invoiceInput}
            >
              <option value="">All sources</option>
              <option value="wallet">Wallet</option>
              <option value="astro">Astro</option>
            </select>
          )}
          <select
            value={hasInvoice}
            onChange={(e) => { setHasInvoice(e.target.value); setPage(1); }}
            className={invoiceInput}
          >
            <option value="">All PDF states</option>
            <option value="true">PDF exists</option>
            <option value="false">Missing PDF</option>
          </select>
          <button type="button" onClick={() => void load()} className={invoiceBtn}>
            Apply filters
          </button>
        </div>
      </InvoiceSectionCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className={`${invoiceCard} overflow-hidden xl:col-span-3`}>
          <div className="border-b border-indigo-50 px-5 py-4 dark:border-indigo-900/30">
            <h2 className="font-semibold text-gray-900 dark:text-white">Invoice ledger</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Click a row to preview the PDF</p>
          </div>

          {loading ? (
            <InvoiceLoading />
          ) : items.length === 0 ? (
            <InvoiceEmptyState
              title="No invoices found"
              description="Try adjusting your filters or search terms."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-indigo-50 dark:divide-indigo-900/20">
                  <thead className="bg-indigo-50/40 dark:bg-indigo-950/20">
                    <tr>
                      <th className={thClass}>Invoice</th>
                      <th className={thClass}>User</th>
                      <th className={thClass}>Amount</th>
                      <th className={thClass}>PDF</th>
                      <th className={thClass}>Paid</th>
                      <th className={thClass} />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {items.map((inv) => {
                      const regenKey = `${inv.source}:${inv.transactionId}`;
                      const selected =
                        previewInvoice?.source === inv.source &&
                        previewInvoice?.transactionId === inv.transactionId;
                      return (
                        <tr
                          key={`${inv.source}-${inv.transactionId}`}
                          onClick={() => setPreviewInvoice(inv)}
                          className={`cursor-pointer transition ${
                            selected
                              ? 'bg-indigo-50/80 dark:bg-indigo-950/30'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'
                          }`}
                        >
                          <td className={tdClass}>
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="min-w-0">
                                <div className="mb-1 flex flex-wrap items-center gap-2">
                                  <InvoiceSourceBadge source={inv.source} />
                                  {inv.invoiceVoucherNo && (
                                    <span className="rounded-md bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                      {inv.invoiceVoucherNo}
                                    </span>
                                  )}
                                </div>
                                <p className="truncate font-mono text-xs text-gray-900 dark:text-white">{inv.orderId}</p>
                                <p className="text-xs text-gray-400">#{inv.transactionId}</p>
                                {inv.astrologerName && (
                                  <p className="mt-0.5 truncate text-xs text-gray-500">{inv.astrologerName}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className={tdClass}>
                            <Link
                              to={`/enhanced-user-details?userId=${inv.userId}`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                            >
                              {inv.userName}
                            </Link>
                            {inv.userMobileNo && (
                              <p className="text-xs text-gray-400">{inv.userMobileNo}</p>
                            )}
                          </td>
                          <td className={tdClass}>
                            <p className="font-semibold text-gray-900 dark:text-white">{formatInvoiceINR(inv.payableAmount)}</p>
                            <p className="text-xs text-gray-400">incl. GST {formatInvoiceINR(inv.gstAmount)}</p>
                          </td>
                          <td className={tdClass}>
                            <PdfStatusBadge exists={inv.invoice.exists} />
                          </td>
                          <td className={`${tdClass} whitespace-nowrap text-gray-500`}>
                            {inv.paidAt ? formatLocalDate(inv.paidAt) : '—'}
                          </td>
                          <td className={tdClass} onClick={(e) => e.stopPropagation()}>
                            <div className="flex flex-wrap gap-1.5">
                              {inv.invoice.exists && (
                                <button
                                  type="button"
                                  onClick={() => void downloadInvoice(inv.source, inv.transactionId, inv.orderId)}
                                  className={invoiceBtnOutlineSm}
                                >
                                  Download
                                </button>
                              )}
                              {!inv.invoice.exists && inv.status === 'success' && (
                                <button
                                  type="button"
                                  disabled={regenerating === regenKey}
                                  onClick={() => void regenerate(inv.source, inv.transactionId)}
                                  className={invoiceBtnSm}
                                >
                                  {regenerating === regenKey ? '…' : 'Regenerate'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {pagination && pagination.pages > 1 && (
                <InvoicePaginationBar pagination={pagination} onPage={setPage} />
              )}
            </>
          )}
        </div>

        <div className={`${invoiceCard} overflow-hidden xl:col-span-2 xl:sticky xl:top-4 xl:min-h-[680px] xl:self-start`}>
          {previewInvoice ? (
            <AdminInvoicePdfPreview
              invoice={previewInvoice}
              onClose={() => setPreviewInvoice(null)}
              onRegenerate={(source, id) => void regenerate(source, id)}
              regenerating={
                regenerating === `${previewInvoice.source}:${previewInvoice.transactionId}`
              }
            />
          ) : (
            <InvoiceEmptyState
              title="Invoice preview"
              description="Select a row from the ledger to preview the PDF here."
            />
          )}
        </div>
      </div>
    </div>
  );
}
