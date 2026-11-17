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
import { authService, type RoleDefinition } from '../services/auth';

function roleBadgeColor(roleId: string): 'primary' | 'info' | 'warning' | 'dark' {
  if (roleId === 'admin') return 'primary';
  if (roleId === 'astroadmin') return 'info';
  return 'warning';
}

function roleInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatScopesSummary(scopes: string[]): { label: string; detail?: string } {
  if (scopes.includes('*')) {
    return { label: 'Full access', detail: 'Wildcard * — all modules' };
  }
  const readCount = scopes.filter((s) => s.endsWith(':read')).length;
  const writeCount = scopes.filter((s) => s.endsWith(':write')).length;
  const wildcards = scopes.filter((s) => s.includes('.*'));
  const preview = [...wildcards, ...scopes.filter((s) => !s.includes('.*'))].slice(0, 3);
  const rwHint =
    readCount || writeCount ? `${readCount} read · ${writeCount} write` : undefined;
  const detail = preview.length
    ? [rwHint, preview.join(', ') + (scopes.length > 3 ? '…' : '')].filter(Boolean).join(' — ')
    : rwHint;
  return {
    label: `${scopes.length} scope${scopes.length === 1 ? '' : 's'}`,
    detail,
  };
}

function sortRoles(roles: RoleDefinition[]): RoleDefinition[] {
  const systemOrder = ['admin', 'astroadmin'];
  return [...roles].sort((a, b) => {
    const aIdx = systemOrder.indexOf(a.id);
    const bIdx = systemOrder.indexOf(b.id);
    if (aIdx !== -1 || bIdx !== -1) {
      if (aIdx === -1) return 1;
      if (bIdx === -1) return -1;
      return aIdx - bIdx;
    }
    return a.name.localeCompare(b.name);
  });
}

export default function RoleManagement() {
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<RoleDefinition | null>(null);
  const [search, setSearch] = useState('');
  const deleteModal = useModal();

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.listRoles();
      setRoles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  const sortedRoles = useMemo(() => sortRoles(roles), [roles]);

  const filteredRoles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sortedRoles;
    return sortedRoles.filter(
      (role) =>
        role.name.toLowerCase().includes(q) ||
        role.id.toLowerCase().includes(q) ||
        (role.description?.toLowerCase().includes(q) ?? false)
    );
  }, [sortedRoles, search]);

  const stats = useMemo(() => {
    const system = roles.filter((r) => r.isSystem).length;
    const assigned = roles.reduce((sum, r) => sum + (r.accountCount ?? 0), 0);
    return {
      total: roles.length,
      system,
      custom: roles.length - system,
      assigned,
    };
  }, [roles]);

  const onConfirmDelete = async () => {
    if (!roleToDelete || roleToDelete.isSystem) return;
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      await authService.deleteRole(roleToDelete.id);
      setSuccess(`Role "${roleToDelete.name}" deleted.`);
      deleteModal.closeModal();
      setRoleToDelete(null);
      await loadRoles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete role');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        title="Roles"
        description="Define permission profiles and assign scopes per module."
        action={
          <Link to="/roles/new">
            <Button>Create role</Button>
          </Link>
        }
      />

      {error && <SettingsAlert variant="error">{error}</SettingsAlert>}
      {success && <SettingsAlert variant="success">{success}</SettingsAlert>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SettingsStatCard label="Total roles" value={stats.total} />
        <SettingsStatCard label="System roles" value={stats.system} hint="Built-in, protected" />
        <SettingsStatCard label="Custom roles" value={stats.custom} hint="Created by admins" />
        <SettingsStatCard label="Assigned accounts" value={stats.assigned} hint="Across all roles" />
      </div>

      <SettingsDataPanel
        title="All roles"
        subtitle={`${filteredRoles.length} of ${roles.length} shown`}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search name, ID, description…"
      >
        {loading ? (
          <SettingsTableLoading label="Loading roles…" />
        ) : (
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-gray-50 dark:bg-gray-800/60">
                <TableRow>
                  <TableCell isHeader className={SETTINGS_TH_CLASS}>Role</TableCell>
                  <TableCell isHeader className={SETTINGS_TH_CLASS}>Permissions</TableCell>
                  <TableCell isHeader className={SETTINGS_TH_CLASS}>Accounts</TableCell>
                  <TableCell isHeader className={`${SETTINGS_TH_CLASS} text-end`}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredRoles.length === 0 ? (
                  <SettingsTableEmpty
                    colSpan={4}
                    message={
                      search.trim() ? 'No roles match your search.' : 'No roles configured yet.'
                    }
                  />
                ) : (
                  filteredRoles.map((role) => {
                    const scopeSummary = formatScopesSummary(role.scopes);
                    return (
                      <TableRow
                        key={role.id}
                        className="transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/40"
                      >
                        <TableCell className={SETTINGS_TD_CLASS}>
                          <div className="flex items-start gap-3 min-w-[220px]">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                                role.isSystem
                                  ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
                              }`}
                            >
                              {roleInitials(role.name)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {role.name}
                                </p>
                                {role.isSystem && (
                                  <Badge color="primary" size="sm">System</Badge>
                                )}
                              </div>
                              <p className="font-mono text-xs text-gray-500 dark:text-gray-400">
                                {role.id}
                              </p>
                              {role.description && (
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                  {role.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className={SETTINGS_TD_CLASS}>
                          <Badge color={roleBadgeColor(role.id)} size="sm" variant="light">
                            {scopeSummary.label}
                          </Badge>
                          {scopeSummary.detail && (
                            <p className="mt-1.5 max-w-xs font-mono text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                              {scopeSummary.detail}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className={SETTINGS_TD_CLASS}>
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            {role.accountCount ?? 0}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(role.accountCount ?? 0) === 1 ? 'account' : 'accounts'}
                          </p>
                        </TableCell>
                        <TableCell className={`${SETTINGS_TD_CLASS} text-end`}>
                          <div className="inline-flex items-center gap-1">
                            <Link
                              to={`/roles/${role.id}`}
                              title={role.id === 'admin' ? 'View role' : 'Edit scopes'}
                              className="inline-flex rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-brand-400"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                            {!role.isSystem && (
                              <button
                                type="button"
                                disabled={actionLoading}
                                title="Delete role"
                                onClick={() => {
                                  setRoleToDelete(role);
                                  deleteModal.openModal();
                                }}
                                className="inline-flex rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                              >
                                <TrashBinIcon className="h-4 w-4" />
                              </button>
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
          setRoleToDelete(null);
        }}
        className="max-w-md"
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Delete role</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Permanently delete role{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              {roleToDelete?.name}
            </span>{' '}
            (<span className="font-mono">{roleToDelete?.id}</span>)? All accounts using this role
            must be reassigned first.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => { deleteModal.closeModal(); setRoleToDelete(null); }}>
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
