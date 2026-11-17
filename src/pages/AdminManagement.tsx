import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import Badge from '../components/ui/badge';
import Button from '../components/ui/button/Button';
import { Modal } from '../components/ui/modal';
import {
  SettingsAlert,
  SettingsDataPanel,
  SettingsPageHeader,
  SettingsStatCard,
  SettingsTableEmpty,
  SettingsTableLoading,
  SETTINGS_TD_CLASS,
  SETTINGS_TH_CLASS,
} from '../components/settings/settingsUi';
import { useModal } from '../hooks/useModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { PencilIcon, TrashBinIcon } from '../icons';
import { authService, type AdminUser } from '../services/auth';
import { formatLocalDate } from '../utils/dateUtils';

function formatLastLogin(value?: string) {
  if (!value) return 'Never';
  return formatLocalDate(value ?? null);
}

function getInitials(admin: AdminUser): string {
  const source = admin.fullName?.trim() || admin.username;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function roleBadgeColor(roleId: string): 'primary' | 'info' | 'warning' | 'dark' {
  if (roleId === 'admin') return 'primary';
  if (roleId === 'astroadmin') return 'info';
  return 'warning';
}

export default function AdminManagement() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);
  const [search, setSearch] = useState('');
  const deleteModal = useModal();

  const loadAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [data, roleList] = await Promise.all([
        authService.listAdmins(),
        authService.listRoles().catch(() => []),
      ]);
      setAdmins(data);
      setRoles(roleList.map((r) => ({ id: r.id, name: r.name })));
    } catch (err) {
      const e = err as Error & { status?: number };
      if (e.status === 403) {
        setError('Access denied — admin role required.');
      } else {
        setError(e.message ?? 'Failed to load admins');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAdmins();
  }, [loadAdmins]);

  const roleLabel = useCallback(
    (admin: AdminUser) => {
      const roleId = admin.roleId ?? admin.role;
      return roles.find((r) => r.id === roleId)?.name ?? roleId;
    },
    [roles]
  );

  const sortedAdmins = useMemo(() => {
    return [...admins].sort((a, b) => {
      if (a.isRoot && !b.isRoot) return -1;
      if (!a.isRoot && b.isRoot) return 1;
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      return a.username.localeCompare(b.username);
    });
  }, [admins]);

  const filteredAdmins = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sortedAdmins;
    return sortedAdmins.filter((admin) => {
      const roleId = admin.roleId ?? admin.role;
      return (
        admin.username.toLowerCase().includes(q) ||
        admin.fullName.toLowerCase().includes(q) ||
        admin.gmail.toLowerCase().includes(q) ||
        roleId.toLowerCase().includes(q) ||
        roleLabel(admin).toLowerCase().includes(q)
      );
    });
  }, [sortedAdmins, search, roleLabel]);

  const stats = useMemo(() => {
    const active = admins.filter((a) => a.isActive).length;
    return {
      total: admins.length,
      active,
      disabled: admins.length - active,
      roles: new Set(admins.map((a) => a.roleId ?? a.role)).size,
    };
  }, [admins]);

  const onToggleEnabled = async (admin: AdminUser) => {
    if (admin.isRoot) return;
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      await authService.setAdminEnabled(admin.id, !admin.isActive);
      setSuccess(`Admin ${admin.username} ${admin.isActive ? 'disabled' : 'enabled'}.`);
      await loadAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update admin');
    } finally {
      setActionLoading(false);
    }
  };

  const onConfirmDelete = async () => {
    if (!adminToDelete || adminToDelete.isRoot) return;
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      await authService.deleteAdmin(adminToDelete.id);
      setSuccess(`Admin ${adminToDelete.username} deleted.`);
      deleteModal.closeModal();
      setAdminToDelete(null);
      await loadAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete admin');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        title="Admin accounts"
        description="Manage dashboard logins, roles, and account status."
        action={
          <Link to="/admins/new">
            <Button>Create admin</Button>
          </Link>
        }
      />

      {error && <SettingsAlert variant="error">{error}</SettingsAlert>}
      {success && <SettingsAlert variant="success">{success}</SettingsAlert>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SettingsStatCard label="Total accounts" value={stats.total} />
        <SettingsStatCard label="Active" value={stats.active} hint="Can sign in" />
        <SettingsStatCard label="Disabled" value={stats.disabled} hint="Blocked from login" />
        <SettingsStatCard label="Roles in use" value={stats.roles} />
      </div>

      <SettingsDataPanel
        title="All accounts"
        subtitle={`${filteredAdmins.length} of ${admins.length} shown`}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search name, username, email, role…"
      >
        {loading ? (
          <SettingsTableLoading label="Loading accounts…" />
        ) : (
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-gray-50 dark:bg-gray-800/60">
                <TableRow>
                  <TableCell isHeader className={SETTINGS_TH_CLASS}>Account</TableCell>
                  <TableCell isHeader className={SETTINGS_TH_CLASS}>Contact</TableCell>
                  <TableCell isHeader className={SETTINGS_TH_CLASS}>Role</TableCell>
                  <TableCell isHeader className={SETTINGS_TH_CLASS}>Status</TableCell>
                  <TableCell isHeader className={SETTINGS_TH_CLASS}>Last login</TableCell>
                  <TableCell isHeader className={`${SETTINGS_TH_CLASS} text-end`}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredAdmins.length === 0 ? (
                  <SettingsTableEmpty
                    colSpan={6}
                    message={
                      search.trim()
                        ? 'No accounts match your search.'
                        : 'No admin accounts yet.'
                    }
                  />
                ) : (
                  filteredAdmins.map((admin) => {
                    const roleId = admin.roleId ?? admin.role;
                    return (
                      <TableRow
                        key={admin.id}
                        className="transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/40"
                      >
                        <TableCell className={SETTINGS_TD_CLASS}>
                          <div className="flex items-center gap-3 min-w-[200px]">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                                admin.isRoot
                                  ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300'
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                              }`}
                            >
                              {getInitials(admin)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                  {admin.fullName}
                                </p>
                                {admin.isRoot && (
                                  <Badge color="primary" size="sm">Root</Badge>
                                )}
                              </div>
                              <p className="font-mono text-xs text-gray-500 dark:text-gray-400">
                                @{admin.username}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className={SETTINGS_TD_CLASS}>
                          <p className="text-gray-900 dark:text-gray-100">{admin.gmail}</p>
                          <p className="mt-0.5 font-mono text-xs text-gray-400 dark:text-gray-500">
                            {admin.id}
                          </p>
                        </TableCell>
                        <TableCell className={SETTINGS_TD_CLASS}>
                          <Badge color={roleBadgeColor(roleId)} size="sm">
                            {roleLabel(admin)}
                          </Badge>
                          <p className="mt-1 font-mono text-xs text-gray-400 dark:text-gray-500">
                            {roleId}
                          </p>
                        </TableCell>
                        <TableCell className={SETTINGS_TD_CLASS}>
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                admin.isActive ? 'bg-success-500' : 'bg-gray-400 dark:bg-gray-500'
                              }`}
                            />
                            <Badge color={admin.isActive ? 'success' : 'dark'} size="sm" variant="light">
                              {admin.isActive ? 'Active' : 'Disabled'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className={`${SETTINGS_TD_CLASS} whitespace-nowrap text-gray-600 dark:text-gray-400`}>
                          {formatLastLogin(admin.lastLoginAt)}
                        </TableCell>
                        <TableCell className={`${SETTINGS_TD_CLASS} text-end`}>
                          <div className="inline-flex items-center gap-1">
                            <Link
                              to={`/admins/${admin.id}`}
                              title="Edit account"
                              className="inline-flex rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-brand-400"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                            {!admin.isRoot && (
                              <>
                                <button
                                  type="button"
                                  disabled={actionLoading}
                                  title={admin.isActive ? 'Disable account' : 'Enable account'}
                                  onClick={() => void onToggleEnabled(admin)}
                                  className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800"
                                >
                                  {admin.isActive ? 'Disable' : 'Enable'}
                                </button>
                                <button
                                  type="button"
                                  disabled={actionLoading}
                                  title="Delete account"
                                  onClick={() => {
                                    setAdminToDelete(admin);
                                    deleteModal.openModal();
                                  }}
                                  className="inline-flex rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                                >
                                  <TrashBinIcon className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </SettingsDataPanel>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => {
          deleteModal.closeModal();
          setAdminToDelete(null);
        }}
        className="max-w-md"
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Delete admin</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Permanently delete{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              {adminToDelete?.fullName}
            </span>{' '}
            (<span className="font-mono">{adminToDelete?.username}</span>)? This cannot be undone.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => { deleteModal.closeModal(); setAdminToDelete(null); }}>
              Cancel
            </Button>
            <Button onClick={() => void onConfirmDelete()} disabled={actionLoading} className="bg-red-600 hover:bg-red-700">
              {actionLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
