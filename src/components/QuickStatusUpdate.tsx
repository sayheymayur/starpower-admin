import React, { useState } from 'react';
import { doctorAvailabilityAPI } from '../services/api';
import type { BulkStatusUpdateRequest, BulkUpdateResponse } from '../services/api';

interface QuickStatusUpdateProps {
  onUpdate?: (result: BulkUpdateResponse) => void;
  compact?: boolean;
}

const QuickStatusUpdate: React.FC<QuickStatusUpdateProps> = ({
  onUpdate,
  compact = false
}) => {
  const [userIds, setUserIds] = useState<string>('');
  const [phoneNumbers, setPhoneNumbers] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BulkUpdateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const statusOptions = [
    { value: 0, label: 'Unavailable', color: 'red' },
    { value: 1, label: 'Available', color: 'green' },
    { value: 2, label: 'Busy', color: 'yellow' },
    { value: 3, label: 'On Break', color: 'blue' }
  ];

  const handleBulkUpdate = async () => {
    try {
      setLoading(true);
      setError(null);
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
      onUpdate?.(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to update doctor status');
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setUserIds('');
    setPhoneNumbers('');
    setSelectedStatus(1);
    setResult(null);
    setError(null);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${compact ? 'p-4' : 'p-6'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-medium text-gray-900 dark:text-white ${compact ? 'text-sm' : 'text-lg'}`}>
          Quick Status Update
        </h3>
        <button
          onClick={clearForm}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          Clear
        </button>
      </div>

      <div className="space-y-4">
        {/* User IDs Input */}
        <div>
          <label className={`block font-medium text-gray-700 dark:text-gray-300 mb-2 ${compact ? 'text-xs' : 'text-sm'}`}>
            User IDs
          </label>
          <input
            type="text"
            value={userIds}
            onChange={(e) => setUserIds(e.target.value)}
            placeholder="123, 456, 789"
            className={`w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
              compact ? 'text-sm' : ''
            }`}
          />
          <p className={`text-gray-500 dark:text-gray-400 mt-1 ${compact ? 'text-xs' : 'text-sm'}`}>
            Enter comma-separated user IDs
          </p>
        </div>

        {/* Phone Numbers Input */}
        <div>
          <label className={`block font-medium text-gray-700 dark:text-gray-300 mb-2 ${compact ? 'text-xs' : 'text-sm'}`}>
            Phone Numbers
          </label>
          <input
            type="text"
            value={phoneNumbers}
            onChange={(e) => setPhoneNumbers(e.target.value)}
            placeholder="+1234567890, +0987654321"
            className={`w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
              compact ? 'text-sm' : ''
            }`}
          />
          <p className={`text-gray-500 dark:text-gray-400 mt-1 ${compact ? 'text-xs' : 'text-sm'}`}>
            Enter comma-separated phone numbers
          </p>
        </div>

        {/* Status Selection */}
        <div>
          <label className={`block font-medium text-gray-700 dark:text-gray-300 mb-2 ${compact ? 'text-xs' : 'text-sm'}`}>
            New Status
          </label>
          <div className="grid grid-cols-2 gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedStatus(option.value)}
                className={`px-3 py-2 text-xs font-medium rounded-md border transition-colors ${
                  selectedStatus === option.value
                    ? `bg-${option.color}-100 text-${option.color}-800 border-${option.color}-300 dark:bg-${option.color}-900 dark:text-${option.color}-200 dark:border-${option.color}-700`
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Update Button */}
        <button
          onClick={handleBulkUpdate}
          disabled={loading || (!userIds.trim() && !phoneNumbers.trim())}
          className={`w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
            compact ? 'text-sm' : ''
          }`}
        >
          {loading ? 'Updating...' : 'Update Status'}
        </button>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg dark:bg-red-900 dark:border-red-700 dark:text-red-200">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className={`font-medium text-gray-900 dark:text-white mb-2 ${compact ? 'text-sm' : ''}`}>
              Update Result
            </h4>
            <div className="space-y-2">
              <div className={`text-gray-600 dark:text-gray-400 ${compact ? 'text-xs' : 'text-sm'}`}>
                Total Processed: {result.totalProcessed}
              </div>
              <div className={`text-green-600 dark:text-green-400 ${compact ? 'text-xs' : 'text-sm'}`}>
                Successful: {result.successful?.length || 0}
              </div>
              <div className={`text-red-600 dark:text-red-400 ${compact ? 'text-xs' : 'text-sm'}`}>
                Failed: {result.failed?.length || 0}
              </div>
              
              {/* Successful Updates */}
              {result.successful && result.successful.length > 0 && (
                <div className="mt-3">
                  <div className={`font-medium text-gray-900 dark:text-white mb-1 ${compact ? 'text-xs' : 'text-sm'}`}>
                    Successful Updates:
                  </div>
                  <div className="space-y-1">
                    {result.successful.map((success, index) => (
                      <div key={index} className={`text-green-600 dark:text-green-400 ${compact ? 'text-xs' : 'text-sm'}`}>
                        User {success.userId}: Updated to {statusOptions.find(opt => opt.value === success.data.avail_status)?.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Failed Updates */}
              {result.failed && result.failed.length > 0 && (
                <div className="mt-3">
                  <div className={`font-medium text-gray-900 dark:text-white mb-1 ${compact ? 'text-xs' : 'text-sm'}`}>
                    Failed Updates:
                  </div>
                  <div className="space-y-1">
                    {result.failed.map((failure, index) => (
                      <div key={index} className={`text-red-600 dark:text-red-400 ${compact ? 'text-xs' : 'text-sm'}`}>
                        User {failure.userId}: {failure.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickStatusUpdate;
