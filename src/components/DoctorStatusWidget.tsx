import React, { useState, useEffect } from 'react';
import { doctorAvailabilityAPI } from '../services/api';
import type { DoctorStatusResponse } from '../services/api';

interface DoctorStatusWidgetProps {
  doctorId?: number;
  phoneNumber?: string;
  onStatusUpdate?: (newStatus: number) => void;
  showHistory?: boolean;
  compact?: boolean;
}

const DoctorStatusWidget: React.FC<DoctorStatusWidgetProps> = ({
  doctorId,
  phoneNumber,
  onStatusUpdate,
  showHistory = false,
  compact = false
}) => {
  const [doctorStatus, setDoctorStatus] = useState<DoctorStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const loadDoctorStatus = async () => {
    if (!doctorId && !phoneNumber) return;

    try {
      setLoading(true);
      setError(null);

      let response;
      if (doctorId) {
        response = await doctorAvailabilityAPI.getStatusByUserId(doctorId);
      } else if (phoneNumber) {
        response = await doctorAvailabilityAPI.getStatusByPhone(phoneNumber);
      }

      setDoctorStatus(response?.data || null);
    } catch (err: any) {
      setError(err.message || 'Failed to load doctor status');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: number) => {
    if (!doctorId && !phoneNumber) return;

    try {
      setUpdating(true);
      setError(null);

      let response;
      if (doctorId) {
        response = await doctorAvailabilityAPI.updateStatusByUserId(doctorId, {
          avail_status: newStatus,
          created_by: 1 // TODO: Get from auth context
        });
      } else if (phoneNumber) {
        response = await doctorAvailabilityAPI.updateStatusByPhone(phoneNumber, {
          avail_status: newStatus,
          created_by: 1 // TODO: Get from auth context
        });
      }

      setDoctorStatus(response?.data || null);
      onStatusUpdate?.(newStatus);
    } catch (err: any) {
      setError(err.message || 'Failed to update doctor status');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    loadDoctorStatus();
  }, [doctorId, phoneNumber]);

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

  const getStatusButtons = () => {
    const currentStatus = doctorStatus?.currentStatus?.avail_status;
    
    return [
      { status: 1, label: 'Available', color: 'green', disabled: currentStatus === 1 },
      { status: 0, label: 'Unavailable', color: 'red', disabled: currentStatus === 0 },
      { status: 2, label: 'Busy', color: 'yellow', disabled: currentStatus === 2 },
      { status: 3, label: 'On Break', color: 'blue', disabled: currentStatus === 3 }
    ];
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${compact ? 'p-4' : 'p-8'}`}>
        <div className="text-gray-500 dark:text-gray-400">Loading doctor status...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg dark:bg-red-900 dark:border-red-700 dark:text-red-200 ${compact ? 'text-sm' : ''}`}>
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
        <button
          onClick={loadDoctorStatus}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!doctorStatus) {
    return (
      <div className={`text-center ${compact ? 'p-4' : 'p-8'}`}>
        <div className="text-gray-500 dark:text-gray-400">
          {doctorId ? `Doctor ${doctorId} not found` : 'No doctor selected'}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${compact ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`font-medium text-gray-900 dark:text-white ${compact ? 'text-sm' : 'text-lg'}`}>
            {doctorStatus.doctorName || 'Unknown Doctor'}
          </h3>
          {!compact && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              ID: {doctorStatus.userId}
              {doctorStatus.mobile_no && ` • ${doctorStatus.mobile_no}`}
            </div>
          )}
        </div>
        <button
          onClick={loadDoctorStatus}
          disabled={loading}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Current Status */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Status</span>
          {doctorStatus.currentStatus && getStatusBadge(doctorStatus.currentStatus.avail_status)}
        </div>
        {doctorStatus.currentStatus && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Last updated: {new Date(doctorStatus.currentStatus.last_update_date_time).toLocaleString()}
          </div>
        )}
      </div>

      {/* Status Update Buttons */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Update Status
        </div>
        <div className={`grid gap-2 ${compact ? 'grid-cols-2' : 'grid-cols-2'}`}>
          {getStatusButtons().map((button) => (
            <button
              key={button.status}
              onClick={() => updateStatus(button.status)}
              disabled={button.disabled || updating}
              className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                button.disabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                  : `bg-${button.color}-100 text-${button.color}-800 hover:bg-${button.color}-200 dark:bg-${button.color}-900 dark:text-${button.color}-200 dark:hover:bg-${button.color}-800`
              }`}
            >
              {updating ? 'Updating...' : button.label}
            </button>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      {!compact && doctorStatus.email_id && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Email: {doctorStatus.email_id}
          </div>
        </div>
      )}

      {/* History Link */}
      {showHistory && !compact && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            View History →
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorStatusWidget;
