import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dashboardAPI from "../services/dashboardAPI";
import { formatLocalDate } from "../utils/dateUtils";
import useGoBack from "../hooks/useGoBack";

interface PostReport {
  reportId: number;
  postId: number;
  userId: number;
  userName: string;
  userProfilePhoto: string | null;
  reportMasterId: number;
  reportType: string;
  remark: string | null;
  createdDateTime: string;
  status: number;
  post: {
    postId: number;
    description: string | null;
    user: {
      userId: number;
      name: string;
      profilePhoto: string | null;
    };
    statistics: {
      likeCount: number;
      commentCount: number;
      viewCount: number;
    };
  };
}

interface ReportStats {
  totalReports: number;
  reportsByType: Array<{
    reportType: string;
    count: number;
  }>;
  reportsByStatus: Array<{
    status: number;
    count: number;
  }>;
  topReportedUsers: Array<{
    userName: string;
    count: number;
  }>;
}

export default function PostReports() {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [reports, setReports] = useState<PostReport[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [reportTypeFilter, setReportTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, [currentPage, pageSize]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {
        page: currentPage,
        limit: pageSize,
      };

      if (searchTerm) filters.search = searchTerm;
      if (reportTypeFilter) filters.reportType = reportTypeFilter;
      if (statusFilter) filters.status = statusFilter;
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;

      // This would need to be implemented in dashboardAPI
      const response = await dashboardAPI.getPostReports(filters);

      if (response.success && response.data) {
        const reportsData = Array.isArray(response.data) ? response.data : [];
        setReports(reportsData as PostReport[]);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalRecords(response.pagination.total);
        }
      } else {
        setReports([]);
        throw new Error(response.message || 'Failed to fetch reports');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching reports:', err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await dashboardAPI.getPostReportStats();

      if (response.success && response.data) {
        setStats(response.data as ReportStats);
      }
    } catch (err) {
      console.error('Error fetching report stats:', err);
    }
  };

  const getReportTypeText = (reportMasterId: number) => {
    const reportTypes: { [key: number]: string } = {
      1: 'Spam',
      2: 'Inappropriate Content',
      3: 'Harassment',
      4: 'Violence',
      5: 'Hate Speech',
      6: 'False Information',
      7: 'Copyright Violation',
      8: 'Other'
    };
    return reportTypes[reportMasterId] || 'Unknown';
  };

  const getReportTypeBadge = (reportMasterId: number) => {
    const badgeClasses: { [key: number]: string } = {
      1: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      2: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      3: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      4: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      5: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      6: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      7: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      8: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    };
    return badgeClasses[reportMasterId] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0: return { text: 'Pending', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
      case 1: return { text: 'Under Review', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' };
      case 2: return { text: 'Resolved', class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
      case 3: return { text: 'Dismissed', class: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' };
      default: return { text: 'Unknown', class: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' };
    }
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchReports();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setReportTypeFilter("");
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
    fetchReports();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Post Reports</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage and review post reports and content moderation
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={goBack}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium"
          >
            Back to Posts
          </button>
          <button
            onClick={() => navigate('/post-statistics')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
          >
            Statistics
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Reports</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalReports.toLocaleString()}</p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
              {stats.reportsByStatus.find(s => s.status === 0)?.count || 0} pending
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Under Review</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats.reportsByStatus.find(s => s.status === 1)?.count || 0}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              {stats.reportsByStatus.find(s => s.status === 2)?.count || 0} resolved
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Most Reported Type</p>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">
              {stats.reportsByType.length > 0 ? stats.reportsByType[0].reportType : 'N/A'}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              {stats.reportsByType.length > 0 ? stats.reportsByType[0].count : 0} reports
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Dismissed</p>
            <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">
              {stats.reportsByStatus.find(s => s.status === 3)?.count || 0}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              False reports
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
              placeholder="Search reports, users, posts..."
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Report Type
            </label>
            <select
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={reportTypeFilter}
              onChange={(e) => setReportTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="1">Spam</option>
              <option value="2">Inappropriate Content</option>
              <option value="3">Harassment</option>
              <option value="4">Violence</option>
              <option value="5">Hate Speech</option>
              <option value="6">False Information</option>
              <option value="7">Copyright Violation</option>
              <option value="8">Other</option>
            </select>
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
              <option value="0">Pending</option>
              <option value="1">Under Review</option>
              <option value="2">Resolved</option>
              <option value="3">Dismissed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date From
            </label>
            <input
              type="date"
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
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

      {/* Reports Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reports</h2>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading reports...</span>
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
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Reporter
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Report Type
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Post
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Remark
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Reported
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {!reports || !Array.isArray(reports) || reports.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          No reports found
                        </td>
                      </tr>
                    ) : (
                      reports.map((report) => (
                        <tr
                          key={report.reportId}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={report.userProfilePhoto || 'https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg'}
                                alt={report.userName}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  {report.userName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  ID: {report.userId}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getReportTypeBadge(report.reportMasterId)}`}>
                              {getReportTypeText(report.reportMasterId)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="max-w-xs">
                              <p className="text-sm text-gray-900 dark:text-gray-100 truncate">
                                {report.post.description || 'No description'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                By: {report.post.user.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">❤️ {report.post.statistics.likeCount}</span>
                                <span className="text-xs text-gray-500">💬 {report.post.statistics.commentCount}</span>
                                <span className="text-xs text-gray-500">👁️ {report.post.statistics.viewCount}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(report.status).class}`}>
                              {getStatusBadge(report.status).text}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                              {report.remark || 'No remark'}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                            {formatLocalDate(report.createdDateTime)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => navigate(`/post-details?postId=${report.postId}`)}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-medium"
                              >
                                View Post
                              </button>
                              <button
                                onClick={() => navigate(`/enhanced-user-details?userId=${report.userId}`)}
                                className="text-green-600 hover:text-green-800 dark:text-green-400 text-sm font-medium"
                              >
                                Reporter
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
    </div>
  );
}
