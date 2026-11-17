import React, { useState, useEffect } from "react";
import BarConversionFunnel from "../charts/bar/BarConversionFunnel"; // Import the chart

export const ConversionFunnel: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Conversion Funnel
          </h3>
        </div>
        {/* Three-dot menu button */}
        <button
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
            />
          </svg>
        </button>
        {/* Dropdown menu */}
        {menuOpen && (
          <div className="absolute right-4 top-10 z-10 w-32 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <button className="block w-full px-4 py-2 text-left text-theme-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700">
              View More
            </button>
            <button className="block w-full px-4 py-2 text-left text-theme-sm text-red-600 hover:bg-gray-50 dark:text-red-500 dark:hover:bg-gray-700">
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Funnel visualization */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      ) : (
        <BarConversionFunnel /> // Use the imported chart here
      )}
    </div>
  );
};