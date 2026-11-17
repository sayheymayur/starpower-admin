import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dashboardAPI from "../services/dashboardAPI";
import { formatLocalDate } from "../utils/dateUtils";

interface Doctor {
  userId: number;
  fullName: string | null;
  emailId: string | null;
  mobileNo: string;
  isDoctor: number;
  perMinuteCost: number;
  commissionPer: number;
  doctorProfileStatus: number;
  kycStatus: number;
  state: {
    stateId: number;
    stateName: string;
  } | null;
  createdDateTime: string;
  statistics?: {
    totalSessions: number;
    completedSessions: number;
    totalEarned: number;
    averageRating: number;
  };
}

interface DoctorStats {
  totalDoctors: number;
  activeDoctors: number;
  inactiveDoctors: number;
  kycApproved: number;
  kycPending: number;
  kycRejected: number;
  averageEarnings?: number;
  totalEarnings?: number;
}

export default function DoctorManagement() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [stats, setStats] = useState<DoctorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [kycStatusFilter, setKycStatusFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdDateTime");
  const [sortOrder, setSortOrder] = useState("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchDoctors();
    fetchStats();
  }, [currentPage, pageSize, sortBy, sortOrder]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {
        page: currentPage,
        limit: pageSize,
        isDoctor: 1, // Only get doctors
        sortBy,
        sortOrder,
      };

      if (searchTerm) filters.search = searchTerm;
      if (statusFilter) filters.status = statusFilter;
      if (kycStatusFilter) filters.kycStatus = kycStatusFilter;
      if (stateFilter) filters.state = stateFilter;

      const response = await dashboardAPI.getEnhancedUsers(filters);

      if (response.success && response.data) {
        const doctorsData = Array.isArray(response.data) ? response.data : [];
        setDoctors(doctorsData as Doctor[]);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalRecords(response.pagination.total);
        }
      } else {
        setDoctors([]);
        throw new Error(response.message || 'Failed to fetch doctors');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching doctors:', err);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await dashboardAPI.getUserAnalytics();

      if (response.success && response.data) {
        setStats(response.data as DoctorStats);
      }
    } catch (err) {
      console.error('Error fetching doctor stats:', err);
    }
  };

  const getStatusBadge = (status: number) => {
    return status === 1
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const getStatusText = (status: number) => {
    return status === 1 ? 'Active' : 'Inactive';
  };

  const getKycBadge = (kycStatus: number) => {
    switch (kycStatus) {
      case 0: return { text: 'Not Verified', class: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' };
      case 1: return { text: 'Pending', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
      case 2: return { text: 'Verified', class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
      case 3: return { text: 'Rejected', class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
      default: return { text: 'Unknown', class: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' };
    }
  };

  const getDoctorProfileBadge = (status: number) => {
    return status === 1 || status === 4
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      : status === 2
        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const getDoctorProfileText = (status: number) => {
    if (status === 1 || status === 4) return 'Verified';
    if (status === 2) return 'Rejected';
    if (status === 0 || status === 3) return 'Pending verification';
    return `Status ${status}`;
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchDoctors();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Doctor Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage doctor profiles, availability, and performance
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/doctor-availability')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
          >
            Availability Status
          </button>
          <button
            onClick={() => navigate('/enhanced-users?isDoctor=1')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium"
          >
            View All Doctors
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Doctors</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalDoctors?.toLocaleString()}</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              {stats.activeDoctors} active
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">KYC Status</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.kycApproved?.toLocaleString()}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              {stats.kycPending} pending, {stats.kycRejected} rejected
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Earnings</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">₹{stats.totalEarnings?.toLocaleString()}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Avg: ₹{stats.averageEarnings?.toFixed(2)}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Rate</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {((stats.activeDoctors / stats.totalDoctors) * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              {stats.inactiveDoctors} inactive
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
              placeholder="Search by name, email, phone..."
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
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              KYC Status
            </label>
            <select
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
              value={kycStatusFilter}
              onChange={(e) => setKycStatusFilter(e.target.value)}
            >
              <option value="">All KYC Status</option>
              <option value="0">Not Verified</option>
              <option value="1">Pending</option>
              <option value="2">Verified</option>
              <option value="3">Rejected</option>
            </select>
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
              <option value="createdDateTime">Join Date</option>
              <option value="perMinuteCost">Rate</option>
              <option value="fullName">Name</option>
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

      {/* Doctors Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Doctors</h2>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading doctors...</span>
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
                        Doctor
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Contact
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Rates
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        KYC
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Profile
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Performance
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Joined
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {!doctors || !Array.isArray(doctors) || doctors.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          No doctors found
                        </td>
                      </tr>
                    ) : (
                      doctors.map((doctor) => (
                        <tr
                          key={doctor.userId}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                                  {doctor.fullName ? doctor.fullName.charAt(0).toUpperCase() : 'D'}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  {doctor.fullName || 'Anonymous'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  ID: {doctor.userId}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-gray-900 dark:text-gray-100">
                              {doctor.mobileNo}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              ID: {doctor.userId}
                            </p>
                            {doctor.state && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {doctor.state.stateName}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                ₹{doctor.perMinuteCost}/min
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Commission: {doctor.commissionPer}%
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(doctor.isDoctor)}`}>
                              {getStatusText(doctor.isDoctor)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getKycBadge(doctor.kycStatus).class}`}>
                              {getKycBadge(doctor.kycStatus).text}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getDoctorProfileBadge(doctor.doctorProfileStatus)}`}>
                              {getDoctorProfileText(doctor.doctorProfileStatus)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {doctor.statistics && (
                              <div className="text-xs space-y-1">
                                <p className="text-gray-900 dark:text-gray-100">
                                  Sessions: {doctor.statistics.totalSessions}
                                </p>
                                <p className="text-green-600 dark:text-green-400">
                                  Earned: ₹{doctor.statistics.totalEarned.toFixed(2)}
                                </p>
                                <p className="text-yellow-600 dark:text-yellow-400">
                                  Rating: {doctor.statistics.averageRating?.toFixed(1)}⭐
                                </p>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                            {formatLocalDate(doctor.createdDateTime)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => navigate(`/enhanced-user-details?userId=${doctor.userId}`)}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-medium"
                              >
                                View
                              </button>
                              <button
                                onClick={() => navigate(`/doctor-availability?userId=${doctor.userId}`)}
                                className="text-green-600 hover:text-green-800 dark:text-green-400 text-sm font-medium"
                              >
                                Availability
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
