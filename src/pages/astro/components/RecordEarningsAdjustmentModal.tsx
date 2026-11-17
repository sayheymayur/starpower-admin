import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ApiError } from '../../../services/api/base';
import {
  astroFinanceAPI,
  AstroCompletedSession,
  AstroEarningsAdjustmentDirection,
  AstroEarningsAdjustmentAmountType,
  CreateAstroEarningsAdjustmentResult,
} from '../../../services/api/astroFinance';
import { astroBtn, astroBtnOutline, astroCard, formatINR } from './astroUi';

type Props = {
  open: boolean;
  onClose: () => void;
  astrologerUserId: number;
  astrologerName: string;
  direction: AstroEarningsAdjustmentDirection;
  sessions: AstroCompletedSession[];
  initialBookingId?: number | null;
  onSuccess: (result: CreateAstroEarningsAdjustmentResult, message: string) => void;
  onError: (message: string) => void;
};

export default function RecordEarningsAdjustmentModal({
  open,
  onClose,
  astrologerUserId,
  astrologerName,
  direction,
  sessions,
  initialBookingId,
  onSuccess,
  onError,
}: Props) {
  const [amountType, setAmountType] =
    useState<AstroEarningsAdjustmentAmountType>('custom');
  const [customAmount, setCustomAmount] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedSession = useMemo(() => {
    const id = Number(bookingId);
    if (!Number.isFinite(id) || id <= 0) return null;
    return sessions.find((s) => s.bookingId === id) ?? null;
  }, [bookingId, sessions]);

  useEffect(() => {
    if (!open) return;
    const defaultBooking =
      initialBookingId != null
        ? String(initialBookingId)
        : sessions[0]
          ? String(sessions[0].bookingId)
          : '';
    setAmountType(initialBookingId != null || sessions.length > 0 ? 'session' : 'custom');
    setCustomAmount('');
    setBookingId(defaultBooking);
    setRemark('');
  }, [open, astrologerUserId, direction, sessions, initialBookingId]);

  if (!open) return null;

  const title = direction === 'add' ? 'Add earnings' : 'Deduct earnings';

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    const body = {
      astrologerUserId,
      direction,
      amountType,
      remark: remark.trim() || undefined,
    } as Parameters<typeof astroFinanceAPI.createEarningsAdjustment>[0];

    if (amountType === 'custom') {
      const amount = Number(customAmount);
      if (!Number.isFinite(amount) || amount <= 0) {
        onError('Enter a valid amount greater than 0');
        return;
      }
      body.customAmount = amount;
    } else {
      const id = Number(bookingId);
      if (!Number.isFinite(id) || id <= 0) {
        onError('Select or enter a booking ID');
        return;
      }
      body.bookingId = id;
    }

    try {
      setSubmitting(true);
      const res = await astroFinanceAPI.createEarningsAdjustment(body);
      const adj = res.data.adjustment;
      const signed = formatINR(Math.abs(adj.signedAmount));
      onSuccess(
        res.data,
        `${direction === 'add' ? 'Added' : 'Deducted'} ${signed} for ${astrologerName}`
      );
      onClose();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Failed to record adjustment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <form onSubmit={submit} className={`${astroCard} w-full max-w-lg space-y-4 p-6`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title} — {astrologerName}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Adjustments change pending balance before you record a bank payout. They are not bank
          transfers.
        </p>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Amount type
          </label>
          <div className="flex flex-wrap gap-2">
            <label
              className={`cursor-pointer rounded-lg border px-3 py-2 text-sm ${
                amountType === 'custom'
                  ? 'border-brand-500 bg-brand-50 text-brand-800 dark:border-brand-600 dark:bg-brand-950/40 dark:text-brand-300'
                  : 'border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400'
              }`}
            >
              <input
                type="radio"
                name="amountType"
                className="sr-only"
                checked={amountType === 'custom'}
                onChange={() => setAmountType('custom')}
              />
              Custom amount
            </label>
            <label
              className={`cursor-pointer rounded-lg border px-3 py-2 text-sm ${
                amountType === 'session'
                  ? 'border-brand-500 bg-brand-50 text-brand-800 dark:border-brand-600 dark:bg-brand-950/40 dark:text-brand-300'
                  : 'border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400'
              }`}
            >
              <input
                type="radio"
                name="amountType"
                className="sr-only"
                checked={amountType === 'session'}
                onChange={() => setAmountType('session')}
              />
              Session (booking)
            </label>
          </div>
        </div>

        {amountType === 'custom' ? (
          <div>
            <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">
              Amount (₹)
            </label>
            <input
              type="number"
              required
              min={1}
              step="1"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">
              Booking
            </label>
            {sessions.length > 0 ? (
              <select
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                {sessions.map((s) => (
                  <option key={s.bookingId} value={s.bookingId}>
                    #{s.bookingId} · {s.userName} · {formatINR(s.earning)} earning
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                min={1}
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="Booking ID"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            )}
            {selectedSession && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Session earning: {formatINR(selectedSession.earning)} (60% of pre-GST payment)
              </p>
            )}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">Remark</label>
          <input
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder={
              direction === 'add' ? 'e.g. Festival bonus' : 'e.g. Refund clawback'
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className={astroBtnOutline}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={
              direction === 'deduct'
                ? 'rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50'
                : astroBtn
            }
          >
            {submitting ? 'Saving…' : direction === 'add' ? 'Add adjustment' : 'Deduct adjustment'}
          </button>
        </div>
      </form>
    </div>
  );
}
