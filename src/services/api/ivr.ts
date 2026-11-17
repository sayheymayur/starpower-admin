import { TOKEN_KEY, UNAUTHORIZED_EVENT, authService } from '../auth/dashboardAuth';
import { API_CONFIG } from './config';
import { ApiError } from './base';

export type IvrSource = 'ivr' | 'medibhai';
export type IvrSourceFilter = 'all' | IvrSource;
export type IvrOutcome = 'pending' | 'success' | 'failed';
export type IvrCallType = 'play' | 'bridge';
export type IvrBridgeMode = 'direct' | 'medibhai';

export interface IvrCall {
  id: number;
  source: IvrSource;
  callType: IvrCallType;
  outcome: IvrOutcome;
  toPhone: string;
  bridgePhone: string | null;
  listenerId: number | null;
  listenerName: string | null;
  durationSeconds: number | null;
  userDuration: number | null;
  listenerDuration: number | null;
  cmiRequestId: string | null;
  sessionId: string | null;
  audioFileName: string | null;
  remark: string | null;
  triggeredByAdminId: number | null;
  bridgeMode: IvrBridgeMode | null;
  rawStatus: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface IvrStats {
  totalCalls: number;
  success: number;
  failed: number;
  pending: number;
}

export interface IvrPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface IvrListParams {
  page?: number;
  limit?: number;
  source?: IvrSourceFilter;
  outcome?: IvrOutcome;
  callType?: IvrCallType;
  phoneNumber?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TriggerPlayCallInput {
  phoneNumber: string;
  callType: 'play';
  remark?: string;
  audioFileName?: string;
}

export interface TriggerBridgeCallInput {
  phoneNumber: string;
  callType: 'bridge';
  listenerId: number;
  durationMinutes: number;
  remark?: string;
  bridgeMode?: 'medibhai';
}

export type TriggerIvrCallInput = TriggerPlayCallInput | TriggerBridgeCallInput;

interface StatsResponse {
  success: boolean;
  data: IvrStats;
}

interface ListResponse {
  success: boolean;
  data: IvrCall[];
  pagination: IvrPagination;
}

interface DetailResponse {
  success: boolean;
  data: IvrCall;
}

const BASE = `${API_CONFIG.BASE_URL}/ivr`;

function buildQuery(params?: Record<string, string | number | undefined>): string {
  if (!params) return '';
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    qs.append(k, String(v));
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
}

async function ivrRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
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

export const ivrAPI = {
  getStats: (params?: { source?: IvrSourceFilter }) =>
    ivrRequest<StatsResponse>(`/stats${buildQuery(params)}`),

  list: (params?: IvrListParams) =>
    ivrRequest<ListResponse>(buildQuery(params as Record<string, string | number | undefined>)),

  get: (source: IvrSource, id: number) =>
    ivrRequest<DetailResponse>(`/${source}/${id}`),

  trigger: (input: TriggerIvrCallInput) =>
    ivrRequest<{ success: boolean; data?: IvrCall; message?: string }>('/trigger', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  refresh: (source: IvrSource, id: number) =>
    ivrRequest<{ success: boolean; data?: IvrCall; message?: string }>(
      `/${source}/${id}/refresh`,
      { method: 'POST' }
    ),
};

export function formatIvrPhone(phone: string | null | undefined): string {
  if (!phone) return '—';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return phone;
}

export function formatIvrDuration(seconds: number | null | undefined): string {
  if (seconds == null || seconds < 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function ivrOutcomeColor(
  outcome: IvrOutcome
): 'success' | 'warning' | 'error' | 'dark' {
  switch (outcome) {
    case 'success':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
      return 'error';
    default:
      return 'dark';
  }
}

export function ivrSourceLabel(source: IvrSource): string {
  return source === 'medibhai' ? 'Medibhai' : 'IVR';
}
