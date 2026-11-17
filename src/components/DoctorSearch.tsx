import React, { useState } from 'react';
import { doctorAvailabilityAPI } from '../services/api';
import type { DoctorStatusResponse } from '../services/api';

interface DoctorSearchProps {
  onDoctorSelect?: (doctor: DoctorStatusResponse) => void;
  placeholder?: string;
  compact?: boolean;
}

const DoctorSearch: React.FC<DoctorSearchProps> = ({
  onDoctorSelect,
  compact = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'userId' | 'phone'>('userId');
  const [results, setResults] = useState<DoctorStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const searchDoctor = async () => {
    if (!searchTerm.trim()) return;

    try {
      setLoading(true);
      setError(null);

      let response;
      if (searchType === 'userId') {
        const userId = parseInt(searchTerm.trim());
        if (isNaN(userId)) {
          throw new Error('Please enter a valid user ID');
        }
        response = await doctorAvailabilityAPI.getStatusByUserId(userId);
      } else {
        response = await doctorAvailabilityAPI.getStatusByPhone(searchTerm.trim());
      }

      setResults(response.data);
      setShowResults(true);
      onDoctorSelect?.(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to search doctor');
      setResults(null);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setResults(null);
    setError(null);
    setShowResults(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchDoctor();
    }
  };

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

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${compact ? 'p-4' : 'p-6'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-medium text-gray-900 dark:text-white ${compact ? 'text-sm' : 'text-lg'}`}>
          Search Doctor
        </h3>
        <button
          onClick={clearSearch}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          Clear
        </button>
      </div>

      <div className="space-y-4">
        {/* Search Type Selection */}
        <div>
          <label className={`block font-medium text-gray-700 dark:text-gray-300 mb-2 ${compact ? 'text-xs' : 'text-sm'}`}>
            Search Type
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => setSearchType('userId')}
              className={`px-3 py-2 text-xs font-medium rounded-md border transition-colors ${
                searchType === 'userId'
                  ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
              }`}
            >
              User ID
            </button>
            <button
              onClick={() => setSearchType('phone')}
              className={`px-3 py-2 text-xs font-medium rounded-md border transition-colors ${
                searchType === 'phone'
                  ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
              }`}
            >
              Phone Number
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div>
          <label className={`block font-medium text-gray-700 dark:text-gray-300 mb-2 ${compact ? 'text-xs' : 'text-sm'}`}>
            {searchType === 'userId' ? 'User ID' : 'Phone Number'}
          </label>
          <div className="flex space-x-2">
            <input
              type={searchType === 'userId' ? 'number' : 'text'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={searchType === 'userId' ? 'Enter user ID' : 'Enter phone number'}
              className={`flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                compact ? 'text-sm' : ''
              }`}
            />
            <button
              onClick={searchDoctor}
              disabled={loading || !searchTerm.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

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

        {/* Search Results */}
        {showResults && results && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className={`font-medium text-gray-900 dark:text-white mb-3 ${compact ? 'text-sm' : ''}`}>
              Search Results
            </h4>
            
            <div className="space-y-3">
              {/* Doctor Info */}
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-medium text-gray-900 dark:text-white ${compact ? 'text-sm' : ''}`}>
                    {results.doctorName || 'Unknown Doctor'}
                  </div>
                  <div className={`text-gray-500 dark:text-gray-400 ${compact ? 'text-xs' : 'text-sm'}`}>
                    ID: {results.userId}
                    {results.mobile_no && ` • ${results.mobile_no}`}
                  </div>
                </div>
                {results.currentStatus && getStatusBadge(results.currentStatus.avail_status)}
              </div>

              {/* Contact Info */}
              {results.email_id && (
                <div className={`text-gray-500 dark:text-gray-400 ${compact ? 'text-xs' : 'text-sm'}`}>
                  Email: {results.email_id}
                </div>
              )}

              {/* Status Info */}
              {results.currentStatus && (
                <div className={`text-gray-500 dark:text-gray-400 ${compact ? 'text-xs' : 'text-sm'}`}>
                  Last updated: {new Date(results.currentStatus.last_update_date_time).toLocaleString()}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => {
                    // You can add more actions here
                    console.log('View details for doctor:', results.userId);
                  }}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
                >
                  View Details
                </button>
                <button
                  onClick={() => {
                    // You can add more actions here
                    console.log('View history for doctor:', results.userId);
                  }}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                >
                  View History
                </button>
              </div>
            </div>
          </div>
        )}

        {/* No Results */}
        {showResults && !results && !error && (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            No doctor found with the provided {searchType === 'userId' ? 'User ID' : 'Phone Number'}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorSearch;
