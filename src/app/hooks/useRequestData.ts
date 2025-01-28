import { useState, useEffect } from 'react';
import { useAppKitAccount } from "@reown/appkit/react";
import { retrieveRequest } from '@/app/requests/RetrieveRequest';
import { formatUnits } from 'viem';

export const useRequestData = () => {
  const { address, isConnected } = useAppKitAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<{
    outstanding: { amount: number; count: number };
    paid: { amount: number; count: number };
    overdue: { count: number };
  } | null>(null);

  useEffect(() => {
    const calculateStats = async () => {
      if (!isConnected || !address) return;
      setIsLoading(true);
  
      try {
        const requests = await retrieveRequest(address);
        let totalOutstanding = 0;
        let pendingCount = 0;
        let totalPaid = 0;
        let overdueCount = 0;
  
        const invoices = requests.filter(
          (request) =>
            request.contentData?.transactionType === 'invoice' &&
            request.payer?.value.toLowerCase() === address.toLowerCase()
        );
  
        invoices.forEach((invoice) => {
          const currency = invoice.currency.split('-')[0];
          if (!['ETH', 'FAU'].includes(currency)) return;
  
          const amount = parseFloat(formatUnits(BigInt(invoice.expectedAmount), 18));
          const dueDate = new Date(invoice.contentData?.dueDate);
          const balance = invoice.balance?.balance ? BigInt(invoice.balance.balance) : BigInt(0);
  
          if (balance > 0) {
            // Paid invoices
            totalPaid += amount;
          } else {
            // Unpaid invoices
            totalOutstanding += amount;
            if (dueDate > new Date()) {
              pendingCount++;
            } else {
              overdueCount++;
            }
          }
        });
  
        setStats({
          outstanding: {
            amount: totalOutstanding,
            count: pendingCount
          },
          paid: {
            amount: totalPaid,
            count: invoices.length - pendingCount - overdueCount
          },
          overdue: {
            count: overdueCount
          }
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    calculateStats();
  }, [address, isConnected]);

  return {
    stats,
    isLoading
  };
}; 