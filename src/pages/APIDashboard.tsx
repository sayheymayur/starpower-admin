import { useNavigate } from "react-router-dom";

interface APICard {
  title: string;
  description: string;
  route: string;
  icon: string;
  color: string;
  features: string[];
}

export default function APIDashboard() {
  const navigate = useNavigate();

  const apiCards: APICard[] = [
    {
      title: "Enhanced User Management",
      description: "Comprehensive user data with statistics and detailed information",
      route: "/enhanced-users",
      icon: "👥",
      color: "bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
      features: [
        "Advanced filtering and search",
        "KYC status tracking",
        "User statistics",
        "Detailed user profiles",
      ],
    },
    {
      title: "Session History",
      description: "View and manage all session data with comprehensive details",
      route: "/sessionhistory",
      icon: "💬",
      color: "bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800",
      features: [
        "Session filtering",
        "Duration tracking",
        "Cost calculations",
        "Status management",
      ],
    },
    {
      title: "Analytics Dashboard",
      description: "Real-time insights and performance metrics",
      route: "/analytics-dashboard",
      icon: "📊",
      color: "bg-purple-100 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
      features: [
        "User growth metrics",
        "Session analytics",
        "Revenue tracking",
        "Engagement stats",
      ],
    },
    {
      title: "Wallet Management",
      description: "Manage wallet transactions and view financial statistics",
      route: "/wallet-management",
      icon: "💰",
      color: "bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
      features: [
        "Transaction history",
        "Balance tracking",
        "Payment types",
        "Financial reports",
      ],
    },
    {
      title: "Activity Tracking",
      description: "Real-time user activity monitoring",
      route: "/activity-tracking",
      icon: "🎯",
      color: "bg-pink-100 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800",
      features: [
        "Live activity feed",
        "User actions",
        "Auto-refresh",
        "Activity types",
      ],
    },
    {
      title: "Listeners Management",
      description: "Manage doctor/listener profiles and availability",
      route: "/listeners",
      icon: "🩺",
      color: "bg-indigo-100 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800",
      features: [
        "Listener profiles",
        "Specializations",
        "Availability status",
        "Performance metrics",
      ],
    },
    {
      title: "Regular Users",
      description: "Basic user management interface",
      route: "/users",
      icon: "👤",
      color: "bg-teal-100 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800",
      features: [
        "User list",
        "Basic filtering",
        "Quick actions",
        "User details",
      ],
    },
    {
      title: "Doctor Availability",
      description: "Manage doctor availability status",
      route: "/doctor-availability",
      icon: "🏥",
      color: "bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800",
      features: [
        "Status management",
        "Availability history",
        "Bulk operations",
        "Statistics",
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Dashboard API Management</h1>
        <p className="text-blue-100 text-lg">
          Comprehensive interface for all Dashboard APIs and endpoints
        </p>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-sm text-blue-100">Total Endpoints</p>
            <p className="text-2xl font-bold">100+</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-sm text-blue-100">API Categories</p>
            <p className="text-2xl font-bold">10</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-sm text-blue-100">Active Pages</p>
            <p className="text-2xl font-bold">{apiCards.length}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-sm text-blue-100">Status</p>
            <p className="text-2xl font-bold">✅ Online</p>
          </div>
        </div>
      </div>

      {/* API Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apiCards.map((card) => (
          <div
            key={card.route}
            className={`${card.color} rounded-lg border p-6 hover:shadow-lg transition-shadow cursor-pointer`}
            onClick={() => navigate(card.route)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">{card.icon}</div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(card.route);
                }}
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-3 py-1 rounded text-sm font-medium"
              >
                Open →
              </button>
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {card.title}
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              {card.description}
            </p>

            <div className="space-y-1">
              {card.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* API Documentation Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          API Categories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              User Management APIs
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Get All Users (Basic & Enhanced)</li>
              <li>• Get All Listeners</li>
              <li>• Get User Statistics</li>
              <li>• Get User by ID</li>
              <li>• Enhanced User Details (Comprehensive)</li>
              <li>• Update User (Basic & Enhanced)</li>
              <li>• Bulk Update Users</li>
              <li>• Update User Status</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Session Management APIs
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Get All Sessions</li>
              <li>• Get Sessions by User</li>
              <li>• Get Sessions by Listener</li>
              <li>• Get Sessions by Date Range</li>
              <li>• Get Session Statistics</li>
              <li>• Get Session Details (Comprehensive)</li>
              <li>• Update Session</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Wallet & Financial APIs
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Get Wallet Transactions</li>
              <li>• Get User Wallet Balance</li>
              <li>• Get Wallet Statistics</li>
              <li>• Transaction filtering by type</li>
              <li>• Date range filtering</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Analytics APIs
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Get Dashboard Analytics</li>
              <li>• Get User Analytics</li>
              <li>• User Growth Metrics</li>
              <li>• Session Metrics</li>
              <li>• Revenue Metrics</li>
              <li>• User Engagement Stats</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Activity Tracking APIs
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Get Latest Activity</li>
              <li>• Get Activity by User</li>
              <li>• Real-time tracking</li>
              <li>• Activity type filtering</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Doctor Management APIs
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Get Doctor Availability</li>
              <li>• Update Availability Status</li>
              <li>• Get Availability Statistics</li>
              <li>• Bulk Status Updates</li>
              <li>• Availability History</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Quick Links
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate("/enhanced-users")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded font-medium text-sm"
          >
            Enhanced Users
          </button>
          <button
            onClick={() => navigate("/sessionhistory")}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded font-medium text-sm"
          >
            Session History
          </button>
          <button
            onClick={() => navigate("/analytics-dashboard")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded font-medium text-sm"
          >
            Analytics
          </button>
          <button
            onClick={() => navigate("/wallet-management")}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded font-medium text-sm"
          >
            Wallet
          </button>
          <button
            onClick={() => navigate("/activity-tracking")}
            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-3 rounded font-medium text-sm"
          >
            Activity
          </button>
          <button
            onClick={() => navigate("/listeners")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded font-medium text-sm"
          >
            Listeners
          </button>
          <button
            onClick={() => navigate("/users")}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded font-medium text-sm"
          >
            Users
          </button>
          <button
            onClick={() => navigate("/doctor-availability")}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded font-medium text-sm"
          >
            Availability
          </button>
        </div>
      </div>

      {/* Base URL Info */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
          API Configuration
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Base URL:</span>
            <code className="bg-white dark:bg-gray-800 px-3 py-1 rounded text-blue-600 dark:text-blue-400">
              https://paapi.sayhey.co.in/api/dashboard/api
            </code>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Authentication:</span>
            <span className="text-green-600 dark:text-green-400">JWT Token (Optional)</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Response Format:</span>
            <span className="text-gray-900 dark:text-white">JSON</span>
          </div>
        </div>
      </div>
    </div>
  );
}

