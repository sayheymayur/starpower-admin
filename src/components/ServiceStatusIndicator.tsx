import React, { useState } from 'react';
import { useServiceStatus } from '../hooks/useServiceStatus';
import { Link } from 'react-router';

const ServiceStatusIndicator: React.FC = () => {
  const { hasDownServices, downServiceCount, downServiceNames, loading } = useServiceStatus();
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  if (loading) {
    return null;
  }

  if (!hasDownServices) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-xs font-medium text-green-700 dark:text-green-300">
          All Services Up
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      <Link
        to="/services-status"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        onMouseEnter={() => setIsTooltipOpen(true)}
        onMouseLeave={() => setIsTooltipOpen(false)}
      >
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        <span className="text-xs font-medium text-red-700 dark:text-red-300">
          {downServiceCount} Service{downServiceCount !== 1 ? 's' : ''} Down
        </span>
        <svg
          className="w-3 h-3 text-red-600 dark:text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Link>

      {/* Tooltip */}
      {isTooltipOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-3">
          <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Down Services
          </div>
          <div className="space-y-1">
            {downServiceNames.map((serviceName) => (
              <div
                key={serviceName}
                className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                {serviceName}
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Click to view details
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceStatusIndicator;
