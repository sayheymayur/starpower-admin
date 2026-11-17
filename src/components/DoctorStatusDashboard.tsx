import React, { useState, useEffect } from 'react';
import { doctorAvailabilityAPI } from '../services/api';
import type { 
  DoctorAvailabilityStatus, 
  AvailabilityStats
} from '../services/api';

interface DoctorStatusDashboardProps {
  refreshInterval?: number;
  showQuickActions?: boolean;
  compact?: boolean;
}

const DoctorStatusDashboard: React.FC<DoctorStatusDashboardProps> = ({
  refreshInterval = 30000,
  showQuickActions = true,
  compact = false
}) => {
  const [stats, setStats] = useState<AvailabilityStats | null>(null);
  const [availableDoctors, setAvailableDoctors] = useState<DoctorAvailabilityStatus[]>([]);
  const [unavailableDoctors, setUnavailableDoctors] = useState<DoctorAvailabilityStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsResponse, availableResponse, unavailableResponse] = await Promise.all([
        doctorAvailabilityAPI.getStatistics(),
        doctorAvailabilityAPI.getAvailableDoctors({ limit: 10 }),
        doctorAvailabilityAPI.getUnavailableDoctors({ limit: 10 })
      ]);

      setStats(statsResponse.data);
      setAvailableDoctors(availableResponse.data.doctors);
      setUnavailableDoctors(unavailableResponse.data.doctors);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const updateDoctorStatus = async (userId: number, newStatus: number) => {
    try {
      await doctorAvailabilityAPI.updateStatusByUserId(userId, {
        avail_status: newStatus,
        created_by: 1 // TODO: Get from auth context
      });
      await loadData(); // Refresh data
    } catch (err: any) {
      setError(err.message || 'Failed to update doctor status');
    }
  };

  useEffect(() => {
    loadData();
    
    if (refreshInterval > 0) {
      const interval = setInterval(loadData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  const getStatusBadge = (status: number) => {
    const statusConfig = {
      0: { text: 'Unavailable', class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
      1: { text: 'Available', class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      2: { text: 'Busy', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      3: { text: 'On Break', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      text: 'Unknown', 
      class: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' 
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}`}>
        {config.text}
      </span>
    );
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-gray-500 dark:text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg dark:bg-red-900 dark:border-red-700 dark:text-red-200">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
        <button
          onClick={loadData}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${compact ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`font-bold text-gray-900 dark:text-white ${compact ? 'text-lg' : 'text-2xl'}`}>
            Doctor Status Dashboard
          </h2>
          {lastUpdated && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          {refreshInterval > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Auto-refresh: {Math.round(refreshInterval / 1000)}s
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className={`grid gap-4 ${compact ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-4'}`}>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Doctors</p>
                <p className={`font-bold text-gray-900 dark:text-white ${compact ? 'text-lg' : 'text-2xl'}`}>
                  {stats.totalDoctors}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Available</p>
                <p className={`font-bold text-green-600 dark:text-green-400 ${compact ? 'text-lg' : 'text-2xl'}`}>
                  {stats.totalAvailable}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unavailable</p>
                <p className={`font-bold text-red-600 dark:text-red-400 ${compact ? 'text-lg' : 'text-2xl'}`}>
                  {stats.totalUnavailable}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Availability Rate</p>
                <p className={`font-bold text-purple-600 dark:text-purple-400 ${compact ? 'text-lg' : 'text-2xl'}`}>
                  {stats.availabilityRate}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Lists */}
      {!compact && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Doctors */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Available Doctors ({availableDoctors.length})
              </h3>
            </div>
            <div className="p-4">
              {availableDoctors.length === 0 ? (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No available doctors
                </div>
              ) : (
                <div className="space-y-3">
                  {availableDoctors.map((doctor) => (
                    <div key={doctor.avail_status_id_pk} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-green-200 dark:bg-green-700 flex items-center justify-center">
                            <span className="text-sm font-medium text-green-800 dark:text-green-200">
                              {(doctor.doctorName || 'D').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {doctor.doctorName || 'Unknown Doctor'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {doctor.user_id_fk}
                          </div>
                        </div>
                      </div>
                      {showQuickActions && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => updateDoctorStatus(doctor.user_id_fk, 0)}
                            className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                          >
                            Set Unavailable
                          </button>
                          <button
                            onClick={() => updateDoctorStatus(doctor.user_id_fk, 2)}
                            className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800"
                          >
                            Set Busy
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Unavailable Doctors */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Unavailable Doctors ({unavailableDoctors.length})
              </h3>
            </div>
            <div className="p-4">
              {unavailableDoctors.length === 0 ? (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No unavailable doctors
                </div>
              ) : (
                <div className="space-y-3">
                  {unavailableDoctors.map((doctor) => (
                    <div key={doctor.avail_status_id_pk} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-red-200 dark:bg-red-700 flex items-center justify-center">
                            <span className="text-sm font-medium text-red-800 dark:text-red-200">
                              {(doctor.doctorName || 'D').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {doctor.doctorName || 'Unknown Doctor'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {doctor.user_id_fk}
                          </div>
                        </div>
                      </div>
                      {showQuickActions && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => updateDoctorStatus(doctor.user_id_fk, 1)}
                            className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
                          >
                            Set Available
                          </button>
                          <button
                            onClick={() => updateDoctorStatus(doctor.user_id_fk, 3)}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
                          >
                            Set Break
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Compact View - Single List */}
      {compact && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Recent Activity
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {[...availableDoctors.slice(0, 3), ...unavailableDoctors.slice(0, 2)].map((doctor) => (
                <div key={doctor.avail_status_id_pk} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-6 w-6">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                        doctor.avail_status === 1 ? 'bg-green-200 dark:bg-green-700' : 'bg-red-200 dark:bg-red-700'
                      }`}>
                        <span className={`text-xs font-medium ${
                          doctor.avail_status === 1 ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                        }`}>
                          {(doctor.doctorName || 'D').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {doctor.doctorName || 'Unknown Doctor'}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(doctor.avail_status)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorStatusDashboard;
