import { TOKEN_KEY, UNAUTHORIZED_EVENT, authService } from '../auth/dashboardAuth';
import { API_CONFIG } from './config';
import { ApiError } from './base';

export type SupportTicketStatus =
  | 'open'
  | 'in_progress'
  | 'waiting_on_user'
  | 'resolved'
  | 'closed';

export type SupportTicketPriority = 'low' | 'normal' | 'high' | 'urgent';

export type SupportTicketType =
  | 'general_help'
  | 'bug_report'
  | 'session_issue'
  | 'booking_issue'
  | 'payout_issue'
  | 'account_verification'
  | 'harassment_safety'
  | 'technical_issue'
  | 'feature_request'
  | 'other';

export type SupportMessageSender = 'partner' | 'admin' | 'system';

export interface SupportPartner {
  userId: number;
  fullName: string;
  mobileNo: string;
  email?: string | null;
  profilePhoto?: string | null;
}

export interface SupportTicket {
  ticketId: number;
  ticketNumber: string;
  userId: number;
  partnerRole: 'listener' | 'astrologer';
  type: SupportTicketType;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  subject: string;
  description: string;
  sessionId: string | null;
  bookingId: number | null;
  sessionType: string | null;
  relatedUserId: number | null;
  deviceInfo: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
  lastMessagePreview: string | null;
  unreadByPartner: boolean;
  partner: SupportPartner;
}

export interface SupportMessage {
  messageId: number;
  ticketId: number;
  sender: SupportMessageSender;
  message: string;
  attachments: unknown[];
  createdAt: string;
}

export interface SupportTicketDetail extends SupportTicket {
  messages: SupportMessage[];
}

export interface SupportTicketStats {
  open: number;
  in_progress: number;
  waiting_on_user: number;
  resolved: number;
  closed: number;
  urgent: number;
  active: number;
  total: number;
}

export interface SupportTicketPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SupportTicketListResult {
  tickets: SupportTicket[];
  pagination: SupportTicketPagination;
}

export interface SupportFaq {
  faqId: number;
  question: string;
  answer: string;
  partnerRole: 'listener' | 'astrologer' | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
}

export interface TicketListParams {
  page?: number;
  limit?: number;
  status?: SupportTicketStatus;
  type?: SupportTicketType;
  priority?: SupportTicketPriority;
  search?: string;
  userId?: number;
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const SUPPORT_BASE = {
  listener: `${API_CONFIG.BASE_URL}/dashboard/support`,
  astro: `${API_CONFIG.BASE_URL}/astro/support`,
} as const;

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

async function supportRequest<T>(baseUrl: string, path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const url = `${baseUrl}${path}`;

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

function createSupportClient(baseUrl: string) {
  return {
    getStats: () =>
      supportRequest<ApiEnvelope<SupportTicketStats>>(baseUrl, '/tickets/stats').then((r) => r.data),

    listTickets: (params?: TicketListParams) =>
      supportRequest<ApiEnvelope<SupportTicketListResult>>(
        baseUrl,
        `/tickets${buildQuery(params as Record<string, string | number | undefined>)}`
      ).then((r) => r.data),

    getTicket: (ticketId: number) =>
      supportRequest<ApiEnvelope<SupportTicketDetail>>(baseUrl, `/tickets/${ticketId}`).then(
        (r) => r.data
      ),

    reply: (ticketId: number, message: string) =>
      supportRequest<ApiEnvelope<SupportMessage>>(baseUrl, `/tickets/${ticketId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ message, attachments: [] }),
      }).then((r) => r.data),

    updateStatus: (ticketId: number, status: SupportTicketStatus, note?: string) =>
      supportRequest<ApiEnvelope<{ ticketId: number; status: SupportTicketStatus }>>(
        baseUrl,
        `/tickets/${ticketId}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status, ...(note ? { note } : {}) }),
        }
      ).then((r) => r.data),

    listFaq: () =>
      supportRequest<ApiEnvelope<SupportFaq[]>>(baseUrl, '/faq').then((r) => r.data),

    createFaq: (input: { question: string; answer: string; sortOrder?: number; isActive?: boolean }) =>
      supportRequest<ApiEnvelope<SupportFaq>>(baseUrl, '/faq', {
        method: 'POST',
        body: JSON.stringify(input),
      }).then((r) => r.data),

    updateFaq: (
      faqId: number,
      input: Partial<{ question: string; answer: string; sortOrder: number; isActive: boolean }>
    ) =>
      supportRequest<ApiEnvelope<SupportFaq>>(baseUrl, `/faq/${faqId}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      }).then((r) => r.data),

    deleteFaq: (faqId: number) =>
      supportRequest<ApiEnvelope<{ faqId: number }>>(baseUrl, `/faq/${faqId}`, {
        method: 'DELETE',
      }).then((r) => r.data),
  };
}

export const listenerSupportAPI = createSupportClient(SUPPORT_BASE.listener);
export const astroSupportAPI = createSupportClient(SUPPORT_BASE.astro);

export type SupportClient = ReturnType<typeof createSupportClient>;
