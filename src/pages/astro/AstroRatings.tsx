import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ApiError } from '../../services/api/base';
import { astroFinanceAPI, AstroRating, AstroRatingStats } from '../../services/api/astroFinance';
import type { AstroPagination } from '../../services/api/astro';
import Badge from '../../components/ui/badge';
import {
  AstroAlert,
  AstroPageHeader,
  AstroPaginationBar,
  AstroStatCard,
  astroBtnOutline,
  astroCard,
  formatAstroDate,
  thClass,
  tdClass,
} from './components/astroUi';

type Tab = 'all' | 'to-astrologers' | 'from-astrologers';

const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'to-astrologers', label: 'User → Astrologer' },
  { key: 'from-astrologers', label: 'Astrologer → User' },
];

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-500" title={`${rating}/5`}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  );
}

function directionLabel(direction: AstroRating['direction']) {
  if (direction === 'userToAstrologer') return 'User → Astro';
  if (direction === 'astrologerToUser') return 'Astro → User';
  return 'Feedback';
}

export default function AstroRatings() {
  const [tab, setTab] = useState<Tab>('to-astrologers');
  const [stats, setStats] = useState<AstroRatingStats | null>(null);
  const [items, setItems] = useState<AstroRating[]>([]);
  const [pagination, setPagination] = useState<AstroPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [minRating, setMinRating] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: 20,
        search: search || undefined,
        minRating: minRating || undefined,
      };

      const [statsRes, listRes] = await Promise.all([
        astroFinanceAPI.getRatingStats(),
        tab === 'to-astrologers'
          ? astroFinanceAPI.listRatingsToAstrologers(params)
          : tab === 'from-astrologers'
            ? astroFinanceAPI.listRatingsFromAstrologers(params)
            : astroFinanceAPI.listRatings(params),
      ]);

      setStats(statsRes.data);
      setItems(listRes.data);
      setPagination(listRes.pagination);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load ratings');
    } finally {
      setLoading(false);
    }
  }, [tab, page, search, minRating]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <AstroPageHeader
        title="Reviews & feedback"
        description="Post-booking ratings between users and astrologers."
      />

      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AstroStatCard
            label="User → Astrologer"
            value={stats.userToAstrologer.total}
            sub={`Avg ${stats.userToAstrologer.averageRating.toFixed(2)} ★`}
          />
          <AstroStatCard
            label="Astrologer → User"
            value={stats.astrologerToUser.total}
            sub={`Avg ${stats.astrologerToUser.averageRating.toFixed(2)} ★`}
            accent="sky"
          />
          <AstroStatCard
            label="5-star reviews"
            value={stats.ratingDistribution['5'] ?? 0}
            accent="amber"
          />
          <AstroStatCard label="Astrologers rated" value={stats.astrologerCount} />
        </div>
      )}

      {error && <AstroAlert type="error" message={error} onDismiss={() => setError(null)} />}

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setPage(1); }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-brand-600 text-white'
                : 'border border-brand-200 text-brand-700 hover:bg-brand-50 dark:border-brand-800 dark:text-brand-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={`${astroCard} p-4`}>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Comment, names, phones…"
            className="flex-1 min-w-[200px] rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          <select
            value={minRating}
            onChange={(e) => { setMinRating(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Any rating</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{n}+ stars</option>
            ))}
          </select>
          <button onClick={() => void load()} className={astroBtnOutline}>Search</button>
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
                    <th className={thClass}>Rating</th>
                    <th className={thClass}>Direction</th>
                    <th className={thClass}>By</th>
                    <th className={thClass}>To</th>
                    <th className={thClass}>Comment</th>
                    <th className={thClass}>Date</th>
                    <th className={thClass}></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-50 dark:divide-brand-900/20">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">
                        No ratings found
                      </td>
                    </tr>
                  ) : (
                    items.map((r) => (
                      <tr key={r.ratingId} className="hover:bg-brand-50/30 dark:hover:bg-brand-950/10">
                        <td className={tdClass}><Stars rating={r.rating} /></td>
                        <td className={tdClass}>
                          <Badge color="primary" size="sm">{directionLabel(r.direction)}</Badge>
                        </td>
                        <td className={tdClass}>{r.byUser.name}</td>
                        <td className={tdClass}>{r.toUser.name}</td>
                        <td className={`${tdClass} max-w-[200px] truncate`}>
                          {r.comment ?? (r.tags?.length ? r.tags.join(', ') : '—')}
                        </td>
                        <td className={tdClass}>{formatAstroDate(r.createdAt)}</td>
                        <td className={tdClass}>
                          <Link
                            to={`/astro/ratings/${r.ratingId}`}
                            className="text-sm text-brand-600 hover:underline dark:text-brand-400"
                          >
                            View
                          </Link>
                        </td>
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
    </div>
  );
}
