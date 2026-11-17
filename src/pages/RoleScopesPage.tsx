import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import Button from '../components/ui/button/Button';
import Input from '../components/form/input/InputField';
import Label from '../components/form/Label';
import ScopeMatrix from '../components/ScopeMatrix';
import {
  SettingsAlert,
  SettingsFormCard,
  SettingsPageHeader,
  SettingsTableLoading,
} from '../components/settings/settingsUi';
import {
  authService,
  type CreateRoleInput,
  type RoleDefinition,
  type ScopeModule,
} from '../services/auth';

const DEFAULT_SCOPES = [
  'auth.profile:read',
  'auth.change-password:write',
];

export default function RoleScopesPage() {
  const { roleId } = useParams<{ roleId: string }>();
  const isCreate = roleId === 'new';
  const navigate = useNavigate();

  const [catalog, setCatalog] = useState<ScopeModule[]>([]);
  const [role, setRole] = useState<RoleDefinition | null>(null);
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<Set<string>>(
    () => new Set(DEFAULT_SCOPES)
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdminRole = role?.id === 'admin';
  const scopesReadOnly = Boolean(role?.isSystem && isAdminRole);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const scopeCatalog = await authService.listScopes();
        setCatalog(scopeCatalog);

        if (isCreate) return;

        const roleData = await authService.getRole(roleId!);
        setRole(roleData);
        setId(roleData.id);
        setName(roleData.name);
        setDescription(roleData.description ?? '');
        setSelectedScopes(new Set(roleData.scopes));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load role');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [roleId, isCreate]);

  const validate = (): string | null => {
    if (isCreate) {
      if (!/^[a-z][a-z0-9_]{2,31}$/.test(id)) {
        return 'Role ID must be 3–32 chars: lowercase letters, numbers, underscore';
      }
      if (!name.trim()) return 'Name is required';
    }
    if (selectedScopes.size === 0) return 'Select at least one scope';
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const scopes = Array.from(selectedScopes).sort();

    try {
      setSaving(true);
      setError(null);

      if (isCreate) {
        const input: CreateRoleInput = {
          id: id.trim(),
          name: name.trim(),
          description: description.trim() || undefined,
          scopes,
        };
        await authService.createRole(input);
      } else if (role) {
        if (name.trim() !== role.name || description !== (role.description ?? '')) {
          await authService.updateRole(role.id, {
            name: name.trim(),
            description: description.trim() || undefined,
          });
        }
        if (!scopesReadOnly) {
          await authService.replaceRoleScopes(role.id, scopes);
        }
      }

      navigate('/roles');
    } catch (err) {
      const e = err as Error & { errors?: string[] };
      if (Array.isArray(e.errors) && e.errors.length) {
        setError(e.errors.join('\n'));
      } else {
        setError(e.message ?? 'Failed to save role');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <SettingsTableLoading label="Loading role…" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        to="/roles"
        className="inline-block text-sm text-brand-500 hover:text-brand-600"
      >
        ← Back to roles
      </Link>
      <SettingsPageHeader
        title={isCreate ? 'Create role' : `Edit role — ${role?.name ?? roleId}`}
        description={
          scopesReadOnly
            ? 'The admin role has full access; scopes cannot be changed.'
            : 'Set role metadata and choose module permissions below.'
        }
      />

      <form onSubmit={(e) => void onSubmit(e)} className="space-y-6">
        {error && <SettingsAlert variant="error">{error}</SettingsAlert>}

        {isCreate && (
          <SettingsFormCard title="Role details" description="ID cannot be changed after creation.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Role ID</Label>
                <Input
                  value={id}
                  onChange={(e) => setId(e.target.value.toLowerCase())}
                  placeholder="support"
                />
              </div>
              <div>
                <Label>Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Support Team"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Description (optional)</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Listener support only"
                />
              </div>
            </div>
          </SettingsFormCard>
        )}

        {!isCreate && !isAdminRole && (
          <SettingsFormCard title="Role details">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Role ID</Label>
                <p className="mt-1 font-mono text-sm text-gray-600 dark:text-gray-400">{id}</p>
              </div>
            </div>
          </SettingsFormCard>
        )}

        <SettingsFormCard
          title="Permissions"
          description={
            isAdminRole
              ? undefined
              : `${selectedScopes.size} scope${selectedScopes.size === 1 ? '' : 's'} selected`
          }
        >
          {isAdminRole ? (
            <div className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300">
              Wildcard <code className="font-mono font-semibold">*</code> — full access to all
              modules and actions.
            </div>
          ) : (
            <ScopeMatrix
              catalog={catalog}
              selected={selectedScopes}
              onChange={setSelectedScopes}
              disabled={scopesReadOnly}
            />
          )}
        </SettingsFormCard>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/roles')}>
            Cancel
          </Button>
          {!scopesReadOnly && (
            <Button
              disabled={saving}
              onClick={() => {
                const form = document.querySelector('form');
                form?.requestSubmit();
              }}
            >
              {saving ? 'Saving...' : isCreate ? 'Create role' : 'Save changes'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
