import { TOKEN_KEY, UNAUTHORIZED_EVENT, authService } from '../auth/dashboardAuth';
import { API_CONFIG } from './config';
import { ApiError } from './base';

export interface AstroPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

type RawAstroPagination = Partial<AstroPagination> & {
  currentPage?: number;
  totalPages?: number;
  has_next?: boolean;
  has_prev?: boolean;
};

export function normalizeAstroPagination(
  raw: RawAstroPagination | null | undefined,
  fallback: { page: number; limit: number; itemCount: number }
): AstroPagination {
  const page = Number(raw?.page ?? raw?.currentPage ?? fallback.page) || 1;
  const limit = Number(raw?.limit ?? fallback.limit) || fallback.limit;
  const fullPage = fallback.itemCount >= limit;

  let total = Number(raw?.total);
  if (!Number.isFinite(total) || total < 0) {
    total = fullPage
      ? page * limit
      : (page - 1) * limit + fallback.itemCount;
  }

  let pages = Number(raw?.pages ?? raw?.totalPages);
  if (!Number.isFinite(pages) || pages < 1) {
    pages = Math.max(page + (fullPage ? 1 : 0), Math.ceil(total / limit) || 1);
  }

  const hasPrev = raw?.hasPrev ?? raw?.has_prev ?? page > 1;
  const hasNext = raw?.hasNext ?? raw?.has_next ?? (page < pages || fullPage);

  return { page, limit, total, pages, hasPrev, hasNext };
}

export interface AstroListResponse<T> {
  success: boolean;
  data: T[];
  pagination: AstroPagination;
  message?: string;
}

export interface AstroDetailResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AstroDocuments {
  assessmentCertificate: string | null;
  qualificationProof: string | null;
  l2Certificate?: string | null;
  panNo: string | null;
  kycStatus: number | null;
  rejectedRemark: string | null;
}

export interface AstroUserSummary {
  userId: number;
  fullName: string;
  username: string | null;
  mobileNo: string;
  email: string | null;
  gender?: string | null;
  profilePhoto: string | null;
  status: number;
  bookingCount: number;
  lastBookingAt: string | null;
  astroProfile: {
    astroUserId: number;
    dob: string | null;
    birthPlace: string | null;
    birthTime: string | null;
    createdAt: string;
    status?: number;
  } | null;
}

export interface AstroUserDetail extends AstroUserSummary {
  recentBookings?: AstroBooking[];
}

export interface AstrologerSummary {
  astrologerRecordId: number;
  userId: number;
  fullName: string;
  username?: string | null;
  mobileNo: string;
  email?: string | null;
  bio?: string | null;
  profilePhoto: string | null;
  doctorProfileStatus: number | null;
  yearsOfExperience: number | null;
  callRate: number | null;
  chatRate: number | null;
  status: number;
  /** Hidden from public app lists; visible only to testViewerUserIds */
  isTestAstrologer?: boolean;
  /** App user IDs allowed to see this test astrologer */
  testViewerUserIds?: number[];
  specialities?: { id: number; name: string; description?: string | null }[];
  documents?: AstroDocuments;
  stats?: {
    totalBookings: number;
    completedBookings: number;
    activeBookings?: number;
  };
}

import type { AdminAadhaarProfile } from './aadhaar';

export interface AstrologerDetail extends AstrologerSummary {
  recentBookings?: AstroBooking[];
  availability?: unknown;
  aadhaar?: AdminAadhaarProfile | null;
}

export interface AstroBooking {
  bookingId: number;
  sessionId: string | null;
  sessionType: 1 | 2;
  status: string;
  displayStatus: string;
  requestDateTime: string;
  startDateTime: string | null;
  endDateTime: string | null;
  remark?: string | null;
  isCancelledByServer?: boolean | number | null;
  user: {
    userId: number;
    userName: string;
    profilePhoto: string | null;
    mobileNo: string | null;
  } | null;
  astrologer: {
    astrologerId: number;
    astrologerName: string;
    profilePhoto: string | null;
  } | null;
  userBirthDetails: {
    dob: string | null;
    birthPlace: string | null;
    birthTime: string | null;
  } | null;
  payment: {
    transactionId: number;
    orderId: string;
    paymentId: string | null;
    amount: number;
    gstAmount: number;
    payableAmount?: number;
    status: 'pending' | 'success' | 'failed' | 'refunded';
    paidAt: string | null;
  } | null;
  transactions?: {
    transactionId: number;
    orderId: string;
    paymentId: string | null;
    amount: number;
    gstAmount?: number;
    payableAmount?: number;
    status: 'pending' | 'success' | 'failed' | 'refunded';
    paidAt: string | null;
  }[];
}

export interface CancelAstroBookingBody {
  title: string;
  body: string;
  remark?: string;
}

export interface CancelAstroBookingPartyResult {
  success?: boolean;
  sent?: boolean;
  message?: string;
  error?: string;
}

export interface CancelAstroBookingData {
  booking: AstroBooking;
  notifications?: {
    customer?: CancelAstroBookingPartyResult;
    astrologer?: CancelAstroBookingPartyResult;
  };
  customer?: CancelAstroBookingPartyResult;
  astrologer?: CancelAstroBookingPartyResult;
  sendResults?: {
    customer?: CancelAstroBookingPartyResult;
    astrologer?: CancelAstroBookingPartyResult;
  };
}

export interface AstroOverview {
  users: {
    totalWithProfile: number;
    newProfilesThisWeek: number;
    usersWithBookings: number;
  };
  astrologers: {
    active: number;
    pendingVerification: number;
    total: number;
  };
  bookings: {
    byStatus: Record<string, number>;
    today: number;
    activeNow: number;
  };
  revenue: {
    totalPaid: number;
  };
}

export interface AstroUserStats {
  total?: number;
  withProfile?: number;
  withBookings?: number;
}

export interface AstroAstrologerStats {
  active: number;
  pendingVerification: number;
  total: number;
}

export interface AstroVerificationStats {
  total?: number;
  pending?: number;
  verified?: number;
  rejected?: number;
  byStatus?: Record<string, number>;
}

export interface SetAstrologerVerificationInput {
  doctorProfileStatus: number;
  rejectedRemark?: string;
}

export type AstroGender = 'Male' | 'Female' | 'Others' | 'Prefer not to say';

export interface UpdateAstroUserBody {
  fullName?: string | null;
  username?: string | null;
  email?: string | null;
  mobileNo?: string | null;
  gender?: AstroGender | null;
  userStatus?: number | null;
  profileImage?: string | null;
  dob?: string | null;
  birthPlace?: string | null;
  birthTime?: string | null;
  astroProfileStatus?: number | null;
}

export interface UpdateAstrologerBody {
  fullName?: string | null;
  username?: string | null;
  email?: string | null;
  mobileNo?: string | null;
  bio?: string | null;
  userStatus?: number | null;
  panNo?: string | null;
  kycStatus?: 0 | 1 | 2 | null;
  rejectedRemark?: string | null;
  profileImage?: string | null;
  assessmentCertificate?: string | null;
  qualificationProof?: string | null;
  yearsOfExperience?: number | null;
  callRate?: number | null;
  chatRate?: number | null;
  astrologerStatus?: number | null;
  specialities?: string | null;
  specialityIds?: number[] | null;
  /** Mark as test (hidden from public lists). false clears / makes public again. */
  isTestAstrologer?: boolean;
  /** App user IDs that can see this test astrologer */
  testViewerUserIds?: number[];
}

export interface AstroBookingStats {
  byStatus?: Record<string, number>;
  total?: number;
}

export type BookingListEndpoint =
  | '/bookings'
  | '/bookings/failed'
  | '/bookings/upcoming'
  | '/bookings/active'
  | '/bookings/completed'
  | '/bookings/cancelled';

export type ListParams = Record<
  string,
  string | number | boolean | undefined | (string | number)[]
>;

function buildQuery(params?: ListParams): string {
  if (!params) return '';
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    if (Array.isArray(v)) {
      v.forEach((item) => qs.append(k, String(item)));
      return;
    }
    qs.append(k, String(v));
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
}

async function astroRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
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

export const astroAPI = {
  getOverview: () =>
    astroRequest<AstroDetailResponse<AstroOverview>>('/analytics/overview'),

  listUsers: (params?: ListParams) =>
    astroRequest<AstroListResponse<AstroUserSummary>>(`/users${buildQuery(params)}`),

  getUserStats: () =>
    astroRequest<AstroDetailResponse<AstroUserStats>>('/users/stats'),

  getUser: (userId: number) =>
    astroRequest<AstroDetailResponse<AstroUserDetail>>(`/users/${userId}`),

  updateUser: (userId: number, body: UpdateAstroUserBody) =>
    astroRequest<AstroDetailResponse<AstroUserDetail>>(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  deleteUser: (userId: number, force = false) =>
    astroRequest<{ success: boolean; message?: string }>(
      `/users/${userId}${force ? '?force=true' : ''}`,
      { method: 'DELETE' }
    ),

  listAstrologers: (params?: ListParams) =>
    astroRequest<AstroListResponse<AstrologerSummary>>(
      `/astrologers${buildQuery(params)}`
    ),

  listPendingAstrologers: (params?: ListParams) =>
    astroRequest<AstroListResponse<AstrologerSummary>>(
      `/astrologers/pending${buildQuery(params)}`
    ),

  getAstrologerStats: () =>
    astroRequest<AstroDetailResponse<AstroAstrologerStats>>('/astrologers/stats'),

  getAstrologer: (userId: number) =>
    astroRequest<AstroDetailResponse<AstrologerDetail>>(`/astrologers/${userId}`),

  updateAstrologer: (userId: number, body: UpdateAstrologerBody) =>
    astroRequest<AstroDetailResponse<AstrologerDetail>>(`/astrologers/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  deleteAstrologer: (userId: number, force = false) =>
    astroRequest<{ success: boolean; message?: string }>(
      `/astrologers/${userId}${force ? '?force=true' : ''}`,
      { method: 'DELETE' }
    ),

  getVerificationStats: () =>
    astroRequest<AstroDetailResponse<AstroVerificationStats>>(
      '/astrologers/verification/stats'
    ),

  setAstrologerVerification: (userId: number, input: SetAstrologerVerificationInput) =>
    astroRequest<AstroDetailResponse<AstrologerDetail>>(
      `/astrologers/${userId}/verification`,
      { method: 'PATCH', body: JSON.stringify(input) }
    ),

  approveAstrologer: (userId: number) =>
    astroRequest<AstroDetailResponse<AstrologerDetail>>(`/astrologers/${userId}/approve`, {
      method: 'POST',
    }),

  rejectAstrologer: (userId: number, input?: { rejectedRemark?: string }) =>
    astroRequest<AstroDetailResponse<AstrologerDetail>>(`/astrologers/${userId}/reject`, {
      method: 'POST',
      body: JSON.stringify(input ?? {}),
    }),

  markAstrologerPending: (userId: number) =>
    astroRequest<AstroDetailResponse<AstrologerDetail>>(
      `/astrologers/${userId}/mark-pending`,
      { method: 'POST' }
    ),

  listBookings: (endpoint: BookingListEndpoint = '/bookings', params?: ListParams) =>
    astroRequest<AstroListResponse<AstroBooking>>(`${endpoint}${buildQuery(params)}`),

  getBookingStats: () =>
    astroRequest<AstroDetailResponse<AstroBookingStats>>('/bookings/stats'),

  getBooking: (bookingId: number) =>
    astroRequest<AstroDetailResponse<AstroBooking>>(`/bookings/${bookingId}`),

  /** Admin cancel — sets cancelled + is_cancelled_by_server, FCM to both parties. Does not refund. */
  cancelBooking: (bookingId: number, body: CancelAstroBookingBody) =>
    astroRequest<AstroDetailResponse<CancelAstroBookingData | AstroBooking>>(
      `/bookings/${bookingId}/cancel`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    ),

  listInstantSessions: (params?: ListParams) =>
    astroRequest<AstroListResponse<AstroInstantSession>>(
      `/instant-sessions${buildQuery(params)}`
    ),

  getInstantSessionStats: (params?: ListParams) =>
    astroRequest<AstroDetailResponse<AstroInstantSessionStats>>(
      `/instant-sessions/stats${buildQuery(params)}`
    ),

  getInstantSession: (sessionId: string) =>
    astroRequest<AstroDetailResponse<AstroInstantSession>>(
      `/instant-sessions/${encodeURIComponent(sessionId)}`
    ),
};

export interface AstroInstantSession {
  kind: 'instant';
  txnId: number | null;
  sessionId: string | null;
  userId: number | null;
  userName: string | null;
  userMobile?: string | null;
  astrologerId: number | null;
  astrologerName?: string | null;
  sessionType: number;
  sessionTypeLabel?: string;
  billedMinutes: number;
  amount: number;
  earning: number;
  requestDateTime?: string | null;
  startDateTime: string | null;
  endDateTime: string | null;
  createdDateTime?: string | null;
  status?: string;
}

export interface AstroInstantSessionStats {
  totalSessions: number;
  totalAmount: number;
  totalEarning: number;
  totalBilledMinutes: number;
  bySessionType?: Record<string, number>;
}
