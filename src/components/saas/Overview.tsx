import React, { useState } from 'react';

export const Overview: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'Weekly' | 'Monthly' | 'Yearly'>('Monthly');

  return (
    <div className="overview-container rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex flex-col gap-2 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Overview</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['Weekly', 'Monthly', 'Yearly'] as const).map((item) => (
              <button
                key={item}
                onClick={() => setActiveFilter(item)}
                className={`text-theme-sm px-3 py-1.5 rounded-md transition-colors ${
                  item === activeFilter
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white font-medium'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            <span>Filter</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-800">
          <div className="text-theme-sm text-gray-500 dark:text-gray-400 mb-2">Total Revenue</div>
          <div className="text-2xl font-semibold text-gray-800 dark:text-white/90 mb-1">$20,045.87</div>
          <div className="text-theme-xs text-green-500 flex items-center font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
            +2.5%
          </div>
        </div>

        {/* Active Users */}
        <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-800">
          <div className="text-theme-sm text-gray-500 dark:text-gray-400 mb-2">Active Users</div>
          <div className="text-2xl font-semibold text-gray-800 dark:text-white/90 mb-1">9,528</div>
          <div className="text-theme-xs text-green-500 flex items-center font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
            +9.5%
          </div>
        </div>

        {/* Customer Lifetime Value */}
        <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-800">
          <div className="text-theme-sm text-gray-500 dark:text-gray-400 mb-2">Customer Lifetime Value</div>
          <div className="text-2xl font-semibold text-gray-800 dark:text-white/90 mb-1">$849.54</div>
          <div className="text-theme-xs text-red-500 flex items-center font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
            -1.0%
          </div>
        </div>

        {/* Customer Acquisition Cost */}
        <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-800">
          <div className="text-theme-sm text-gray-500 dark:text-gray-400 mb-2">Customer Acquisition Cost</div>
          <div className="text-2xl font-semibold text-gray-800 dark:text-white/90 mb-1">9,528</div>
          <div className="text-theme-xs text-green-500 flex items-center font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
            +3.5%
          </div>
        </div>
      </div>
    </div>
  );
};