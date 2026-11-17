import { FormEvent, useEffect, useState } from 'react';
import { ApiError } from '../../../services/api/base';
import {
  CancelAstroBookingBody,
  CancelAstroBookingData,
  CancelAstroBookingPartyResult,
} from '../../../services/api/astro';
import { Modal } from '../../../components/ui/modal';
import { astroBtnOutline } from './astroUi';
import { astroFieldClass, astroLabelClass } from '../utils/astroProfileUtils';

const DEFAULT_TITLE = 'Session cancelled';
const DEFAULT_BODY = 'Your booking was cancelled by support. Please rebook.';

type Props = {
  isOpen: boolean;
  bookingId: number;
  onClose: () => void;
  onCancel: (body: CancelAstroBookingBody) => Promise<CancelAstroBookingData | void>;
};

function partyLabel(result: CancelAstroBookingPartyResult | undefined, fallback: string) {
  if (!result) return `${fallback}: unknown`;
  const ok = result.success ?? result.sent;
  if (ok === true) return `${fallback}: sent`;
  if (ok === false) return `${fallback}: failed${result.error || result.message ? ` — ${result.error ?? result.message}` : ''}`;
  if (result.message || result.error) return `${fallback}: ${result.message ?? result.error}`;
  return `${fallback}: ok`;
}

export default function CancelBookingModal({
  isOpen,
  bookingId,
  onClose,
  onCancel,
}: Props) {
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [body, setBody] = useState(DEFAULT_BODY);
  const [remark, setRemark] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(DEFAULT_TITLE);
    setBody(DEFAULT_BODY);
    setRemark('');
    setError(null);
    setSaving(false);
  }, [isOpen, bookingId]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    if (!trimmedTitle || !trimmedBody) {
      setError('Notification title and body are required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const payload: CancelAstroBookingBody = {
        title: trimmedTitle,
        body: trimmedBody,
      };
      const trimmedRemark = remark.trim();
      if (trimmedRemark) payload.remark = trimmedRemark;

      const result = await onCancel(payload);
      void result;
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError(err.message || 'Booking can no longer be cancelled (already terminal).');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to cancel booking');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
      <form onSubmit={(e) => void submit(e)} className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Cancel booking #{bookingId}
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Marks the booking cancelled by server and sends the same FCM notification to customer and
          astrologer. Does not refund — handle Razorpay separately if needed.
        </p>

        <div className="mt-4 space-y-3">
          <div>
            <label className={astroLabelClass}>Notification title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={astroFieldClass}
              required
            />
          </div>
          <div>
            <label className={astroLabelClass}>Notification body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              className={astroFieldClass}
              required
            />
          </div>
          <div>
            <label className={astroLabelClass}>Remark (optional, stored on booking)</label>
            <input
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className={astroFieldClass}
              placeholder="Internal note"
            />
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" className={astroBtnOutline} onClick={onClose} disabled={saving}>
            Keep booking
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {saving ? 'Cancelling…' : 'Cancel booking'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function formatCancelNotificationSummary(
  result: CancelAstroBookingData | undefined
): string | null {
  if (!result) return null;
  const customer =
    result.notifications?.customer ?? result.sendResults?.customer ?? result.customer;
  const astrologer =
    result.notifications?.astrologer ?? result.sendResults?.astrologer ?? result.astrologer;
  if (!customer && !astrologer) return null;
  return [partyLabel(customer, 'Customer FCM'), partyLabel(astrologer, 'Astrologer FCM')].join(
    ' · '
  );
}
