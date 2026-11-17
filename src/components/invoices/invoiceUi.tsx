import { ReactNode } from 'react';
import { Link } from 'react-router';
import Badge from '../ui/badge';
import {
  AdminInvoicePagination,
  InvoiceScope,
  InvoiceSource,
} from '../../services/api/invoices';

export const invoiceCard =
  'rounded-2xl border border-indigo-100/80 bg-white shadow-sm dark:border-indigo-900/30 dark:bg-gray-900';
export const invoiceInput =
  'rounded-xl border border-gray-200 bg-gray-50/80 px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800/80 dark:text-white dark:focus:border-indigo-600 dark:focus:bg-gray-800';
export const invoiceBtn =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50';
export const invoiceBtnOutline =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-medium text-indigo-700 shadow-sm transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-indigo-800 dark:bg-gray-900 dark:text-indigo-300 dark:hover:bg-indigo-950/40';
export const invoiceBtnSm =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50';
export const invoiceBtnOutlineSm =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-50 disabled:opacity-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-950/40';
export const thClass =
  'px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-indigo-900/60 dark:text-indigo-300/70';
export const tdClass = 'px-4 py-4 text-sm text-gray-700 dark:text-gray-300';

export function InvoicePageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-6 py-6 shadow-sm dark:border-indigo-900/40 dark:from-indigo-950/40 dark:via-gray-900 dark:to-violet-950/20">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-200/40 blur-2xl dark:bg-indigo-600/10" />
      <div className="pointer-events-none absolute -bottom-10 left-1/3 h-24 w-24 rounded-full bg-violet-200/30 blur-2xl dark:bg-violet-600/10" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/80 px-3 py-1 text-xs font-medium text-indigo-700 backdrop-blur dark:border-indigo-800 dark:bg-gray-900/60 dark:text-indigo-300">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            GST invoice management
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
    </div>
  );
}

export function InvoiceScopeToggle({
  scope,
  onChange,
}: {
  scope: InvoiceScope;
  onChange: (scope: InvoiceScope) => void;
}) {
  return (
    <div className="inline-flex rounded-xl border border-indigo-200/80 bg-white/90 p-1 shadow-sm backdrop-blur dark:border-indigo-800 dark:bg-gray-900/80">
      {(
        [
          { id: 'all' as const, label: 'All invoices' },
          { id: 'excludeAstro' as const, label: 'Wallet only' },
        ] as const
      ).map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            scope === item.id
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function InvoiceStatCard({
  label,
  value,
  sub,
  accent = 'indigo',
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: 'indigo' | 'violet' | 'amber' | 'emerald' | 'rose';
  icon?: ReactNode;
}) {
  const accents = {
    indigo: {
      bar: 'from-indigo-500 to-violet-500',
      text: 'text-indigo-600 dark:text-indigo-400',
      icon: 'from-indigo-500/15 to-indigo-500/5',
    },
    violet: {
      bar: 'from-violet-500 to-purple-500',
      text: 'text-violet-600 dark:text-violet-400',
      icon: 'from-violet-500/15 to-violet-500/5',
    },
    amber: {
      bar: 'from-amber-500 to-orange-500',
      text: 'text-amber-600 dark:text-amber-400',
      icon: 'from-amber-500/15 to-amber-500/5',
    },
    emerald: {
      bar: 'from-emerald-500 to-teal-500',
      text: 'text-emerald-600 dark:text-emerald-400',
      icon: 'from-emerald-500/15 to-emerald-500/5',
    },
    rose: {
      bar: 'from-rose-500 to-pink-500',
      text: 'text-rose-600 dark:text-rose-400',
      icon: 'from-rose-500/15 to-rose-500/5',
    },
  };
  const tone = accents[accent];

  return (
    <div className={`${invoiceCard} relative overflow-hidden p-5`}>
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tone.bar}`} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className={`mt-2 text-3xl font-bold tracking-tight ${tone.text}`}>
            {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
          </p>
          {sub && <p className="mt-1.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{sub}</p>}
        </div>
        {icon && (
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${tone.icon}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export function InvoiceSectionCard({
  title,
  description,
  action,
  children,
  className = '',
  noPadding,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <div className={`${invoiceCard} overflow-hidden ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-indigo-50 px-5 py-4 dark:border-indigo-900/30">
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
        {action}
      </div>
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </div>
  );
}

export function InvoiceAlert({
  type,
  message,
  onDismiss,
}: {
  type: 'error' | 'success';
  message: string;
  onDismiss?: () => void;
}) {
  const styles =
    type === 'error'
      ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200'
      : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200';

  return (
    <div className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${styles}`}>
      <p>{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-lg leading-none opacity-60 transition hover:opacity-100"
        >
          ×
        </button>
      )}
    </div>
  );
}

export function InvoiceLoading({ label = 'Loading invoices…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

export function InvoiceEmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-400 dark:bg-indigo-950/40 dark:text-indigo-500">
        {icon ?? (
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )}
      </div>
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{title}</p>
        {description && (
          <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
    </div>
  );
}

export function InvoicePaginationBar({
  pagination,
  onPage,
}: {
  pagination: AdminInvoicePagination;
  onPage: (page: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-indigo-50 px-5 py-4 dark:border-indigo-900/30">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Page {pagination.page} of {pagination.pages} · {pagination.total.toLocaleString('en-IN')} total
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!pagination.hasPrev}
          onClick={() => onPage(pagination.page - 1)}
          className={invoiceBtnOutline}
        >
          Previous
        </button>
        <button
          type="button"
          disabled={!pagination.hasNext}
          onClick={() => onPage(pagination.page + 1)}
          className={invoiceBtnOutline}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export function InvoiceSourceBadge({ source }: { source: InvoiceSource }) {
  return (
    <Badge color={source === 'wallet' ? 'info' : 'success'} size="sm">
      {source === 'wallet' ? 'Wallet' : 'Astro'}
    </Badge>
  );
}

export function InvoiceBackLink({ to = '/all-invoices', children }: { to?: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 transition hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
    >
      <span aria-hidden>←</span>
      {children}
    </Link>
  );
}

export function InvoiceCoverageRing({
  generated,
  total,
  label,
}: {
  generated: number;
  total: number;
  label: string;
}) {
  const pct = total > 0 ? Math.round((generated / total) * 100) : 0;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className={`${invoiceCard} flex items-center gap-5 p-5`}>
      <div className="relative h-24 w-24 shrink-0">
        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-100 dark:text-gray-800" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="text-indigo-500 transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-900 dark:text-white">{pct}%</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
          {generated.toLocaleString('en-IN')} of {total.toLocaleString('en-IN')}
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">invoices generated</p>
      </div>
    </div>
  );
}

export function InvoiceSearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative min-w-[220px] flex-1">
      <svg
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${invoiceInput} w-full pl-10`}
      />
    </div>
  );
}

export function PdfStatusBadge({ exists }: { exists: boolean }) {
  return exists ? (
    <Badge color="success" size="sm">PDF ready</Badge>
  ) : (
    <Badge color="warning" size="sm">Missing</Badge>
  );
}
