import { useState, useEffect } from 'react';
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";

interface AccountStats {
  inflow: {
    total: number;
    count: number;
  };
  outflow: {
    total: number;
    count: number;
  };
  netChange: {
    amount: number;
    isPositive: boolean;
  };
  pendingInflow: {
    total: number;
    count: number;
  };
  pendingOutflow: {
    total: number;
    count: number;
  };
}

export const useAccountStats = () => {
  const { address, isConnected } = useAppKitAccount();
  const { caipNetwork } = useAppKitNetwork();
  const isSolanaNetwork = caipNetwork?.name?.toLowerCase().includes('solana');

  const [stats, setStats] = useState<AccountStats | null>(null);
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
        const response = await fetch(`/api/account/stats?address=${address}`);
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
        console.error('Error fetching account stats:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch account stats'));
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [address, isConnected, isSolanaNetwork]);

  return {
    stats,
    isLoading,
    error,
    isConnected,
    isSolanaNetwork
  };
}; 