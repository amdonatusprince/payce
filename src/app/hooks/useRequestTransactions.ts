import { useState, useEffect } from 'react';
import { Types } from "@requestnetwork/request-client.js";
import { retrieveRequest } from '@/app/requests/RetrieveRequest';
import { useAppKitAccount } from "@reown/appkit/react";

export const useRequestTransactions = (page: number = 1) => {
  const [transactions, setTransactions] = useState<Types.IRequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const { address, isConnected } = useAppKitAccount();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!isConnected || !address || page === 0) return;
      
      setIsLoading(true);
      try {
        const allRequests: Types.IRequestData[] = await retrieveRequest(address);
        // Filter only completed outflow transactions
        const filteredRequests = allRequests.filter(request => {
          const isPayer = request.payer?.value.toLowerCase() === address.toLowerCase();
          const isPaid = request.balance?.balance && 
            BigInt(request.balance.balance) > 0;
          
          return isPayer && isPaid;
        });

        // Calculate pagination
        const limit = 5;
        const start = (page - 1) * limit;
        const end = start + limit;
        
        const paginatedRequests = filteredRequests
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(start, end);
        
        setTransactions(paginatedRequests);
        setTotalPages(Math.ceil(filteredRequests.length / limit));
      } catch (err) {
        setError('Failed to fetch transactions');
        console.error('Error fetching transactions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [address, isConnected, page]);

  return { transactions, isLoading, error, totalPages };
}; 