import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import Badge from '../../components/ui/badge';
import { ApiError } from '../../services/api/base';
import type {
  SupportClient,
  SupportTicketDetail,
  SupportTicketStatus,
} from '../../services/api/support';
import {
  TICKET_PRIORITY_LABELS,
  TICKET_STATUS_LABELS,
  TICKET_STATUSES,
  TICKET_TYPE_LABELS,
  priorityBadgeColor,
  statusBadgeColor,
} from './supportLabels';
import type { SupportVariant } from './SupportTicketsPage';
import {
  AstroAlert,
  AstroBackLink,
  AstroInfoRow,
  AstroLoading,
  AstroSectionCard,
  formatAstroDate,
} from '../astro/components/astroUi';
import {
  MessageBubble,
  PartnerSidebarCard,
  QuickStatusActions,
  formatRelativeTime,
  useSupportTheme,
} from './supportUi';

export interface SupportTicketDetailConfig {
  variant: SupportVariant;
  api: SupportClient;
  listPath: string;
  partnerLabel: string;
}

function partnerProfileLink(variant: SupportVariant, ticket: SupportTicketDetail): string {
  if (variant === 'astro') {
    return ticket.partnerRole === 'astrologer'
      ? `/astro/astrologers/${ticket.userId}`
      : `/astro/users/${ticket.userId}`;
  }
  return `/enhanced-user-details?userId=${ticket.userId}`;
}

export default function SupportTicketDetailPage({ config }: { config: SupportTicketDetailConfig }) {
  const { variant, api, listPath, partnerLabel } = config;
  const theme = useSupportTheme(variant);
  const { ticketId } = useParams<{ ticketId: string }>();
  const threadEndRef = useRef<HTMLDivElement>(null);

  const [ticket, setTicket] = useState<SupportTicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [newStatus, setNewStatus] = useState<SupportTicketStatus>('in_progress');
  const [submitting, setSubmitting] = useState<'reply' | 'status' | null>(null);

  const load = useCallback(async () => {
    if (!ticketId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTicket(Number(ticketId));
      setTicket(data);
      setNewStatus(data.status);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  }, [api, ticketId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages.length]);

  const handleReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!ticket || !reply.trim()) return;
    try {
      setSubmitting('reply');
      setError(null);
      await api.reply(ticket.ticketId, reply.trim());
      setReply('');
      setSuccess('Reply sent — partner will be notified');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send reply');
    } finally {
      setSubmitting(null);
    }
  };

  const handleStatusUpdate = async (status: SupportTicketStatus, note?: string) => {
    if (!ticket) return;
    try {
      setSubmitting('status');
      setError(null);
      await api.updateStatus(ticket.ticketId, status, note?.trim() || undefined);
      setStatusNote('');
      setNewStatus(status);
      setSuccess(`Status updated to ${TICKET_STATUS_LABELS[status]}`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update status');
    } finally {
      setSubmitting(null);
    }
  };

  const isClosed = ticket?.status === 'closed' || ticket?.status === 'resolved';

  if (loading) {
    return theme.isAstro ? <AstroLoading label="Loading ticket…" /> : (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <p className="text-sm text-gray-500">Loading ticket…</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="space-y-4">
        {theme.isAstro ? (
          <AstroBackLink to={listPath}>Back to support</AstroBackLink>
        ) : (
          <Link to={listPath} className={`text-sm font-medium ${theme.link}`}>← Back to support</Link>
        )}
        <p className="text-red-600">{error ?? 'Ticket not found'}</p>
      </div>
    );
  }

  const profileLink = partnerProfileLink(variant, ticket);

  return (
    <div className="space-y-6">
      {theme.isAstro ? (
        <AstroBackLink to={listPath}>Back to support tickets</AstroBackLink>
      ) : (
        <Link to={listPath} className={`inline-flex text-sm font-medium ${theme.link}`}>
          ← Back to support tickets
        </Link>
      )}

      {/* Header */}
      <div className={`${theme.card} p-5`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`font-mono text-sm font-bold ${theme.link}`}>{ticket.ticketNumber}</span>
              <Badge size="sm" color={statusBadgeColor(ticket.status)}>
                {TICKET_STATUS_LABELS[ticket.status]}
              </Badge>
              <Badge size="sm" color={priorityBadgeColor(ticket.priority)}>
                {TICKET_PRIORITY_LABELS[ticket.priority]}
              </Badge>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                {TICKET_TYPE_LABELS[ticket.type]}
              </span>
            </div>
            <h1 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">{ticket.subject}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Opened {formatRelativeTime(ticket.createdAt)} · Updated {formatRelativeTime(ticket.updatedAt)}
            </p>
          </div>
          {!isClosed && (
            <QuickStatusActions
              currentStatus={ticket.status}
              variant={variant}
              disabled={submitting === 'status'}
              onSelect={(s) => void handleStatusUpdate(s)}
            />
          )}
        </div>
      </div>

      {error && (
        theme.isAstro ? (
          <AstroAlert type="error" message={error} onDismiss={() => setError(null)} />
        ) : (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )
      )}
      {success && (
        theme.isAstro ? (
          <AstroAlert type="success" message={success} onDismiss={() => setSuccess(null)} />
        ) : (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-200">
            {success}
          </div>
        )
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Thread */}
          <div className={`${theme.card} flex flex-col`}>
            <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-white">Conversation</h2>
              <p className="text-xs text-gray-500">{ticket.messages.length} message{ticket.messages.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="max-h-[520px] space-y-4 overflow-y-auto px-5 py-5">
              {/* Original issue as opening message */}
              <MessageBubble
                sender="partner"
                message={ticket.description}
                createdAt={ticket.createdAt}
                variant={variant}
              />
              {ticket.messages
                .filter((m) => m.message !== ticket.description)
                .map((msg) => (
                  <MessageBubble
                    key={msg.messageId}
                    sender={msg.sender}
                    message={msg.message}
                    createdAt={msg.createdAt}
                    variant={variant}
                  />
                ))}
              <div ref={threadEndRef} />
            </div>

            {!isClosed ? (
              <form onSubmit={(e) => void handleReply(e)} className="border-t border-gray-100 p-4 dark:border-gray-800">
                <textarea
                  required
                  rows={3}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Write a reply to the partner…"
                  className={theme.input}
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-gray-400">Reply sets status to “Waiting on partner” and sends a push notification</p>
                  <button type="submit" disabled={submitting === 'reply' || !reply.trim()} className={theme.btn}>
                    {submitting === 'reply' ? 'Sending…' : 'Send reply'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="border-t border-gray-100 px-5 py-4 text-sm text-gray-500 dark:border-gray-800">
                This ticket is {ticket.status}. Reopen by changing status to resume the conversation.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <PartnerSidebarCard
            ticket={ticket}
            variant={variant}
            partnerLabel={partnerLabel}
            profileLink={profileLink}
          />

          {theme.isAstro ? (
            <AstroSectionCard title="Ticket metadata">
              <TicketMetaExtra ticket={ticket} isAstro />
            </AstroSectionCard>
          ) : (
            <div className={`${theme.card} p-5`}>
              <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Ticket metadata</h3>
              <TicketMetaExtra ticket={ticket} isAstro={false} />
            </div>
          )}

          {theme.isAstro ? (
            <AstroSectionCard title="Change status" description="Adds a system message in the thread">
              <StatusForm
                newStatus={newStatus}
                statusNote={statusNote}
                submitting={submitting === 'status'}
                inputClass={theme.input}
                btnOutline={theme.btnOutline}
                onStatusChange={setNewStatus}
                onNoteChange={setStatusNote}
                onSubmit={() => void handleStatusUpdate(newStatus, statusNote)}
              />
            </AstroSectionCard>
          ) : (
            <div className={`${theme.card} p-5`}>
              <h3 className="font-semibold text-gray-900 dark:text-white">Change status</h3>
              <p className="mb-4 text-xs text-gray-500">Adds a system message in the thread</p>
              <StatusForm
                newStatus={newStatus}
                statusNote={statusNote}
                submitting={submitting === 'status'}
                inputClass={theme.input}
                btnOutline={theme.btnOutline}
                onStatusChange={setNewStatus}
                onNoteChange={setStatusNote}
                onSubmit={() => void handleStatusUpdate(newStatus, statusNote)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TicketMetaExtra({ ticket, isAstro }: { ticket: SupportTicketDetail; isAstro: boolean }) {
  const rows: { label: string; value: string; mono?: boolean }[] = [];
  if (ticket.sessionId) rows.push({ label: 'Session ID', value: ticket.sessionId, mono: true });
  if (ticket.bookingId) rows.push({ label: 'Booking ID', value: String(ticket.bookingId), mono: true });
  if (ticket.sessionType) rows.push({ label: 'Session type', value: ticket.sessionType });
  if (ticket.relatedUserId) rows.push({ label: 'Related user', value: String(ticket.relatedUserId), mono: true });
  if (ticket.deviceInfo) {
    const d = ticket.deviceInfo as Record<string, string>;
    const parts = [d.platform, d.appVersion].filter(Boolean).join(' · ');
    if (parts) rows.push({ label: 'Device', value: parts });
  }
  rows.push({
    label: 'Created',
    value: isAstro ? formatAstroDate(ticket.createdAt) : new Date(ticket.createdAt).toLocaleString(),
  });

  if (rows.length === 0) {
    return <p className="text-sm text-gray-500">No linked session or booking</p>;
  }

  if (isAstro) {
    return (
      <div>
        {rows.map((row) => (
          <AstroInfoRow key={row.label} label={row.label} value={row.value} mono={row.mono} />
        ))}
      </div>
    );
  }

  return (
    <dl className="space-y-3 text-sm">
      {rows.map((row) => (
        <div key={row.label}>
          <dt className="text-gray-500">{row.label}</dt>
          <dd className={`mt-0.5 font-medium text-gray-900 dark:text-white ${row.mono ? 'font-mono text-xs' : ''}`}>
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function StatusForm({
  newStatus,
  statusNote,
  submitting,
  inputClass,
  btnOutline,
  onStatusChange,
  onNoteChange,
  onSubmit,
}: {
  newStatus: SupportTicketStatus;
  statusNote: string;
  submitting: boolean;
  inputClass: string;
  btnOutline: string;
  onStatusChange: (s: SupportTicketStatus) => void;
  onNoteChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-3">
      <select
        value={newStatus}
        onChange={(e) => onStatusChange(e.target.value as SupportTicketStatus)}
        className={inputClass}
      >
        {TICKET_STATUSES.map((s) => (
          <option key={s} value={s}>{TICKET_STATUS_LABELS[s]}</option>
        ))}
      </select>
      <textarea
        rows={2}
        value={statusNote}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="Optional note for the system message"
        className={inputClass}
      />
      <button
        type="button"
        disabled={submitting}
        onClick={onSubmit}
        className={`${btnOutline} w-full`}
      >
        {submitting ? 'Updating…' : 'Update status'}
      </button>
    </div>
  );
}
