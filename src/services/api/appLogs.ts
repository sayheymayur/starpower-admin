import { TOKEN_KEY, UNAUTHORIZED_EVENT, authService } from '../auth/dashboardAuth';
import { API_CONFIG } from './config';
import { ApiError } from './base';

export type AppLogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'event';

export interface AppLogEntry {
  app_log_id_pk: number;
  level: AppLogLevel;
  source: string;
  event: string | null;
  screen: string | null;
  action: string | null;
  user_id_fk: number | null;
  session_id: string | null;
  request_id: string | null;
  message: string | null;
  stack_trace: string | null;
  metadata: Record<string, unknown> | string | null;
  app_version: string | null;
  build_number: string | null;
  environment: string | null;
  platform: string | null;
  os_version: string | null;
  device_model: string | null;
  device_brand: string | null;
  device_id: string | null;
  network_type: string | null;
  locale: string | null;
  timezone: string | null;
  device_time: string | null;
  device_time_raw: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_date_time: string;
}

export interface AppLogStats {
  total: number;
  byLevel: Partial<Record<AppLogLevel, number>>;
  bySource: Record<string, number>;
}

export interface AppLogPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AppLogListParams {
  page?: number;
  limit?: number;
  level?: AppLogLevel;
  source?: string;
  event?: string;
  screen?: string;
  userId?: number;
  sessionId?: string;
  platform?: string;
  environment?: string;
  from?: string;
  to?: string;
  q?: string;
}

interface ListResponse {
  success: boolean;
  items: AppLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  message?: string;
}

interface StatsResponse {
  success: boolean;
  data: AppLogStats;
  message?: string;
}

interface DetailResponse {
  success: boolean;
  data: AppLogEntry;
  message?: string;
}

const BASE = `${API_CONFIG.BASE_URL}/app-logs`;

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

async function appLogsRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
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

export const appLogsAPI = {
  list: (params?: AppLogListParams) =>
    appLogsRequest<ListResponse>(buildQuery(params as Record<string, string | number | undefined>)),

  stats: (params?: Pick<AppLogListParams, 'from' | 'to'>) =>
    appLogsRequest<StatsResponse>(
      `/stats${buildQuery(params as Record<string, string | number | undefined>)}`
    ).then((r) => r.data),

  getById: (id: number) =>
    appLogsRequest<DetailResponse>(`/${id}`).then((r) => r.data),
};

export const APP_LOG_LEVELS: AppLogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal', 'event'];

export const APP_LOG_LEVEL_LABELS: Record<AppLogLevel, string> = {
  debug: 'Debug',
  info: 'Info',
  warn: 'Warn',
  error: 'Error',
  fatal: 'Fatal',
  event: 'Event',
};

export function appLogLevelColor(
  level: AppLogLevel
): 'success' | 'warning' | 'error' | 'info' | 'dark' {
  switch (level) {
    case 'error':
    case 'fatal':
      return 'error';
    case 'warn':
      return 'warning';
    case 'info':
    case 'event':
      return 'info';
    case 'debug':
      return 'dark';
    default:
      return 'dark';
  }
}

export function formatMetadata(metadata: AppLogEntry['metadata']): string {
  if (metadata == null) return '—';
  if (typeof metadata === 'string') return metadata;
  try {
    return JSON.stringify(metadata, null, 2);
  } catch {
    return String(metadata);
  }
}
