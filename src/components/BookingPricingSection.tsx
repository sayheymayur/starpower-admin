import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../services/api/base';
import {
  BookingPricingConfig,
  BookingPricingSample,
  bookingPricingAPI,
} from '../services/api/bookingPricing';
import Button from './ui/button/Button';
import Input from './form/input/InputField';
import Label from './form/Label';

function formatCurrency(amount: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

type Props = {
  state: string;
  onUpdated?: () => void;
};

export default function BookingPricingSection({ state, onUpdated }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [serverConfig, setServerConfig] = useState<BookingPricingConfig | null>(null);
  const [defaults, setDefaults] = useState<BookingPricingConfig | null>(null);
  const [sample, setSample] = useState<BookingPricingSample | null>(null);

  const [basePrice, setBasePrice] = useState('');
  const [gstPercent, setGstPercent] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await bookingPricingAPI.get({ state });
      setServerConfig(res.data.config);
      setDefaults(res.data.defaults);
      setSample(res.data.sampleNoCoupon);
      setBasePrice(String(res.data.config.basePrice));
      setGstPercent(String(res.data.config.gstPercent));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load booking pricing');
    } finally {
      setLoading(false);
    }
  }, [state]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!success) return;
    const t = window.setTimeout(() => setSuccess(null), 4000);
    return () => window.clearTimeout(t);
  }, [success]);

  const isDirty =
    serverConfig != null &&
    (Number(basePrice) !== serverConfig.basePrice ||
      Number(gstPercent) !== serverConfig.gstPercent);

  const onSave = async () => {
    const nextBase = Number(basePrice);
    const nextGst = Number(gstPercent);

    if (!Number.isFinite(nextBase) || nextBase < 1 || nextBase > 1_000_000) {
      setError('Base price must be between ₹1 and ₹10,00,000');
      return;
    }
    if (!Number.isFinite(nextGst) || nextGst < 0 || nextGst > 100) {
      setError('GST percent must be between 0 and 100');
      return;
    }

    const patch: Partial<BookingPricingConfig> = {};
    if (nextBase !== serverConfig?.basePrice) patch.basePrice = nextBase;
    if (nextGst !== serverConfig?.gstPercent) patch.gstPercent = nextGst;

    if (Object.keys(patch).length === 0) return;

    try {
      setSaving(true);
      setError(null);
      const res = await bookingPricingAPI.update(patch, { state });
      setServerConfig(res.data.config);
      setBasePrice(String(res.data.config.basePrice));
      setGstPercent(String(res.data.config.gstPercent));
      if (res.data.sampleNoCoupon) setSample(res.data.sampleNoCoupon);
      setSuccess('Session pricing updated — coupon previews will recalculate');
      onUpdated?.();
    } catch (e) {
      if (e instanceof ApiError) {
        const response = e.response as { errors?: string[] };
        setError(
          Array.isArray(response?.errors) && response.errors.length
            ? response.errors.join('\n')
            : e.message
        );
      } else {
        setError('Failed to update booking pricing');
      }
    } finally {
      setSaving(false);
    }
  };

  const onReset = () => {
    if (!serverConfig) return;
    setBasePrice(String(serverConfig.basePrice));
    setGstPercent(String(serverConfig.gstPercent));
    setError(null);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
        <h2 className="font-semibold text-gray-900 dark:text-white">Session pricing</h2>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          Global checkout MRP for astrologer bookings (call & chat). Not per-astrologer rates.
        </p>
      </div>

      <div className="p-5 space-y-5">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200 whitespace-pre-line">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-200">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <Label>Base price (pre-GST MRP)</Label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  ₹
                </span>
                <Input
                  type="number"
                  min="1"
                  max="1000000"
                  value={basePrice}
                  onChange={(e) => {
                    setBasePrice(e.target.value);
                    setError(null);
                  }}
                  disabled={loading || saving}
                  className="pl-8"
                />
              </div>
              {defaults && (
                <p className="mt-1 text-xs text-gray-400">Default: ₹{defaults.basePrice.toLocaleString('en-IN')}</p>
              )}
            </div>

            <div>
              <Label>GST rate (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step={0.01}
                value={gstPercent}
                onChange={(e) => {
                  setGstPercent(e.target.value);
                  setError(null);
                }}
                disabled={loading || saving}
                className="mt-1.5"
              />
              {defaults && (
                <p className="mt-1 text-xs text-gray-400">Default: {defaults.gstPercent}%</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Button onClick={() => void onSave()} disabled={loading || saving || !isDirty}>
                {saving ? 'Saving…' : 'Save pricing'}
              </Button>
              {isDirty && (
                <button
                  type="button"
                  onClick={onReset}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-brand-200/60 bg-brand-50/40 p-4 dark:border-brand-900/40 dark:bg-brand-950/20">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              List price preview ({state})
            </p>
            {loading ? (
              <p className="mt-4 text-sm text-gray-500">Loading…</p>
            ) : sample ? (
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-gray-600 dark:text-gray-400">Base (MRP)</dt>
                  <dd className="font-medium">{formatCurrency(sample.basePrice, sample.currency)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-gray-600 dark:text-gray-400">GST ({sample.gstRate}%)</dt>
                  <dd className="font-medium">{formatCurrency(sample.gstAmount, sample.currency)}</dd>
                </div>
                <div className="flex justify-between gap-3 border-t border-brand-200/60 pt-2 dark:border-brand-900/40">
                  <dt className="font-semibold text-gray-900 dark:text-white">Payable (no coupon)</dt>
                  <dd className="text-xl font-bold text-brand-600 dark:text-brand-400">
                    {formatCurrency(sample.payableAmount, sample.currency)}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="mt-4 text-sm text-gray-500">No preview available</p>
            )}
            <p className="mt-3 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
              Coupon discounts apply to the base price before GST. Paid bookings keep their original amount.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
