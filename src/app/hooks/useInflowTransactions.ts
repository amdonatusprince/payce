import { useState, useEffect } from 'react';
import { useAppKitAccount } from "@reown/appkit/react";
import { SolanaTransaction } from './useSolanaTransactions';

export const useInflowTransactions = (limit: number = 5) => {
  const { address, isConnected } = useAppKitAccount();
  const [transactions, setTransactions] = useState<SolanaTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!isConnected || !address) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/transactions/inflow?address=${address}&limit=${limit}`
        );
        const data = await response.json();
        
        if (data.success) {
          setTransactions(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to fetch inflow transactions');
        console.error('Error fetching transactions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [address, isConnected, limit]);

  return { transactions, isLoading, error };
}; 