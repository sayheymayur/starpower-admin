import { TOKEN_KEY, UNAUTHORIZED_EVENT, authService } from '../auth/dashboardAuth';
import { API_CONFIG } from './config';
import { ApiError } from './base';

export type CallRecordingStatus = 'recording' | 'completed' | 'stopped' | 'failed';

export interface CallRecordingParticipant {
  userId: number;
  fullName: string;
  username: string | null;
  phone: string | null;
}

export interface CallRecordingSession {
  sessionUuid: string;
  sessionType: number;
  startDateTime: string | null;
  endDateTime: string | null;
}

export interface CallRecording {
  recordingId: number;
  sessionId: number;
  channelName: string;
  status: CallRecordingStatus;
  recordingUrl: string | null;
  resourceId: string | null;
  recordingSid: string | null;
  recordingUid: string | null;
  startedAt: string | null;
  stoppedAt: string | null;
  createdAt: string;
  session: CallRecordingSession | null;
  user: CallRecordingParticipant | null;
  listener: CallRecordingParticipant | null;
}

export interface CallRecordingPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CallRecordingListParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  userId?: number;
  listenerId?: number;
  userName?: string;
  listenerName?: string;
  phoneNumber?: string;
  userPhone?: string;
  listenerPhone?: string;
  status?: CallRecordingStatus;
  sessionUuid?: string;
  channelName?: string;
  startDate?: string;
  endDate?: string;
}

interface ListResponse {
  success: boolean;
  data: CallRecording[];
  pagination: CallRecordingPagination;
  message?: string;
}

interface DetailResponse {
  success: boolean;
  data: CallRecording;
  message?: string;
}

const BASE = `${API_CONFIG.BASE_URL}/dashboard/api/call-recordings`;

function buildQuery(params?: CallRecordingListParams): string {
  if (!params) return '';
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    qs.append(k, String(v));
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
}

async function recordingRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const url = `${BASE}${path}`;

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

  if (!res.ok || body.success === false) {
    throw new ApiError(body.message ?? `HTTP ${res.status}`, res.status, body);
  }

  return body as T;
}

export const callRecordingsAPI = {
  list: (params?: CallRecordingListParams) =>
    recordingRequest<ListResponse>(buildQuery(params)),

  getById: (recordingId: number) =>
    recordingRequest<DetailResponse>(`/${recordingId}`).then((r) => r.data),
};

export const RECORDING_STATUS_LABELS: Record<CallRecordingStatus, string> = {
  recording: 'Recording',
  completed: 'Completed',
  stopped: 'Stopped',
  failed: 'Failed',
};

export const RECORDING_STATUSES = Object.keys(RECORDING_STATUS_LABELS) as CallRecordingStatus[];

export function recordingStatusColor(
  status: CallRecordingStatus
): 'success' | 'warning' | 'error' | 'info' | 'dark' {
  switch (status) {
    case 'completed':
      return 'success';
    case 'recording':
      return 'info';
    case 'stopped':
      return 'dark';
    case 'failed':
      return 'error';
    default:
      return 'dark';
  }
}

export function formatRecordingDuration(startedAt: string | null, stoppedAt: string | null): string {
  if (!startedAt || !stoppedAt) return '—';
  const ms = new Date(stoppedAt).getTime() - new Date(startedAt).getTime();
  if (ms <= 0) return '—';
  const secs = Math.floor(ms / 1000);
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  if (mins < 60) return `${mins}:${String(rem).padStart(2, '0')}`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}
