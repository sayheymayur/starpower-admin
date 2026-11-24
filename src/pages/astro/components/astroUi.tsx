import { ReactNode } from 'react';
import { Link } from 'react-router';
import Badge from '../../../components/ui/badge';
import { AstroDocuments, AstroPagination } from '../../../services/api/astro';
import { formatLocalDate } from '../../../utils/dateUtils';
import { bookingStatusPillClass, getBookingStatusLabel } from '../bookingLabels';

export const astroBtn =
  'rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-colors';
export const astroBtnOutline =
  'rounded-lg border border-brand-300 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50 dark:border-brand-700 dark:text-brand-400 dark:hover:bg-brand-950/30 disabled:opacity-50';
export const astroBtnSm =
  'rounded-md bg-brand-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-colors';
export const astroBtnOutlineSm =
  'rounded-md border border-brand-300 px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50 dark:border-brand-700 dark:text-brand-400 dark:hover:bg-brand-950/30 disabled:opacity-50';
export const astroBtnDangerSm =
  'rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30 disabled:opacity-50';
export const astroCard =
  'rounded-xl border border-brand-100 bg-white dark:border-brand-900/40 dark:bg-gray-900';
export const thClass =
  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-800/70 dark:text-brand-400/80';
export const tdClass = 'px-4 py-4 text-sm text-gray-700 dark:text-gray-300';

export function AstroLoading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

export function AstroBackLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 transition-colors hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
    >
      <span aria-hidden>←</span>
      {children}
    </Link>
  );
}

export function AstroSectionCard({
  title,
  description,
  action,
  children,
  className = '',
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${astroCard} overflow-hidden ${className}`}>
      <div className="flex items-start justify-between gap-3 border-b border-brand-100 px-5 py-4 dark:border-brand-900/40">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function AstroInfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 py-2.5 last:border-0 dark:border-gray-800">
      <span className="shrink-0 text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span
        className={`text-right text-sm font-medium text-gray-900 dark:text-gray-100 ${
          mono ? 'font-mono text-xs' : ''
        }`}
      >
        {value ?? '—'}
      </span>
    </div>
  );
}

export function AstroStatusBadge({ active }: { active: boolean }) {
  return (
    <Badge color={active ? 'success' : 'dark'} size="sm">
      {active ? 'Active' : 'Inactive'}
    </Badge>
  );
}

export function VerificationBadge({ status }: { status: number | null | undefined }) {
  if (status === null || status === undefined) {
    return <Badge color="dark" size="sm">Unknown</Badge>;
  }
  const map: Record<number, { label: string; color: 'warning' | 'success' | 'error' | 'dark' }> = {
    0: { label: 'Pending review', color: 'warning' },
    3: { label: 'Pending verification', color: 'warning' },
    1: { label: 'Verified', color: 'success' },
    4: { label: 'Verified', color: 'success' },
    2: { label: 'Rejected', color: 'error' },
  };
  const item = map[status] ?? { label: `Status ${status}`, color: 'dark' as const };
  return <Badge color={item.color} size="sm">{item.label}</Badge>;
}

export function TestAstrologerBadge({
  isTest,
  viewerCount,
}: {
  isTest?: boolean;
  viewerCount?: number;
}) {
  if (!isTest) return null;
  return (
    <Badge color="info" size="sm">
      Test{viewerCount != null && viewerCount > 0 ? ` · ${viewerCount} viewer${viewerCount === 1 ? '' : 's'}` : ''}
    </Badge>
  );
}

export function AstroQuickLink({
  to,
  label,
  description,
}: {
  to: string;
  label: string;
  description?: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-lg border border-brand-100 bg-brand-50/50 px-4 py-3 transition-colors hover:border-brand-300 hover:bg-brand-50 dark:border-brand-900/40 dark:bg-brand-950/20 dark:hover:border-brand-700"
    >
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
      <span className="text-brand-500 transition-transform group-hover:translate-x-0.5">→</span>
    </Link>
  );
}

export function AstroAvatar({
  name,
  photo,
  size = 'lg',
}: {
  name: string;
  photo?: string | null;
  size?: 'md' | 'lg' | 'xl';
}) {
  const sizeClass = { md: 'h-12 w-12 text-lg', lg: 'h-16 w-16 text-xl', xl: 'h-24 w-24 text-3xl' }[size];
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        className={`${sizeClass} shrink-0 rounded-2xl object-cover ring-4 ring-white/80 dark:ring-brand-950/60`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 font-bold text-white ring-4 ring-white/80 dark:ring-brand-950/60`}
    >
      {initial}
    </div>
  );
}

export function AstroPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function AstroStatCard({
  label,
  value,
  sub,
  accent = 'brand',
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: 'brand' | 'amber' | 'sky';
}) {
  const accentMap = {
    brand: 'text-brand-600 dark:text-brand-400',
    amber: 'text-amber-600 dark:text-amber-400',
    sky: 'text-sky-600 dark:text-sky-400',
  };
  return (
    <div className={`${astroCard} p-5`}>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${accentMap[accent]}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{sub}</p>}
    </div>
  );
}

export function AstroAlert({
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
      : 'border-brand-200 bg-brand-50 text-brand-800 dark:border-brand-900/40 dark:bg-brand-950/30 dark:text-brand-200';
  return (
    <div className={`flex justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${styles}`}>
      <p className="whitespace-pre-line">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 text-lg leading-none opacity-60 hover:opacity-100">
          ×
        </button>
      )}
    </div>
  );
}

export function AstroPaginationBar({
  pagination,
  onPage,
}: {
  pagination: AstroPagination;
  onPage: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between border-t border-brand-100 px-4 py-3 dark:border-brand-900/40">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Page {pagination.page} of {pagination.pages} · {pagination.total} total
      </p>
      <div className="flex gap-2">
        <button
          disabled={!pagination.hasPrev}
          onClick={() => onPage(pagination.page - 1)}
          className={astroBtnOutline}
        >
          Previous
        </button>
        <button
          disabled={!pagination.hasNext}
          onClick={() => onPage(pagination.page + 1)}
          className={astroBtnOutline}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export function SessionTypeBadge({ type }: { type: 1 | 2 }) {
  return (
    <Badge color={type === 1 ? 'info' : 'primary'} size="sm">
      {type === 1 ? 'Call' : 'Chat'}
    </Badge>
  );
}

export function BookingStatusPill({ status }: { status: string }) {
  const cls = bookingStatusPillClass(status);
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {getBookingStatusLabel(status)}
    </span>
  );
}

const INSTANT_SESSION_STATUS: Record<string, { label: string; color: 'success' | 'warning' | 'error' }> = {
  completed: { label: 'Completed', color: 'success' },
  in_progress: { label: 'In progress', color: 'warning' },
  cancelled_after_start: { label: 'Cut off (no end recorded)', color: 'error' },
};

export function InstantSessionStatusBadge({ status }: { status: string | null | undefined }) {
  const entry = INSTANT_SESSION_STATUS[status ?? 'completed'] ?? { label: status ?? '—', color: 'warning' as const };
  return (
    <Badge color={entry.color} size="sm">
      {entry.label}
    </Badge>
  );
}

export function FreeSessionBadge() {
  return (
    <span
      title="Free first session (system)"
      className="font-semibold text-emerald-600 dark:text-emerald-400"
    >
      FREE
    </span>
  );
}

/** 270 → "4m 30s". */
export function formatCallDuration(seconds: number | null | undefined) {
  if (seconds == null || !Number.isFinite(seconds)) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function PaymentStatusBadge({
  status,
}: {
  status: 'pending' | 'success' | 'failed' | 'refunded' | null | undefined;
}) {
  if (!status) return <span className="text-gray-400 text-xs">—</span>;
  const colorMap = {
    pending: 'warning' as const,
    success: 'success' as const,
    failed: 'error' as const,
    refunded: 'dark' as const,
  };
  return (
    <Badge color={colorMap[status]} size="sm">
      {status}
    </Badge>
  );
}

export function KycBadge({ status }: { status: number | null }) {
  if (status === null) return <span className="text-gray-400 text-xs">—</span>;
  const labels: Record<number, string> = {
    0: 'Pending',
    1: 'Verified',
    2: 'Rejected',
  };
  const colors: Record<number, 'warning' | 'success' | 'error'> = {
    0: 'warning',
    1: 'success',
    2: 'error',
  };
  return (
    <Badge color={colors[status] ?? 'dark'} size="sm">
      {labels[status] ?? `KYC ${status}`}
    </Badge>
  );
}

export const emptyAstroDocuments: AstroDocuments = {
  assessmentCertificate: null,
  qualificationProof: null,
  l2Certificate: null,
  panNo: null,
  kycStatus: null,
  rejectedRemark: null,
};

export function formatAstrologerBookings(
  stats?: { totalBookings: number; completedBookings: number } | null
) {
  if (!stats) return '—';
  return `${stats.completedBookings ?? 0}/${stats.totalBookings ?? 0}`;
}

function DocumentTile({
  title,
  href,
  icon,
}: {
  title: string;
  href?: string | null;
  icon: string;
}) {
  if (!href) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-4 dark:border-gray-700 dark:bg-gray-800/40">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-lg opacity-40 dark:bg-gray-800">
          {icon}
        </span>
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-xs text-gray-400">Not uploaded</p>
        </div>
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-3 rounded-xl border border-brand-100 bg-brand-50/40 px-4 py-4 transition-all hover:border-brand-300 hover:bg-brand-50 hover:shadow-sm dark:border-brand-900/40 dark:bg-brand-950/20 dark:hover:border-brand-700"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-lg dark:bg-brand-900/50">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
        <p className="text-xs text-brand-600 group-hover:underline dark:text-brand-400">
          Open document →
        </p>
      </div>
    </a>
  );
}

export function AstroDocumentsPanel({
  documents,
  embedded,
  variant = 'default',
}: {
  documents?: AstroDocuments | null;
  embedded?: boolean;
  /** Astrologers use L2 certificate only — not assessment / qualification. */
  variant?: 'default' | 'astrologer';
}) {
  const docs = documents ?? emptyAstroDocuments;
  const isAstrologer = variant === 'astrologer';

  const content = (
    <>
      {docs.rejectedRemark && (
        <div className="mb-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-950/30">
          <span className="text-lg">⚠️</span>
          <div>
            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">Verification rejected</p>
            <p className="mt-0.5 text-sm text-amber-800 dark:text-amber-300">{docs.rejectedRemark}</p>
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="rounded-lg bg-gray-50 px-4 py-2 dark:bg-gray-800/60">
          <p className="text-xs text-gray-500 dark:text-gray-400">PAN</p>
          <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
            {docs.panNo ?? '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">KYC status</p>
          <KycBadge status={docs.kycStatus} />
        </div>
      </div>

      {isAstrologer ? (
        <DocumentTile title="L2 certificate" href={docs.l2Certificate} icon="📜" />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DocumentTile
            title="Assessment certificate"
            href={docs.assessmentCertificate}
            icon="📄"
          />
          <DocumentTile
            title="Qualification proof"
            href={docs.qualificationProof}
            icon="🎓"
          />
        </div>
      )}
    </>
  );

  if (embedded) return content;

  return (
    <AstroSectionCard title="Documents & KYC" description="Verification documents on file">
      {content}
    </AstroSectionCard>
  );
}

export function DocIcons({
  documents,
  variant = 'default',
}: {
  documents?: AstroDocuments | null;
  variant?: 'default' | 'astrologer';
}) {
  const docs = documents ?? emptyAstroDocuments;

  if (variant === 'astrologer') {
    if (!docs.l2Certificate) return <span className="text-gray-400 text-xs">—</span>;
    return (
      <a
        href={docs.l2Certificate}
        target="_blank"
        rel="noreferrer"
        title="L2 certificate"
        className="text-brand-600 hover:text-brand-800 dark:text-brand-400"
      >
        📜 L2
      </a>
    );
  }

  const hasCert = Boolean(docs.assessmentCertificate);
  const hasQual = Boolean(docs.qualificationProof);
  if (!hasCert && !hasQual) return <span className="text-gray-400 text-xs">—</span>;
  return (
    <div className="flex gap-2">
      {hasCert && (
        <a
          href={docs.assessmentCertificate!}
          target="_blank"
          rel="noreferrer"
          title="Certificate"
          className="text-brand-600 hover:text-brand-800 dark:text-brand-400"
        >
          📄
        </a>
      )}
      {hasQual && (
        <a
          href={docs.qualificationProof!}
          target="_blank"
          rel="noreferrer"
          title="Qualification"
          className="text-brand-600 hover:text-brand-800 dark:text-brand-400"
        >
          🎓
        </a>
      )}
    </div>
  );
}

export function formatAstroDate(value: string | null | undefined) {
  if (!value) return '—';
  return formatLocalDate(value);
}

export function formatINR(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPayoutRemark(remark: string | null | undefined) {
  if (!remark) return '—';
  try {
    const parsed = JSON.parse(remark) as { note?: string };
    if (parsed?.note) return parsed.note;
  } catch {
    /* plain text remark */
  }
  return remark;
}

export function formatCommissionRate(rate: number | null | undefined) {
  if (rate == null) return '40%';
  return `${Math.round(rate * 100)}%`;
}
