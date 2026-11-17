import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import AadhaarProfileCard from '../components/aadhaar/AadhaarProfileCard';
import EditAadhaarModal from '../components/aadhaar/EditAadhaarModal';
import { Modal } from '../components/ui/modal';
import { ApiError } from '../services/api/base';
import { AdminAadhaarProfile, aadhaarAPI } from '../services/api/aadhaar';
import { useAuth } from '../context/AuthContext';
import useGoBack from '../hooks/useGoBack';

export default function AadhaarDetail() {
  const { userId } = useParams<{ userId: string }>();
  const goBack = useGoBack();
  const navigate = useNavigate();
  const { can } = useAuth();

  const canEdit = can('aadhaar.users.userId.update:write') || can('aadhaar:write');
  const canDelete = can('aadhaar.users.userId.delete:write') || can('aadhaar:write');

  const [record, setRecord] = useState<AdminAadhaarProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await aadhaarAPI.getByUserId(Number(userId));
        setRecord(data);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'Failed to load Aadhaar record');
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const handleDelete = async () => {
    if (!record) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await aadhaarAPI.delete(record.userId);
      navigate('/aadhaar', { replace: true });
    } catch (e) {
      setDeleteError(e instanceof ApiError ? e.message : 'Failed to delete Aadhaar record');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-gray-500">
        Loading Aadhaar record…
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={goBack} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
          ← Back
        </button>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
          {error ?? 'Record not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button type="button" onClick={goBack} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
            ← Back to list
          </button>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            Aadhaar — User {record.userId}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{record.fullName ?? 'DigiLocker record'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/enhanced-user-details?userId=${record.userId}`}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            User profile
          </Link>
          {record.isAstrologer && (
            <Link
              to={`/astro/astrologers/${record.userId}`}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Astrologer profile
            </Link>
          )}
          {canEdit && (
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Edit
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => { setDeleteError(null); setDeleteOpen(true); }}
              className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <AadhaarProfileCard aadhaar={record} showViewLink={false} />

      {record.address && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-3 font-semibold text-gray-900 dark:text-white">Structured address</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
            {Object.entries(record.address).map(([key, value]) =>
              value ? (
                <div key={key}>
                  <dt className="text-xs capitalize text-gray-500">{key.replace(/([A-Z])/g, ' $1')}</dt>
                  <dd className="text-gray-900 dark:text-gray-100">{value}</dd>
                </div>
              ) : null
            )}
          </dl>
        </div>
      )}

      {canEdit && (
        <EditAadhaarModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          record={record}
          onUpdated={setRecord}
        />
      )}

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} className="max-w-md">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Aadhaar record</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            This removes the record, linked DigiLocker sessions, and stored profile/XML files for{' '}
            <span className="font-semibold">User {record.userId}</span>. The user must re-verify via
            DigiLocker afterward.
          </p>
          {deleteError && (
            <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
              {deleteError}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeleteOpen(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={() => void handleDelete()}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Delete record'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
