import React from 'react';

const invoices = [
  { 
    id: 1, 
    serial: '#DF429', 
    date: 'April 28, 2016', 
    user: 'Jenny Wilson', 
    amount: '$473.85', 
    status: 'Complete', 
    statusColor: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
  },
  { 
    id: 2, 
    serial: '#HTY274', 
    date: 'October 30, 2017', 
    user: 'Wade Warren', 
    amount: '$293.01', 
    status: 'Complete', 
    statusColor: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
  },
  { 
    id: 3, 
    serial: '#LKE600', 
    date: 'May 29, 2017', 
    user: 'Darlene Robertson', 
    amount: '$782.01', 
    status: 'Pending', 
    statusColor: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' 
  },
  { 
    id: 4, 
    serial: '#HRP447', 
    date: 'May 20, 2015', 
    user: 'Arlene McCoy', 
    amount: '$202.87', 
    status: 'Cancelled', 
    statusColor: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' 
  },
  { 
    id: 5, 
    serial: '#WRH647', 
    date: 'March 13, 2014', 
    user: 'Bessie Cooper', 
    amount: '$490.51', 
    status: 'Complete', 
    statusColor: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
  },
];

export const RecentInvoices: React.FC = () => {
  return (
    <div className="recent-invoices-card bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md h-full border border-gray-200 dark:border-gray-700">
      <h1 className="text-2xl font-semibold mb-8 text-gray-900 dark:text-white">Recent Invoices</h1>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-200 dark:border-gray-700">
              <th className="pb-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Serial No:</th>
              <th className="pb-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Close Date</th>
              <th className="pb-4 text-sm font-semibold text-gray-500 dark:text-gray-400">User</th>
              <th className="pb-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Amount</th>
              <th className="pb-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(({ id, serial, date, user, amount, status, statusColor }) => (
              <tr key={id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="py-5 text-sm font-semibold text-gray-900 dark:text-white">{serial}</td>
                <td className="py-5 text-sm text-gray-600 dark:text-gray-400">{date}</td>
                <td className="py-5 text-sm text-gray-900 dark:text-white">{user}</td>
                <td className="py-5 text-sm text-gray-900 dark:text-white">{amount}</td>
                <td className="py-5">
                  <span className={`${statusColor} text-xs px-3 py-1 rounded-full font-semibold`}>
                    {status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
