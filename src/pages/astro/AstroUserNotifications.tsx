import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ApiError } from '../../services/api/base';
import { normalizeAstroPagination, type AstroPagination } from '../../services/api/astro';
import {
  astroNotificationsAPI,
  AstroNotificationLog,
} from '../../services/api/astroNotifications';
import NotificationStatusBadge from './components/NotificationStatusBadge';
import {
  AstroAlert,
  AstroBackLink,
  AstroLoading,
  AstroPageHeader,
  AstroPaginationBar,
  astroCard,
  formatAstroDate,
  thClass,
  tdClass,
} from './components/astroUi';

const PAGE_SIZE = 20;

export default function AstroUserNotifications() {
  const { userId } = useParams<{ userId: string }>();
  const [items, setItems] = useState<AstroNotificationLog[]>([]);
  const [pagination, setPagination] = useState<AstroPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await astroNotificationsAPI.listByUser(Number(userId), {
        page,
        limit: PAGE_SIZE,
        status: status || undefined,
        sortBy: 'created_date_time',
        sortOrder: 'desc',
      });
      setItems(res.data);
      setPagination(
        normalizeAstroPagination(res.pagination, {
          page,
          limit: PAGE_SIZE,
          itemCount: res.data.length,
        })
      );
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [userId, page, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const recipientName = items[0]?.user?.name;

  if (loading && items.length === 0) {
    return <AstroLoading label="Loading notification history…" />;
  }

  return (
    <div className="space-y-6">
      <AstroPageHeader
        title={recipientName ? `Notifications — ${recipientName}` : `Notifications — user #${userId}`}
        description="Push notification history for this astro user or astrologer."
        action={
          <div className="flex flex-wrap gap-3">
            <AstroBackLink to="/astro/notifications">All notifications</AstroBackLink>
            <Link
              to={`/astro/users/${userId}`}
              className="text-sm text-brand-600 hover:underline dark:text-brand-400"
            >
              User profile →
            </Link>
          </div>
        }
      />

      {error && <AstroAlert type="error" message={error} onDismiss={() => setError(null)} />}

      <div className={`${astroCard} p-4`}>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="">All statuses</option>
          <option value="sent">Sent</option>
          <option value="scheduled">Scheduled</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className={`${astroCard} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-brand-100 dark:divide-brand-900/40">
            <thead className="bg-brand-50/50 dark:bg-brand-950/20">
              <tr>
                <th className={thClass}>When</th>
                <th className={thClass}>Title</th>
                <th className={thClass}>Body</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Audience</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-50 dark:divide-brand-900/20">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-500">
                    No notifications for this user
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr key={row.notificationLogId}>
                    <td className={tdClass}>{formatAstroDate(row.sentAt ?? row.scheduledFor ?? row.createdDateTime)}</td>
                    <td className={tdClass}>{row.title}</td>
                    <td className={tdClass}>
                      <p className="line-clamp-2 text-xs text-gray-500">{row.body}</p>
                    </td>
                    <td className={tdClass}>
                      <NotificationStatusBadge status={row.status} />
                    </td>
                    <td className={tdClass}>{row.audience ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pagination && <AstroPaginationBar pagination={pagination} onPage={setPage} />}
      </div>
    </div>
  );
}
