import { useState } from 'react';
import { useNavigate } from 'react-router';
import Button from '../components/ui/button/Button';
import Input from '../components/form/input/InputField';
import Label from '../components/form/Label';
import {
  SettingsAlert,
  SettingsFormCard,
  SettingsPageHeader,
} from '../components/settings/settingsUi';
import { authService } from '../services/auth';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    try {
      setSaving(true);
      await authService.changePassword(currentPassword, newPassword);
      setSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const e = err as Error & { errors?: string[] };
      if (Array.isArray(e.errors) && e.errors.length) {
        setError(e.errors.join('\n'));
      } else {
        setError(e.message ?? 'Failed to change password');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <SettingsPageHeader
        title="Change password"
        description="Update your admin account password."
      />

      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
        {error && <SettingsAlert variant="error">{error}</SettingsAlert>}
        {success && <SettingsAlert variant="success">{success}</SettingsAlert>}

        <SettingsFormCard>
          <div className="space-y-4">
            <div>
              <Label>Current password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <Label>New password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <Label>Confirm new password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button disabled={saving}>
                {saving ? 'Saving...' : 'Update password'}
              </Button>
            </div>
          </div>
        </SettingsFormCard>
      </form>
    </div>
  );
}
