import { useState } from 'react';
import { ApiError } from '../../../services/api/base';
import { Modal } from '../../../components/ui/modal';
import { astroBtn, astroBtnOutline } from './astroUi';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  label: string;
  onDelete: (force: boolean) => Promise<void>;
};

export default function DeleteWithForceModal({
  isOpen,
  onClose,
  title,
  label,
  onDelete,
}: Props) {
  const [saving, setSaving] = useState(false);
  const [needsForce, setNeedsForce] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (force: boolean) => {
    try {
      setSaving(true);
      setError(null);
      await onDelete(force);
      setNeedsForce(false);
      onClose();
    } catch (e) {
      if (e instanceof ApiError && e.status === 409 && !force) {
        setNeedsForce(true);
        setError('Active bookings exist. Force remove will deactivate the account but keep booking history.');
      } else {
        setError(e instanceof Error ? e.message : 'Delete failed');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { setNeedsForce(false); setError(null); onClose(); }}
      className="max-w-md"
    >
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Remove <span className="font-semibold">{label}</span>? Booking history is preserved.
        </p>
        {error && (
          <p className="mt-3 text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3">
            {error}
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button className={astroBtnOutline} onClick={onClose}>Cancel</button>
          {!needsForce ? (
            <button className={astroBtn} disabled={saving} onClick={() => void handleDelete(false)}>
              {saving ? 'Removing…' : 'Delete'}
            </button>
          ) : (
            <button
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              disabled={saving}
              onClick={() => void handleDelete(true)}
            >
              {saving ? 'Force removing…' : 'Force remove'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
