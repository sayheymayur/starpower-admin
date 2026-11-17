import { TOKEN_KEY, UNAUTHORIZED_EVENT, authService } from '../auth/dashboardAuth';
import { API_CONFIG } from './config';
import { ApiError } from './base';

export type AadhaarVerificationStatus = 'pending' | 'verified' | 'failed';

export interface AadhaarAddress {
  country?: string | null;
  district?: string | null;
  state?: string | null;
  postOffice?: string | null;
  house?: string | null;
  locality?: string | null;
  city?: string | null;
  subDistrict?: string | null;
  street?: string | null;
  landmark?: string | null;
}

export interface AdminAadhaarProfile {
  userId: number;
  mobileNo?: string | null;
  isDoctor?: boolean;
  isAstrologer?: boolean;
  verified: boolean;
  verificationStatus: AadhaarVerificationStatus;
  maskedAadhaar?: string | null;
  fullName?: string | null;
  careOf?: string | null;
  fatherName?: string | null;
  dob?: string | null;
  yob?: string | null;
  gender?: string | null;
  zipCode?: string | null;
  fullAddress?: string | null;
  address?: AadhaarAddress | null;
  digilockerMobile?: string | null;
  digilockerClientId?: string | null;
  profileImageUrl?: string | null;
  xmlUrl?: string | null;
  verifiedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  accountName?: string | null;
  accountUsername?: string | null;
  accountProfilePhoto?: string | null;
}

export interface AadhaarStats {
  total: number;
  verified: number;
  pending: number;
  failed: number;
  listeners: number;
  astrologers: number;
}

export interface AadhaarPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AadhaarListParams {
  page?: number;
  limit?: number;
  search?: string;
  verified?: boolean;
  verificationStatus?: AadhaarVerificationStatus;
  isDoctor?: boolean;
  isAstrologer?: boolean;
  sortBy?: 'verifiedAt' | 'createdAt' | 'fullName' | 'mobileNo' | 'userId';
  sortOrder?: 'asc' | 'desc';
}

interface ListResponse {
  success: boolean;
  data: AdminAadhaarProfile[];
  pagination: AadhaarPagination;
  message?: string;
}

interface StatsResponse {
  success: boolean;
  data: AadhaarStats;
  message?: string;
}

interface DetailResponse {
  success: boolean;
  data: AdminAadhaarProfile;
  message?: string;
}

interface DeleteResponse {
  success: boolean;
  message?: string;
  data: { userId: number; deleted: boolean };
}

export interface AadhaarUpdateInput {
  mobileNo?: string | null;
  isDoctor?: boolean;
  isAstrologer?: boolean;
  verified?: boolean;
  verificationStatus?: AadhaarVerificationStatus;
  maskedAadhaar?: string | null;
  fullName?: string | null;
  careOf?: string | null;
  fatherName?: string | null;
  dob?: string | null;
  yob?: string | null;
  gender?: string | null;
  zipCode?: string | null;
  fullAddress?: string | null;
  address?: AadhaarAddress | null;
  digilockerMobile?: string | null;
  digilockerClientId?: string | null;
  verifiedAt?: string | null;
  clearProfileImage?: boolean;
  clearXmlFile?: boolean;
}

const BASE = `${API_CONFIG.BASE_URL}/aadhaar`;

function buildQuery(params?: AadhaarListParams): string {
  if (!params) return '';
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    qs.append(k, String(v));
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
}

async function aadhaarRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
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

export const aadhaarAPI = {
  list: (params?: AadhaarListParams) =>
    aadhaarRequest<ListResponse>(buildQuery(params)),

  stats: () => aadhaarRequest<StatsResponse>('/stats').then((r) => r.data),

  getByUserId: (userId: number) =>
    aadhaarRequest<DetailResponse>(`/users/${userId}`).then((r) => r.data),

  update: (userId: number, body: AadhaarUpdateInput) =>
    aadhaarRequest<DetailResponse>(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }).then((r) => r.data),

  delete: (userId: number) =>
    aadhaarRequest<DeleteResponse>(`/users/${userId}`, {
      method: 'DELETE',
    }),
};

export const AADHAAR_STATUS_LABELS: Record<AadhaarVerificationStatus, string> = {
  pending: 'Pending',
  verified: 'Verified',
  failed: 'Failed',
};

export function aadhaarStatusColor(
  status: AadhaarVerificationStatus
): 'success' | 'warning' | 'error' | 'dark' {
  switch (status) {
    case 'verified':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
      return 'error';
    default:
      return 'dark';
  }
}

export function formatAadhaarGender(gender: string | null | undefined): string {
  if (!gender) return '—';
  switch (gender.toUpperCase()) {
    case 'M':
      return 'Male';
    case 'F':
      return 'Female';
    case 'O':
      return 'Other';
    default:
      return gender;
  }
}

export function partnerTypeLabel(row: Pick<AdminAadhaarProfile, 'isDoctor' | 'isAstrologer'>): string {
  const types: string[] = [];
  if (row.isDoctor) types.push('Listener');
  if (row.isAstrologer) types.push('Astrologer');
  return types.length ? types.join(', ') : 'User';
}
