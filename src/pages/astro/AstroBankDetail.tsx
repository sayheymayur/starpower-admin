import { FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ApiError } from '../../services/api/base';
import {
  astroFinanceAPI,
  AstroBankItem,
  CreateBankInput,
  UpdateBankInput,
} from '../../services/api/astroFinance';
import {
  AstroAlert,
  AstroPageHeader,
  astroBtn,
  astroBtnOutline,
  astroCard,
  formatAstroDate,
} from './components/astroUi';

export default function AstroBankDetail() {
  const { userId } = useParams<{ userId: string }>();
  const [bank, setBank] = useState<AstroBankItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const [fullName, setFullName] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [micr, setMicr] = useState('');
  const [status, setStatus] = useState(1);

  useEffect(() => {
    if (!userId) return;
    void (async () => {
      try {
        setLoading(true);
        const res = await astroFinanceAPI.getBank(Number(userId));
        // The API returns the astrologer at the top level and the bank record under
        // `bankDetails` (null when the astrologer has not added one yet).
        const details = res.data.bankDetails ?? null;
        setBank({
          ...res.data,
          ...(details ?? {}),
          astrologerName: details?.astrologerName || res.data.astrologerName,
          mobileNo: details?.mobileNo || res.data.mobileNo,
        });
        setFullName(details?.fullName ?? res.data.astrologerName ?? '');
        setAccountNo(details?.accountNumber ?? '');
        setIfscCode(details?.ifscCode ?? '');
        setMicr(details?.micr ?? '');
        setStatus(details?.status ?? 1);
        setIsNew(!details);
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) {
          setIsNew(true);
          setBank({
            astrologerUserId: Number(userId),
            astrologerName: `Astrologer ${userId}`,
            mobileNo: '',
          });
        } else {
          setError(e instanceof ApiError ? e.message : 'Failed to load bank details');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    try {
      setSubmitting(true);
      setError(null);
      if (isNew) {
        const input: CreateBankInput = {
          astrologerUserId: Number(userId),
          fullName,
          accountNo,
          ifscCode,
          micr: micr || undefined,
          status,
        };
        const res = await astroFinanceAPI.createBank(input);
        setBank(res.data);
        setIsNew(false);
        setSuccess('Bank account created');
      } else {
        const input: UpdateBankInput = {
          fullName,
          accountNo,
          ifscCode,
          micr: micr || undefined,
          status,
        };
        const res = await astroFinanceAPI.updateBank(Number(userId), input);
        setBank(res.data);
        setSuccess('Bank account updated');
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AstroPageHeader
        title={isNew ? 'Add bank account' : 'Bank account'}
        description={bank?.astrologerName}
        action={<Link to="/astro/banks" className={astroBtnOutline}>← All banks</Link>}
      />

      {error && <AstroAlert type="error" message={error} onDismiss={() => setError(null)} />}
      {success && <AstroAlert type="success" message={success} onDismiss={() => setSuccess(null)} />}

      <form onSubmit={submit} className={`${astroCard} max-w-xl p-6 space-y-4`}>
        {!isNew && bank?.createdAt && (
          <p className="text-sm text-gray-500">Added {formatAstroDate(bank.createdAt)}</p>
        )}

        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Account holder name</label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Account number</label>
          <input
            required
            value={accountNo}
            onChange={(e) => setAccountNo(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">IFSC code</label>
          <input
            required
            value={ifscCode}
            onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">MICR (optional)</label>
          <input
            value={micr}
            onChange={(e) => setMicr(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value={1}>Active</option>
            <option value={0}>Inactive</option>
          </select>
        </div>

        {bank?.aadhaarFront && (
          <div className="text-sm">
            <a href={bank.aadhaarFront} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline dark:text-brand-400">
              View Aadhaar front
            </a>
            {bank.aadhaarBack && (
              <>
                {' · '}
                <a href={bank.aadhaarBack} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline dark:text-brand-400">
                  View Aadhaar back
                </a>
              </>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={submitting} className={astroBtn}>
            {submitting ? 'Saving…' : isNew ? 'Create bank record' : 'Save changes'}
          </button>
          <Link to={`/astro/astrologers/${userId}`} className={astroBtnOutline}>
            View astrologer
          </Link>
        </div>
      </form>
    </div>
  );
}
