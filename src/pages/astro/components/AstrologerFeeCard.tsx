import { FormEvent, useEffect, useState } from 'react';
import { ApiError } from '../../../services/api/base';
import type { AstrologerFeeState, SetAstrologerFeeBody } from '../../../services/api/astro';
import { Modal } from '../../../components/ui/modal';
import { useModal } from '../../../hooks/useModal';
import { astroBtnOutline, AstroInfoRow, AstroSectionCard, formatAstroDate, formatINR } from './astroUi';
import { astroFieldClass, astroLabelClass } from '../utils/astroProfileUtils';

/** Small "Free" pill used wherever a session's astrologer fee is waived. */
export function FreeFeeBadge({ source }: { source?: 'admin' | 'free_grant' | null }) {
  return (
    <span
      title={source === 'free_grant' ? 'Free first session (system)' : 'Fee marked free by admin'}
      className="font-semibold text-emerald-600 dark:text-emerald-400"
    >
      FREE
    </span>
  );
}

type Props = {
  fee: AstrologerFeeState | undefined;
  /** Human label for the modal, e.g. "booking #12". */
  subject: string;
  onChange: (body: SetAstrologerFeeBody) => Promise<void>;
};

export default function AstrologerFeeCard({ fee, subject, onChange }: Props) {
  const modal = useModal();
  const [mode, setMode] = useState<'free' | 'revert'>('free');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!modal.isOpen) return;
    setReason('');
    setError(null);
    setSaving(false);
  }, [modal.isOpen]);

  // Nothing to show until the session is settled (completed + paid) or a free grant.
  if (!fee || (!fee.isFree && fee.earning == null)) return null;

  const open = (next: 'free' | 'revert') => {
    setMode(next);
    modal.openModal();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = reason.trim();
    if (mode === 'free' && trimmed.length < 3) {
      setError('A reason of at least 3 characters is required');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await onChange(mode === 'free' ? { free: true, reason: trimmed } : { free: false });
      modal.closeModal();
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : 'Failed to update fee');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AstroSectionCard
        title="Astrologer fee"
        description="What the astrologer earns for this session. Does not change the customer's charge."
      >
        <div>
          <AstroInfoRow
            label="Fee status"
            value={
              fee.isFree ? (
                <span className="inline-flex items-center gap-2">
                  <FreeFeeBadge source={fee.source} />
                  <span className="text-xs text-gray-500">
                    {fee.source === 'free_grant' ? 'System free first session' : 'Marked free by admin'}
                  </span>
                </span>
              ) : (
                'Paid'
              )
            }
          />
          <AstroInfoRow label="Astrologer earning" value={formatINR(fee.earning ?? 0)} />
          {fee.isFree && fee.source === 'admin' && fee.waivedAmount != null && (
            <AstroInfoRow label="Waived amount" value={formatINR(fee.waivedAmount)} />
          )}
          {!fee.isFree && fee.standardEarning != null && (
            <AstroInfoRow label="Standard earning" value={formatINR(fee.standardEarning)} />
          )}
          {fee.reason && <AstroInfoRow label="Reason" value={fee.reason} />}
          {fee.markedAt && <AstroInfoRow label="Marked at" value={formatAstroDate(fee.markedAt)} />}
        </div>

        {(fee.canMarkFree || fee.canRevert) && (
          <div className="mt-4">
            {fee.canMarkFree && (
              <button
                type="button"
                onClick={() => open('free')}
                className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Mark astrologer fee as free
              </button>
            )}
            {fee.canRevert && (
              <button type="button" onClick={() => open('revert')} className={`${astroBtnOutline} w-full`}>
                Restore astrologer fee
              </button>
            )}
          </div>
        )}
        {fee.isFree && fee.source === 'free_grant' && (
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            System-granted free sessions cannot be changed.
          </p>
        )}
      </AstroSectionCard>

      <Modal isOpen={modal.isOpen} onClose={modal.closeModal} className="max-w-lg">
        <form onSubmit={(e) => void submit(e)} className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {mode === 'free' ? `Mark ${subject} as free` : `Restore fee for ${subject}`}
          </h2>
          {mode === 'free' ? (
            <>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                The astrologer will see this session as <strong>Free</strong> (₹0) in their earnings
                history and will not be paid for it
                {fee.standardEarning != null && <> (waives {formatINR(fee.standardEarning)})</>}. The
                customer is not refunded or re-charged.
              </p>
              <p className="mt-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                If this session was already included in a payout, the astrologer becomes overpaid and
                new payouts are blocked until future earnings offset it.
              </p>
              <div className="mt-4">
                <label className={astroLabelClass}>Reason (required)</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className={astroFieldClass}
                  placeholder="e.g. Call quality issue, goodwill session"
                  required
                />
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              The astrologer will earn {fee.waivedAmount != null ? formatINR(fee.waivedAmount) : 'the standard fee'}{' '}
              for this session again and it will count towards their payout balance.
            </p>
          )}

          {error && (
            <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button type="button" className={astroBtnOutline} onClick={modal.closeModal} disabled={saving}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? 'Saving…' : mode === 'free' ? 'Mark as free' : 'Restore fee'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
