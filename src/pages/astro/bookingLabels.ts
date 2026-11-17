/** Raw `bookings_tbl.status` values and admin filter keys. */
export const BOOKING_STATUS_LABELS: Record<string, string> = {
  failed: 'Payment failed',
  upcoming: 'Upcoming',
  starting_soon: 'Starting soon',
  started: 'In progress',
  completed: 'Completed',
  ended: 'Ended',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
  expired: 'Expired',
  /** List filter: upcoming + starting_soon + started */
  active: 'Active',
  /** Unpaid / failed bookings tab */
  pending: 'Pending payment',
};

export const BOOKING_STATUSES = Object.keys(BOOKING_STATUS_LABELS);

export function getBookingStatusLabel(status: string | null | undefined): string {
  if (!status) return '—';
  const key = status.toLowerCase().trim();
  return (
    BOOKING_STATUS_LABELS[key] ??
    key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export function bookingStatusPillClass(status: string): string {
  const normalized = status.toLowerCase();
  const styles: Record<string, string> = {
    completed: 'bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300',
    ended: 'bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300',
    upcoming: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
    starting_soon: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    started: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
    active: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    expired: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  };
  return styles[normalized] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
}
