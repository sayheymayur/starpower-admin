import React from 'react';

const activities = [
  {
    id: 1,
    name: 'Francisco Grbbs',
    action: 'created invoice',
    invoice: 'PQ-4491C',
    time: 'Just Now',
    isNew: true,
  },
  {
    id: 2,
    name: 'Courtney Henry',
    action: 'created invoice',
    invoice: 'HK-234G',
    time: '15 minutes ago',
    isNew: false,
  },
  {
    id: 3,
    name: 'Bessie Cooper',
    action: 'created invoice',
    invoice: 'LH-2891C',
    time: '5 months ago',
    isNew: false,
  },
  {
    id: 4,
    name: 'Theresa Web',
    action: 'created invoice',
    invoice: 'CK-125NH',
    time: '2 weeks ago',
    isNew: false,
  },
];

export const Activities: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">Activities</h1>
      
      <div className="space-y-6">
        {activities.map((activity) => (
          <div key={activity.id} className="flex flex-col">
            {activity.isNew && (
              <span className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">
                New invoice
              </span>
            )}
            <div className="text-base text-gray-900 dark:text-white">
              <strong>{activity.name}</strong> {activity.action}
            </div>
            <div className="text-base text-gray-500 dark:text-gray-400 mt-2">
              {activity.invoice}
            </div>
            <div className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              {activity.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
