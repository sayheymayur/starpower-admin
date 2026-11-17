import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dashboardAPI from "../services/dashboardAPI";
import { formatLocalDate } from "../utils/dateUtils";
import Badge from "../components/ui/badge";

interface PendingListener {
  userId: number;
  fullName: string;
  username: string | null;
  email: string | null;
  mobileNumber: string;
  gender: string | null;
  dateOfBirth: string | null;
  bio: string | null;
  profilePhoto: string | null;
  createdAt: string;
  doctorProfileStatus: number | null;
  userStatus: number;
  pricing: {
    perMinuteCost: number | null;
    chatPerMinuteCost: number | null;
    commissionPer: number | null;
    chatCommissionPer: number | null;
  };
  documents: {
    assessmentCertificate: string | null;
    qualificationProof: string | null;
    panNo: string | null;
  };
  preferences: {
    preferredLanguage: string | null;
    topicIds: string | null;
  };
  location: {
    stateId: number | null;
    stateName: string | null;
    latitude: string | null;
    longitude: string | null;
  };
  rejectedRemark: string | null;
  kycStatus: number | null;
  appPlatform: string | null;
}

export default function ListenerApprovalStatus() {
  const navigate = useNavigate();
  const [listeners, setListeners] = useState<PendingListener[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchPendingListeners = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await dashboardAPI.getPendingListeners({
        page: currentPage,
        limit: pageSize,
        search: searchTerm.trim() || undefined,
      });

      if (response.success) {
        setListeners(response.data || []);
        setTotalItems(response.pagination?.total || 0);
        setTotalPages(response.pagination?.totalPages || 0);
      } else {
        throw new Error(response.message || "Failed to fetch pending listeners");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setListeners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      fetchPendingListeners();
    }, 400);

    return () => window.clearTimeout(handler);
  }, [currentPage, pageSize, searchTerm]);

  const handleApprove = async (userId: number) => {
    if (!confirm(`Are you sure you want to approve listener ${userId}?`)) {
      return;
    }

    try {
      setUpdatingStatus(userId);
      const response = await dashboardAPI.updateListenerStatus(userId, {
        doctorProfileStatus: 1,
      });

      if (response.success) {
        alert("Listener approved successfully!");
        fetchPendingListeners();
      } else {
        throw new Error(response.message || "Failed to approve listener");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to approve listener");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleReject = async (userId: number) => {
    if (!rejectReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    try {
      setUpdatingStatus(userId);
      const response = await dashboardAPI.updateListenerStatus(userId, {
        doctorProfileStatus: 2,
        rejectedRemark: rejectReason,
      });

      if (response.success) {
        alert("Listener rejected successfully!");
        setShowRejectModal(null);
        setRejectReason("");
        fetchPendingListeners();
      } else {
        throw new Error(response.message || "Failed to reject listener");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reject listener");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getDefaultProfilePhoto = () => {
    return "/images/user/user-01.jpg";
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="p-4 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Listener Approval Status
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Review and approve pending listener applications
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="entries" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Entries per page
            </label>
            <select
              id="entries"
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
          <div className="relative md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name, email, mobile, or username..."
              className="w-full rounded-lg bg-gray-50 dark:bg-gray-700 py-2 pl-10 pr-4 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 dark:border-gray-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="absolute left-3 top-9 h-5 w-5 text-gray-400 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z" />
            </svg>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading listeners...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error loading listeners
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</div>
                <div className="mt-4">
                  <button
                    onClick={fetchPendingListeners}
                    className="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-3 py-2 rounded text-sm hover:bg-red-200 dark:hover:bg-red-700"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-6">
            {listeners.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No pending listeners found.</p>
              </div>
            ) : (
              listeners.map((listener) => (
                <div
                  key={listener.userId}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-700/50"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Side - Profile Info */}
                    <div className="flex-shrink-0">
                      <div className="flex items-start gap-4">
                        <img
                          src={listener.profilePhoto || getDefaultProfilePhoto()}
                          alt={listener.fullName}
                          className="h-20 w-20 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                          onError={(e) => {
                            e.currentTarget.src = getDefaultProfilePhoto();
                          }}
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {listener.fullName}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            @{listener.username || "N/A"}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            User ID: {listener.userId}
                          </p>
                          <div className="mt-2 flex gap-2">
                            <Badge color={listener.userStatus === 1 ? "success" : "danger"}>
                              {listener.userStatus === 1 ? "Active" : "Inactive"}
                            </Badge>
                            <Badge color="warning">Pending Approval</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Middle - Details */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Contact Information
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="text-gray-500 dark:text-gray-400">Mobile:</span>{" "}
                            <span className="text-gray-900 dark:text-white">
                              {listener.mobileNumber}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-500 dark:text-gray-400">Email:</span>{" "}
                            <span className="text-gray-900 dark:text-white">
                              {listener.email || "N/A"}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-500 dark:text-gray-400">Gender:</span>{" "}
                            <span className="text-gray-900 dark:text-white">
                              {listener.gender || "N/A"}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-500 dark:text-gray-400">DOB:</span>{" "}
                            <span className="text-gray-900 dark:text-white">
                              {listener.dateOfBirth
                                ? formatLocalDate(listener.dateOfBirth)
                                : "N/A"}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Location
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="text-gray-500 dark:text-gray-400">State:</span>{" "}
                            <span className="text-gray-900 dark:text-white">
                              {listener.location.stateName || "N/A"}
                            </span>
                          </p>
                          {listener.location.latitude && listener.location.longitude && (
                            <p>
                              <span className="text-gray-500 dark:text-gray-400">Coordinates:</span>{" "}
                              <span className="text-gray-900 dark:text-white">
                                {listener.location.latitude}, {listener.location.longitude}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Pricing
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="text-gray-500 dark:text-gray-400">
                              Call Rate:
                            </span>{" "}
                            <span className="text-gray-900 dark:text-white">
                              ₹{listener.pricing.perMinuteCost || "N/A"}/min
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-500 dark:text-gray-400">
                              Chat Rate:
                            </span>{" "}
                            <span className="text-gray-900 dark:text-white">
                              ₹{listener.pricing.chatPerMinuteCost || "N/A"}/min
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-500 dark:text-gray-400">
                              Call Commission:
                            </span>{" "}
                            <span className="text-gray-900 dark:text-white">
                              {listener.pricing.commissionPer || "N/A"}%
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-500 dark:text-gray-400">
                              Chat Commission:
                            </span>{" "}
                            <span className="text-gray-900 dark:text-white">
                              {listener.pricing.chatCommissionPer || "N/A"}%
                            </span>
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Documents
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="text-gray-500 dark:text-gray-400">PAN:</span>{" "}
                            <span className="text-gray-900 dark:text-white">
                              {listener.documents.panNo || "N/A"}
                            </span>
                          </p>
                          {listener.documents.assessmentCertificate && (
                            <p>
                              <span className="text-gray-500 dark:text-gray-400">
                                Assessment:
                              </span>{" "}
                              <a
                                href={listener.documents.assessmentCertificate}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                View Certificate
                              </a>
                            </p>
                          )}
                          {listener.documents.qualificationProof && (
                            <p>
                              <span className="text-gray-500 dark:text-gray-400">
                                Qualification:
                              </span>{" "}
                              <a
                                href={listener.documents.qualificationProof}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                View Proof
                              </a>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Actions */}
                    <div className="flex-shrink-0 flex flex-col gap-2">
                      <button
                        onClick={() => navigate(`/enhanced-user-details?userId=${listener.userId}`)}
                        className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/30"
                      >
                        View Full Details
                      </button>
                      <button
                        onClick={() => handleApprove(listener.userId)}
                        disabled={updatingStatus === listener.userId}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingStatus === listener.userId ? "Approving..." : "Approve"}
                      </button>
                      <button
                        onClick={() => setShowRejectModal(listener.userId)}
                        disabled={updatingStatus === listener.userId}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Reject
                      </button>
                      {listener.bio && (
                        <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Bio:</p>
                          <p className="text-sm text-gray-900 dark:text-white">{listener.bio}</p>
                        </div>
                      )}
                      {listener.rejectedRemark && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                          <p className="text-xs text-red-600 dark:text-red-400 mb-1">
                            Previous Rejection:
                          </p>
                          <p className="text-sm text-red-800 dark:text-red-200">
                            {listener.rejectedRemark}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {!loading && !error && totalPages > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {totalItems > 0 ? (
                <>
                  Showing {(currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
                </>
              ) : (
                <>No results</>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Previous
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (pageNum > totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === pageNum
                        ? "text-blue-600 bg-blue-50 border border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700"
                        : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Reject Listener
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Please provide a reason for rejecting this listener application.
              </p>
              <textarea
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 mb-4"
                rows={4}
                placeholder="Enter rejection reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(null);
                    setRejectReason("");
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(showRejectModal)}
                  disabled={updatingStatus === showRejectModal}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {updatingStatus === showRejectModal ? "Rejecting..." : "Confirm Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


