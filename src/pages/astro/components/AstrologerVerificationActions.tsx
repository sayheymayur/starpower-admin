import { FormEvent, useState } from 'react';
import { ApiError } from '../../../services/api/base';
import { astroAPI } from '../../../services/api/astro';
import { Modal } from '../../../components/ui/modal';
import {
  AstroAlert,
  VerificationBadge,
  astroBtn,
  astroBtnDangerSm,
  astroBtnOutline,
  astroBtnOutlineSm,
  astroBtnSm,
  astroCard,
} from './astroUi';

type Props = {
  userId: number;
  fullName: string;
  doctorProfileStatus: number | null | undefined;
  onUpdated?: (status: number) => void;
  compact?: boolean;
};

export default function AstrologerVerificationActions({
  userId,
  fullName,
  doctorProfileStatus,
  onUpdated,
  compact = false,
}: Props) {
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectRemark, setRejectRemark] = useState('');

  const status = doctorProfileStatus ?? 0;
  const isPending = status === 0 || status === 3;
  const isVerified = status === 1 || status === 4;
  const isRejected = status === 2;

  const runAction = async (action: string, fn: () => Promise<{ data: { doctorProfileStatus?: number | null } }>) => {
    try {
      setSubmitting(action);
      setError(null);
      setSuccess(null);
      const res = await fn();
      const next = res.data.doctorProfileStatus ?? (action === 'approve' ? 4 : action === 'reject' ? 2 : 3);
      setSuccess(
        action === 'approve'
          ? `${fullName} approved and activated`
          : action === 'reject'
            ? `${fullName} rejected`
            : `${fullName} marked as pending review`
      );
      onUpdated?.(next);
      if (action === 'reject') {
        setRejectOpen(false);
        setRejectRemark('');
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Action failed');
    } finally {
      setSubmitting(null);
    }
  };

  const handleReject = (e: FormEvent) => {
    e.preventDefault();
    void runAction('reject', () =>
      astroAPI.rejectAstrologer(userId, {
        rejectedRemark: rejectRemark.trim() || undefined,
      })
    );
  };

  const approveBtn = (
    <button
      type="button"
      disabled={!!submitting}
      onClick={() => void runAction('approve', () => astroAPI.approveAstrologer(userId))}
      className={compact ? astroBtnSm : `${astroBtn} w-full sm:w-auto`}
    >
      {submitting === 'approve' ? '…' : 'Approve'}
    </button>
  );

  const rejectBtn = (
    <button
      type="button"
      disabled={!!submitting}
      onClick={() => setRejectOpen(true)}
      className={
        compact
          ? astroBtnDangerSm
          : 'w-full rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30 disabled:opacity-50 sm:w-auto'
      }
    >
      Reject
    </button>
  );

  const pendingBtn = (
    <button
      type="button"
      disabled={!!submitting}
      onClick={() => void runAction('pending', () => astroAPI.markAstrologerPending(userId))}
      className={compact ? astroBtnOutlineSm : `${astroBtnOutline} w-full sm:w-auto`}
    >
      {submitting === 'pending' ? '…' : 'Mark pending'}
    </button>
  );

  if (compact) {
    return (
      <>
        <div className="flex items-center gap-1.5">
          {!isVerified && approveBtn}
          {!isRejected && rejectBtn}
          {!isPending && pendingBtn}
        </div>

        <RejectModal
          isOpen={rejectOpen}
          fullName={fullName}
          remark={rejectRemark}
          submitting={submitting === 'reject'}
          onRemarkChange={setRejectRemark}
          onClose={() => { setRejectOpen(false); setRejectRemark(''); }}
          onSubmit={handleReject}
        />
      </>
    );
  }

  return (
    <div className={`${astroCard} overflow-hidden`}>
      <div className="border-b border-brand-100 px-5 py-4 dark:border-brand-900/40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Verification</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Review documents and approve or reject this profile
            </p>
          </div>
          <VerificationBadge status={doctorProfileStatus} />
        </div>
      </div>

      <div className="space-y-4 p-5">
        {error && <AstroAlert type="error" message={error} onDismiss={() => setError(null)} />}
        {success && <AstroAlert type="success" message={success} onDismiss={() => setSuccess(null)} />}

        {isPending && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
            This astrologer is awaiting verification. Approve to activate their profile on the app.
          </div>
        )}

        {isRejected && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            Profile was rejected. You can mark pending again for re-review or approve directly.
          </div>
        )}

        {isVerified && (
          <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900 dark:border-brand-900/40 dark:bg-brand-950/30 dark:text-brand-200">
            Profile is verified and active. Reject or mark pending if you need to pause their listing.
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {!isVerified && approveBtn}
          {!isRejected && rejectBtn}
          {!isPending && pendingBtn}
        </div>
      </div>

      <RejectModal
        isOpen={rejectOpen}
        fullName={fullName}
        remark={rejectRemark}
        submitting={submitting === 'reject'}
        onRemarkChange={setRejectRemark}
        onClose={() => { setRejectOpen(false); setRejectRemark(''); }}
        onSubmit={handleReject}
      />
    </div>
  );
}

function RejectModal({
  isOpen,
  fullName,
  remark,
  submitting,
  onRemarkChange,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  fullName: string;
  remark: string;
  submitting: boolean;
  onRemarkChange: (v: string) => void;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <form onSubmit={onSubmit} className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Reject astrologer</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Reject <span className="font-semibold">{fullName}</span>. Optionally add a reason for the astrologer or internal notes.
        </p>
        <textarea
          value={remark}
          onChange={(e) => onRemarkChange(e.target.value)}
          placeholder="Rejection reason (optional)"
          rows={4}
          className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className={astroBtnOutline}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {submitting ? 'Rejecting…' : 'Confirm reject'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
