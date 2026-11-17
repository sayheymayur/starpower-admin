import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { authService } from "../services/auth";
import { formatLocalDate } from "../utils/dateUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../components/ui/table";

import { TrashBinIcon, PencilIcon } from "../icons";

interface State {
  state_id_pk: number;
  state_code: string;
  state_name: string;
}

interface User {
  user_id_pk: number;
  full_name: string | null;
  mobile_no: string;
  email_id: string | null;
  profile_photo: string | null;
  state: State | null;
  status: number;
  is_doctor: number;
  kyc_status: number;
}

interface Listener {
  user_id_pk: number;
  full_name: string | null;
  mobile_no: string;
  email_id: string | null;
  profile_photo: string | null;
  state: State | null;
  status: number;
  is_doctor: number;
  kyc_status: number;
  per_minute_cost?: number;
  commission_per?: number;
  doctor_profile_status?: number;
}

interface Session {
  user_listener_session_id_pk: number;
  by_user_id: number;
  to_user_id_fk: number;
  start_date_time: string;
  end_date_time: string | null;
  session_type: number;
  session_id: string;
  canceled: number;
  remark: string | null;
  request_date_time: string;
  invoice_no: string | null;
  financial_year: string;
  request_type: number;
  is_cancelled_by_server: number;
  cancelled_date_time: string | null;
  cancellation_type: string | null;
  created_date_time: string;
  created_by: number;
  recent_agora_end_date_time: string | null;
  user: User;
  listener: Listener;
  duration: number | null;
  status: string;
  /** Present on missed-session rows: cancelled | rejected | timeout */
  missedType?: "cancelled" | "rejected" | "timeout" | null;
}

interface SessionResponse {
  success: boolean;
  data: Session[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function SessionHistory() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sessionTypeFilter, setSessionTypeFilter] = useState<string>("");
  const [missedTypeFilter, setMissedTypeFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [dateField, setDateField] = useState<string>("request_date_time");

  const API_BASE_URL = "https://paapi.sayhey.co.in/api/dashboard/api";
  const isMissedFilter = statusFilter === "missed";

  const toIsoDateTime = (localValue: string) => {
    if (!localValue) return "";
    const date = new Date(localValue);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString();
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      const sortBy = isMissedFilter ? dateField || "request_date_time" : "created_date_time";
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        sortBy,
        sortOrder: "desc",
      });

      if (statusFilter && !isMissedFilter) {
        params.append("status", statusFilter);
      }
      if (sessionTypeFilter) {
        params.append("sessionType", sessionTypeFilter);
      }
      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim());
      }

      if (isMissedFilter) {
        if (missedTypeFilter && missedTypeFilter !== "all") {
          params.append("missedType", missedTypeFilter);
        } else {
          params.append("missedType", "all");
        }
        if (dateField) {
          params.append("dateField", dateField);
        }
      }

      const startIso = toIsoDateTime(startDate);
      const endIso = toIsoDateTime(endDate);
      if (startIso) params.append("startDate", startIso);
      if (endIso) params.append("endDate", endIso);
      if ((startIso || endIso) && !isMissedFilter && dateField) {
        params.append("dateField", dateField);
      }

      const endpoint = isMissedFilter
        ? `${API_BASE_URL}/sessions/missed`
        : `${API_BASE_URL}/sessions/allsessions`;

      const token = authService.getToken();
      const response = await fetch(`${endpoint}?${params}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SessionResponse = await response.json();

      if (data.success) {
        setSessions(data.data);

        const total = data.pagination?.total ?? 0;
        const limit = data.pagination?.limit ?? pageSize;
        const apiTotalPages = data.pagination?.totalPages;

        setTotalItems(total);
        setTotalPages(apiTotalPages ?? (limit > 0 ? Math.ceil(total / limit) : 0));
      } else {
        throw new Error("Failed to fetch sessions");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, sessionTypeFilter, pageSize, searchTerm, missedTypeFilter, startDate, endDate, dateField]);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      fetchSessions();
    }, 400);

    return () => window.clearTimeout(handler);
  }, [currentPage, pageSize, statusFilter, sessionTypeFilter, searchTerm, missedTypeFilter, startDate, endDate, dateField]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (durationMs: number | null) => {
    if (!durationMs || durationMs < 0) return "N/A";
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getEffectiveDurationMs = (session: Session): number | null => {
    if (session.duration && session.duration > 0) return session.duration;

    const startTs = (session.start_date_time || session.request_date_time)
      ? new Date((session.start_date_time || session.request_date_time) as string).getTime()
      : null;

    const endTs =
      (session.cancelled_date_time ? new Date(session.cancelled_date_time).getTime() : null) ||
      (session.end_date_time ? new Date(session.end_date_time).getTime() : null) ||
      (session.recent_agora_end_date_time ? new Date(session.recent_agora_end_date_time).getTime() : null);

    if (startTs && endTs && endTs >= startTs) return endTs - startTs;
    return null;
  };

  const getSessionTypeName = (type: number) => {
    switch (type) {
      case 1:
        return "Call";
      case 2:
        return "Chat";
      case 3:
        return "Video";
      default:
        return "Unknown";
    }
  };

  const getSessionStatusBadgeClass = (session: Session) => {
    const statusLabel = getStatusLabel(session);
    switch (statusLabel.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "rejected":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "timeout":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusLabel = (session: Session) => {
    if (session.missedType) {
      return session.missedType.charAt(0).toUpperCase() + session.missedType.slice(1);
    }
    if (session.is_cancelled_by_server === 1) {
      return "Timeout";
    }
    const cancelType = session.cancellation_type !== null ? String(session.cancellation_type) : null;
    if (cancelType === "2") {
      return "Rejected";
    }
    if (cancelType === "1") {
      return "Cancelled";
    }
    return session.status.charAt(0).toUpperCase() + session.status.slice(1);
  };

  const getDefaultProfilePhoto = (isDoctor: number) => {
    return isDoctor ? "/images/user/owner.jpg" : "/images/user/user-01.jpg";
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="p-4 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Session History</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Detailed list of every session with live filters and pagination.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={statusFilter}
              onChange={(e) => {
                const next = e.target.value;
                setStatusFilter(next);
                if (next === "missed" && !dateField) {
                  setDateField("request_date_time");
                }
              }}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
              <option value="missed">Missed</option>
            </select>
          </div>
          <div>
            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Session Type
            </label>
            <select
              id="type-filter"
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={sessionTypeFilter}
              onChange={(e) => setSessionTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="1">Call</option>
              <option value="2">Chat</option>
            </select>
          </div>
          {isMissedFilter && (
            <div>
              <label htmlFor="missed-type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Missed Type
              </label>
              <select
                id="missed-type-filter"
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                value={missedTypeFilter}
                onChange={(e) => setMissedTypeFilter(e.target.value)}
              >
                <option value="all">All Missed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
                <option value="timeout">Timeout</option>
              </select>
            </div>
          )}
          <div>
            <label htmlFor="date-field-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date Field
            </label>
            <select
              id="date-field-filter"
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={dateField}
              onChange={(e) => setDateField(e.target.value)}
            >
              <option value="request_date_time">Request time</option>
              <option value="created_date_time">Created time</option>
              <option value="cancelled_date_time">Cancelled time</option>
              <option value="start_date_time">Start time</option>
              <option value="end_date_time">End time</option>
            </select>
          </div>
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              id="start-date"
              type="datetime-local"
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <input
              id="end-date"
              type="datetime-local"
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
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
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name, email, or session ID..."
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
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading sessions...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error loading sessions
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
                <div className="mt-4">
                  <button
                    onClick={fetchSessions}
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-100 dark:bg-gray-700">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                  >
                    Session ID
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                  >
                    Type
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                  >
                    Status
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                  >
                    User
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                  >
                    Listener
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                  >
                    Start Time
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                  >
                    End Time
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                  >
                    Duration
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                  >
                    Created Time
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                {sessions.length === 0 ? (
                  <TableRow>
                    <td colSpan={10} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      No sessions found.
                    </td>
                  </TableRow>
                ) : (
                  sessions.map((session) => (
                    <TableRow
                      key={session.user_listener_session_id_pk}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm">
                        <div
                          className="cursor-pointer"
                          onClick={() =>
                            navigate(`/session-details?sessionId=${session.user_listener_session_id_pk}`)
                          }
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs">{session.session_id}</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">��️</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {getSessionTypeName(session.session_type)}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSessionStatusBadgeClass(session)}`}
                          >
                            {getStatusLabel(session)}
                          </span>
                          {session.canceled === 1 && (
                            <div className="text-[11px] text-gray-500 dark:text-gray-400">
                              Request lasted: {formatDuration(getEffectiveDurationMs(session))}
                            </div>
                          )}
                          {session.remark && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 max-w-32 truncate" title={session.remark}>
                              {session.remark}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              session.user.profile_photo ||
                              getDefaultProfilePhoto(session.user.is_doctor)
                            }
                            alt={session.user.full_name || "Anonymous"}
                            className="w-8 h-8 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = getDefaultProfilePhoto(session.user.is_doctor);
                            }}
                          />
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {session.user.full_name || "Anonymous"}
                              {session.user.is_doctor === 1 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  Dr.
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {session.user.mobile_no || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {session.user.state?.state_name || "N/A"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              session.listener.profile_photo ||
                              getDefaultProfilePhoto(session.listener.is_doctor)
                            }
                            alt={session.listener.full_name || "Anonymous"}
                            className="w-8 h-8 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = getDefaultProfilePhoto(session.listener.is_doctor);
                            }}
                          />
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {session.listener.full_name || "Anonymous"}
                              {session.listener.is_doctor === 1 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  Dr.
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {session.listener.mobile_no || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {session.listener.state?.state_name || "N/A"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm">
                        {formatDate(session.start_date_time)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm">
                        {formatDate(session.end_date_time)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm">
                        {(() => {
                          const statusLabel = getStatusLabel(session);
                          if (statusLabel === "Cancelled" || statusLabel === "Timeout" || statusLabel === "Rejected") {
                            return "N/A";
                          }
                          return formatDuration(getEffectiveDurationMs(session));
                        })()}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm">
                        {formatLocalDate(session.created_date_time)}
                      </TableCell>
                      <TableCell className="px-4 py-3 flex gap-3 text-gray-400 dark:text-gray-300">
                        <button className="hover:text-gray-600 dark:hover:text-white" aria-label="Delete session">
                          <TrashBinIcon className="w-5 h-5" />
                        </button>
                        <button className="hover:text-gray-600 dark:hover:text-white" aria-label="Edit session">
                          <PencilIcon className="w-5 h-5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {!loading && !error && totalPages > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {totalItems > 0 ? (
                <>
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
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
    </div>
  );
}
