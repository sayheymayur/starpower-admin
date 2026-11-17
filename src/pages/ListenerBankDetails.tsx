import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";

import Badge from "../components/ui/badge";
import { dashboardAPI } from "../services/dashboardAPI";
import { formatLocalDate } from "../utils/dateUtils";
import { buildImageUrl } from "../utils/imageUtils";

interface ListenerProfile {
  user_id_pk: number;
  full_name: string | null;
  mobile_no: string | null;
  email_id: string | null;
  profile_photo: string | null;
  state?: {
    state_name: string;
  } | null;
  gender?: string | null;
  dob?: string | null;
  kyc_status?: number | null;
}

interface ListenerBankAccount {
  doctorBankId?: number;
  listenerId: number;
  fullName: string | null;
  accountNumber: string | null;
  maskedAccountNumber: string | null;
  ifscCode: string | null;
  micr: string | null;
  aadhaarFront: string | null;
  aadhaarBack: string | null;
  status: number | null;
  createdAt: string;
  createdBy: number | null;
  updatedAt?: string | null;
  listener?: {
    listenerId: number;
    name: string;
    phoneNumber: string;
    state?: string | null;
  };
}

type BankFormState = {
  fullName: string;
  accountNo: string;
  ifscCode: string;
  micr: string;
  aadhaarFront: string;
  aadhaarBack: string;
  status: string;
  createdBy: string;
};

const initialForm: BankFormState = {
  fullName: "",
  accountNo: "",
  ifscCode: "",
  micr: "",
  aadhaarFront: "",
  aadhaarBack: "",
  status: "1",
  createdBy: "",
};

const statusOptions = [
  { value: "1", label: "Active" },
  { value: "2", label: "Pending" },
  { value: "0", label: "Inactive" },
  { value: "3", label: "Rejected" },
];

const badgeColorMap: Record<number, "success" | "warning" | "dark" | "info"> = {
  0: "dark",
  1: "success",
  2: "warning",
  3: "info",
};

const statusLabelMap: Record<number, string> = {
  0: "Inactive",
  1: "Active",
  2: "Pending",
  3: "Rejected",
};

export default function ListenerBankDetails() {
  const navigate = useNavigate();
  const { listenerId } = useParams<{ listenerId: string }>();
  const numericListenerId = Number(listenerId);

  const [listener, setListener] = useState<ListenerProfile | null>(null);
  const [bankAccount, setBankAccount] = useState<ListenerBankAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<BankFormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isExistingRecord = useMemo(() => bankAccount !== null && bankAccount.accountNumber !== null, [bankAccount]);

  useEffect(() => {
    if (!listenerId || Number.isNaN(numericListenerId)) {
      setError("Invalid listener ID");
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [listenerRes, bankRes] = await Promise.all([
          dashboardAPI.getEnhancedListenerDetails(numericListenerId),
          dashboardAPI.getListenerBankByListener(numericListenerId).catch((err) => err),
        ]);

        if (listenerRes.success && listenerRes.data) {
          setListener(listenerRes.data as ListenerProfile);
        } else {
          throw new Error(listenerRes.message || "Unable to fetch listener details");
        }

        if (bankRes && bankRes.success && bankRes.data) {
          const bankData = bankRes.data as ListenerBankAccount;
          setBankAccount(bankData);
          setForm({
            fullName: bankData.fullName ?? "",
            accountNo: bankData.accountNumber ?? "",
            ifscCode: bankData.ifscCode ?? "",
            micr: bankData.micr ?? "",
            aadhaarFront: bankData.aadhaarFront ?? "",
            aadhaarBack: bankData.aadhaarBack ?? "",
            status: bankData.status !== null && bankData.status !== undefined ? String(bankData.status) : "1",
            createdBy: bankData.createdBy !== null && bankData.createdBy !== undefined ? String(bankData.createdBy) : "",
          });
        } else {
          setBankAccount(null);
          setForm(initialForm);
        }
      } catch (err) {
        console.error("Error fetching listener bank detail:", err);
        setError(err instanceof Error ? err.message : "Unable to load bank details");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [listenerId, numericListenerId]);

  const handleFormChange = (field: keyof BankFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (Number.isNaN(numericListenerId)) {
      setError("Invalid listener ID");
      return;
    }

    if (!isExistingRecord && !form.createdBy.trim()) {
      setError("Admin ID (created by) is required to create a bank record");
      return;
    }

    try {
      setSaving(true);
      setSuccessMessage(null);
      setError(null);

      if (isExistingRecord) {
        const payload: {
          fullName?: string;
          accountNo?: string;
          ifscCode?: string;
          micr?: string;
          aadhaarFront?: string;
          aadhaarBack?: string;
          status?: number;
        } = {};

        payload.fullName = form.fullName || undefined;
        payload.accountNo = form.accountNo || undefined;
        payload.ifscCode = form.ifscCode || undefined;
        payload.micr = form.micr || undefined;
        payload.aadhaarFront = form.aadhaarFront || undefined;
        payload.aadhaarBack = form.aadhaarBack || undefined;
        payload.status = form.status ? Number(form.status) : undefined;

        if (Object.keys(payload).length === 0) {
          setError("Please provide at least one field to update.");
          setSaving(false);
          return;
        }

        const response = await dashboardAPI.updateListenerBank(numericListenerId, payload);
        if (!response.success) {
          throw new Error(response.message || "Failed to update bank details");
        }
      } else {
        const payload = {
          userId: numericListenerId,
          createdBy: Number(form.createdBy),
          fullName: form.fullName || undefined,
          accountNo: form.accountNo || undefined,
          ifscCode: form.ifscCode || undefined,
          micr: form.micr || undefined,
          aadhaarFront: form.aadhaarFront || undefined,
          aadhaarBack: form.aadhaarBack || undefined,
          status: form.status ? Number(form.status) : undefined,
        };

        const response = await dashboardAPI.createListenerBank(payload);
        if (!response.success) {
          throw new Error(response.message || "Failed to create bank details");
        }
      }

      setSuccessMessage(isExistingRecord ? "Bank details updated." : "Bank details created.");

      const refreshed = await dashboardAPI.getListenerBankByListener(numericListenerId);
      if (refreshed.success && refreshed.data) {
        const updated = refreshed.data as ListenerBankAccount;
        setBankAccount(updated);
        setForm((prev) => ({
          ...prev,
          status: updated.status !== null && updated.status !== undefined ? String(updated.status) : prev.status,
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save bank details");
    } finally {
      setSaving(false);
    }
  };

  const headerStatus = useMemo(() => {
    if (!bankAccount || bankAccount.status === null || bankAccount.status === undefined) {
      return null;
    }
    return {
      label: statusLabelMap[bankAccount.status] ?? "Unknown",
      color: badgeColorMap[bankAccount.status] ?? "info",
    };
  }, [bankAccount]);

  if (loading) {
    return (
      <div className="flex h-full min-h-[60vh] flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">Loading listener bank details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Listener Bank Details</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage payout information for listener ID {listenerId}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Back
          </button>
          {headerStatus && (
            <Badge size="sm" color={headerStatus.color}>
              {headerStatus.label}
            </Badge>
          )}
        </div>
      </div>

      {listener && (
        <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Listener profile</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <span className="block text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Name</span>
              <span className="font-medium text-gray-900 dark:text-white">{listener.full_name || "—"}</span>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Phone</span>
              <span>{listener.mobile_no || "—"}</span>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Email</span>
              <span>{listener.email_id || "—"}</span>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">State</span>
              <span>{listener.state?.state_name || "—"}</span>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Gender</span>
              <span>{listener.gender || "—"}</span>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Date of birth</span>
              <span>{listener.dob ? formatLocalDate(listener.dob) : "—"}</span>
            </div>
          </div>
        </div>
      )}

      {/* Aadhaar Documents Preview */}
      {bankAccount && (bankAccount.aadhaarFront || bankAccount.aadhaarBack) && (
        <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Aadhaar Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bankAccount.aadhaarFront && (() => {
              const imageUrl = buildImageUrl(bankAccount.aadhaarFront, bankAccount.listenerId);
              return imageUrl ? (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Aadhaar Front</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <img
                      src={imageUrl}
                      alt="Aadhaar Front"
                      className="w-full h-auto rounded-lg border border-gray-200 dark:border-gray-600 max-h-[400px] object-contain cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(imageUrl, '_blank')}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                      }}
                    />
                    <a
                      href={imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open in New Tab
                    </a>
                  </div>
                </div>
              ) : null;
            })()}
            {bankAccount.aadhaarBack && (() => {
              const imageUrl = buildImageUrl(bankAccount.aadhaarBack, bankAccount.listenerId);
              return imageUrl ? (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Aadhaar Back</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <img
                      src={imageUrl}
                      alt="Aadhaar Back"
                      className="w-full h-auto rounded-lg border border-gray-200 dark:border-gray-600 max-h-[400px] object-contain cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(imageUrl, '_blank')}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                      }}
                    />
                    <a
                      href={imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open in New Tab
                    </a>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Bank account</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {bankAccount ? "Update payout account information." : "No bank record found. Create one below."}
            </p>
          </div>
          {bankAccount?.accountNumber && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Account ID: {bankAccount.doctorBankId ?? "—"}
            </div>
          )}
        </div>

        {successMessage && (
          <div className="mb-4 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-900 dark:bg-green-900/20 dark:text-green-200">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account holder name</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => handleFormChange("fullName", e.target.value)}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account number</label>
              <input
                type="text"
                value={form.accountNo}
                onChange={(e) => handleFormChange("accountNo", e.target.value)}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IFSC code</label>
              <input
                type="text"
                value={form.ifscCode}
                onChange={(e) => handleFormChange("ifscCode", e.target.value.toUpperCase())}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm uppercase text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">MICR</label>
              <input
                type="text"
                value={form.micr}
                onChange={(e) => handleFormChange("micr", e.target.value)}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aadhaar front key</label>
              <input
                type="text"
                value={form.aadhaarFront}
                onChange={(e) => handleFormChange("aadhaarFront", e.target.value)}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aadhaar back key</label>
              <input
                type="text"
                value={form.aadhaarBack}
                onChange={(e) => handleFormChange("aadhaarBack", e.target.value)}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => handleFormChange("status", e.target.value)}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {!isExistingRecord && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Created by (Admin ID) *</label>
                <input
                  type="number"
                  value={form.createdBy}
                  onChange={(e) => handleFormChange("createdBy", e.target.value)}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {bankAccount?.createdAt && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Created: {formatLocalDate(bankAccount.createdAt)}{bankAccount.createdBy ? ` • Admin ID ${bankAccount.createdBy}` : ""}
              </p>
            )}
            {bankAccount?.updatedAt && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Last updated: {formatLocalDate(bankAccount.updatedAt)}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : isExistingRecord ? "Save changes" : "Create record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

