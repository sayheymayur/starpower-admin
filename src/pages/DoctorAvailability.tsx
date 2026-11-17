import React, { useState, useEffect } from 'react';
import { doctorAvailabilityAPI } from '../services/api';
import type { 
  DoctorAvailabilityStatus, 
  AvailabilityStats, 
  BulkStatusUpdateRequest 
} from '../services/api/doctorAvailability';

const DoctorAvailability: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'bulk' | 'history'>('overview');
  const [selectedStatus, setSelectedStatus] = useState<number>(1); // 1 = Available
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // State for different data
  const [stats, setStats] = useState<AvailabilityStats | null>(null);
  const [doctors, setDoctors] = useState<DoctorAvailabilityStatus[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load statistics
  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await doctorAvailabilityAPI.getStatistics();
      setStats(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  // Load doctors by status
  const loadDoctors = async (status: number, page: number = 1) => {
    try {
      setLoading(true);
      const response = await doctorAvailabilityAPI.getDoctorsByStatus(status, { page, limit: pageSize });
      setDoctors(response.data.doctors);
      setPagination(response.data.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  // Load available doctors
  const loadAvailableDoctors = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await doctorAvailabilityAPI.getAvailableDoctors({ page, limit: pageSize });
      setDoctors(response.data.doctors);
      setPagination(response.data.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to load available doctors');
    } finally {
      setLoading(false);
    }
  };

  // Load unavailable doctors
  const loadUnavailableDoctors = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await doctorAvailabilityAPI.getUnavailableDoctors({ page, limit: pageSize });
      setDoctors(response.data.doctors);
      setPagination(response.data.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to load unavailable doctors');
    } finally {
      setLoading(false);
    }
  };

  // Update doctor status
  const updateDoctorStatus = async (userId: number, newStatus: number) => {
    try {
      setLoading(true);
      await doctorAvailabilityAPI.updateStatusByUserId(userId, {
        avail_status: newStatus,
        created_by: 1 // TODO: Get from auth context
      });
      
      // Reload data
      if (selectedStatus === 1) {
        await loadAvailableDoctors(currentPage);
      } else if (selectedStatus === 0) {
        await loadUnavailableDoctors(currentPage);
      } else {
        await loadDoctors(selectedStatus, currentPage);
      }
      await loadStats();
    } catch (err: any) {
      setError(err.message || 'Failed to update doctor status');
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tab: 'overview' | 'doctors' | 'bulk' | 'history') => {
    setActiveTab(tab);
    setError(null);
    
    if (tab === 'overview') {
      loadStats();
    } else if (tab === 'doctors') {
      if (selectedStatus === 1) {
        loadAvailableDoctors();
      } else if (selectedStatus === 0) {
        loadUnavailableDoctors();
      } else {
        loadDoctors(selectedStatus);
      }
    }
  };

  // Handle status filter change
  const handleStatusChange = (status: number) => {
    setSelectedStatus(status);
    setCurrentPage(1);
    if (status === 1) {
      loadAvailableDoctors(1);
    } else if (status === 0) {
      loadUnavailableDoctors(1);
    } else {
      loadDoctors(status, 1);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (selectedStatus === 1) {
      loadAvailableDoctors(page);
    } else if (selectedStatus === 0) {
      loadUnavailableDoctors(page);
    } else {
      loadDoctors(selectedStatus, page);
    }
  };

  // Load initial data
  useEffect(() => {
    loadStats();
    if (activeTab === 'doctors') {
      if (selectedStatus === 1) {
        loadAvailableDoctors();
      } else if (selectedStatus === 0) {
        loadUnavailableDoctors();
      } else {
        loadDoctors(selectedStatus);
      }
    }
  }, []);

  const getStatusBadge = (status: number) => {
    const statusConfig = {
      0: { text: 'Unavailable', class: 'bg-red-100 text-red-800' },
      1: { text: 'Available', class: 'bg-green-100 text-green-800' },
      2: { text: 'Busy', class: 'bg-yellow-100 text-yellow-800' },
      3: { text: 'On Break', class: 'bg-blue-100 text-blue-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { text: 'Unknown', class: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}`}>
        {config.text}
      </span>
    );
  };

  const getStatusOptions = () => [
    { value: 1, label: 'Available', count: stats?.statistics.available.count || 0 },
    { value: 0, label: 'Unavailable', count: stats?.statistics.unavailable.count || 0 },
    { value: 2, label: 'Busy', count: 0 },
    { value: 3, label: 'On Break', count: 0 }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Doctor Availability Management
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => loadStats()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'doctors', label: 'Doctors' },
            { id: 'bulk', label: 'Bulk Update' },
            { id: 'history', label: 'History' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-lg">Loading statistics...</div>
            </div>
          ) : stats ? (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Doctors</h3>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalDoctors}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Available</h3>
                  <p className="text-3xl font-bold text-green-600">{stats.totalAvailable}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Unavailable</h3>
                  <p className="text-3xl font-bold text-red-600">{stats.totalUnavailable}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Availability Rate</h3>
                  <p className="text-3xl font-bold text-purple-600">{stats.availabilityRate}%</p>
                </div>
              </div>

              {/* Detailed Statistics */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Availability Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Available Doctors</h4>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${stats.statistics.available.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {stats.statistics.available.count} ({stats.statistics.available.percentage}%)
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Unavailable Doctors</h4>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ width: `${stats.statistics.unavailable.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {stats.statistics.unavailable.count} ({stats.statistics.unavailable.percentage}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500">No statistics available</div>
            </div>
          )}
        </div>
      )}

      {/* Doctors Tab */}
      {activeTab === 'doctors' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Filter by Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => handleStatusChange(Number(e.target.value))}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {getStatusOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} ({option.count})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search Doctors
                </label>
                <input
                  type="text"
                  placeholder="Search by name, phone, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Doctors Table */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-lg">Loading doctors...</div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Current Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Last Updated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {doctors
                      .filter(doctor => 
                        !searchTerm || 
                        (doctor.doctorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (doctor.mobile_no || '').includes(searchTerm) ||
                        (doctor.email_id || '').toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((doctor) => (
                      <tr key={doctor.avail_status_id_pk}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {(doctor.doctorName || 'D').charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {doctor.doctorName || 'Unknown Doctor'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                ID: {doctor.user_id_fk}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {doctor.mobile_no || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {doctor.email_id || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(doctor.avail_status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(doctor.last_update_date_time).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {doctor.avail_status !== 1 && (
                              <button
                                onClick={() => updateDoctorStatus(doctor.user_id_fk, 1)}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              >
                                Set Available
                              </button>
                            )}
                            {doctor.avail_status !== 0 && (
                              <button
                                onClick={() => updateDoctorStatus(doctor.user_id_fk, 0)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                Set Unavailable
                              </button>
                            )}
                            {doctor.avail_status !== 2 && (
                              <button
                                onClick={() => updateDoctorStatus(doctor.user_id_fk, 2)}
                                className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                              >
                                Set Busy
                              </button>
                            )}
                            {doctor.avail_status !== 3 && (
                              <button
                                onClick={() => updateDoctorStatus(doctor.user_id_fk, 3)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                Set Break
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Showing{' '}
                        <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span>
                        {' '}to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * pageSize, pagination.total)}
                        </span>
                        {' '}of{' '}
                        <span className="font-medium">{pagination.total}</span>
                        {' '}results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === currentPage
                                ? 'z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === pagination.totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bulk Update Tab */}
      {activeTab === 'bulk' && (
        <BulkUpdateComponent onUpdate={() => {
          loadStats();
          if (selectedStatus === 1) {
            loadAvailableDoctors(currentPage);
          } else if (selectedStatus === 0) {
            loadUnavailableDoctors(currentPage);
          } else {
            loadDoctors(selectedStatus, currentPage);
          }
        }} />
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <DoctorHistoryComponent />
      )}
    </div>
  );
};

// Bulk Update Component
const BulkUpdateComponent: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
  const [userIds, setUserIds] = useState<string>('');
  const [phoneNumbers, setPhoneNumbers] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleBulkUpdate = async () => {
    try {
      setLoading(true);
      setResult(null);

      const request: BulkStatusUpdateRequest = {
        avail_status: selectedStatus,
        created_by: 1 // TODO: Get from auth context
      };

      if (userIds.trim()) {
        request.userIds = userIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      }

      if (phoneNumbers.trim()) {
        request.phoneNumbers = phoneNumbers.split(',').map(phone => phone.trim()).filter(phone => phone);
      }

      if (!request.userIds?.length && !request.phoneNumbers?.length) {
        throw new Error('Please provide at least one user ID or phone number');
      }

      const response = await doctorAvailabilityAPI.bulkUpdateStatus(request);
      setResult(response.data);
      onUpdate();
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Bulk Update Doctor Status</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              User IDs (comma-separated)
            </label>
            <input
              type="text"
              value={userIds}
              onChange={(e) => setUserIds(e.target.value)}
              placeholder="123, 456, 789"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Numbers (comma-separated)
            </label>
            <input
              type="text"
              value={phoneNumbers}
              onChange={(e) => setPhoneNumbers(e.target.value)}
              placeholder="+1234567890, +0987654321"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(Number(e.target.value))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={0}>Unavailable</option>
              <option value={1}>Available</option>
              <option value={2}>Busy</option>
              <option value={3}>On Break</option>
            </select>
          </div>

          <button
            onClick={handleBulkUpdate}
            disabled={loading || (!userIds.trim() && !phoneNumbers.trim())}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Status'}
          </button>
        </div>

        {result && (
          <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Update Result</h4>
            {result.error ? (
              <div className="text-red-600 dark:text-red-400">{result.error}</div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Processed: {result.totalProcessed}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Successful: {result.successful?.length || 0}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">
                  Failed: {result.failed?.length || 0}
                </div>
                {result.failed?.length > 0 && (
                  <div className="mt-2">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Failed Updates:</div>
                    {result.failed.map((failure: any, index: number) => (
                      <div key={index} className="text-sm text-red-600 dark:text-red-400">
                        User {failure.userId}: {failure.error}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Doctor History Component
const DoctorHistoryComponent: React.FC = () => {
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [searchType, setSearchType] = useState<'userId' | 'phone'>('userId');
  const [history, setHistory] = useState<DoctorAvailabilityStatus[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async (page: number = 1) => {
    if (!selectedDoctor.trim()) return;

    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (searchType === 'userId') {
        response = await doctorAvailabilityAPI.getHistoryByUserId(parseInt(selectedDoctor), { page, limit: 20 });
      } else {
        response = await doctorAvailabilityAPI.getHistoryByPhone(selectedDoctor, { page, limit: 20 });
      }
      
      setHistory(response.data.history);
      setPagination(response.data.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: number) => {
    const statusConfig = {
      0: { text: 'Unavailable', class: 'bg-red-100 text-red-800' },
      1: { text: 'Available', class: 'bg-green-100 text-green-800' },
      2: { text: 'Busy', class: 'bg-yellow-100 text-yellow-800' },
      3: { text: 'On Break', class: 'bg-blue-100 text-blue-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { text: 'Unknown', class: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Doctor History</h3>
        
        <div className="space-y-4">
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Type
              </label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as 'userId' | 'phone')}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="userId">User ID</option>
                <option value="phone">Phone Number</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {searchType === 'userId' ? 'User ID' : 'Phone Number'}
              </label>
              <input
                type="text"
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                placeholder={searchType === 'userId' ? 'Enter user ID' : 'Enter phone number'}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => loadHistory(1)}
                disabled={!selectedDoctor.trim() || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Load History'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Created By
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {history.map((record) => (
                    <tr key={record.avail_status_id_pk}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(record.avail_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(record.created_date_time).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(record.last_update_date_time).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {record.created_by}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => loadHistory(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => loadHistory(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAvailability;
