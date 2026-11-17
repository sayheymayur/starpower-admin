import React from "react";
import PageMeta from "../../components/common/PageMeta";
// import AcquisitionChannels from "../../components/charts/bar/AcquisitionChannels";
import AnalyticsChart from "../../components/charts/bar/AnalyticsChart";
import SessionsByDevice from "../../components/charts/pi/SessionsByDevice";
import TopChannels from "../../components/Analytics/TopChannels";
import TopPages from "../../components/Analytics/TopPages"; 
import ActiveUsers from "../../components/Analytics/ActiveUsers";
import { Acquisition as AcquisitionChannels } from "../../components/Analytics/AcquisitionChannels";
import CustomersDemographic from "../../components/Analytics/CustomersDemographic";
import RecentOrders from "../../components/Analytics/RecentOrders";


// Placeholder components for analytics widgets
const UniqueVisitors = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm text-gray-900 dark:text-white">
    <h3 className="text-sm font-medium">Unique Visitors</h3>
    <p className="text-3xl font-bold mt-1">24.7K</p>
    <p className="text-green-600 dark:text-green-400 text-sm mt-1 inline-flex items-center">
      +20% <span className="ml-1 text-gray-500 dark:text-gray-400">Vs last month</span>
    </p>
  </div>
);

const TotalPageviews = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm text-gray-900 dark:text-white">
    <h3 className="text-sm font-medium">Total Pageviews</h3>
    <p className="text-3xl font-bold mt-1">55.9K</p>
    <p className="text-green-600 dark:text-green-400 text-sm mt-1 inline-flex items-center">
      +4% <span className="ml-1 text-gray-500 dark:text-gray-400">Vs last month</span>
    </p>
  </div>
);

const BounceRate = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm text-gray-900 dark:text-white">
    <h3 className="text-sm font-medium">Bounce Rate</h3>
    <p className="text-3xl font-bold mt-1">54%</p>
    <p className="text-red-600 dark:text-red-400 text-sm mt-1 inline-flex items-center">
      -1.59% <span className="ml-1 text-gray-500 dark:text-gray-400">Vs last month</span>
    </p>
  </div>
);

const VisitDuration = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm text-gray-900 dark:text-white">
    <h3 className="text-sm font-medium">Visit Duration</h3>
    <p className="text-3xl font-bold mt-1">2m 56s</p>
    <p className="text-green-600 dark:text-green-400 text-sm mt-1 inline-flex items-center">
      +7% <span className="ml-1 text-gray-500 dark:text-gray-400">Vs last month</span>
    </p>
  </div>
);

const Analytics: React.FC = () => {
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen max-w-screen-xl mx-auto">
      <PageMeta title="Analytics Dashboard" description="Analytics overview and metrics" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <UniqueVisitors />
        <TotalPageviews />
        <BounceRate />
        <VisitDuration />
      </div>
      {/* Additional analytics components and charts can be added here */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm text-gray-900 dark:text-white mb-8">
        
        <AnalyticsChart />

        </div>
     
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <TopChannels />
        <TopPages />
        <ActiveUsers />
      </div>

      {/* <AcquisitionChannels />
      <SessionsByDevice /> */}

      {/* make this two graph <AcquisitionChannels />
      <SessionsByDevice /> in one div */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <AcquisitionChannels />
        <SessionsByDevice />
       
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <CustomersDemographic />
        <RecentOrders />
      </div>
    </div>
  );
};

export default Analytics;
