import { useState, useEffect } from 'react';
import dashboardAPI from '../services/dashboardAPI';

interface ServiceStatus {
  hasDownServices: boolean;
  downServiceCount: number;
  downServiceNames: string[];
}

export const useServiceStatus = (refreshInterval: number = 30000) => {
  const [status, setStatus] = useState<ServiceStatus>({
    hasDownServices: false,
    downServiceCount: 0,
    downServiceNames: [],
  });
  const [loading, setLoading] = useState(true);

  const checkServices = async () => {
    try {
      const response = await dashboardAPI.getServicesStatus(true);
      
      if (response.success && response.data) {
        const services = response.data.services || [];
        const downServices = services.filter((service: any) => service.status === 'down');
        
        setStatus({
          hasDownServices: downServices.length > 0,
          downServiceCount: downServices.length,
          downServiceNames: downServices.map((service: any) => service.name),
        });
      }
    } catch (error) {
      console.error('Error checking service status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkServices();
    
    const interval = setInterval(checkServices, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { ...status, loading, refresh: checkServices };
};
