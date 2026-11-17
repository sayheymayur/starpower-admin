import { useEffect, useMemo, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import Badge from "../components/ui/badge";
import { Modal } from "../components/ui/modal";
import dashboardAPI from "../services/dashboardAPI";
import { buildImageUrl } from "../utils/imageUtils";
import { formatLocalDate } from "../utils/dateUtils";

interface Transaction {
  transactionId: number;
  amount: number;
  orderId: string;
  paymentId: string;
  paymentDateTime: string;
  creditedToWallet: boolean;
  gstAmount: number;
  paymentStatus: number;
  isCredit: boolean;
  remark: string | null;
  createdDateTime: string;
  createdBy: number;
  stateId: number | null;
}

interface ListenerPayoutRow {
  listenerId: number;
  fullName: string;
  username: string;
  mobileNo: string;
  email: string | null;
  state: string | null;
  doctorProfileStatus: number;
  balance: number; // This is the wallet balance (payout amount) - Total from transactions after 2025-10-18 with credited_to_wallet = 0
  balanceLastUpdated: string;
}

interface BankDetails {
  doctorBankId: number;
  fullName: string;
  accountNo: string;
  ifscCode: string;
  micr: string;
  aadhaarFront: string;
  aadhaarBack: string;
  status: number;
  createdDateTime: string;
}

interface ListenerBalanceDetail extends ListenerPayoutRow {
  walletCreated: string;
  transactions: Transaction[];
  transactionCount: number;
  bankDetails?: BankDetails | null;
}

interface ListenerBalancesResponse {
  success: boolean;
  data: ListenerPayoutRow[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters?: {
    search: string | null;
    state: string | null;
    minBalance: number | null;
    maxBalance: number | null;
  };
  message?: string;
}

interface ListenerBalanceDetailResponse {
  success: boolean;
  data: ListenerBalanceDetail;
  message?: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);

const formatDateTime = (dateString: string) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function ListenerPayoutSummary() {
  const [listeners, setListeners] = useState<ListenerPayoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
  const [totalListeners, setTotalListeners] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState] = useState("");

  const [selectedListener, setSelectedListener] = useState<ListenerPayoutRow | null>(
    null,
  );
  const [listenerDetail, setListenerDetail] = useState<ListenerBalanceDetail | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    payoutByAdminId: "",
    createdBy: "",
    paymentId: "",
    remark: "",
    payoutDateTime: new Date().toISOString().slice(0, 16),
  });
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);
  const [payoutError, setPayoutError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchListenerBalances = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = (await dashboardAPI.getListenerBalances({
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        state: selectedState || undefined,
      })) as ListenerBalancesResponse;

      if (response.success) {
        setListeners(Array.isArray(response.data) ? response.data : []);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalListeners(response.pagination.total);
        }
      } else {
        throw new Error(response.message || "Failed to fetch listener balances");
      }
    } catch (err) {
      setListeners([]);
      setError(err instanceof Error ? err.message : "Unable to load listener balances");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListenerBalances();
  }, [currentPage, pageSize, searchTerm, selectedState]);

  const totals = useMemo(() => {
    if (!listeners.length) {
      return null;
    }
    return listeners.reduce(
      (acc, row) => {
        acc.totalBalance += row.balance;
        return acc;
      },
      { totalBalance: 0 },
    );
  }, [listeners]);

  const openModal = (listener: ListenerPayoutRow) => {
    setSelectedListener(listener);
    setPayoutForm((prev) => ({
      ...prev,
      payoutDateTime: new Date().toISOString().slice(0, 16),
    }));
    setPayoutError(null);
    setSuccessMessage(null);
    setModalOpen(true);
  };

  const fetchListenerDetail = async (listenerId: number) => {
    try {
      setLoadingDetail(true);
      setError(null);
      const response = (await dashboardAPI.getListenerBalanceById(listenerId)) as ListenerBalanceDetailResponse;

      if (response.success) {
        setListenerDetail(response.data);
        setDetailModalOpen(true);
      } else {
        throw new Error(response.message || "Failed to fetch listener details");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load listener details");
    } finally {
      setLoadingDetail(false);
    }
  };

  const openDetailModal = (listener: ListenerPayoutRow) => {
    fetchListenerDetail(listener.listenerId);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setListenerDetail(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedListener(null);
    setPayoutError(null);
  };

  const handlePayoutChange = (field: keyof typeof payoutForm, value: string) => {
    setPayoutForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePayoutSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedListener) {
      setPayoutError("No listener selected");
      return;
    }

    if (!payoutForm.payoutByAdminId.trim() || !payoutForm.createdBy.trim()) {
      setPayoutError("Administrator IDs are required");
      return;
    }

    try {
      setPayoutSubmitting(true);
      setPayoutError(null);

      const payload = {
        userId: selectedListener.listenerId,
        totalAmount: selectedListener.balance, // Use balance as payout amount
        payoutByAdminId: Number(payoutForm.payoutByAdminId),
        createdBy: Number(payoutForm.createdBy),
        payoutDateTime: payoutForm.payoutDateTime
          ? new Date(payoutForm.payoutDateTime).toISOString()
          : undefined,
        paymentId: payoutForm.paymentId || undefined,
        remark: payoutForm.remark || undefined,
      };

      const response = await dashboardAPI.createPayout(payload);
      if (!response.success) {
        throw new Error(response.message || "Failed to mark payout as paid");
      }

      setSuccessMessage("Payout recorded successfully.");
      closeModal();
      fetchListenerBalances();
    } catch (err) {
      setPayoutError(err instanceof Error ? err.message : "Unable to save payout record.");
    } finally {
      setPayoutSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Listener Payout Summary</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Current wallet balances (payout amounts) for all listeners.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search listeners..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-white"
          />
          <button
            onClick={fetchListenerBalances}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Refresh
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-900/20 dark:text-green-200">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      {totals && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Balance</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {formatCurrency(totals.totalBalance)}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Listeners</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalListeners}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Showing</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{listeners.length} listeners</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">Loading listener balances...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-100 dark:bg-gray-700">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Listener
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Contact
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  State
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Profile Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Balance (Payout Amount)
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Last Updated
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
              {listeners.length === 0 ? (
                <TableRow>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    No listeners found.
                  </td>
                </TableRow>
              ) : (
                listeners.map((row) => (
                  <TableRow key={row.listenerId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <TableCell className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      <div className="font-medium">{row.fullName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">@{row.username} • ID: {row.listenerId}</div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      <div>{row.mobileNo || "—"}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{row.email || "No email"}</div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {row.state || "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      <Badge size="sm" color={row.doctorProfileStatus === 1 ? "success" : "warning"}>
                        {row.doctorProfileStatus === 1 ? "Active" : `Status ${row.doctorProfileStatus}`}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(row.balance)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      <div className="text-xs">{formatDateTime(row.balanceLastUpdated)}</div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-blue-600">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openDetailModal(row)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => openModal(row)}
                          disabled={row.balance === 0}
                          className={`text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 ${
                            row.balance === 0 ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          Mark as paid
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between px-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages} • {totalListeners} total listeners
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-xl w-full p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Confirm payout
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Record a payout for {selectedListener?.fullName} using their wallet balance as the payout amount.
        </p>

        {payoutError && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
            {payoutError}
          </div>
        )}

        <form onSubmit={handlePayoutSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payout amount (Balance)</label>
              <input
                type="text"
                value={selectedListener ? formatCurrency(selectedListener.balance) : "—"}
                disabled
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700/60 py-2 px-3 text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payout date & time</label>
              <input
                type="datetime-local"
                value={payoutForm.payoutDateTime}
                onChange={(e) => handlePayoutChange("payoutDateTime", e.target.value)}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payout admin ID *</label>
              <input
                type="number"
                value={payoutForm.payoutByAdminId}
                onChange={(e) => handlePayoutChange("payoutByAdminId", e.target.value)}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Created by (Admin ID) *</label>
              <input
                type="number"
                value={payoutForm.createdBy}
                onChange={(e) => handlePayoutChange("createdBy", e.target.value)}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment ID</label>
              <input
                type="text"
                value={payoutForm.paymentId}
                onChange={(e) => handlePayoutChange("paymentId", e.target.value)}
                placeholder="Optional payment reference"
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remark</label>
              <input
                type="text"
                value={payoutForm.remark}
                onChange={(e) => handlePayoutChange("remark", e.target.value)}
                placeholder="Notes or payment channel"
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={payoutSubmitting}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {payoutSubmitting ? "Saving..." : "Confirm payout"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Listener Detail Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={closeDetailModal} className="max-w-4xl w-full max-h-[90vh] flex flex-col m-4 overflow-hidden">
        {loadingDetail ? (
          <div className="flex items-center justify-center py-12 p-6">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">Loading details...</span>
          </div>
        ) : listenerDetail ? (
          <div className="flex flex-col h-full max-h-[90vh] overflow-hidden">
            {/* Fixed Header */}
            <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Listener Details: {listenerDetail.fullName}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Balance and transaction details
              </p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
              {/* Listener Information */}
              <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Listener ID</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{listenerDetail.listenerId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Username</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">@{listenerDetail.username}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Mobile</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{listenerDetail.mobileNo}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{listenerDetail.email || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">State</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{listenerDetail.state || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Profile Status</p>
                  <Badge size="sm" color={listenerDetail.doctorProfileStatus === 1 ? "success" : "warning"}>
                    {listenerDetail.doctorProfileStatus === 1 ? "Active" : `Status ${listenerDetail.doctorProfileStatus}`}
                  </Badge>
                </div>
              </div>

              {/* Balance Information */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Current Balance</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(listenerDetail.balance)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Updated: {formatDateTime(listenerDetail.balanceLastUpdated)}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Wallet Created</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDateTime(listenerDetail.walletCreated)}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Transaction Count</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {listenerDetail.transactionCount}
                  </p>
                </div>
              </div>

              {/* Bank Details */}
              {listenerDetail.bankDetails && (
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white">Bank Account Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Account Holder Name</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{listenerDetail.bankDetails.fullName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Account Number</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">{listenerDetail.bankDetails.accountNo || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">IFSC Code</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">{listenerDetail.bankDetails.ifscCode || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">MICR</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">{listenerDetail.bankDetails.micr || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Bank Account Status</p>
                      <Badge size="sm" color={listenerDetail.bankDetails.status === 1 ? "success" : listenerDetail.bankDetails.status === 2 ? "warning" : listenerDetail.bankDetails.status === 3 ? "info" : "dark"}>
                        {listenerDetail.bankDetails.status === 1 ? "Active" : listenerDetail.bankDetails.status === 2 ? "Pending" : listenerDetail.bankDetails.status === 3 ? "Rejected" : "Inactive"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Created Date</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatLocalDate(listenerDetail.bankDetails.createdDateTime)}
                      </p>
                    </div>
                  </div>

                  {/* Aadhaar Documents */}
                  {(listenerDetail.bankDetails.aadhaarFront || listenerDetail.bankDetails.aadhaarBack) && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Aadhaar Documents</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {listenerDetail.bankDetails.aadhaarFront && (() => {
                          const imageUrl = buildImageUrl(listenerDetail.bankDetails.aadhaarFront, listenerDetail.listenerId);
                          return imageUrl ? (
                            <div>
                              <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Aadhaar Front</h5>
                              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                <img
                                  src={imageUrl}
                                  alt="Aadhaar Front"
                                  className="w-full h-auto rounded-lg border border-gray-200 dark:border-gray-600 max-h-[300px] object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(imageUrl, '_blank')}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
                                  }}
                                />
                                <a
                                  href={imageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                  Open
                                </a>
                              </div>
                            </div>
                          ) : null;
                        })()}
                        {listenerDetail.bankDetails.aadhaarBack && (() => {
                          const imageUrl = buildImageUrl(listenerDetail.bankDetails.aadhaarBack, listenerDetail.listenerId);
                          return imageUrl ? (
                            <div>
                              <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Aadhaar Back</h5>
                              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                <img
                                  src={imageUrl}
                                  alt="Aadhaar Back"
                                  className="w-full h-auto rounded-lg border border-gray-200 dark:border-gray-600 max-h-[300px] object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(imageUrl, '_blank')}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
                                  }}
                                />
                                <a
                                  href={imageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                  Open
                                </a>
                              </div>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!listenerDetail.bankDetails && (
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">No bank details available</p>
                </div>
              )}

              {/* Transactions Table */}
              {listenerDetail.transactions && listenerDetail.transactions.length > 0 ? (
                <div className="flex flex-col min-h-0">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex-shrink-0">
                    Transactions (creditedToWallet = false, after 2025-10-18)
                  </h3>
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-auto" style={{ maxHeight: '300px' }}>
                      <Table>
                      <TableHeader className="bg-gray-100 dark:bg-gray-700">
                        <TableRow>
                          <TableCell isHeader className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                            Transaction ID
                          </TableCell>
                          <TableCell isHeader className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                            Amount
                          </TableCell>
                          <TableCell isHeader className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                            Order ID
                          </TableCell>
                          <TableCell isHeader className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                            Payment ID
                          </TableCell>
                          <TableCell isHeader className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                            Payment Date
                          </TableCell>
                          <TableCell isHeader className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                            Status
                          </TableCell>
                          <TableCell isHeader className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                            Remark
                          </TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {listenerDetail.transactions.map((txn) => (
                          <TableRow key={txn.transactionId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <TableCell className="px-4 py-2 text-xs text-gray-900 dark:text-gray-100">
                              {txn.transactionId}
                            </TableCell>
                            <TableCell className="px-4 py-2 text-xs font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(txn.amount)}
                            </TableCell>
                            <TableCell className="px-4 py-2 text-xs text-gray-900 dark:text-gray-100">
                              {txn.orderId}
                            </TableCell>
                            <TableCell className="px-4 py-2 text-xs text-gray-900 dark:text-gray-100">
                              {txn.paymentId}
                            </TableCell>
                            <TableCell className="px-4 py-2 text-xs text-gray-900 dark:text-gray-100">
                              {formatDateTime(txn.paymentDateTime)}
                            </TableCell>
                            <TableCell className="px-4 py-2 text-xs">
                              <Badge size="sm" color={txn.paymentStatus === 1 ? "success" : "warning"}>
                                {txn.paymentStatus === 1 ? "Success" : `Status ${txn.paymentStatus}`}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-4 py-2 text-xs text-gray-900 dark:text-gray-100">
                              {txn.remark || "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">No transactions found</p>
                </div>
              )}
            </div>

            {/* Fixed Footer */}
            <div className="p-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2 flex-shrink-0">
              <button
                onClick={closeDetailModal}
                className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Close
              </button>
              {listenerDetail.balance > 0 && (
                <button
                  onClick={() => {
                    closeDetailModal();
                    const listenerRow = listeners.find(l => l.listenerId === listenerDetail.listenerId);
                    if (listenerRow) {
                      openModal(listenerRow);
                    }
                  }}
                  className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Mark as Paid
                </button>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

