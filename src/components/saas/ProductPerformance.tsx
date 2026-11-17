import React, { useState, useEffect, } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export const ProductPerformance: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Daily Sales');
  const tabs = ['Daily Sales', 'Online Sales', 'New Users'];
  

  // Chart data
  const dailySalesData = [400, 300, 200, 100, 0];
  const onlineSalesData = [200, 150, 100, 50, 0];
  const newUsersData = [200, 150, 100, 50, 0];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Chart options
  const barChartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: {
        show: false,
      },
      fontFamily: 'Outfit, sans-serif',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '39%',
        borderRadius: 5,
        borderRadiusApplication: 'end',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ['transparent'],
    },
    xaxis: {
      categories: days,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px',
          fontFamily: 'Outfit, sans-serif',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: ['#6B7280'],
          fontSize: '12px',
          fontFamily: 'Outfit, sans-serif',
        },
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        
        },
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    colors: ['#3B82F6', '#93C5FD'],
    tooltip: {
      enabled: false,
    },
    legend: {
      show: false,
    },
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Product Performance
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
            <button className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700">
              View More
            </button>
            <button className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 dark:text-red-500 dark:hover:bg-gray-700">
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Tab navigation */}
      <div className="flex w-full items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900 mb-6">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`w-full rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Daily Sales' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 justify-between gap-10 divide-x divide-gray-100 rounded-xl border border-gray-100 bg-white py-4 dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-800/[0.03]">
            <div className="px-5">
              <span className="block text-sm text-gray-500 dark:text-gray-400">Digital Product</span>
              <div className="mt-1 flex items-center gap-2">
                <span className="bg-green-100 dark:bg-green-500/15 text-green-600 inline-flex size-5 items-center justify-center rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M5.56462 1.62411C5.70194 1.47091 5.90136 1.37451 6.12329 1.37451C6.1236 1.37451 6.1239 1.37451 6.12421 1.37451C6.3163 1.37434 6.50845 1.4475 6.65505 1.594L9.65514 4.59199C9.94814 4.88478 9.94831 5.35966 9.65552 5.65265C9.36272 5.94565 8.88785 5.94581 8.59486 5.65302L6.87329 3.93267L6.87329 10.1252C6.87329 10.5394 6.53751 10.8752 6.12329 10.8752C5.70908 10.8752 5.37329 10.5394 5.37329 10.1252L5.37329 3.93597L3.65516 5.65301C3.36218 5.94581 2.8873 5.94566 2.5945 5.65267C2.3017 5.35968 2.30185 4.88481 2.59484 4.59201L5.56462 1.62411Z" fill="currentColor"></path>
                  </svg>
                </span>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {isLoading ? (
                    <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ) : (
                    '790'
                  )}
                </h4>
              </div>
            </div>
            <div className="px-5">
              <span className="block text-sm text-gray-500 dark:text-gray-400">Physical Product</span>
              <div className="mt-1 flex items-center gap-2">
                <span className="bg-red-100 dark:bg-red-500/15 text-red-600 inline-flex size-5 items-center justify-center rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M5.31462 10.3761C5.45194 10.5293 5.65136 10.6257 5.87329 10.6257C5.8736 10.6257 5.8739 10.6257 5.87421 10.6257C6.0663 10.6259 6.25845 10.5527 6.40505 10.4062L9.40514 7.4082C9.69814 7.11541 9.69831 6.64054 9.40552 6.34754C9.11273 6.05454 8.63785 6.05438 8.34486 6.34717L6.62329 8.06753L6.62329 1.875C6.62329 1.46079 6.28751 1.125 5.87329 1.125C5.45908 1.125 5.12329 1.46079 5.12329 1.875L5.12329 8.06422L3.40516 6.34719C3.11218 6.05439 2.6373 6.05454 2.3445 6.34752C2.0517 6.64051 2.05185 7.11538 2.34484 7.40818L5.31462 10.3761Z" fill="currentColor"></path>
                  </svg>
                </span>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {isLoading ? (
                    <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ) : (
                    '572'
                  )}
                </h4>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 px-5 py-4 dark:border-gray-800">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Daily Sales</span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isLoading ? (
                    <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ) : (
                    '$2,950'
                  )}
                </h3>
              </div>
              <div>
                <span className="bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-500 flex items-center gap-1 rounded-full py-0.5 pr-2.5 pl-2 text-sm font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M5.31462 10.3761C5.45194 10.5293 5.65136 10.6257 5.87329 10.6257C5.8736 10.6257 5.8739 10.6257 5.87421 10.6257C6.0663 10.6259 6.25845 10.5527 6.40505 10.4062L9.40514 7.4082C9.69814 7.11541 9.69831 6.64054 9.40552 6.34754C9.11273 6.05454 8.63785 6.05438 8.34486 6.34717L6.62329 8.06753L6.62329 1.875C6.62329 1.46079 6.28751 1.125 5.87329 1.125C5.45908 1.125 5.12329 1.46079 5.12329 1.875L5.12329 8.06422L3.40516 6.34719C3.11218 6.05439 2.6373 6.05454 2.3445 6.34752C2.0517 6.64051 2.05185 7.11538 2.34484 7.40818L5.31462 10.3761Z" fill="currentColor"></path>
                  </svg>
                  {isLoading ? (
                    <div className="h-4 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ) : (
                    '0.52%'
                  )}
                </span>
              </div>
            </div>

            <div className="h-[200px]">
              {isLoading ? (
                <div className="h-full w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                <Chart
                  options={barChartOptions}
                  series={[{ name: 'Sales', data: dailySalesData }]}
                  type="bar"
                  height="100%"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Online Sales' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 justify-between gap-10 divide-x divide-gray-100 rounded-xl border border-gray-100 bg-white py-4 dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-800/[0.03]">
            <div className="px-5">
              <span className="block text-sm text-gray-500 dark:text-gray-400">Digital Product</span>
              <div className="mt-1 flex items-center gap-2">
                <span className="bg-green-100 dark:bg-green-500/15 text-green-600 inline-flex size-5 items-center justify-center rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M5.56462 1.62411C5.70194 1.47091 5.90136 1.37451 6.12329 1.37451C6.1236 1.37451 6.1239 1.37451 6.12421 1.37451C6.3163 1.37434 6.50845 1.4475 6.65505 1.594L9.65514 4.59199C9.94814 4.88478 9.94831 5.35966 9.65552 5.65265C9.36272 5.94565 8.88785 5.94581 8.59486 5.65302L6.87329 3.93267L6.87329 10.1252C6.87329 10.5394 6.53751 10.8752 6.12329 10.8752C5.70908 10.8752 5.37329 10.5394 5.37329 10.1252L5.37329 3.93597L3.65516 5.65301C3.36218 5.94581 2.8873 5.94566 2.5945 5.65267C2.3017 5.35968 2.30185 4.88481 2.59484 4.59201L5.56462 1.62411Z" fill="currentColor"></path>
                  </svg>
                </span>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {isLoading ? (
                    <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ) : (
                    '8,490'
                  )}
                </h4>
              </div>
            </div>
            <div className="px-5">
              <span className="block text-sm text-gray-500 dark:text-gray-400">Physical Product</span>
              <div className="mt-1 flex items-center gap-2">
                <span className="bg-red-100 dark:bg-red-500/15 text-red-600 inline-flex size-5 items-center justify-center rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M5.31462 10.3761C5.45194 10.5293 5.65136 10.6257 5.87329 10.6257C5.8736 10.6257 5.8739 10.6257 5.87421 10.6257C6.0663 10.6259 6.25845 10.5527 6.40505 10.4062L9.40514 7.4082C9.69814 7.11541 9.69831 6.64054 9.40552 6.34754C9.11273 6.05454 8.63785 6.05438 8.34486 6.34717L6.62329 8.06753L6.62329 1.875C6.62329 1.46079 6.28751 1.125 5.87329 1.125C5.45908 1.125 5.12329 1.46079 5.12329 1.875L5.12329 8.06422L3.40516 6.34719C3.11218 6.05439 2.6373 6.05454 2.3445 6.34752C2.0517 6.64051 2.05185 7.11538 2.34484 7.40818L5.31462 10.3761Z" fill="currentColor"></path>
                  </svg>
                </span>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {isLoading ? (
                    <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ) : (
                    '950'
                  )}
                </h4>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 px-5 py-4 dark:border-gray-800">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Online Sales</span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isLoading ? (
                    <div className="h-6 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ) : (
                    '$59,410'
                  )}
                </h3>
              </div>
              <div>
                <span className="bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-500 flex items-center gap-1 rounded-full py-0.5 pr-2.5 pl-2 text-sm font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M5.31462 10.3761C5.45194 10.5293 5.65136 10.6257 5.87329 10.6257C5.8736 10.6257 5.8739 10.6257 5.87421 10.6257C6.0663 10.6259 6.25845 10.5527 6.40505 10.4062L9.40514 7.4082C9.69814 7.11541 9.69831 6.64054 9.40552 6.34754C9.11273 6.05454 8.63785 6.05438 8.34486 6.34717L6.62329 8.06753L6.62329 1.875C6.62329 1.46079 6.28751 1.125 5.87329 1.125C5.45908 1.125 5.12329 1.46079 5.12329 1.875L5.12329 8.06422L3.40516 6.34719C3.11218 6.05439 2.6373 6.05454 2.3445 6.34752C2.0517 6.64051 2.05185 7.11538 2.34484 7.40818L5.31462 10.3761Z" fill="currentColor"></path>
                  </svg>
                  {isLoading ? (
                    <div className="h-4 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ) : (
                    '0.52%'
                  )}
                </span>
              </div>
            </div>

            <div className="h-[200px]">
              {isLoading ? (
                <div className="h-full w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                <Chart
                  options={barChartOptions}
                  series={[{ name: 'Sales', data: onlineSalesData }]}
                  type="bar"
                  height="100%"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'New Users' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 justify-between gap-4 rounded-xl border border-gray-100 bg-white py-4 dark:border-gray-800 dark:bg-gray-800/[0.03]">
            <div className="px-5">
              <div className="flex -space-x-3">
                <div className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-700 ring-2 ring-white dark:ring-gray-800/90">
                  {isLoading ? (
                    <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                  ) : (
                    '10+'
                  )}
                </div>
              </div>
            </div>
            <div className="px-5">
              <span className="block text-sm text-gray-500 dark:text-gray-400">Added last month</span>
              <div className="mt-1 flex items-center gap-2">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {isLoading ? (
                    <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ) : (
                    '8,490'
                  )}
                </h4>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 px-5 py-4 dark:border-gray-800">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total New Users</span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isLoading ? (
                    <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ) : (
                    '5.9K'
                  )}
                </h3>
              </div>
              <div>
                <span className="bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-500 flex items-center gap-1 rounded-full py-0.5 pr-2.5 pl-2 text-sm font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M5.56462 1.62411C5.70194 1.47091 5.90136 1.37451 6.12329 1.37451C6.1236 1.37451 6.12391 1.37451 6.12421 1.37451C6.3163 1.37434 6.50845 1.4475 6.65505 1.594L9.65514 4.59199C9.94814 4.88478 9.94831 5.35966 9.65552 5.65265C9.36272 5.94565 8.88785 5.94581 8.59486 5.65302L6.87329 3.93267L6.87329 10.1252C6.87329 10.5394 6.53751 10.8752 6.12329 10.8752C5.70908 10.8752 5.37329 10.5394 5.37329 10.1252L5.37329 3.93597L3.65516 5.65301C3.36218 5.94581 2.8873 5.94566 2.5945 5.65267C2.3017 5.35968 2.30185 4.88481 2.59484 4.59201L5.56462 1.62411Z" fill="currentColor"></path>
                  </svg>
                  {isLoading ? (
                    <div className="h-4 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ) : (
                    '0.52%'
                  )}
                </span>
              </div>
            </div>

            <div className="h-[200px]">
              {isLoading ? (
                <div className="h-full w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                <Chart
                  options={barChartOptions}
                  series={[{ name: 'Users', data: newUsersData }]}
                  type="bar"
                  height="100%"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};