import { TOKEN_KEY, UNAUTHORIZED_EVENT, authService } from '../auth/dashboardAuth';
import { API_CONFIG } from './config';
import { ApiError } from './base';
import type { AstroListResponse, AstroDetailResponse, ListParams } from './astro';

export type NotificationAudience = 'astro_users' | 'astrologers' | 'all';
export type NotificationStatus = 'sent' | 'scheduled' | 'failed';

export interface AstroNotificationUser {
  userId: number;
  name: string;
  phoneNumber: string;
  email?: string | null;
  profilePhoto?: string | null;
  state?: string | null;
  status?: number;
  isAstroUser: boolean;
  isAstrologer: boolean;
}

export interface AstroNotificationLog {
  notificationLogId: number;
  userId: number | null;
  title: string;
  body: string;
  metadata: Record<string, unknown>;
  scheduledFor: string | null;
  sentAt: string | null;
  status: NotificationStatus;
  isGlobal: boolean;
  isRecurringDaily: boolean;
  createdDateTime: string;
  createdBy: number | null;
  recipientType: string | null;
  audience: string | null;
  user?: AstroNotificationUser | null;
}

export interface AstroNotificationStats {
  totalNotifications: number;
  successfulCount: number;
  failedCount: number;
  notificationsByStatus: { status: string; count: number }[];
  globalNotifications: number;
  userNotifications: number;
  recurringNotifications: number;
  totalUsersWithTokens: number;
  audience: NotificationAudience;
}

export interface AstroFcmStats {
  totalTokens: number;
  activeTokens: number;
  inactiveTokens: number;
  tokensByPlatform: { platform: string; count: number }[];
  usersWithTokens: number;
  audience: NotificationAudience;
}

export interface SendNotificationBody {
  userId: number;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
  audience?: NotificationAudience;
}

export interface ScheduleNotificationBody extends SendNotificationBody {
  scheduledFor: string;
}

export interface SendGlobalNotificationBody {
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
  audience: NotificationAudience;
}

export interface SendToTokenBody {
  fcmToken: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  imageUrl?: string;
  audience?: NotificationAudience;
}

export interface SendNotificationResult {
  notification: AstroNotificationLog;
  fcm: {
    success: number;
    failure: number;
    failedTokens: string[];
  };
}

export interface SendGlobalNotificationResult {
  notification: AstroNotificationLog;
  summary: {
    audience: NotificationAudience;
    targetUserCount: number;
    successCount: number;
    failureCount: number;
    failures: { userId: number; error: string }[];
  };
}

function buildQuery(params?: ListParams): string {
  if (!params) return '';
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    qs.append(k, String(v));
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

export const astroNotificationsAPI = {
  list: (params?: ListParams) =>
    astroRequest<AstroListResponse<AstroNotificationLog>>(
      `/notifications${buildQuery(params)}`
    ),

  listByUser: (userId: number, params?: ListParams) =>
    astroRequest<AstroListResponse<AstroNotificationLog>>(
      `/notifications/user/${userId}${buildQuery(params)}`
    ),

  getStatistics: (params?: ListParams) =>
    astroRequest<AstroDetailResponse<AstroNotificationStats>>(
      `/notifications/statistics${buildQuery(params)}`
    ),

  getFcmStatistics: (params?: ListParams) =>
    astroRequest<AstroDetailResponse<AstroFcmStats>>(
      `/notifications/fcm-statistics${buildQuery(params)}`
    ),

  send: (input: SendNotificationBody) =>
    astroRequest<AstroDetailResponse<SendNotificationResult>>('/notifications/send', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  schedule: (input: ScheduleNotificationBody) =>
    astroRequest<AstroDetailResponse<{ notification: AstroNotificationLog }>>(
      '/notifications/schedule',
      {
        method: 'POST',
        body: JSON.stringify(input),
      }
    ),

  sendGlobal: (input: SendGlobalNotificationBody) =>
    astroRequest<AstroDetailResponse<SendGlobalNotificationResult>>(
      '/notifications/send-global',
      {
        method: 'POST',
        body: JSON.stringify(input),
      }
    ),

  sendToToken: (input: SendToTokenBody) =>
    astroRequest<AstroDetailResponse<unknown>>('/notifications/send-to-token', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
};
