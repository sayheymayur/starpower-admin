import { TOKEN_KEY, UNAUTHORIZED_EVENT, authService } from '../auth/dashboardAuth';
import { API_CONFIG } from './config';
import { ApiError } from './base';
import type { AstroListResponse, AstroDetailResponse, AstroPagination, ListParams } from './astro';

export type { AstroPagination, ListParams };

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';

export interface AstroTransaction {
  transactionId: number;
  bookingId: number;
  userId: number;
  astrologerId: number;
  orderId: string;
  paymentId: string | null;
  amount: number;
  gstAmount: number;
  payableAmount: number;
  status: PaymentStatus;
  statusCode: number;
  paidAt: string | null;
  refundAmount: number | null;
  refundId: string | null;
  refundAt: string | null;
  remark?: string | null;
  pricingDetails?: Record<string, unknown> | null;
  stateId?: number | null;
  createdAt: string;
  updatedAt?: string | null;
  userName?: string;
  astrologerName?: string;
  bookingStatus?: string;
  sessionType?: 1 | 2;
  booking?: unknown;
}

export interface AstroTransactionStats {
  total: number;
  byStatus: Record<PaymentStatus, number>;
  paidRevenue: number;
  transactionsToday: number;
}

export interface AstroEarningsSummary {
  completedSessions: number;
  commissionRate: number;
  totalPaidExGst: number;
  averageSessionEarning: number;
  totalEarned: number;
  totalAdjustments: number;
  effectiveTotalEarned: number;
  totalPaidOut: number;
  pendingBalance: number;
  /** Paid out more than currently earned (fee marked free after payout). Blocks new payouts. */
  overpaidAmount?: number;
  /** Sessions that earned a fee (paid, not waived). */
  paidSessions?: number;
  /** Admin-waived + system free-grant sessions, shown as "Free". */
  freeSessions?: number;
  waivedSessions?: number;
  freeGrantSessions?: number;
  totalSessions?: number;
  /** Fee that would have been earned on admin-waived sessions. */
  waivedAmount?: number;
}

export type AstroEarningsAdjustmentDirection = 'add' | 'deduct';
export type AstroEarningsAdjustmentAmountType = 'custom' | 'session';

export interface AstroEarningsAdjustment {
  adjustmentId: number;
  astrologerUserId: number;
  direction: AstroEarningsAdjustmentDirection;
  amountType: AstroEarningsAdjustmentAmountType;
  amount: number;
  signedAmount: number;
  bookingId: number | null;
  remark: string | null;
  createdByAdminId: number | null;
  createdAt: string;
}

export interface CreateAstroEarningsAdjustmentBody {
  astrologerUserId: number;
  direction: AstroEarningsAdjustmentDirection;
  amountType: AstroEarningsAdjustmentAmountType;
  customAmount?: number;
  bookingId?: number;
  remark?: string | null;
}

export interface CreateAstroEarningsAdjustmentResult {
  adjustment: AstroEarningsAdjustment;
  earningsAfter: AstroEarningsSummary;
}

export interface AstroPayoutBankSnapshot {
  doctorBankId: number | null;
  fullName: string | null;
  accountNo: string | null;
  ifscCode: string | null;
  micr: string | null;
  status: number | null;
  createdDateTime: string | null;
}

/** @deprecated Use AstroEarningsQueueItem */
export type AstroEarningsItem = AstroEarningsQueueItem;

export interface AstroEarningsQueueItem {
  astrologerUserId: number;
  astrologerRecordId: number;
  fullName: string | null;
  mobileNo: string | null;
  email: string | null;
  status: number;
  earnings: AstroEarningsSummary;
  bankDetails: AstroPayoutBankSnapshot | null;
  lastPayoutAt: string | null;
}

export interface AstroCompletedSession {
  kind?: 'booking' | 'instant';
  bookingId: number | null;
  sessionId?: string | null;
  sessionType: 1 | 2 | number | null;
  startDateTime: string;
  endDateTime: string;
  userName: string;
  paidAmountExGst: number;
  gstAmount: number;
  earning: number;
  /** True for admin-waived and system free-grant sessions (earning is 0). */
  isFree?: boolean;
  feeLabel?: 'Free' | null;
  freeSource?: 'admin' | 'free_grant' | null;
  waivedAmount?: number | null;
  freeReason?: string | null;
}

export interface AstroEarningsDetail extends AstroEarningsQueueItem {
  recentCompletedSessions: AstroCompletedSession[];
  payoutHistory: AstroPayoutRecord[];
  adjustmentHistory: AstroEarningsAdjustment[];
}

export interface AstroPayoutStats {
  activeAstrologers: number;
  astrologersWithPendingBalance: number;
  totalPendingBalance: number;
  totalPaidOut: number;
  payoutCount: number;
  commissionRate: number;
}

export interface AstroPayoutRecord {
  payoutId: number;
  astrologerUserId: number;
  astrologerName: string | null;
  mobileNo: string | null;
  totalAmount: number;
  payoutDateTime: string;
  paymentId: string | null;
  maskedPaymentId: string | null;
  remark: string | null;
  createdAt: string;
  processedByAdminId: number | null;
}

/** @deprecated Use AstroPayoutRecord */
export type AstroPayout = AstroPayoutRecord;

export interface AstroPayoutDetailData extends AstroPayoutRecord {
  earnings?: AstroEarningsSummary;
  bankDetails?: AstroPayoutBankSnapshot | null;
}

export interface CreateAstroPayoutBody {
  astrologerUserId: number;
  totalAmount: number;
  payoutDateTime?: string;
  paymentId?: string | null;
  remark?: string | null;
}

/** @deprecated Use CreateAstroPayoutBody */
export type CreatePayoutInput = CreateAstroPayoutBody;

export interface CreateAstroPayoutResult {
  payout: AstroPayoutRecord;
  earningsAfter: AstroEarningsSummary;
}

export interface AstroInvoiceItem {
  transactionId: number;
  bookingId: number;
  userId: number;
  userName: string;
  userMobileNo?: string;
  astrologerId: number;
  astrologerName: string;
  orderId: string;
  paymentId: string | null;
  amount: number;
  gstAmount: number;
  payableAmount: number;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
  bookingStatus?: string;
  sessionType?: 1 | 2;
  invoice: {
    filename?: string;
    exists: boolean;
    publicUrl?: string | null;
    downloadPath?: string;
  };
}

export interface AstroInvoiceStats {
  totalSuccessfulPayments: number;
  invoicesGenerated: number;
  invoicesMissing: number;
  totalPaidAmount: number;
  uniquePayers: number;
}

export interface AstroInvoiceMonth {
  month: string;
  year: number;
  monthNumber: number;
  paymentCount: number;
  invoiceCount: number;
  missingCount: number;
  totalAmount: number;
  totalGst: number;
}

export interface AstroInvoiceMonthsData {
  months: AstroInvoiceMonth[];
  totalMonths: number;
  downloadPaths?: {
    singleMonth?: string;
    selectedMonths?: string;
  };
}

export interface AstroInvoiceBulkDownloadParams {
  month?: string;
  months?: string[];
  dateFrom?: string;
  dateTo?: string;
  userId?: number;
  astrologerId?: number;
  forceZip?: boolean;
}

export interface AstroBankItem {
  bankId?: number;
  astrologerUserId: number;
  astrologerName: string;
  mobileNo: string;
  email?: string | null;
  fullName?: string;
  accountNumber?: string;
  maskedAccountNumber?: string;
  ifscCode?: string;
  micr?: string | null;
  aadhaarFront?: string | null;
  aadhaarBack?: string | null;
  status?: number;
  createdAt?: string;
  bankDetails?: AstroBankItem | null;
}

export interface AstroBankStats {
  totalAstrologers: number;
  withBankDetails: number;
  missingBankDetails: number;
  activeBankAccounts: number;
}

export interface CreateBankInput {
  astrologerUserId: number;
  fullName: string;
  accountNo: string;
  ifscCode: string;
  micr?: string | null;
  aadhaarFront?: string;
  aadhaarBack?: string;
  status?: number;
}

export interface UpdateBankInput {
  fullName?: string;
  accountNo?: string;
  ifscCode?: string;
  micr?: string | null;
  aadhaarFront?: string;
  aadhaarBack?: string;
  status?: number;
}

export interface AstroRatingUser {
  userId: number;
  name: string;
  mobileNo?: string;
  profilePhoto?: string | null;
  isAstrologer?: boolean;
  isAstroUser?: boolean;
}

export interface AstroRating {
  ratingId: number;
  rating: number;
  direction: 'userToAstrologer' | 'astrologerToUser' | 'astroUserFeedback';
  byUser: AstroRatingUser;
  toUser: AstroRatingUser;
  comment?: string | null;
  tags?: string[];
  sessionId?: string | null;
  sessionType?: string | null;
  astrologerReply?: string | null;
  rawComments?: string | null;
  createdAt: string;
  createdBy?: number;
  linkedBooking?: {
    bookingId: number;
    sessionId: string;
    sessionType: number;
    status: string;
    startDateTime?: string;
    endDateTime?: string;
  } | null;
}

export interface AstroRatingStats {
  userToAstrologer: { total: number; averageRating: number; withComments?: number };
  astrologerToUser: { total: number; averageRating: number };
  ratingDistribution: Record<string, number>;
  astrologerCount: number;
}

export type TransactionListEndpoint =
  | '/transactions'
  | '/transactions/pending'
  | '/transactions/success'
  | '/transactions/failed'
  | '/transactions/refunded';

function buildQuery(params?: ListParams): string {
  if (!params) return '';
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
}

async function astroRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const url = `${API_CONFIG.BASE_URL}/astro${path}`;

  const res = await fetch(url, {
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

  if (res.status === 403 && authService.getUser()?.role === 'astroadmin') {
    if (!window.location.pathname.startsWith('/astro')) {
      window.location.assign('/astro');
    }
  }

  if (!res.ok || body.success === false) {
    throw new ApiError(body.message ?? `HTTP ${res.status}`, res.status, body);
  }

  return body as T;
}

async function astroDownload(path: string): Promise<Blob> {
  const token = localStorage.getItem(TOKEN_KEY);
  const url = `${API_CONFIG.BASE_URL}/astro${path}`;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(err.message ?? 'Download failed', res.status, err);
  }
  return res.blob();
}

function filenameFromDisposition(header: string | null): string | null {
  if (!header) return null;
  const match = /filename\*?=(?:UTF-8''|")?([^";]+)/i.exec(header);
  return match?.[1]?.replace(/"/g, '') ?? null;
}

async function astroDownloadFile(
  path: string,
  fallbackFilename: string
): Promise<{ blob: Blob; filename: string }> {
  const token = localStorage.getItem(TOKEN_KEY);
  const url = `${API_CONFIG.BASE_URL}/astro${path}`;
  const res = await fetch(url, {
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

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const astroFinanceAPI = {
  // Transactions
  getTransactionStats: () =>
    astroRequest<AstroDetailResponse<AstroTransactionStats>>('/transactions/stats'),

  listTransactions: (endpoint: TransactionListEndpoint = '/transactions', params?: ListParams) =>
    astroRequest<AstroListResponse<AstroTransaction>>(`${endpoint}${buildQuery(params)}`),

  getTransaction: (transactionId: number) =>
    astroRequest<AstroDetailResponse<AstroTransaction>>(`/transactions/${transactionId}`),

  // Payouts
  getPayoutStats: () =>
    astroRequest<AstroDetailResponse<AstroPayoutStats>>('/payouts/stats'),

  listEarnings: (params?: ListParams) =>
    astroRequest<AstroListResponse<AstroEarningsQueueItem>>(
      `/payouts/earnings${buildQuery(params)}`
    ),

  getEarningsDetail: (userId: number) =>
    astroRequest<AstroDetailResponse<AstroEarningsDetail>>(
      `/payouts/earnings/${userId}`
    ),

  listPayouts: (params?: ListParams) =>
    astroRequest<AstroListResponse<AstroPayoutRecord>>(`/payouts${buildQuery(params)}`),

  getPayout: (payoutId: number) =>
    astroRequest<AstroDetailResponse<AstroPayoutDetailData>>(`/payouts/${payoutId}`),

  createPayout: (input: CreateAstroPayoutBody) =>
    astroRequest<AstroDetailResponse<CreateAstroPayoutResult>>('/payouts', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  createEarningsAdjustment: (input: CreateAstroEarningsAdjustmentBody) =>
    astroRequest<AstroDetailResponse<CreateAstroEarningsAdjustmentResult>>(
      '/payouts/adjustments',
      {
        method: 'POST',
        body: JSON.stringify(input),
      }
    ),

  listEarningsAdjustments: (params?: ListParams) =>
    astroRequest<AstroListResponse<AstroEarningsAdjustment>>(
      `/payouts/adjustments${buildQuery(params)}`
    ),

  // Invoices
  getInvoiceStats: () =>
    astroRequest<AstroDetailResponse<AstroInvoiceStats>>('/invoices/stats'),

  listInvoices: (params?: ListParams) =>
    astroRequest<AstroListResponse<AstroInvoiceItem>>(`/invoices${buildQuery(params)}`),

  getInvoice: (transactionId: number) =>
    astroRequest<AstroDetailResponse<AstroInvoiceItem>>(`/invoices/${transactionId}`),

  downloadInvoice: (transactionId: number) =>
    astroDownload(`/invoices/${transactionId}/download`),

  getInvoiceMonths: (params?: { year?: number; userId?: number; astrologerId?: number }) =>
    astroRequest<AstroDetailResponse<AstroInvoiceMonthsData>>(
      `/invoices/months${buildQuery(params)}`
    ),

  downloadInvoicesBulk: async (params: AstroInvoiceBulkDownloadParams) => {
    const qs = new URLSearchParams();
    if (params.month) qs.set('month', params.month);
    if (params.months?.length) qs.set('months', params.months.join(','));
    if (params.dateFrom) qs.set('dateFrom', params.dateFrom);
    if (params.dateTo) qs.set('dateTo', params.dateTo);
    if (params.userId != null) qs.set('userId', String(params.userId));
    if (params.astrologerId != null) qs.set('astrologerId', String(params.astrologerId));
    if (params.forceZip) qs.set('forceZip', 'true');

    const query = qs.toString();
    const fallback =
      params.month
        ? `astro-invoices-${params.month}.zip`
        : params.months?.length
          ? `astro-invoices-${params.months[0]}_to_${params.months[params.months.length - 1]}.zip`
          : 'astro-invoices.zip';

    const { blob, filename } = await astroDownloadFile(
      `/invoices/download-all${query ? `?${query}` : ''}`,
      fallback
    );
    triggerBlobDownload(blob, filename);
  },

  regenerateInvoice: (transactionId: number) =>
    astroRequest<AstroDetailResponse<unknown>>(`/invoices/${transactionId}/regenerate`, {
      method: 'POST',
    }),

  // Banks
  getBankStats: () =>
    astroRequest<AstroDetailResponse<AstroBankStats>>('/banks/stats'),

  listBanks: (params?: ListParams) =>
    astroRequest<AstroListResponse<AstroBankItem>>(`/banks${buildQuery(params)}`),

  getBank: (userId: number) =>
    astroRequest<AstroDetailResponse<AstroBankItem>>(`/banks/${userId}`),

  createBank: (input: CreateBankInput) =>
    astroRequest<AstroDetailResponse<AstroBankItem>>('/banks', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  updateBank: (userId: number, input: UpdateBankInput) =>
    astroRequest<AstroDetailResponse<AstroBankItem>>(`/banks/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),

  // Ratings
  getRatingStats: () =>
    astroRequest<AstroDetailResponse<AstroRatingStats>>('/ratings/stats'),

  listRatings: (params?: ListParams) =>
    astroRequest<AstroListResponse<AstroRating>>(`/ratings${buildQuery(params)}`),

  listRatingsToAstrologers: (params?: ListParams) =>
    astroRequest<AstroListResponse<AstroRating>>(`/ratings/to-astrologers${buildQuery(params)}`),

  listRatingsFromAstrologers: (params?: ListParams) =>
    astroRequest<AstroListResponse<AstroRating>>(`/ratings/from-astrologers${buildQuery(params)}`),

  getAstrologerRatings: (userId: number, params?: ListParams) =>
    astroRequest<AstroDetailResponse<{
      astrologerUserId: number;
      averageRating: number;
      totalReviews: number;
      ratingDistribution: Record<string, number>;
      reviews: AstroRating[];
      pagination: AstroPagination;
    }>>(`/ratings/astrologers/${userId}${buildQuery(params)}`),

  getUserRatings: (userId: number) =>
    astroRequest<AstroDetailResponse<{
      ratingsGiven: AstroRating[];
      ratingsReceived: AstroRating[];
    }>>(`/ratings/users/${userId}`),

  getRating: (ratingId: number) =>
    astroRequest<AstroDetailResponse<AstroRating>>(`/ratings/${ratingId}`),
};
