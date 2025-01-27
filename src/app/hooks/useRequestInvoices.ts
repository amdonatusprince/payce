import { useState, useEffect } from 'react';
import { Types } from "@requestnetwork/request-client.js";
import { useAppKitAccount } from "@reown/appkit/react";
import { retrieveRequest } from '@/app/requests/RetrieveRequest';

export const useRequestInvoices = (page: number = 1, limit: number = 5) => {
  const { address, isConnected } = useAppKitAccount();
  const [invoices, setInvoices] = useState<Types.IRequestData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!isConnected || !address) return;
      setIsLoading(true);
      
      try {
        const allRequests = await retrieveRequest(address);
        const filteredRequests = allRequests
          .filter(request => request.contentData?.transactionType === 'invoice')
          .sort((a, b) => b.timestamp - a.timestamp);
        
        const total = filteredRequests.length;
        const start = (page - 1) * limit;
        const end = start + limit;
        
        setInvoices(filteredRequests.slice(start, end));
        setTotalPages(Math.ceil(total / limit));
      } catch (error) {
        console.error('Error fetching Request invoices:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [address, isConnected, page, limit]);

  return { invoices, isLoading, totalPages };
}; 