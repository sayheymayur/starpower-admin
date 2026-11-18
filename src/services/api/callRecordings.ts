import { TOKEN_KEY, UNAUTHORIZED_EVENT, authService } from '../auth/dashboardAuth';
import { API_CONFIG } from './config';
import { ApiError } from './base';

export type CallRecordingStatus = 'recording' | 'completed' | 'stopped' | 'failed';

export interface CallRecordingParticipant {
  userId: number;
  fullName: string | null;
  username: string | null;
  phone: string | null;
}

export interface CallRecordingSession {
  sessionUuid: string | null;
  sessionType: number | null;
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
  kind?: 'booking' | 'instant' | 'listener';
  bookingId?: number | null;
  instantSessionId?: number | null;
  session: CallRecordingSession | null;
  user: CallRecordingParticipant | null;
  listener: CallRecordingParticipant | null;
  astrologer?: CallRecordingParticipant | null;
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
  /** Server default for StarPower is booking + instant; narrow with booking or instant */
  source?: 'booking' | 'instant';
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

/** StarPower booking + instant astrologer recordings (gateway: /api/dashboard/api/astro/call-recordings) */
const BASE = `${API_CONFIG.BASE_URL}/astro/call-recordings`;

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

  /** Server converts HLS/mp4 → MP3 via ffmpeg and returns the file blob. */
  downloadMp3: async (recordingId: number): Promise<Blob> => {
    const token = localStorage.getItem(TOKEN_KEY);
    const res = await fetch(`${BASE}/${recordingId}/download-mp3`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (res.status === 401) {
      authService.handleUnauthorized();
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
      throw new ApiError('Session expired. Please log in again.', 401);
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError(
        (body as { message?: string }).message ?? `HTTP ${res.status}`,
        res.status,
        body
      );
    }
    return res.blob();
  },
};

/** Trigger a browser file download for a recording as MP3. */
export async function downloadRecordingMp3(recordingId: number, filename?: string): Promise<void> {
  const blob = await callRecordingsAPI.downloadMp3(recordingId);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename ?? `call-recording-${recordingId}.mp3`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

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
