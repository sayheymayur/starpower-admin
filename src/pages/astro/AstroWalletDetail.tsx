import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ApiError } from '../../services/api/base';
import { useAuth } from '../../context/AuthContext';
import {
  astroWalletAPI,
  type AstroWallet,
  type AstroWalletTransaction,
} from '../../services/api/astroWallet';
import {
  AstroAlert,
  AstroBackLink,
  AstroInfoRow,
  AstroLoading,
  AstroPageHeader,
  AstroSectionCard,
  astroBtn,
  astroBtnOutline,
  formatAstroDate,
  formatINR,
  thClass,
  tdClass,
  astroCard,
} from './components/astroUi';

type AdjustMode = 'add' | 'deduct' | 'reset' | null;

export default function AstroWalletDetail() {
  const { userId = '' } = useParams<{ userId: string }>();
  const uid = Number(userId);
  const { isAdmin, isRoot } = useAuth();
  const canAdjust = isAdmin || isRoot;

  const [wallet, setWallet] = useState<AstroWallet | null>(null);
  const [txns, setTxns] = useState<AstroWalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mode, setMode] = useState<AdjustMode>(null);
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!Number.isFinite(uid)) return;
    try {
      setLoading(true);
      setError(null);
      const [walletRes, txnRes] = await Promise.all([
        astroWalletAPI.getWalletByUser(uid),
        astroWalletAPI.listUserTransactions(uid, { page: 1, limit: 20 }),
      ]);
      setWallet(walletRes.data);
      setTxns(txnRes.data ?? []);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load wallet');
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    void load();
  }, [load]);

  const submitAdjust = async () => {
    if (!canAdjust || !mode) return;
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      if (mode === 'reset') {
        await astroWalletAPI.reset(uid, remark || undefined);
        setSuccess('Wallet balance reset');
      } else {
        const value = Number(amount);
        if (!Number.isFinite(value) || value <= 0) {
          setError('Enter a positive amount');
          return;
        }
        if (mode === 'add') {
          await astroWalletAPI.add(uid, value, remark || undefined);
          setSuccess(`Added ${formatINR(value)}`);
        } else {
          await astroWalletAPI.deduct(uid, value, remark || undefined);
          setSuccess(`Deducted ${formatINR(value)}`);
        }
      }
      setMode(null);
      setAmount('');
      setRemark('');
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Adjustment failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AstroLoading label="Loading wallet…" />;

  return (
    <div className="space-y-6">
      <AstroBackLink to="/astro/wallets">Back to wallets</AstroBackLink>
      <AstroPageHeader
        title={wallet?.user?.full_name || `User #${uid}`}
        description="Wallet balance and adjustments"
        action={
          <Link to={`/astro/users/${uid}`} className={astroBtnOutline}>
            User profile
          </Link>
        }
      />

      {error && <AstroAlert type="error" message={error} onDismiss={() => setError(null)} />}
      {success && <AstroAlert type="success" message={success} onDismiss={() => setSuccess(null)} />}

      {wallet && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <AstroSectionCard title="Balance">
            <AstroInfoRow label="User ID" value={wallet.user_id_fk} />
            <AstroInfoRow label="Mobile" value={wallet.user?.mobile_no} />
            <AstroInfoRow label="Email" value={wallet.user?.email_id} />
            <AstroInfoRow label="Balance" value={formatINR(wallet.amount)} />
            <AstroInfoRow label="Updated" value={formatAstroDate(wallet.last_updated_date_time)} />
          </AstroSectionCard>

          {canAdjust && (
            <AstroSectionCard title="Adjust wallet (root)">
              <div className="flex flex-wrap gap-2 mb-4">
                <button type="button" className={astroBtnOutline} onClick={() => setMode('add')}>
                  Add
                </button>
                <button type="button" className={astroBtnOutline} onClick={() => setMode('deduct')}>
                  Deduct
                </button>
                <button type="button" className={astroBtnOutline} onClick={() => setMode('reset')}>
                  Reset
                </button>
              </div>
              {mode && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    Mode: {mode}
                  </p>
                  {mode !== 'reset' && (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Amount"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  )}
                  <input
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="Remark (optional)"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                  <div className="flex gap-2">
                    <button type="button" disabled={saving} className={astroBtn} onClick={() => void submitAdjust()}>
                      {saving ? 'Saving…' : 'Confirm'}
                    </button>
                    <button type="button" className={astroBtnOutline} onClick={() => setMode(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </AstroSectionCard>
          )}
        </div>
      )}

      <div className={`${astroCard} overflow-x-auto`}>
        <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white">Recent transactions</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className={thClass}>When</th>
              <th className={thClass}>Amount</th>
              <th className={thClass}>Type</th>
              <th className={thClass}>Remark</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {txns.length === 0 ? (
              <tr>
                <td colSpan={4} className={`${tdClass} text-center text-gray-500`}>
                  No transactions
                </td>
              </tr>
            ) : (
              txns.map((t, i) => (
                <tr key={String(t.transaction_id_pk ?? t.transaction_id ?? i)}>
                  <td className={tdClass}>{formatAstroDate(t.created_date_time ?? t.payment_date_time)}</td>
                  <td className={tdClass}>{formatINR(Number(t.amount))}</td>
                  <td className={tdClass}>
                    {t.is_credit === true ? 'Credit' : t.is_credit === false ? 'Debit' : t.transaction_type ?? t.status ?? '—'}
                  </td>
                  <td className={tdClass}>{t.remark ?? '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
