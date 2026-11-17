import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ApiError, razorpayTestUsersAPI } from '../services/api';
import Badge from '../components/ui/badge';
import Button from '../components/ui/button/Button';
import Input from '../components/form/input/InputField';
import Label from '../components/form/Label';

const thClass =
  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400';
const tdClass = 'px-4 py-4 text-sm text-gray-700 dark:text-gray-300';

function parseUserIds(raw: string): number[] {
  const parts = raw.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean);
  const ids: number[] = [];
  const seen = new Set<number>();
  for (const part of parts) {
    const n = Number.parseInt(part, 10);
    if (!Number.isFinite(n) || n <= 0 || seen.has(n)) continue;
    seen.add(n);
    ids.push(n);
  }
  return ids;
}

export default function RazorpayTestUsers() {
  const [userIds, setUserIds] = useState<number[]>([]);
  const [defaults, setDefaults] = useState<number[]>([]);
  const [configPath, setConfigPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [singleId, setSingleId] = useState('');
  const [bulkIds, setBulkIds] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await razorpayTestUsersAPI.list();
      setUserIds(res.data.userIds);
      setDefaults(res.data.defaults ?? []);
      setConfigPath(res.data.configPath ?? null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load test user allowlist');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!success) return;
    const t = window.setTimeout(() => setSuccess(null), 4000);
    return () => window.clearTimeout(t);
  }, [success]);

  const defaultSet = useMemo(() => new Set(defaults), [defaults]);

  const filteredIds = useMemo(() => {
    const q = search.trim();
    if (!q) return userIds;
    return userIds.filter((id) => String(id).includes(q));
  }, [search, userIds]);

  const customCount = userIds.filter((id) => !defaultSet.has(id)).length;

  const handleApiError = (e: unknown, fallback: string) => {
    setError(e instanceof ApiError ? e.message : fallback);
  };

  const onAddSingle = async (e: FormEvent) => {
    e.preventDefault();
    const id = Number.parseInt(singleId.trim(), 10);
    if (!Number.isFinite(id) || id <= 0) {
      setError('Enter a valid positive user ID');
      return;
    }
    if (userIds.includes(id)) {
      setError(`User ID ${id} is already in the allowlist`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      const res = await razorpayTestUsersAPI.add({ userId: id });
      setUserIds(res.data.userIds);
      setSingleId('');
      setSuccess(`Added user ID ${id} to Razorpay test allowlist`);
    } catch (err) {
      handleApiError(err, 'Failed to add user ID');
    } finally {
      setSubmitting(false);
    }
  };

  const onAddBulk = async (e: FormEvent) => {
    e.preventDefault();
    const ids = parseUserIds(bulkIds);
    if (ids.length === 0) {
      setError('Enter one or more user IDs (comma or newline separated)');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      const res = await razorpayTestUsersAPI.add({ userIds: ids });
      setUserIds(res.data.userIds);
      setBulkIds('');
      setSuccess(`Added ${ids.length} user ID${ids.length === 1 ? '' : 's'} to the allowlist`);
    } catch (err) {
      handleApiError(err, 'Failed to add user IDs');
    } finally {
      setSubmitting(false);
    }
  };

  const onRemove = async (userId: number) => {
    if (!window.confirm(`Remove user ID ${userId} from the Razorpay test allowlist?`)) return;

    try {
      setRemovingId(userId);
      setError(null);
      setSuccess(null);
      const res = await razorpayTestUsersAPI.remove(userId);
      setUserIds(res.data.userIds);
      setSuccess(`Removed user ID ${userId}`);
    } catch (err) {
      handleApiError(err, 'Failed to remove user ID');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Razorpay test users</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Users in this allowlist receive Razorpay <strong>test keys</strong> on wallet top-up and booking checkout.
          Changes apply live without restart.
        </p>
      </div>

      {error && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/30">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="shrink-0 text-lg leading-none text-red-500 hover:text-red-700"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}
      {success && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900/40 dark:bg-green-950/30">
          <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
          <button
            type="button"
            onClick={() => setSuccess(null)}
            className="shrink-0 text-lg leading-none text-green-500 hover:text-green-700"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Allowlisted users" value={loading ? '—' : userIds.length} />
        <StatCard label="Built-in defaults" value={loading ? '—' : defaults.length} />
        <StatCard label="Custom additions" value={loading ? '—' : customCount} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <form
          onSubmit={(e) => void onAddSingle(e)}
          className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800"
        >
          <h2 className="font-semibold text-gray-900 dark:text-white">Add user ID</h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            POST <code className="rounded bg-gray-100 px-1 dark:bg-gray-900">/razorpay/test-users</code>
          </p>
          <div className="mt-4">
            <Label>User ID</Label>
            <Input
              type="number"
              min="1"
              value={singleId}
              onChange={(e) => setSingleId(e.target.value)}
              placeholder="e.g. 24432"
              disabled={submitting}
              className="mt-1.5"
            />
          </div>
          <div className="mt-4">
            <Button disabled={submitting || !singleId.trim()}>Add to allowlist</Button>
          </div>
        </form>

        <form
          onSubmit={(e) => void onAddBulk(e)}
          className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800"
        >
          <h2 className="font-semibold text-gray-900 dark:text-white">Bulk add</h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Comma, space, or newline separated IDs
          </p>
          <div className="mt-4">
            <Label>User IDs</Label>
            <textarea
              value={bulkIds}
              onChange={(e) => setBulkIds(e.target.value)}
              placeholder="24432, 12345&#10;67890"
              rows={4}
              disabled={submitting}
              className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <div className="mt-4">
            <Button disabled={submitting || !bulkIds.trim()}>Add all</Button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-700">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Allowlist</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {loading ? 'Loading…' : `${userIds.length} user${userIds.length === 1 ? '' : 's'}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by ID…"
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <p className="p-8 text-center text-sm text-gray-500">Loading allowlist…</p>
        ) : filteredIds.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-500">
            {search ? 'No IDs match your filter' : 'No test users configured'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className={thClass}>User ID</th>
                  <th className={thClass}>Source</th>
                  <th className={thClass}>Profile</th>
                  <th className={`${thClass} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredIds.map((userId) => (
                  <tr key={userId} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50">
                    <td className={tdClass}>
                      <span className="font-mono font-semibold text-gray-900 dark:text-white">{userId}</span>
                    </td>
                    <td className={tdClass}>
                      {defaultSet.has(userId) ? (
                        <Badge size="sm" color="info">Default</Badge>
                      ) : (
                        <Badge size="sm" color="success">Added</Badge>
                      )}
                    </td>
                    <td className={tdClass}>
                      <Link
                        to={`/enhanced-user-details?userId=${userId}`}
                        className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
                      >
                        View user →
                      </Link>
                    </td>
                    <td className={`${tdClass} text-right`}>
                      <button
                        type="button"
                        onClick={() => void onRemove(userId)}
                        disabled={removingId === userId}
                        className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        {removingId === userId ? 'Removing…' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {defaults.length > 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-900/40">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Built-in default IDs</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Used when the config file is missing: {defaults.join(', ')}
          </p>
        </div>
      )}

      {configPath && (
        <p className="text-xs text-gray-400">
          Config file: <span className="font-mono">{configPath}</span>
        </p>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
