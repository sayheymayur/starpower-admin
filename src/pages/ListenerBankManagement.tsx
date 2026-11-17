import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import Badge from "../components/ui/badge";
import { Modal } from "../components/ui/modal";
import { dashboardAPI } from "../services/dashboardAPI";
import { formatLocalDate } from "../utils/dateUtils";
import { buildImageUrl } from "../utils/imageUtils";

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
  listener?: {
    listenerId: number;
    name: string;
    phoneNumber: string;
    state?: string | null;
  };
}

type BankFormState = {
  listenerId: string;
  createdBy: string;
  fullName: string;
  accountNo: string;
  ifscCode: string;
  micr: string;
  aadhaarFront: string;
  aadhaarBack: string;
  status: string;
};

const defaultFormState: BankFormState = {
  listenerId: "",
  createdBy: "",
  fullName: "",
  accountNo: "",
  ifscCode: "",
  micr: "",
  aadhaarFront: "",
  aadhaarBack: "",
  status: "1",
};

const statusLabel: Record<number, string> = {
  0: "Inactive",
  1: "Active",
  2: "Pending",
  3: "Rejected",
};

const statusBadge: Record<number, "success" | "warning" | "info" | "dark"> = {
  0: "dark",
  1: "success",
  2: "warning",
  3: "info",
};

export default function ListenerBankManagement() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState<ListenerBankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const [isModalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<BankFormState>(defaultFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);

    return () => window.clearTimeout(handler);
  }, [search]);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await dashboardAPI.getListenerBanks({
        page,
        limit: pageSize,
        search: debouncedSearch || undefined,
        status: status ? Number(status) : undefined,
        state: stateFilter || undefined,
      });

      if (response.success) {
        const data = Array.isArray(response.data)
          ? (response.data as ListenerBankAccount[])
          : Array.isArray((response.data as any)?.data)
          ? ((response.data as any).data as ListenerBankAccount[])
          : [];

        setAccounts(data);

        const pagination = response.pagination || (response.data as any)?.pagination;
        if (pagination) {
          setTotalPages(pagination.totalPages ?? 0);
          setTotalItems(pagination.total ?? data.length);
        } else {
          setTotalPages(data.length > 0 ? 1 : 0);
          setTotalItems(data.length);
        }
      } else {
        throw new Error(response.message || "Failed to fetch bank details");
      }
    } catch (err) {
      console.error("Error fetching listener bank accounts:", err);
      setAccounts([]);
      setTotalPages(0);
      setTotalItems(0);
      setError(err instanceof Error ? err.message : "An error occurred while fetching bank accounts.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, status, stateFilter]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const resetForm = useCallback(() => {
    setForm(defaultFormState);
    setFormError(null);
  }, []);

  const openModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    resetForm();
    setFormSubmitting(false);
  };

  const handleFormChange = (field: keyof BankFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.listenerId.trim()) {
      setFormError("Listener ID is required");
      return;
    }

    if (!form.createdBy.trim()) {
      setFormError("Created by is required");
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError(null);

      const payload = {
        userId: Number(form.listenerId),
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

      closeModal();
      fetchAccounts();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to save bank details.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const statusOptions = useMemo(
    () => [
      { value: "", label: "All" },
      { value: "1", label: "Active" },
      { value: "2", label: "Pending" },
      { value: "0", label: "Inactive" },
      { value: "3", label: "Rejected" },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Listener Bank Details</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Search and manage payout information for registered listeners.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchAccounts}
            className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Refresh
          </button>
          <button
            onClick={openModal}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Add Bank Details
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, account, IFSC…"
            className="w-full rounded-lg bg-gray-50 dark:bg-gray-700 py-2 pl-10 pr-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 dark:border-gray-600"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z" />
          </svg>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
          <select
            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">State</label>
          <input
            type="text"
            value={stateFilter}
            onChange={(e) => {
              setStateFilter(e.target.value);
              setPage(1);
            }}
            placeholder="State name"
            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700 dark:text-gray-300">Show</label>
          <select
            className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-1 px-2 text-sm text-gray-900 dark:text-white"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-700 dark:text-gray-300">entries</span>
        </div>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading bank accounts…</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-100 dark:bg-gray-700">
              <TableRow>
                <TableCell isHeader className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Listener</TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Contact</TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Bank Account</TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">IFSC / MICR</TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Documents</TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Created</TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
              {accounts.length === 0 ? (
                <TableRow>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No bank accounts match the current filters.
                  </td>
                </TableRow>
              ) : (
                accounts.map((account) => (
                  <TableRow key={account.doctorBankId ?? `${account.listenerId}-${account.accountNumber}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <TableCell className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      <div className="font-medium">{account.listener?.name || account.fullName || "—"}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">ID: {account.listener?.listenerId ?? account.listenerId}</div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      <div>{account.listener?.phoneNumber || "—"}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{account.listener?.state || "State: N/A"}</div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      <div className="font-mono">{account.maskedAccountNumber || account.accountNumber || "—"}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Holder: {account.fullName || "—"}</div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      <div>{account.ifscCode || "—"}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">MICR: {account.micr || "N/A"}</div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      <div className="flex flex-wrap gap-3">
                        {account.aadhaarFront && (() => {
                          const imageUrl = buildImageUrl(account.aadhaarFront, account.listenerId);
                          return imageUrl ? (
                            <div className="relative group">
                              <img
                                src={imageUrl}
                                alt="Aadhaar Front"
                                className="w-20 h-20 object-cover rounded border border-gray-300 dark:border-gray-600 cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(imageUrl, '_blank')}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://via.placeholder.com/80x80?text=Image+Not+Available';
                                }}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded transition-all flex items-center justify-center">
                                <span className="text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 px-2 py-1 rounded">
                                  Aadhaar Front
                                </span>
                              </div>
                            </div>
                          ) : null;
                        })()}
                        {account.aadhaarBack && (() => {
                          const imageUrl = buildImageUrl(account.aadhaarBack, account.listenerId);
                          return imageUrl ? (
                            <div className="relative group">
                              <img
                                src={imageUrl}
                                alt="Aadhaar Back"
                                className="w-20 h-20 object-cover rounded border border-gray-300 dark:border-gray-600 cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(imageUrl, '_blank')}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://via.placeholder.com/80x80?text=Image+Not+Available';
                                }}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded transition-all flex items-center justify-center">
                                <span className="text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 px-2 py-1 rounded">
                                  Aadhaar Back
                                </span>
                              </div>
                            </div>
                          ) : null;
                        })()}
                        {!account.aadhaarFront && !account.aadhaarBack && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">No documents</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      <Badge size="sm" color={statusBadge[account.status ?? 1]}>
                        {statusLabel[account.status ?? 1] ?? "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {account.createdAt ? formatLocalDate(account.createdAt) : "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      <button
                        onClick={() => navigate(`/listener-banks/${account.listenerId}`)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-medium"
                      >
                        View details
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300">
          <div>
            Showing {accounts.length === 0 ? 0 : (page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalItems)} of {totalItems} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + index;
              if (pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    page === pageNum
                      ? "text-blue-600 bg-blue-50 border border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700"
                      : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-2xl w-full p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Add Bank Details
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Provide the listener ID and payout account details. You can update records later from the detail screen.
        </p>

        {formError && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
            {formError}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Listener ID *</label>
              <input
                type="number"
                value={form.listenerId}
                onChange={(e) => handleFormChange("listenerId", e.target.value)}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Created by (Admin ID) *</label>
              <input
                type="number"
                value={form.createdBy}
                onChange={(e) => handleFormChange("createdBy", e.target.value)}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account holder name</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => handleFormChange("fullName", e.target.value)}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account number</label>
              <input
                type="text"
                value={form.accountNo}
                onChange={(e) => handleFormChange("accountNo", e.target.value)}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IFSC code</label>
              <input
                type="text"
                value={form.ifscCode}
                onChange={(e) => handleFormChange("ifscCode", e.target.value.toUpperCase())}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white uppercase"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">MICR</label>
              <input
                type="text"
                value={form.micr}
                onChange={(e) => handleFormChange("micr", e.target.value)}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aadhaar front key</label>
              <input
                type="text"
                value={form.aadhaarFront}
                onChange={(e) => handleFormChange("aadhaarFront", e.target.value)}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aadhaar back key</label>
              <input
                type="text"
                value={form.aadhaarBack}
                onChange={(e) => handleFormChange("aadhaarBack", e.target.value)}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => handleFormChange("status", e.target.value)}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white"
              >
                {statusOptions
                  .filter((option) => option.value !== "")
                  .map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {formSubmitting ? "Saving..." : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

