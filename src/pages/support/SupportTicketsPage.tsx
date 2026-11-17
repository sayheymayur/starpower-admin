import { FormEvent, useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../services/api/base';
import type { SupportClient, SupportFaq, SupportTicket, SupportTicketStats } from '../../services/api/support';
import {
  TICKET_STATUSES,
  TICKET_STATUS_LABELS,
  TICKET_TYPES,
  TICKET_TYPE_LABELS,
} from './supportLabels';
import {
  AstroAlert,
  AstroPageHeader,
  AstroPaginationBar,
} from '../astro/components/astroUi';
import { normalizeAstroPagination, type AstroPagination } from '../../services/api/astro';
import {
  EmptyTicketsState,
  StatusQuickFilters,
  SupportStatGrid,
  TicketInboxCard,
  TicketListSkeleton,
  useSupportTheme,
} from './supportUi';

export type SupportVariant = 'admin' | 'astro';

export interface SupportTicketsConfig {
  variant: SupportVariant;
  api: SupportClient;
  basePath: string;
  partnerLabel: string;
  title: string;
  description: string;
}

const PAGE_SIZE = 20;

function partnerProfileLink(variant: SupportVariant, ticket: SupportTicket): string {
  if (variant === 'astro') {
    return ticket.partnerRole === 'astrologer'
      ? `/astro/astrologers/${ticket.userId}`
      : `/astro/users/${ticket.userId}`;
  }
  return `/enhanced-user-details?userId=${ticket.userId}`;
}

export default function SupportTicketsPage({ config }: { config: SupportTicketsConfig }) {
  const { variant, api, basePath, partnerLabel, title, description } = config;
  const theme = useSupportTheme(variant);

  const [tab, setTab] = useState<'tickets' | 'faq'>('tickets');
  const [stats, setStats] = useState<SupportTicketStats | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [pagination, setPagination] = useState<AstroPagination | null>(null);
  const [faqs, setFaqs] = useState<SupportFaq[]>([]);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [priority, setPriority] = useState('');
  const [userId, setUserId] = useState('');
  const [statFilter, setStatFilter] = useState('');

  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<SupportFaq | null>(null);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqSortOrder, setFaqSortOrder] = useState('0');
  const [faqSubmitting, setFaqSubmitting] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const applyStatFilter = (key: string) => {
    setStatFilter(key);
    setPage(1);
    if (key === 'total' || key === 'active') {
      setStatus('');
      setPriority('');
      return;
    }
    if (key === 'urgent') {
      setStatus('');
      setPriority('urgent');
      return;
    }
    setPriority('');
    setStatus(key);
  };

  const clearFilters = () => {
    setStatFilter('');
    setStatus('');
    setPriority('');
    setType('');
    setUserId('');
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, listRes] = await Promise.all([
        api.getStats(),
        api.listTickets({
          page,
          limit: PAGE_SIZE,
          status: (status || undefined) as SupportTicket['status'],
          type: (type || undefined) as SupportTicket['type'],
          priority: (priority || undefined) as SupportTicket['priority'],
          search: search || undefined,
          userId: userId ? Number(userId) : undefined,
        }),
      ]);
      setStats(statsRes);
      setTickets(listRes.tickets);
      setPagination(
        normalizeAstroPagination(listRes.pagination, {
          page,
          limit: PAGE_SIZE,
          itemCount: listRes.tickets.length,
        })
      );
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  }, [api, page, priority, search, status, type, userId]);

  const loadFaqs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listFaq();
      setFaqs(data.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (tab === 'tickets') void loadTickets();
    else void loadFaqs();
  }, [tab, loadTickets, loadFaqs]);

  const openCreateFaq = () => {
    setEditingFaq(null);
    setFaqQuestion('');
    setFaqAnswer('');
    setFaqSortOrder('0');
    setFaqModalOpen(true);
  };

  const openEditFaq = (faq: SupportFaq) => {
    setEditingFaq(faq);
    setFaqQuestion(faq.question);
    setFaqAnswer(faq.answer);
    setFaqSortOrder(String(faq.sortOrder ?? 0));
    setFaqModalOpen(true);
  };

  const handleFaqSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFaqSubmitting(true);
    setError(null);
    try {
      const payload = {
        question: faqQuestion.trim(),
        answer: faqAnswer.trim(),
        sortOrder: Number(faqSortOrder) || 0,
        isActive: true,
      };
      if (editingFaq) {
        await api.updateFaq(editingFaq.faqId, payload);
        setSuccess('FAQ updated');
      } else {
        await api.createFaq(payload);
        setSuccess('FAQ created');
      }
      setFaqModalOpen(false);
      await loadFaqs();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'FAQ save failed');
    } finally {
      setFaqSubmitting(false);
    }
  };

  const handleDeleteFaq = async (faqId: number) => {
    if (!window.confirm('Delete this FAQ?')) return;
    try {
      await api.deleteFaq(faqId);
      setSuccess('FAQ deleted');
      await loadFaqs();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'FAQ delete failed');
    }
  };

  const hasFilters = Boolean(status || priority || type || userId || search);

  return (
    <div className="space-y-6">
      {theme.isAstro ? (
        <AstroPageHeader title={title} description={description} />
      ) : (
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      )}

      {/* Segmented tabs */}
      <div className={`inline-flex rounded-xl p-1 ${theme.isAstro ? 'bg-emerald-100/80 dark:bg-emerald-950/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
        {(['tickets', 'faq'] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
              tab === key ? theme.tabActive : theme.tabInactive
            }`}
          >
            {key === 'tickets' ? 'Ticket inbox' : 'Help Center FAQ'}
          </button>
        ))}
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

      {tab === 'tickets' && (
        <>
          {stats && (
            <SupportStatGrid
              stats={stats}
              variant={variant}
              activeFilter={statFilter}
              onFilter={applyStatFilter}
            />
          )}

          <div className={`${theme.card} space-y-4 p-4`}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="search"
                  placeholder="Search subject, ticket #, partner name…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className={`${theme.input} pl-10`}
                />
              </div>
              <select
                value={type}
                onChange={(e) => { setType(e.target.value); setPage(1); }}
                className={`${theme.input} lg:w-44`}
              >
                <option value="">All types</option>
                {TICKET_TYPES.map((t) => (
                  <option key={t} value={t}>{TICKET_TYPE_LABELS[t]}</option>
                ))}
              </select>
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setStatFilter(''); setPage(1); }}
                className={`${theme.input} lg:w-44`}
              >
                <option value="">All statuses</option>
                {TICKET_STATUSES.map((s) => (
                  <option key={s} value={s}>{TICKET_STATUS_LABELS[s]}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder={`${partnerLabel} ID`}
                value={userId}
                onChange={(e) => { setUserId(e.target.value); setPage(1); }}
                className={`${theme.input} lg:w-32`}
              />
            </div>

            <StatusQuickFilters
              variant={variant}
              status={status}
              priority={priority}
              onStatusChange={(v) => { setStatus(v); setStatFilter(''); setPage(1); }}
              onPriorityChange={(v) => { setPriority(v); setStatFilter(''); setPage(1); }}
              onClear={clearFilters}
            />
          </div>

          {loading ? (
            <TicketListSkeleton variant={variant} />
          ) : tickets.length === 0 ? (
            <EmptyTicketsState variant={variant} hasFilters={hasFilters} />
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <TicketInboxCard
                  key={ticket.ticketId}
                  ticket={ticket}
                  variant={variant}
                  basePath={basePath}
                  partnerProfileLink={partnerProfileLink(variant, ticket)}
                />
              ))}
            </div>
          )}

          {pagination && pagination.pages > 1 && (
            <AstroPaginationBar pagination={pagination} onPage={setPage} />
          )}
        </>
      )}

      {tab === 'faq' && (
        <div className={`${theme.card} p-5`}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Help Center</h2>
              <p className="text-sm text-gray-500">
                FAQs shown to {partnerLabel.toLowerCase()}s in the partner app
              </p>
            </div>
            <button type="button" onClick={openCreateFaq} className={theme.btn}>
              + Add FAQ
            </button>
          </div>

          {loading ? (
            <TicketListSkeleton variant={variant} />
          ) : faqs.length === 0 ? (
            <EmptyTicketsState variant={variant} hasFilters={false} />
          ) : (
            <div className="space-y-2">
              {faqs.map((faq) => {
                const open = expandedFaq === faq.faqId;
                return (
                  <div
                    key={faq.faqId}
                    className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(open ? null : faq.faqId)}
                      className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{faq.question}</p>
                        <p className="mt-0.5 text-xs text-gray-400">
                          Order {faq.sortOrder} · {faq.isActive ? 'Published' : 'Hidden'}
                        </p>
                      </div>
                      <span className={`shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}>
                        ▾
                      </span>
                    </button>
                    {open && (
                      <div className="border-t border-gray-100 px-4 py-3 dark:border-gray-800">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                          {faq.answer}
                        </p>
                        <div className="mt-3 flex gap-2">
                          <button type="button" onClick={() => openEditFaq(faq)} className={theme.btnOutline}>
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeleteFaq(faq.faqId)}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {faqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={(e) => void handleFaqSubmit(e)}
            className={`${theme.card} w-full max-w-lg shadow-xl`}
          >
            <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingFaq ? 'Edit FAQ' : 'New FAQ'}
              </h2>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Question</label>
                <input required value={faqQuestion} onChange={(e) => setFaqQuestion(e.target.value)} className={theme.input} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Answer</label>
                <textarea required rows={5} value={faqAnswer} onChange={(e) => setFaqAnswer(e.target.value)} className={theme.input} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Sort order</label>
                <input type="number" value={faqSortOrder} onChange={(e) => setFaqSortOrder(e.target.value)} className={theme.input} />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4 dark:border-gray-800">
              <button type="button" onClick={() => setFaqModalOpen(false)} className={theme.btnOutline}>
                Cancel
              </button>
              <button type="submit" disabled={faqSubmitting} className={theme.btn}>
                {faqSubmitting ? 'Saving…' : 'Save FAQ'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
