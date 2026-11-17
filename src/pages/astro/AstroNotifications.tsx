import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ApiError } from '../../services/api/base';
import { normalizeAstroPagination, type AstroPagination } from '../../services/api/astro';
import {
  astroNotificationsAPI,
  AstroFcmStats,
  AstroNotificationLog,
  AstroNotificationStats,
  NotificationAudience,
} from '../../services/api/astroNotifications';
import NotificationStatusBadge from './components/NotificationStatusBadge';
import {
  AstroAlert,
  AstroPageHeader,
  AstroPaginationBar,
  AstroStatCard,
  astroBtn,
  astroBtnOutline,
  astroCard,
  formatAstroDate,
  thClass,
  tdClass,
} from './components/astroUi';

type PageTab = 'logs' | 'compose';

const AUDIENCE_OPTIONS: { value: NotificationAudience; label: string }[] = [
  { value: 'all', label: 'All (users + astrologers)' },
  { value: 'astro_users', label: 'Astro users' },
  { value: 'astrologers', label: 'Astrologers' },
];

const PAGE_SIZE = 20;

function parseMetadataJson(raw: string): Record<string, unknown> | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const parsed = JSON.parse(trimmed) as unknown;
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Metadata must be a JSON object');
  }
  return parsed as Record<string, unknown>;
}

function recipientLabel(row: AstroNotificationLog) {
  if (row.isGlobal) return 'Broadcast';
  if (row.user?.name) return row.user.name;
  if (row.userId) return `User #${row.userId}`;
  return '—';
}

export default function AstroNotifications() {
  const [pageTab, setPageTab] = useState<PageTab>('logs');
  const [audience, setAudience] = useState<NotificationAudience>('all');
  const [stats, setStats] = useState<AstroNotificationStats | null>(null);
  const [fcmStats, setFcmStats] = useState<AstroFcmStats | null>(null);
  const [items, setItems] = useState<AstroNotificationLog[]>([]);
  const [pagination, setPagination] = useState<AstroPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [globalOnly, setGlobalOnly] = useState(false);
  const [page, setPage] = useState(1);

  const [composeMode, setComposeMode] = useState<'send' | 'schedule' | 'global' | 'token'>('send');
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [metadataJson, setMetadataJson] = useState('');
  const [composeAudience, setComposeAudience] = useState<NotificationAudience>('all');
  const [scheduledFor, setScheduledFor] = useState('');
  const [fcmToken, setFcmToken] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const audienceParam = audience;
    const listParams = {
      page,
      limit: PAGE_SIZE,
      audience: audienceParam,
      status: status || undefined,
      isGlobal: globalOnly ? 'true' : undefined,
      search: search || undefined,
      sortBy: 'created_date_time',
      sortOrder: 'desc',
    };

    const [statsResult, fcmResult, listResult] = await Promise.allSettled([
      astroNotificationsAPI.getStatistics({ audience: audienceParam }),
      astroNotificationsAPI.getFcmStatistics({ audience: audienceParam }),
      astroNotificationsAPI.list(listParams),
    ]);

    const errors: string[] = [];

    if (statsResult.status === 'fulfilled') {
      setStats(statsResult.value.data);
    } else {
      setStats(null);
      errors.push(
        statsResult.reason instanceof ApiError
          ? statsResult.reason.message
          : 'Failed to load notification statistics'
      );
    }

    if (fcmResult.status === 'fulfilled') {
      setFcmStats(fcmResult.value.data);
    } else {
      setFcmStats(null);
      errors.push(
        fcmResult.reason instanceof ApiError
          ? fcmResult.reason.message
          : 'Failed to load FCM statistics'
      );
    }

    if (listResult.status === 'fulfilled') {
      setItems(listResult.value.data);
      setPagination(
        normalizeAstroPagination(listResult.value.pagination, {
          page,
          limit: PAGE_SIZE,
          itemCount: listResult.value.data.length,
        })
      );
    } else {
      setItems([]);
      setPagination(null);
      errors.push(
        listResult.reason instanceof ApiError
          ? listResult.reason.message
          : 'Failed to load notification log'
      );
    }

    if (errors.length) setError(errors.join(' · '));
    setLoading(false);
  }, [audience, page, status, globalOnly, search]);

  useEffect(() => {
    if (pageTab === 'logs') void load();
  }, [load, pageTab]);

  const resetCompose = () => {
    setUserId('');
    setTitle('');
    setBody('');
    setMetadataJson('');
    setScheduledFor('');
    setFcmToken('');
    setImageUrl('');
  };

  const handleCompose = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError('Title and body are required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const metadata = metadataJson.trim() ? parseMetadataJson(metadataJson) : undefined;

      if (composeMode === 'send') {
        const uid = Number(userId);
        if (!Number.isFinite(uid) || uid <= 0) {
          setError('Enter a valid user ID');
          return;
        }
        const res = await astroNotificationsAPI.send({
          userId: uid,
          title: title.trim(),
          body: body.trim(),
          metadata,
          audience: composeAudience,
        });
        setSuccess(
          `Push sent — ${res.data.fcm.success} success, ${res.data.fcm.failure} failed`
        );
      } else if (composeMode === 'schedule') {
        const uid = Number(userId);
        if (!Number.isFinite(uid) || uid <= 0) {
          setError('Enter a valid user ID');
          return;
        }
        if (!scheduledFor) {
          setError('Scheduled time is required');
          return;
        }
        await astroNotificationsAPI.schedule({
          userId: uid,
          title: title.trim(),
          body: body.trim(),
          metadata,
          audience: composeAudience,
          scheduledFor: new Date(scheduledFor).toISOString(),
        });
        setSuccess('Notification scheduled');
      } else if (composeMode === 'global') {
        const res = await astroNotificationsAPI.sendGlobal({
          title: title.trim(),
          body: body.trim(),
          metadata,
          audience: composeAudience,
        });
        setSuccess(
          `Broadcast sent to ${res.data.summary.targetUserCount} users — ${res.data.summary.successCount} delivered, ${res.data.summary.failureCount} failed`
        );
      } else {
        if (!fcmToken.trim()) {
          setError('FCM token is required');
          return;
        }
        await astroNotificationsAPI.sendToToken({
          fcmToken: fcmToken.trim(),
          title: title.trim(),
          body: body.trim(),
          data: metadata,
          imageUrl: imageUrl.trim() || undefined,
          audience: composeAudience,
        });
        setSuccess('Test push sent to token');
      }

      resetCompose();
      setPageTab('logs');
      void load();
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Metadata must be valid JSON');
      } else {
        setError(err instanceof ApiError ? err.message : 'Failed to send notification');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AstroPageHeader
        title="Push notifications"
        description="FCM pushes to astro app users and astrologers — scoped to the astro vertical."
      />

      {(stats || fcmStats) && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-6">
          <AstroStatCard label="Total sent" value={stats?.totalNotifications ?? '—'} />
          <AstroStatCard label="Successful" value={stats?.successfulCount ?? '—'} accent="sky" />
          <AstroStatCard label="Failed" value={stats?.failedCount ?? '—'} accent="amber" />
          <AstroStatCard label="Users w/ tokens" value={fcmStats?.usersWithTokens ?? '—'} />
          <AstroStatCard label="Active FCM tokens" value={fcmStats?.activeTokens ?? '—'} />
          <AstroStatCard label="Global sends" value={stats?.globalNotifications ?? '—'} />
        </div>
      )}

      {error && <AstroAlert type="error" message={error} onDismiss={() => setError(null)} />}
      {success && <AstroAlert type="success" message={success} onDismiss={() => setSuccess(null)} />}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {(['logs', 'compose'] as PageTab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setPageTab(t)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                pageTab === t
                  ? 'bg-brand-600 text-white'
                  : 'border border-brand-200 text-brand-700 hover:bg-brand-50 dark:border-brand-800 dark:text-brand-400'
              }`}
            >
              {t === 'logs' ? 'Notification log' : 'Send push'}
            </button>
          ))}
        </div>
        <select
          value={audience}
          onChange={(e) => {
            setAudience(e.target.value as NotificationAudience);
            setPage(1);
          }}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          {AUDIENCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {pageTab === 'logs' ? (
        <>
          <div className={`${astroCard} p-4`}>
            <div className="flex flex-wrap items-center gap-3">
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search title, body, user…"
                className="min-w-[200px] flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
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
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <input
                  type="checkbox"
                  checked={globalOnly}
                  onChange={(e) => { setGlobalOnly(e.target.checked); setPage(1); }}
                  className="rounded border-gray-300 text-brand-600"
                />
                Global only
              </label>
              <button type="button" onClick={() => void load()} className={astroBtnOutline}>
                Search
              </button>
            </div>
          </div>

          <div className={`${astroCard} overflow-hidden`}>
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-brand-100 dark:divide-brand-900/40">
                    <thead className="bg-brand-50/50 dark:bg-brand-950/20">
                      <tr>
                        <th className={thClass}>When</th>
                        <th className={thClass}>Recipient</th>
                        <th className={thClass}>Title</th>
                        <th className={thClass}>Status</th>
                        <th className={thClass}>Audience</th>
                        <th className={thClass}>Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-50 dark:divide-brand-900/20">
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                            No notifications found
                          </td>
                        </tr>
                      ) : (
                        items.map((row) => (
                          <tr key={row.notificationLogId} className="hover:bg-brand-50/30 dark:hover:bg-brand-950/10">
                            <td className={tdClass}>
                              <p className="text-xs">{formatAstroDate(row.sentAt ?? row.scheduledFor ?? row.createdDateTime)}</p>
                              {row.scheduledFor && row.status === 'scheduled' && (
                                <p className="text-xs text-amber-600">Scheduled</p>
                              )}
                            </td>
                            <td className={tdClass}>
                              {row.userId && !row.isGlobal ? (
                                <Link
                                  to={`/astro/notifications/user/${row.userId}`}
                                  className="text-brand-600 hover:underline dark:text-brand-400"
                                >
                                  {recipientLabel(row)}
                                </Link>
                              ) : (
                                recipientLabel(row)
                              )}
                              {row.user?.phoneNumber && (
                                <p className="text-xs text-gray-400">{row.user.phoneNumber}</p>
                              )}
                            </td>
                            <td className={tdClass}>
                              <p className="font-medium text-gray-900 dark:text-white">{row.title}</p>
                              <p className="line-clamp-2 text-xs text-gray-500">{row.body}</p>
                            </td>
                            <td className={tdClass}>
                              <NotificationStatusBadge status={row.status} />
                            </td>
                            <td className={tdClass}>{row.audience ?? '—'}</td>
                            <td className={tdClass}>{row.recipientType ?? (row.isGlobal ? 'broadcast' : '—')}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {pagination && <AstroPaginationBar pagination={pagination} onPage={setPage} />}
              </>
            )}
          </div>

          {fcmStats && fcmStats.tokensByPlatform.length > 0 && (
            <div className={`${astroCard} p-4`}>
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">FCM by platform</h3>
              <div className="flex flex-wrap gap-4 text-sm">
                {fcmStats.tokensByPlatform.map((p) => (
                  <span key={p.platform} className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium capitalize text-gray-900 dark:text-white">{p.platform}</span>
                    {' '}{p.count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className={`${astroCard} p-6`}>
          <div className="mb-6 flex flex-wrap gap-2">
            {(
              [
                ['send', 'Send to user'],
                ['schedule', 'Schedule'],
                ['global', 'Broadcast'],
                ['token', 'Test token'],
              ] as const
            ).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => setComposeMode(mode)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                  composeMode === mode
                    ? 'bg-brand-600 text-white'
                    : 'border border-brand-200 text-brand-700 dark:border-brand-800 dark:text-brand-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleCompose} className="mx-auto max-w-xl space-y-4">
            {(composeMode === 'send' || composeMode === 'schedule') && (
              <div>
                <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">User ID</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="user_id_pk"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
            )}

            {composeMode === 'token' && (
              <>
                <div>
                  <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">FCM token</label>
                  <textarea
                    required
                    rows={3}
                    value={fcmToken}
                    onChange={(e) => setFcmToken(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">Image URL (optional)</label>
                  <input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </>
            )}

            <div>
              <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">Title</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">Body</label>
              <textarea
                required
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {composeMode === 'schedule' && (
              <div>
                <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">Scheduled for</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">Audience validation</label>
              <select
                value={composeAudience}
                onChange={(e) => setComposeAudience(e.target.value as NotificationAudience)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                {AUDIENCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {composeMode === 'global'
                  ? 'Required — who receives the broadcast'
                  : 'Validates recipient type for single/scheduled sends'}
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">
                Metadata (JSON, optional)
              </label>
              <textarea
                rows={3}
                value={metadataJson}
                onChange={(e) => setMetadataJson(e.target.value)}
                placeholder='{"type":"booking","bookingId":"991"}'
                className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting} className={astroBtn}>
                {submitting
                  ? 'Sending…'
                  : composeMode === 'schedule'
                    ? 'Schedule'
                    : composeMode === 'global'
                      ? 'Send broadcast'
                      : composeMode === 'token'
                        ? 'Send test'
                        : 'Send push'}
              </button>
              <button type="button" onClick={resetCompose} className={astroBtnOutline}>
                Clear
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
