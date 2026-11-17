import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dashboardAPI from "../services/dashboardAPI";
import { formatLocalDate } from "../utils/dateUtils";
import useGoBack from "../hooks/useGoBack";

interface DoctorStatus {
  statusId: number;
  userId: number;
  status: number;
  reason: string | null;
  createdDateTime: string;
  doctor: {
    userId: number;
    fullName: string | null;
    mobileNo: string;
    emailId: string | null;
    isDoctor: number;
  };
}

interface StatusStats {
  totalStatuses?: number;
  activeStatuses?: number;
  inactiveStatuses?: number;
  recentChanges?: number;
}

export default function DoctorStatusManagement() {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [statuses, setStatuses] = useState<DoctorStatus[]>([]);
  const [stats, setStats] = useState<StatusStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdDateTime");
  const [sortOrder, setSortOrder] = useState("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  // Bulk operations
  const [selectedStatuses, setSelectedStatuses] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState("");
  const [bulkReason, setBulkReason] = useState("");

  // Update form
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<DoctorStatus | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [updateReason, setUpdateReason] = useState("");

  useEffect(() => {
    fetchStatuses();
    fetchStats();
  }, [currentPage, pageSize, sortBy, sortOrder]);

  const fetchStatuses = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {
        page: currentPage,
        limit: pageSize,
        sortBy,
        sortOrder,
      };

      if (searchTerm) filters.search = searchTerm;
      if (statusFilter) filters.status = statusFilter;
      if (dateFilter) filters.date = dateFilter;

      // This would need to be implemented in dashboardAPI
      const response = await dashboardAPI.getDoctorAvailabilityStatuses(filters);

      if (response.success && response.data) {
        const statusesData = Array.isArray(response.data) ? response.data : [];
        setStatuses(statusesData as DoctorStatus[]);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalRecords(response.pagination.total);
        }
      } else {
        setStatuses([]);
        throw new Error(response.message || 'Failed to fetch statuses');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching statuses:', err);
      setStatuses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await dashboardAPI.getDoctorAvailabilityStats();

      if (response.success && response.data) {
        // Handle partial data or missing fields
        const statsData = response.data as Partial<StatusStats>;
        setStats({
          totalStatuses: statsData.totalStatuses ?? 0,
          activeStatuses: statsData.activeStatuses ?? 0,
          inactiveStatuses: statsData.inactiveStatuses ?? 0,
          recentChanges: statsData.recentChanges ?? 0,
        });
      } else {
        // Set default values if no data is available
        setStats({
          totalStatuses: 0,
          activeStatuses: 0,
          inactiveStatuses: 0,
          recentChanges: 0,
        });
      }
    } catch (err) {
      console.error('Error fetching status stats:', err);
      // Set default values on error
      setStats({
        totalStatuses: 0,
        activeStatuses: 0,
        inactiveStatuses: 0,
        recentChanges: 0,
      });
    }
  };

  const getStatusBadge = (status: number) => {
    return status === 1
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const getStatusText = (status: number) => {
    return status === 1 ? 'Available' : 'Unavailable';
  };

  const handleStatusUpdate = async (statusId: number, newStatus: number, reason: string) => {
    try {
      const response = await dashboardAPI.updateDoctorStatus(statusId, {
        status: newStatus,
        reason: reason || null,
      });

      if (response.success) {
        // Refresh the list
        fetchStatuses();
        setShowUpdateForm(false);
        setSelectedStatus(null);
        setNewStatus("");
        setUpdateReason("");
      } else {
        throw new Error(response.message || 'Failed to update status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error updating status:', err);
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedStatuses.length === 0 || !bulkAction) return;

    try {
      const response = await dashboardAPI.bulkUpdateDoctorStatuses({
        statusIds: selectedStatuses,
        status: bulkAction === 'activate' ? 1 : 0,
        reason: bulkReason || null,
      });

      if (response.success) {
        // Refresh the list
        fetchStatuses();
        setSelectedStatuses([]);
        setBulkAction("");
        setBulkReason("");
      } else {
        throw new Error(response.message || 'Failed to bulk update statuses');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error bulk updating statuses:', err);
    }
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchStatuses();
  };

  const toggleStatusSelection = (statusId: number) => {
    setSelectedStatuses(prev =>
      prev.includes(statusId)
        ? prev.filter(id => id !== statusId)
        : [...prev, statusId]
    );
  };

  const selectAllStatuses = () => {
    if (selectedStatuses.length === statuses.length) {
      setSelectedStatuses([]);
    } else {
      setSelectedStatuses(statuses.map(s => s.statusId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Doctor Status Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage doctor availability status and track changes
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={goBack}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium"
          >
            Back to Doctors
          </button>
          <button
            onClick={() => navigate('/doctor-availability')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
          >
            Availability Dashboard
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Status Records</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.totalStatuses?.toLocaleString() || 'N/A'}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Currently Available</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.activeStatuses?.toLocaleString() || 'N/A'}
            </p>
            {stats.activeStatuses !== undefined && stats.totalStatuses !== undefined && stats.totalStatuses > 0 && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                {((stats.activeStatuses / stats.totalStatuses) * 100).toFixed(1)}% of total
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Currently Unavailable</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {stats.inactiveStatuses?.toLocaleString() || 'N/A'}
            </p>
            {stats.inactiveStatuses !== undefined && stats.totalStatuses !== undefined && stats.totalStatuses > 0 && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                {((stats.inactiveStatuses / stats.totalStatuses) * 100).toFixed(1)}% of total
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Recent Changes</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats.recentChanges?.toLocaleString() || 'N/A'}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Last 24 hours
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by doctor name, phone..."
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="1">Available</option>
              <option value="0">Unavailable</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date
            </label>
            <input
              type="date"
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sort By
            </label>
            <select
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="createdDateTime">Date</option>
              <option value="status">Status</option>
              <option value="doctor.fullName">Doctor Name</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Show
            </label>
            <select
              className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-1 px-2"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <label className="text-sm text-gray-700 dark:text-gray-300">
              entries
            </label>
          </div>

          <button
            onClick={applyFilters}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedStatuses.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              {selectedStatuses.length} status(es) selected
            </p>
            <div className="flex items-center gap-2">
              <select
                className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-1 px-2"
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
              >
                <option value="">Select Action</option>
                <option value="activate">Mark as Available</option>
                <option value="deactivate">Mark as Unavailable</option>
              </select>
              <input
                type="text"
                placeholder="Reason (optional)"
                className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-1 px-2"
                value={bulkReason}
                onChange={(e) => setBulkReason(e.target.value)}
              />
              <button
                onClick={handleBulkUpdate}
                disabled={!bulkAction}
                className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-sm font-medium"
              >
                Apply
              </button>
              <button
                onClick={() => setSelectedStatuses([])}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm font-medium"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Records</h2>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading statuses...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedStatuses.length === statuses.length && statuses.length > 0}
                          onChange={selectAllStatuses}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Doctor
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Current Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Reason
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Updated
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {!statuses || !Array.isArray(statuses) || statuses.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          No status records found
                        </td>
                      </tr>
                    ) : (
                      statuses.map((status) => (
                        <tr
                          key={status.statusId}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedStatuses.includes(status.statusId)}
                              onChange={() => toggleStatusSelection(status.statusId)}
                              className="rounded border-gray-300 dark:border-gray-600"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                                  {status.doctor.fullName ? status.doctor.fullName.charAt(0).toUpperCase() : 'D'}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  {status.doctor.fullName || 'Anonymous'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  ID: {status.doctor.userId} | {status.doctor.mobileNo}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(status.status)}`}>
                              {getStatusText(status.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-gray-900 dark:text-gray-100">
                              {status.reason || 'No reason provided'}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                            {formatLocalDate(status.createdDateTime)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedStatus(status);
                                  setNewStatus(status.status.toString());
                                  setUpdateReason(status.reason || '');
                                  setShowUpdateForm(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => navigate(`/enhanced-user-details?userId=${status.doctor.userId}`)}
                                className="text-green-600 hover:text-green-800 dark:text-green-400 text-sm font-medium"
                              >
                                View Doctor
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                              ? 'text-blue-600 bg-blue-50 border border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      {showUpdateForm && selectedStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Update Status for {selectedStatus.doctor.fullName || 'Anonymous'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="1">Available</option>
                  <option value="0">Unavailable</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason
                </label>
                <textarea
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  rows={3}
                  value={updateReason}
                  onChange={(e) => setUpdateReason(e.target.value)}
                  placeholder="Enter reason for status change..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowUpdateForm(false);
                  setSelectedStatus(null);
                  setNewStatus("");
                  setUpdateReason("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedStatus.statusId, Number(newStatus), updateReason)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
