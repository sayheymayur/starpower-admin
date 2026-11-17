import { useState, useEffect } from "react";
import dashboardAPI from "../services/dashboardAPI";
import { formatLocalDate } from "../utils/dateUtils";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../components/ui/table/index";
import { AlertIcon, CloseIcon } from "../icons";

interface Notification {
  notification_log_id_pk: number;
  user_id_fk: number;
  title: string;
  body: string;
  status: 'sent' | 'failed' | 'scheduled' | 'cancelled';
  metadata: any;
  created_date_time: string;
  last_updated_date_time: string;
}

interface NotificationFilters {
  page?: number;
  limit?: number;
  userId?: number;
  status?: 'sent' | 'failed' | 'scheduled' | 'cancelled';
  startDate?: string;
  endDate?: string;
  userType?: 'all' | 'doctors' | 'users' | 'listeners';
}

export default function AllNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [userIdFilter, setUserIdFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  // Actions
  const [cancelling, setCancelling] = useState<number | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, [currentPage, pageSize]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: NotificationFilters = {
        page: currentPage,
        limit: pageSize,
      };

      if (userIdFilter) filters.userId = Number(userIdFilter);
      if (statusFilter) filters.status = statusFilter as any;
      if (userTypeFilter) filters.userType = userTypeFilter as any;
      if (startDateFilter) filters.startDate = startDateFilter;
      if (endDateFilter) filters.endDate = endDateFilter;

      const response = await dashboardAPI.getNotificationHistory(filters);

      if (response.success && response.data) {
        setNotifications(response.data.notifications || []);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages);
          setTotalRecords(response.data.pagination.total);
        }
      } else {
        setNotifications([]);
        throw new Error(response.message || "Failed to fetch notifications");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching notifications:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchNotifications();
  };

  const clearFilters = () => {
    setUserIdFilter("");
    setStatusFilter("");
    setUserTypeFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
    setCurrentPage(1);
    fetchNotifications();
  };

  const handleCancelNotification = async (notificationId: number) => {
    try {
      setCancelling(notificationId);
      const response = await dashboardAPI.cancelScheduledNotification(notificationId);
      
      if (response.success) {
        // Refresh the notifications list
        fetchNotifications();
      } else {
        throw new Error(response.message || "Failed to cancel notification");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel notification");
      console.error("Error cancelling notification:", err);
    } finally {
      setCancelling(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      sent: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', text: 'Sent' },
      failed: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', text: 'Failed' },
      scheduled: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', text: 'Scheduled' },
      cancelled: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', text: 'Cancelled' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.failed;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getPriorityBadge = (metadata: any) => {
    const priority = metadata?.priority || 'normal';
    const priorityConfig = {
      low: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', text: 'Low' },
      normal: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', text: 'Normal' },
      high: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', text: 'High' },
      urgent: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', text: 'Urgent' },
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.normal;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notification Management</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          View and manage all notifications sent to users
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              User ID
            </label>
            <input
              type="text"
              placeholder="Filter by user ID"
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
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
              <option value="">All Statuses</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
              <option value="scheduled">Scheduled</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              User Type
            </label>
            <select
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={userTypeFilter}
              onChange={(e) => setUserTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
                  <option value="all">All Users</option>
                  <option value="doctors">Doctors</option>
                  <option value="users">Users</option>
                  <option value="listeners">Listeners</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">Show</label>
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
            <label className="text-sm text-gray-700 dark:text-gray-300">entries</label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={clearFilters}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium"
            >
              Clear Filters
            </button>
            <button
              onClick={applyFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">All Notifications</h2>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading notifications...</span>
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
                <Table className="w-full">
                  <TableHeader className="bg-gray-100 dark:bg-gray-700">
                    <TableRow>
                      <TableCell className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Notification
                      </TableCell>
                      <TableCell className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        User ID
                      </TableCell>
                      <TableCell className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status
                      </TableCell>
                      <TableCell className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Priority
                      </TableCell>
                      <TableCell className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Created Date
                      </TableCell>
                      <TableCell className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {!notifications || notifications.length === 0 ? (
                      <TableRow>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          No notifications found
                        </td>
                      </TableRow>
                    ) : (
                      notifications.map((notification) => (
                        <TableRow
                          key={notification.notification_log_id_pk}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <TableCell className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <AlertIcon className="w-5 h-5 text-blue-500" />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                  {notification.body}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <span className="font-mono text-sm text-gray-900 dark:text-gray-100">
                              {notification.user_id_fk}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            {getStatusBadge(notification.status)}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            {getPriorityBadge(notification.metadata)}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                            {formatLocalDate(notification.created_date_time)}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <div className="flex gap-2">
                              {notification.status === 'scheduled' && (
                                <button
                                  onClick={() => handleCancelNotification(notification.notification_log_id_pk)}
                                  disabled={cancelling === notification.notification_log_id_pk}
                                  className="flex items-center gap-1 text-red-600 hover:text-red-800 dark:text-red-400 text-sm font-medium disabled:opacity-50"
                                >
                                  <CloseIcon className="w-4 h-4" />
                                  {cancelling === notification.notification_log_id_pk ? 'Cancelling...' : 'Cancel'}
                                </button>
                              )}
                              <button
                                onClick={() => window.open(`/user-details?userId=${notification.user_id_fk}`, '_blank')}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-medium"
                              >
                                View User
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
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
    </div>
  );
}
