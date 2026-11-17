import { FormEvent, useEffect, useState } from 'react';
import { ApiError } from '../../../services/api/base';
import {
  astroFinanceAPI,
  CreateAstroPayoutResult,
} from '../../../services/api/astroFinance';
import { astroBtn, astroBtnOutline, astroCard, formatINR } from './astroUi';

type Props = {
  open: boolean;
  onClose: () => void;
  astrologerUserId: number;
  astrologerName: string;
  pendingBalance: number;
  onSuccess: (result: CreateAstroPayoutResult, message: string) => void;
  onError: (message: string) => void;
};

export default function RecordPayoutModal({
  open,
  onClose,
  astrologerUserId,
  astrologerName,
  pendingBalance,
  onSuccess,
  onError,
}: Props) {
  const [amount, setAmount] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [remark, setRemark] = useState('');
  const [payoutDateTime, setPayoutDateTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAmount(String(pendingBalance));
    setPaymentRef('');
    setRemark('');
    setPayoutDateTime(new Date().toISOString().slice(0, 16));
  }, [open, pendingBalance, astrologerUserId]);

  if (!open) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const totalAmount = Number(amount);
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      onError('Enter a valid payout amount');
      return;
    }
    if (totalAmount > pendingBalance) {
      onError(`Amount cannot exceed pending balance (${formatINR(pendingBalance)})`);
      return;
    }

    try {
      setSubmitting(true);
      const res = await astroFinanceAPI.createPayout({
        astrologerUserId,
        totalAmount,
        payoutDateTime: payoutDateTime ? new Date(payoutDateTime).toISOString() : undefined,
        paymentId: paymentRef || undefined,
        remark: remark || undefined,
      });
      onSuccess(
        res.data,
        `Payout of ${formatINR(totalAmount)} recorded for ${astrologerName}`
      );
      onClose();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Failed to record payout');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <form onSubmit={submit} className={`${astroCard} w-full max-w-md space-y-4 p-6`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Record payout — {astrologerName}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Record after NEFT/UPI transfer. Pending balance:{' '}
          <span className="font-semibold text-amber-700 dark:text-amber-400">
            {formatINR(pendingBalance)}
          </span>
        </p>

        <div>
          <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">Amount (₹)</label>
          <input
            type="number"
            required
            min={1}
            max={pendingBalance}
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">
            Payout date & time
          </label>
          <input
            type="datetime-local"
            value={payoutDateTime}
            onChange={(e) => setPayoutDateTime(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">
            Payment reference
          </label>
          <input
            value={paymentRef}
            onChange={(e) => setPaymentRef(e.target.value)}
            placeholder="NEFT / UTR id"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">Remark</label>
          <input
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="e.g. June week 1 settlement"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className={astroBtnOutline}>
            Cancel
          </button>
          <button type="submit" disabled={submitting || pendingBalance <= 0} className={astroBtn}>
            {submitting ? 'Saving…' : 'Record payout'}
          </button>
        </div>
      </form>
    </div>
  );
}
