import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import Button from '../components/ui/button/Button';
import Input from '../components/form/input/InputField';
import Label from '../components/form/Label';
import {
  SettingsAlert,
  SettingsFormCard,
  SettingsPageHeader,
  SettingsTableLoading,
} from '../components/settings/settingsUi';
import {
  authService,
  type CreateAdminInput,
  type RoleDefinition,
  type UpdateAdminInput,
} from '../services/auth';

type FormState = {
  username: string;
  gmail: string;
  password: string;
  fullName: string;
  isActive: boolean;
  roleId: string;
};

const emptyForm: FormState = {
  username: '',
  gmail: '',
  password: '',
  fullName: '',
  isActive: true,
  roleId: 'astroadmin',
};

export default function AdminFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id && id !== 'new');
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [isRoot, setIsRoot] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRoles() {
      try {
        const data = await authService.listRoles();
        setRoles(data);
      } catch {
        // Role list failure handled on submit if needed
      }
    }
    void loadRoles();
  }, []);

  useEffect(() => {
    if (!isEdit || !id) return;

    async function load() {
      try {
        setLoading(true);
        const admins = await authService.listAdmins();
        const admin = admins.find((a) => a.id === id);
        if (!admin) {
          setError('Admin not found');
          return;
        }
        setIsRoot(Boolean(admin.isRoot));
        setForm({
          username: admin.username,
          gmail: admin.gmail,
          password: '',
          fullName: admin.fullName,
          isActive: admin.isActive,
          roleId: admin.roleId ?? admin.role ?? 'admin',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load admin');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [id, isEdit]);

  const validate = (): string | null => {
    if (!form.fullName.trim()) return 'Full name is required';
    if (!isEdit) {
      if (!/^[a-zA-Z][a-zA-Z0-9_]{2,31}$/.test(form.username)) {
        return 'Username must be 3–32 chars: letters, numbers, underscore';
      }
      if (!form.gmail.endsWith('@gmail.com')) {
        return 'Gmail must end with @gmail.com';
      }
      if (form.password.length < 6) return 'Password must be at least 6 characters';
      if (!form.roleId) return 'Role is required';
    } else if (form.password && form.password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (isEdit && id) {
        const patch: UpdateAdminInput = {
          fullName: form.fullName,
          isActive: form.isActive,
          roleId: form.roleId,
        };
        if (form.password) patch.password = form.password;
        await authService.updateAdmin(id, patch);
      } else {
        const input: CreateAdminInput = {
          username: form.username,
          gmail: form.gmail,
          password: form.password,
          fullName: form.fullName,
          isActive: form.isActive,
          roleId: form.roleId,
          product: 'starpower',
        };
        await authService.createAdmin(input);
      }

      navigate('/admins');
    } catch (err) {
      const e = err as Error & { status?: number; errors?: string[] };
      if (e.status === 409) {
        setError('Username or Gmail already exists.');
      } else if (Array.isArray(e.errors) && e.errors.length) {
        setError(e.errors.join('\n'));
      } else {
        setError(e.message ?? 'Failed to save admin');
      }
    } finally {
      setSaving(false);
    }
  };

  const roleName = (roleId: string) =>
    roles.find((r) => r.id === roleId)?.name ?? roleId;

  if (loading) {
    return (
      <div className="mx-auto max-w-lg">
        <SettingsTableLoading label="Loading account…" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Link
        to="/admins"
        className="inline-block text-sm text-brand-500 hover:text-brand-600"
      >
        ← Back to admins
      </Link>
      <SettingsPageHeader
          title={isEdit ? 'Edit admin' : 'Create admin'}
          description={
            isEdit
              ? 'Update account details, role, or password.'
              : 'Add a new dashboard login with an assigned role.'
          }
        />

      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
        {error && <SettingsAlert variant="error">{error}</SettingsAlert>}
        <SettingsFormCard>
        <div className="space-y-4">
        <div>
          <Label>Username</Label>
          <Input
            value={form.username}
            onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
            placeholder="ops_admin"
            disabled={isEdit}
          />
        </div>
        <div>
          <Label>Gmail</Label>
          <Input
            type="email"
            value={form.gmail}
            onChange={(e) => setForm((p) => ({ ...p, gmail: e.target.value }))}
            placeholder="ops.team@gmail.com"
            disabled={isEdit && isRoot}
          />
        </div>
        <div>
          <Label>Full name</Label>
          <Input
            value={form.fullName}
            onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
            placeholder="Ops Admin"
          />
        </div>
        <div>
          <Label>Role</Label>
          <select
            value={form.roleId}
            onChange={(e) =>
              setForm((p) => ({ ...p, roleId: e.target.value }))
            }
            disabled={isRoot}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
          >
            {roles.length === 0 ? (
              <option value={form.roleId}>{roleName(form.roleId)}</option>
            ) : (
              roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))
            )}
          </select>
        </div>
        <div>
          <Label>{isEdit ? 'New password (optional)' : 'Password'}</Label>
          <Input
            type="password"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            placeholder={isEdit ? 'Leave blank to keep current' : 'Min 6 characters'}
          />
        </div>
        {!isRoot && (
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
              className="rounded border-gray-300"
            />
            Active account
          </label>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={() => navigate('/admins')}>
            Cancel
          </Button>
          <Button disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Update admin' : 'Create admin'}
          </Button>
        </div>
        </div>
        </SettingsFormCard>
      </form>
    </div>
  );
}
