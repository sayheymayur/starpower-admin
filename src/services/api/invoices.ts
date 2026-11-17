import { TOKEN_KEY, UNAUTHORIZED_EVENT, authService } from '../auth/dashboardAuth';
import { API_CONFIG } from './config';
import { ApiError } from './base';

export type InvoiceSource = 'wallet' | 'astro';
export type InvoiceScope = 'all' | 'excludeAstro';

export interface AdminInvoiceItem {
  source: InvoiceSource;
  category: 'wallet_topup' | 'astro_booking';
  transactionId: number;
  userId: number;
  userName: string;
  userMobileNo?: string;
  orderId: string;
  paymentId: string | null;
  amount: number;
  gstAmount: number;
  payableAmount: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
  bookingId: number | null;
  astrologerId: number | null;
  astrologerName: string | null;
  invoiceVoucherNo: string | null;
  invoice: {
    filename?: string;
    exists: boolean;
    publicUrl?: string | null;
    downloadPath?: string;
  };
}

export interface AdminInvoiceStats {
  scope: InvoiceScope;
  totalSuccessfulPayments: number;
  walletPayments: number;
  astroPayments: number;
  invoicesGenerated: number;
  invoicesMissing: number;
  totalPaidAmount: number;
  uniquePayers: number;
}

export interface AdminInvoiceMonth {
  month: string;
  year: number;
  monthNumber: number;
  paymentCount: number;
  walletCount: number;
  astroCount: number;
  invoiceCount: number;
  missingCount: number;
  totalAmount: number;
  totalGst: number;
}

export interface AdminInvoicePagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AdminInvoiceListParams {
  page?: number;
  limit?: number;
  scope?: InvoiceScope;
  source?: InvoiceSource;
  userId?: number;
  astrologerId?: number;
  bookingId?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  hasInvoice?: string | boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AdminInvoiceBulkDownloadParams {
  scope?: InvoiceScope;
  month?: string;
  months?: string[];
  dateFrom?: string;
  dateTo?: string;
  userId?: number;
  astrologerId?: number;
  forceZip?: boolean;
}

interface ListResponse {
  success: boolean;
  scope?: InvoiceScope;
  data: AdminInvoiceItem[];
  pagination: AdminInvoicePagination;
}

interface StatsResponse {
  success: boolean;
  data: AdminInvoiceStats;
}

interface DetailResponse {
  success: boolean;
  data: AdminInvoiceItem;
}

interface MonthsResponse {
  success: boolean;
  data: {
    scope?: InvoiceScope;
    months: AdminInvoiceMonth[];
    totalMonths: number;
    downloadPaths?: {
      singleMonth?: string;
      selectedMonths?: string;
    };
  };
}

const BASE = `${API_CONFIG.BASE_URL}/invoices`;

function buildQuery(params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return '';
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    qs.append(k, String(v));
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
}

function filenameFromDisposition(header: string | null): string | null {
  if (!header) return null;
  const match = /filename\*?=(?:UTF-8''|")?([^";]+)/i.exec(header);
  return match?.[1]?.replace(/"/g, '') ?? null;
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function invoicesRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = await res.json().catch(() => ({}));

  if (res.status === 401) {
    authService.handleUnauthorized();
    window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    throw new ApiError('Session expired. Please log in again.', 401, body);
  }

  if (!res.ok || body.success === false) {
    throw new ApiError(body.message ?? `HTTP ${res.status}`, res.status, body);
  }

  return body as T;
}

async function downloadBlob(path: string): Promise<Blob> {
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(err.message ?? 'Download failed', res.status, err);
  }
  return res.blob();
}

async function downloadFile(path: string, fallbackFilename: string) {
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(err.message ?? 'Download failed', res.status, err);
  }
  const blob = await res.blob();
  const filename =
    filenameFromDisposition(res.headers.get('Content-Disposition')) ?? fallbackFilename;
  return { blob, filename };
}

export function formatInvoiceINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export const invoicesAPI = {
  getStats: (params?: { scope?: InvoiceScope }) =>
    invoicesRequest<StatsResponse>(`/stats${buildQuery(params)}`),

  list: (params?: AdminInvoiceListParams) =>
    invoicesRequest<ListResponse>(buildQuery(params as Record<string, string | number | undefined>)),

  get: (source: InvoiceSource, transactionId: number) =>
    invoicesRequest<DetailResponse>(`/${source}/${transactionId}`),

  download: (source: InvoiceSource, transactionId: number) =>
    downloadBlob(`/${source}/${transactionId}/download`),

  getMonths: (params?: {
    scope?: InvoiceScope;
    year?: number;
    userId?: number;
    astrologerId?: number;
  }) => invoicesRequest<MonthsResponse>(`/months${buildQuery(params)}`),

  downloadBulk: async (params: AdminInvoiceBulkDownloadParams) => {
    const qs = new URLSearchParams();
    if (params.scope) qs.set('scope', params.scope);
    if (params.month) qs.set('month', params.month);
    if (params.months?.length) qs.set('months', params.months.join(','));
    if (params.dateFrom) qs.set('dateFrom', params.dateFrom);
    if (params.dateTo) qs.set('dateTo', params.dateTo);
    if (params.userId != null) qs.set('userId', String(params.userId));
    if (params.astrologerId != null) qs.set('astrologerId', String(params.astrologerId));
    if (params.forceZip) qs.set('forceZip', 'true');

    const query = qs.toString();
    const scopePrefix = params.scope === 'excludeAstro' ? 'invoices-non-astro' : 'invoices';
    const fallback =
      params.month
        ? `${scopePrefix}-${params.month}.zip`
        : params.months?.length
          ? `${scopePrefix}-${params.months[0]}_to_${params.months[params.months.length - 1]}.zip`
          : `${scopePrefix}.zip`;

    const { blob, filename } = await downloadFile(
      `/download-all${query ? `?${query}` : ''}`,
      fallback
    );
    triggerBlobDownload(blob, filename);
  },

  regenerate: (source: InvoiceSource, transactionId: number) =>
    invoicesRequest<{ success: boolean; message?: string; data: unknown }>(
      `/${source}/${transactionId}/regenerate`,
      { method: 'POST' }
    ),
};
