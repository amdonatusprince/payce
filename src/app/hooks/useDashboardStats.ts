import { useState, useEffect } from 'react';
import { useAppKitAccount } from "@reown/appkit/react";

interface DashboardStats {
  pendingInvoices: {
    count: number;
  };
  overdueInvoices: {
    count: number;
  };
  inflow: {
    total: number;
    count: number;
  };
  outflow: {
    total: number;
    count: number;
  };
}

export const useDashboardStats = () => {
  const { address, isConnected } = useAppKitAccount();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isConnected || !address) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/dashboard/stats?address=${address}`);
        const data = await response.json();
        
        if (data.success) {
          setStats(data.stats);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to fetch dashboard stats');
        console.error('Error fetching stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [address, isConnected]);

  return { stats, isLoading, error };
}; 