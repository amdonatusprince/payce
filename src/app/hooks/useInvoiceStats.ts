import { useState, useEffect } from 'react';
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";

interface InvoiceStats {
  outstanding: {
    amount: number;
    count: number;
  };
  paid: {
    amount: number;
    count: number;
  };
  overdue: {
    count: number;
  };
}

export const useInvoiceStats = () => {
  const { address, isConnected } = useAppKitAccount();
  const { caipNetwork } = useAppKitNetwork();
  const isSolanaNetwork = caipNetwork?.name?.toLowerCase().includes('solana');

  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      // Only fetch if connected, has address, and is on Solana network
      if (!isConnected || !address || !isSolanaNetwork) {
        setStats(null);
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/invoices/stats?address=${address}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch stats');
        }

        if (data.success) {
          setStats(data.stats);
        } else {
          throw new Error(data.message);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch stats'));
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [address, isConnected, isSolanaNetwork]);

  const refresh = async () => {
    setStats(null);
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/invoices/stats');
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      setStats(data.stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch stats'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    stats,
    isLoading,
    error,
    isConnected,
    isSolanaNetwork,
    refresh
  };
}; 