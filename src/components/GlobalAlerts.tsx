import React from 'react';
import { useAlert } from '../context/AlertContext';
import Alert from './ui/alert/Alert';

const GlobalAlerts: React.FC = () => {
  const { alerts, removeAlert } = useAlert();

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-16 left-4 right-4 z-40 space-y-2 max-w-4xl mx-auto lg:top-20">
      {alerts.map((alert) => (
        <div key={alert.id} className="relative">
          <Alert
            variant={alert.variant}
            title={alert.title}
            message={alert.message}
          />
          {alert.dismissible !== false && (
            <button
              type="button"
              onClick={() => removeAlert(alert.id)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Dismiss alert"
            >
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default GlobalAlerts;
