import type {
  SupportTicketPriority,
  SupportTicketStatus,
  SupportTicketType,
} from '../../services/api/support';

export const TICKET_STATUS_LABELS: Record<SupportTicketStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  waiting_on_user: 'Waiting on partner',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const TICKET_PRIORITY_LABELS: Record<SupportTicketPriority, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent',
};

export const TICKET_TYPE_LABELS: Record<SupportTicketType, string> = {
  general_help: 'General help',
  bug_report: 'Bug report',
  session_issue: 'Session issue',
  booking_issue: 'Booking issue',
  payout_issue: 'Payout issue',
  account_verification: 'Account verification',
  harassment_safety: 'Harassment / safety',
  technical_issue: 'Technical issue',
  feature_request: 'Feature request',
  other: 'Other',
};

export const TICKET_STATUSES = Object.keys(TICKET_STATUS_LABELS) as SupportTicketStatus[];
export const TICKET_PRIORITIES = Object.keys(TICKET_PRIORITY_LABELS) as SupportTicketPriority[];
export const TICKET_TYPES = Object.keys(TICKET_TYPE_LABELS) as SupportTicketType[];

export function statusBadgeColor(
  status: SupportTicketStatus
): 'success' | 'warning' | 'error' | 'info' | 'dark' {
  switch (status) {
    case 'open':
      return 'info';
    case 'in_progress':
      return 'warning';
    case 'waiting_on_user':
      return 'warning';
    case 'resolved':
      return 'success';
    case 'closed':
      return 'dark';
    default:
      return 'dark';
  }
}

export function priorityBadgeColor(
  priority: SupportTicketPriority
): 'success' | 'warning' | 'error' | 'info' | 'dark' {
  switch (priority) {
    case 'urgent':
      return 'error';
    case 'high':
      return 'warning';
    case 'normal':
      return 'info';
    case 'low':
      return 'dark';
    default:
      return 'dark';
  }
}
