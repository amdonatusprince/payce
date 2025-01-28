import { useState, useEffect } from 'react';

export interface SolanaTransaction {
  id: string;
  recipient: string;
  amount: string;
  sender: string;
  recipientName: string;
  currency: string;
  network: string;
  transactionType: 'normal' | 'invoice';
  reason: string;
  timestamp: number;
  explorerUrl: string;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
}

export const useSolanaTransactions = (page: number = 1) => {
  const [transactions, setTransactions] = useState<SolanaTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (page === 0) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/transactions/list?page=${page}&limit=5`);
        const data = await response.json();
        
        if (data.success) {
          setTransactions(data.data);
          setTotalPages(Math.ceil(data.total / data.limit));
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to fetch transactions');
        console.error('Error fetching transactions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [page]);

  return { transactions, isLoading, error, totalPages };
}; 