import { ReactNode } from 'react';
import { Link } from 'react-router';
import Badge from '../../components/ui/badge';
import type { SupportTicket, SupportTicketStats, SupportTicketStatus } from '../../services/api/support';
import {
  TICKET_PRIORITY_LABELS,
  TICKET_STATUS_LABELS,
  TICKET_TYPE_LABELS,
  priorityBadgeColor,
  statusBadgeColor,
} from './supportLabels';
import type { SupportVariant } from './SupportTicketsPage';
import { AstroAvatar } from '../astro/components/astroUi';

export function useSupportTheme(variant: SupportVariant) {
  const isAstro = variant === 'astro';
  return {
    isAstro,
    accent: isAstro ? 'brand' : 'blue',
    card: isAstro
      ? 'rounded-xl border border-brand-100 bg-white dark:border-brand-900/40 dark:bg-gray-900'
      : 'rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
    cardHover: isAstro
      ? 'hover:border-brand-300 hover:bg-brand-50/30 dark:hover:border-brand-700 dark:hover:bg-brand-950/20'
      : 'hover:border-blue-200 hover:bg-blue-50/30 dark:hover:border-blue-800 dark:hover:bg-blue-950/20',
    link: isAstro
      ? 'text-brand-700 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300'
      : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300',
    btn: isAstro
      ? 'rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-colors'
      : 'rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors',
    btnOutline: isAstro
      ? 'rounded-lg border border-brand-300 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50 dark:border-brand-700 dark:text-brand-400 dark:hover:bg-brand-950/30 disabled:opacity-50'
      : 'rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 disabled:opacity-50',
    btnSm: isAstro
      ? 'rounded-md bg-brand-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50'
      : 'rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50',
    input:
      'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-transparent focus:outline-none focus:ring-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white ' +
      (isAstro ? 'focus:ring-brand-500' : 'focus:ring-blue-500'),
    tabActive: isAstro
      ? 'bg-brand-600 text-white shadow-sm'
      : 'bg-blue-600 text-white shadow-sm',
    tabInactive: isAstro
      ? 'text-brand-800 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-950/30'
      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50',
    chipActive: isAstro
      ? 'bg-brand-600 text-white ring-brand-600'
      : 'bg-blue-600 text-white ring-blue-600',
    chipInactive: isAstro
      ? 'bg-white text-gray-700 ring-brand-200 hover:bg-brand-50 dark:bg-gray-900 dark:text-gray-200 dark:ring-brand-900/50'
      : 'bg-white text-gray-700 ring-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700',
    ring: isAstro ? 'ring-brand-500/20' : 'ring-blue-500/20',
  };
}

export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function SupportStatGrid({
  stats,
  variant,
  activeFilter,
  onFilter,
}: {
  stats: SupportTicketStats;
  variant: SupportVariant;
  activeFilter: string;
  onFilter: (key: string) => void;
}) {
  const theme = useSupportTheme(variant);
  const items = [
    { key: 'active', label: 'Active', value: stats.active, hint: 'Open + in progress + waiting', accent: 'amber' as const },
    { key: 'open', label: 'Open', value: stats.open, accent: 'sky' as const },
    { key: 'waiting_on_user', label: 'Waiting', value: stats.waiting_on_user, hint: 'Partner replied', accent: 'amber' as const },
    { key: 'urgent', label: 'Urgent', value: stats.urgent, hint: 'Needs immediate attention', accent: 'red' as const },
    { key: 'resolved', label: 'Resolved', value: stats.resolved, accent: 'brand' as const },
    { key: 'total', label: 'Total', value: stats.total, accent: 'gray' as const },
  ];

  const accentBorder: Record<string, string> = {
    amber: 'border-amber-200 dark:border-amber-900/40',
    sky: 'border-sky-200 dark:border-sky-900/40',
    red: 'border-red-200 dark:border-red-900/40',
    brand: theme.isAstro ? 'border-brand-200 dark:border-brand-900/40' : 'border-green-200 dark:border-green-900/40',
    gray: 'border-gray-200 dark:border-gray-700',
  };

  const accentText: Record<string, string> = {
    amber: 'text-amber-600 dark:text-amber-400',
    sky: 'text-sky-600 dark:text-sky-400',
    red: 'text-red-600 dark:text-red-400',
    brand: theme.isAstro ? 'text-brand-600 dark:text-brand-400' : 'text-green-600 dark:text-green-400',
    gray: 'text-gray-900 dark:text-white',
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((item) => {
        const selected = activeFilter === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onFilter(item.key)}
            className={`${theme.card} ${accentBorder[item.accent]} p-4 text-left transition-all ${
              selected ? `ring-2 ${theme.ring} scale-[1.02]` : 'hover:shadow-md'
            }`}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {item.label}
            </p>
            <p className={`mt-1 text-2xl font-bold ${accentText[item.accent]}`}>{item.value}</p>
            {item.hint && (
              <p className="mt-1 text-[10px] leading-tight text-gray-400">{item.hint}</p>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function StatusQuickFilters({
  variant,
  status,
  priority,
  onStatusChange,
  onPriorityChange,
  onClear,
}: {
  variant: SupportVariant;
  status: string;
  priority: string;
  onStatusChange: (v: string) => void;
  onPriorityChange: (v: string) => void;
  onClear: () => void;
}) {
  const theme = useSupportTheme(variant);
  const chips: { label: string; status?: string; priority?: string }[] = [
    { label: 'All open', status: 'open' },
    { label: 'In progress', status: 'in_progress' },
    { label: 'Partner replied', status: 'waiting_on_user' },
    { label: 'Urgent', priority: 'urgent' },
    { label: 'Resolved', status: 'resolved' },
  ];

  const hasFilters = status || priority;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => {
        const active =
          (chip.status && status === chip.status) ||
          (chip.priority && priority === chip.priority);
        return (
          <button
            key={chip.label}
            type="button"
            onClick={() => {
              onStatusChange(chip.status ?? '');
              onPriorityChange(chip.priority ?? '');
            }}
            className={`rounded-full px-3 py-1 text-xs font-medium ring-1 transition-colors ${
              active ? theme.chipActive : theme.chipInactive
            }`}
          >
            {chip.label}
          </button>
        );
      })}
      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-medium text-gray-500 underline-offset-2 hover:underline dark:text-gray-400"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

export function TicketInboxCard({
  ticket,
  variant,
  basePath,
  partnerProfileLink,
}: {
  ticket: SupportTicket;
  variant: SupportVariant;
  basePath: string;
  partnerProfileLink: string;
}) {
  const theme = useSupportTheme(variant);
  const urgent = ticket.priority === 'urgent';
  const waiting = ticket.status === 'waiting_on_user';

  return (
    <Link
      to={`${basePath}/${ticket.ticketId}`}
      className={`block ${theme.card} ${theme.cardHover} p-4 transition-all ${
        urgent
          ? 'border-l-4 border-l-red-500'
          : waiting
            ? 'border-l-4 border-l-amber-500'
            : ''
      }`}
    >
      <div className="flex gap-4">
        <AstroAvatar name={ticket.partner.fullName} photo={ticket.partner.profilePhoto} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`font-mono text-xs font-semibold ${theme.link}`}>
                  {ticket.ticketNumber}
                </span>
                {urgent && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700 dark:bg-red-950/50 dark:text-red-300">
                    Urgent
                  </span>
                )}
                {waiting && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                    Partner replied
                  </span>
                )}
              </div>
              <h3 className="mt-1 truncate font-semibold text-gray-900 dark:text-white">
                {ticket.subject}
              </h3>
            </div>
            <span className="shrink-0 text-xs text-gray-400" title={new Date(ticket.updatedAt).toLocaleString()}>
              {formatRelativeTime(ticket.updatedAt)}
            </span>
          </div>

          <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
            {ticket.lastMessagePreview || ticket.description}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge size="sm" color={statusBadgeColor(ticket.status)}>
              {TICKET_STATUS_LABELS[ticket.status]}
            </Badge>
            <Badge size="sm" color={priorityBadgeColor(ticket.priority)}>
              {TICKET_PRIORITY_LABELS[ticket.priority]}
            </Badge>
            <span className="text-xs text-gray-400">
              {TICKET_TYPE_LABELS[ticket.type]}
            </span>
            <span className="text-xs text-gray-400">·</span>
            <Link
              to={partnerProfileLink}
              onClick={(e) => e.stopPropagation()}
              className={`text-xs font-medium ${theme.link}`}
            >
              {ticket.partner.fullName}
            </Link>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function EmptyTicketsState({ variant, hasFilters }: { variant: SupportVariant; hasFilters: boolean }) {
  const theme = useSupportTheme(variant);
  return (
    <div className={`${theme.card} flex flex-col items-center justify-center px-6 py-16 text-center`}>
      <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${theme.isAstro ? 'bg-brand-100 dark:bg-brand-950/40' : 'bg-blue-100 dark:bg-blue-950/40'}`}>
        <svg className={`h-8 w-8 ${theme.isAstro ? 'text-brand-600' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {hasFilters ? 'No tickets match your filters' : 'Inbox is clear'}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
        {hasFilters
          ? 'Try adjusting filters or search terms to find tickets.'
          : 'New partner support requests will appear here.'}
      </p>
    </div>
  );
}

export function TicketListSkeleton({ variant }: { variant: SupportVariant }) {
  const theme = useSupportTheme(variant);
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={`${theme.card} animate-pulse p-4`}>
          <div className="flex gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MessageBubble({
  sender,
  message,
  createdAt,
  variant,
}: {
  sender: string;
  message: string;
  createdAt: string;
  variant: SupportVariant;
}) {
  const isAdmin = sender === 'admin';
  const isSystem = sender === 'system';
  const theme = useSupportTheme(variant);

  if (isSystem) {
    return (
      <div className="flex justify-center py-1">
        <div className="max-w-md rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-center text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-400">
          {message}
          <span className="ml-2 opacity-60">{formatRelativeTime(createdAt)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
          isAdmin
            ? theme.isAstro
              ? 'rounded-br-md bg-brand-600 text-white'
              : 'rounded-br-md bg-blue-600 text-white'
            : 'rounded-bl-md border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
        }`}
      >
        <div className={`mb-1 flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-wide ${
          isAdmin ? 'text-white/80' : 'text-gray-400'
        }`}>
          <span>{isAdmin ? 'You (Admin)' : 'Partner'}</span>
          <span>{formatRelativeTime(createdAt)}</span>
        </div>
        <p className={`whitespace-pre-wrap text-sm leading-relaxed ${isAdmin ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>
          {message}
        </p>
      </div>
    </div>
  );
}

export function PartnerSidebarCard({
  ticket,
  variant,
  partnerLabel,
  profileLink,
}: {
  ticket: { partner: { fullName: string; mobileNo: string; email?: string | null; profilePhoto?: string | null }; type: string; createdAt: string };
  variant: SupportVariant;
  partnerLabel: string;
  profileLink: string;
}) {
  const theme = useSupportTheme(variant);
  return (
    <div className={`${theme.card} overflow-hidden`}>
      <div className={`px-5 py-6 ${theme.isAstro ? 'bg-gradient-to-br from-brand-50 to-teal-50 dark:from-brand-950/30 dark:to-teal-950/20' : 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20'}`}>
        <div className="flex items-center gap-4">
          <AstroAvatar name={ticket.partner.fullName} photo={ticket.partner.profilePhoto} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-gray-900 dark:text-white">
              {ticket.partner.fullName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{partnerLabel}</p>
            <p className="mt-1 font-mono text-xs text-gray-500">{ticket.partner.mobileNo}</p>
            {ticket.partner.email && (
              <p className="truncate text-xs text-gray-500">{ticket.partner.email}</p>
            )}
          </div>
        </div>
        <Link to={profileLink} className={`mt-4 inline-flex text-sm font-medium ${theme.link}`}>
          View profile →
        </Link>
      </div>
      <div className="space-y-0 px-5 py-4 text-sm">
        <MetaRow label="Issue type" value={TICKET_TYPE_LABELS[ticket.type as keyof typeof TICKET_TYPE_LABELS] ?? ticket.type} />
        <MetaRow label="Opened" value={formatRelativeTime(ticket.createdAt)} />
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-gray-100 py-2.5 last:border-0 dark:border-gray-800">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-right font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}

export function QuickStatusActions({
  currentStatus,
  variant,
  onSelect,
  disabled,
}: {
  currentStatus: SupportTicketStatus;
  variant: SupportVariant;
  onSelect: (status: SupportTicketStatus) => void;
  disabled?: boolean;
}) {
  const theme = useSupportTheme(variant);
  const actions: { status: SupportTicketStatus; label: string }[] = [
    { status: 'in_progress', label: 'Start work' },
    { status: 'waiting_on_user', label: 'Waiting on partner' },
    { status: 'resolved', label: 'Resolve' },
    { status: 'closed', label: 'Close' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <button
          key={action.status}
          type="button"
          disabled={disabled || currentStatus === action.status}
          onClick={() => onSelect(action.status)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-40 ${
            currentStatus === action.status ? theme.chipActive : theme.chipInactive
          } ring-1`}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
