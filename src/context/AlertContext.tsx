import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Alert {
  id: string;
  variant: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  dismissible?: boolean;
  persistent?: boolean;
  autoHideDuration?: number;
}

interface AlertContextType {
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id'>) => string;
  removeAlert: (id: string) => void;
  clearAllAlerts: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const addAlert = (alert: Omit<Alert, 'id'>): string => {
    const id = Math.random().toString(36).substr(2, 9);
    const newAlert: Alert = {
      id,
      autoHideDuration: 5000,
      dismissible: true,
      ...alert,
    };

    setAlerts(prev => {
      // Check if similar alert already exists
      const exists = prev.some(existing => 
        existing.variant === newAlert.variant && 
        existing.title === newAlert.title &&
        existing.message === newAlert.message
      );
      
      if (exists) return prev;
      
      return [...prev, newAlert];
    });

    // Auto-dismiss if not persistent
    if (!newAlert.persistent && newAlert.autoHideDuration) {
      setTimeout(() => {
        removeAlert(id);
      }, newAlert.autoHideDuration);
    }

    return id;
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  return (
    <AlertContext.Provider value={{ alerts, addAlert, removeAlert, clearAllAlerts }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
