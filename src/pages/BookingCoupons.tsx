import { useCallback, useEffect, useState } from "react";
import {
  ApiError,
  BookingCoupon,
  BookingCouponPreview,
  BookingCouponPreviewMeta,
  bookingCouponsAPI,
  CreateBookingCouponInput,
} from "../services/api";
import BookingPricingSection from "../components/BookingPricingSection";
import Badge from "../components/ui/badge";
import Button from "../components/ui/button/Button";
import Input from "../components/form/input/InputField";
import TextArea from "../components/form/input/TextArea";
import Label from "../components/form/Label";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";

const INDIAN_STATES = [
  "Maharashtra",
  "Delhi",
  "Karnataka",
  "Tamil Nadu",
  "Gujarat",
  "West Bengal",
  "Rajasthan",
  "Uttar Pradesh",
  "Telangana",
  "Kerala",
];

const emptyForm: CreateBookingCouponInput = {
  code: "",
  label: "",
  percent: 0,
  description: "",
  enabled: true,
};

const thClass =
  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400";
const tdClass = "px-4 py-4 text-sm text-gray-700 dark:text-gray-300";

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function EnableToggle({
  enabled,
  disabled,
  onChange,
}: {
  enabled: boolean;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        enabled ? "bg-brand-500" : "bg-gray-300 dark:bg-gray-600"
      } disabled:opacity-50`}
      aria-pressed={enabled}
      aria-label={enabled ? "Disable coupon" : "Enable coupon"}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          enabled ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function PreviewCard({
  item,
  preview,
}: {
  item: BookingCouponPreview;
  preview: BookingCouponPreviewMeta;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="font-mono text-sm font-bold text-brand-600 dark:text-brand-400">
            {item.code}
          </span>
          <p className="mt-0.5 text-sm font-medium text-gray-900 dark:text-white">
            {item.label}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
            {item.description}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-bold text-brand-600 dark:text-brand-400">
          {item.percent}% off
        </span>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <div>
          <dt className="text-gray-500 dark:text-gray-400">Discount</dt>
          <dd className="font-medium text-green-600 dark:text-green-400">
            −{formatCurrency(item.discountAmount, preview.currency)}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500 dark:text-gray-400">GST ({preview.gstRate}%)</dt>
          <dd className="font-medium">{formatCurrency(item.gstAmount, preview.currency)}</dd>
        </div>
        <div className="col-span-2 border-t border-gray-200 pt-2 dark:border-gray-700">
          <dt className="text-gray-500 dark:text-gray-400">Payable</dt>
          <dd className="text-lg font-bold text-gray-900 dark:text-white">
            {formatCurrency(item.payableAmount, preview.currency)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export default function BookingCoupons() {
  const [coupons, setCoupons] = useState<BookingCoupon[]>([]);
  const [preview, setPreview] = useState<BookingCouponPreviewMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingCode, setTogglingCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [includeDisabled, setIncludeDisabled] = useState(true);
  const [state, setState] = useState("Maharashtra");

  const couponModal = useModal();
  const deleteModal = useModal();
  const [editingCoupon, setEditingCoupon] = useState<BookingCoupon | null>(null);
  const [form, setForm] = useState<CreateBookingCouponInput>(emptyForm);
  const [couponToDelete, setCouponToDelete] = useState<BookingCoupon | null>(null);

  const handleApiError = (e: unknown, fallback: string) => {
    if (e instanceof ApiError) {
      const response = e.response as { errors?: string[] };
      if (Array.isArray(response?.errors) && response.errors.length) {
        setError(response.errors.join("\n"));
      } else if (e.status === 401 || e.status === 403) {
        setError(`${e.message} — admin authorization is required for this action.`);
      } else {
        setError(e.message);
      }
    } else if (e instanceof Error) {
      setError(e.message);
    } else {
      setError(fallback);
    }
  };

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await bookingCouponsAPI.list({ includeDisabled, state });
      setCoupons(res.data.coupons);
      setPreview(res.data.preview);
    } catch (e) {
      handleApiError(e, "Failed to load booking coupons");
    } finally {
      setLoading(false);
    }
  }, [includeDisabled, state]);

  useEffect(() => {
    void fetchCoupons();
  }, [fetchCoupons]);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(null), 4000);
    return () => clearTimeout(t);
  }, [success]);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setForm(emptyForm);
    couponModal.openModal();
  };

  const openEditModal = (coupon: BookingCoupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      label: coupon.label,
      percent: coupon.percent,
      description: coupon.description,
      enabled: coupon.enabled,
    });
    couponModal.openModal();
  };

  const closeCouponModal = () => {
    couponModal.closeModal();
    setEditingCoupon(null);
    setForm(emptyForm);
  };

  const onSaveCoupon = async () => {
    if (!form.code.trim() || !form.label.trim() || !form.description.trim()) {
      setError("Code, label, and description are required.");
      return;
    }
    if (form.percent < 0 || form.percent > 100) {
      setError("Percent must be between 0 and 100.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (editingCoupon) {
        await bookingCouponsAPI.update(editingCoupon.code, {
          label: form.label,
          percent: form.percent,
          description: form.description,
          enabled: form.enabled,
        });
        setSuccess(`Coupon ${editingCoupon.code} updated.`);
      } else {
        await bookingCouponsAPI.create({
          ...form,
          code: form.code.trim().toUpperCase(),
        });
        setSuccess(`Coupon ${form.code.trim().toUpperCase()} created.`);
      }

      closeCouponModal();
      await fetchCoupons();
    } catch (e) {
      handleApiError(e, "Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };

  const onToggleEnabled = async (coupon: BookingCoupon) => {
    try {
      setTogglingCode(coupon.code);
      setError(null);
      setSuccess(null);
      await bookingCouponsAPI.setEnabled(coupon.code, !coupon.enabled);
      setSuccess(`Coupon ${coupon.code} ${coupon.enabled ? "disabled" : "enabled"}.`);
      await fetchCoupons();
    } catch (e) {
      handleApiError(e, "Failed to update coupon status");
    } finally {
      setTogglingCode(null);
    }
  };

  const onConfirmDelete = async () => {
    if (!couponToDelete) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await bookingCouponsAPI.delete(couponToDelete.code);
      setSuccess(`Coupon ${couponToDelete.code} deleted.`);
      deleteModal.closeModal();
      setCouponToDelete(null);
      await fetchCoupons();
    } catch (e) {
      handleApiError(e, "Failed to delete coupon");
    } finally {
      setSaving(false);
    }
  };

  const enabledCount = coupons.filter((c) => c.enabled).length;
  const disabledCount = coupons.length - enabledCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Booking checkout
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Global session price, GST, and checkout coupons — changes apply live without restart.
          </p>
        </div>
        <Button onClick={openCreateModal}>+ Create coupon</Button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/30">
          <p className="text-sm text-red-800 dark:text-red-200 whitespace-pre-line">{error}</p>
          <button
            onClick={() => setError(null)}
            className="shrink-0 text-red-500 hover:text-red-700 text-lg leading-none"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}
      {success && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900/40 dark:bg-green-950/30">
          <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
          <button
            onClick={() => setSuccess(null)}
            className="shrink-0 text-green-500 hover:text-green-700 text-lg leading-none"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total coupons</p>
          <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
            {loading ? "—" : coupons.length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Enabled in checkout</p>
          <p className="mt-1 text-3xl font-bold text-green-600 dark:text-green-400">
            {loading ? "—" : enabledCount}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Disabled</p>
          <p className="mt-1 text-3xl font-bold text-gray-400 dark:text-gray-500">
            {loading ? "—" : disabledCount}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          Filters & preview settings
        </h2>
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Preview state
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            >
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2.5 pb-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeDisabled}
              onChange={(e) => setIncludeDisabled(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Show disabled in list
            </span>
          </label>
          <button
            onClick={() => void fetchCoupons()}
            disabled={loading}
            className="ml-auto rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <BookingPricingSection state={state} onUpdated={() => void fetchCoupons()} />

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Coupons table */}
        <div className="xl:col-span-2 rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
          <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">All coupons</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Toggle visibility in checkout or edit details
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            </div>
          ) : coupons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                <span className="text-2xl">🏷️</span>
              </div>
              <p className="font-medium text-gray-900 dark:text-white">No coupons yet</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                Create your first checkout coupon to offer discounts on astrologer sessions.
              </p>
              <Button className="mt-4" onClick={openCreateModal}>
                Create coupon
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className={thClass}>Coupon</th>
                    <th className={thClass}>Discount</th>
                    <th className={thClass}>Description</th>
                    <th className={thClass}>Active</th>
                    <th className={`${thClass} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {coupons.map((coupon) => (
                    <tr
                      key={coupon.code}
                      className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30 ${
                        !coupon.enabled ? "opacity-60" : ""
                      }`}
                    >
                      <td className={tdClass}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-gray-900 dark:text-white">
                            {coupon.code}
                          </span>
                          {!coupon.enabled && (
                            <Badge color="dark" size="sm">
                              Off
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          {coupon.label}
                        </p>
                      </td>
                      <td className={tdClass}>
                        <span className="inline-flex items-center rounded-full bg-brand-500/10 px-2.5 py-0.5 text-sm font-semibold text-brand-600 dark:text-brand-400">
                          {coupon.percent}%
                        </span>
                      </td>
                      <td className={`${tdClass} max-w-[200px]`}>
                        <p className="line-clamp-2 text-gray-600 dark:text-gray-400">
                          {coupon.description}
                        </p>
                      </td>
                      <td className={tdClass}>
                        <EnableToggle
                          enabled={coupon.enabled}
                          disabled={togglingCode === coupon.code}
                          onChange={() => void onToggleEnabled(coupon)}
                        />
                      </td>
                      <td className={`${tdClass} text-right`}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(coupon)}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setCouponToDelete(coupon);
                              deleteModal.openModal();
                            }}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Checkout preview sidebar */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Checkout preview
            </h2>
            {preview ? (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {preview.state} · Base{" "}
                {formatCurrency(preview.basePrice, preview.currency)} · GST{" "}
                {preview.gstRate}%
              </p>
            ) : (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Enabled coupons with pricing breakdown
              </p>
            )}
          </div>

          <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
            {loading ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                Loading preview…
              </p>
            ) : !preview || preview.coupons.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                No enabled coupons to preview. Enable a coupon or create one.
              </p>
            ) : (
              preview.coupons.map((item) => (
                <PreviewCard key={item.code} item={item} preview={preview} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create / Edit modal */}
      <Modal isOpen={couponModal.isOpen} onClose={closeCouponModal} className="max-w-lg">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editingCoupon ? `Edit ${editingCoupon.code}` : "Create coupon"}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {editingCoupon
              ? "Update label, discount, or visibility."
              : "Codes are stored uppercase and shown in the checkout picker."}
          </p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <Label>Code</Label>
                <Input
                  value={form.code}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      code: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="SAVE25"
                  disabled={!!editingCoupon}
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label>Discount %</Label>
                <Input
                  type="number"
                  value={String(form.percent)}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      percent: Number(e.target.value),
                    }))
                  }
                  min="0"
                  max="100"
                />
              </div>
            </div>
            <div>
              <Label>Display label</Label>
              <Input
                value={form.label}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, label: e.target.value }))
                }
                placeholder="25% Off"
              />
            </div>
            <div>
              <Label>Description</Label>
              <TextArea
                value={form.description}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, description: value }))
                }
                placeholder="Shown in checkout picker"
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Visible in checkout
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Disabled coupons are hidden from users
                </p>
              </div>
              <EnableToggle
                enabled={form.enabled}
                onChange={() =>
                  setForm((prev) => ({ ...prev, enabled: !prev.enabled }))
                }
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={closeCouponModal}>
              Cancel
            </Button>
            <Button onClick={() => void onSaveCoupon()} disabled={saving}>
              {saving ? "Saving…" : editingCoupon ? "Save changes" : "Create coupon"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => {
          deleteModal.closeModal();
          setCouponToDelete(null);
        }}
        className="max-w-md"
      >
        <div className="p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <span className="text-xl">🗑️</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Delete coupon?
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-mono font-semibold text-gray-900 dark:text-white">
              {couponToDelete?.code}
            </span>{" "}
            will be permanently removed. This cannot be undone.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                deleteModal.closeModal();
                setCouponToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void onConfirmDelete()}
              disabled={saving}
              className="!bg-red-600 hover:!bg-red-700"
            >
              {saving ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
