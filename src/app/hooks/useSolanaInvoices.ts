import { useState, useEffect } from 'react';
import { useAppKitAccount } from "@reown/appkit/react";

export interface SolanaInvoice {
  _id: string;
  timestamp: number;
  transactionId: string;
  network: string;
  invoice: {
    payer: string;
    payee: string;
    amount: string;
    currency: string;
    dueDate: string;
    reason: string;
  };
  contentData: {
    transactionType: string;
    clientDetails: {
      name: string;
      address: string;
      email: string;
    };
    businessDetails: {
      name: string;
      address: string;
      email: string;
    };
    paymentDetails: {
      reason: string;
      dueDate: string;
    };
  };
  status: string;
  createdAt: string;
  updatedAt: string;
  explorerUrl?: string;
}

interface ApiInvoice {
  _id: string;
  transactionId: string;
  network: string;
  invoice: {
    payer: string;
    payee: string;
    amount: string;
    currency: string;
    dueDate: string;
    reason: string;
  };
  contentData: {
    transactionType: string;
    clientDetails: {
      name: string;
      address: string;
      email: string;
    };
    businessDetails: {
      name: string;
      address: string;
      email: string;
    };
    paymentDetails: {
      reason: string;
      dueDate: string;
    };
  };
  status: string;
  createdAt: string;
  timestamp: number;
}

export const useSolanaInvoices = (page: number = 1, limit: number = 5) => {
  const { address, isConnected } = useAppKitAccount();
  const [invoices, setInvoices] = useState<SolanaInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!isConnected || !address) return;
      setIsLoading(true);
      
      try {
        const response = await fetch(
          `/api/invoices/list?address=${address}&page=${page}&limit=${limit}`
        );
        const data = await response.json();
        if (data.success) {
          setInvoices(data.data.map((invoice: ApiInvoice) => ({
            _id: invoice._id,
            timestamp: invoice.timestamp,
            transactionId: invoice.transactionId,
            network: invoice.network,
            invoice: {
              payer: invoice.invoice.payer,
              payee: invoice.invoice.payee,
              amount: invoice.invoice.amount,
              currency: invoice.invoice.currency,
              dueDate: invoice.invoice.dueDate,
              reason: invoice.invoice.reason
            },
            contentData: {
              transactionType: invoice.contentData.transactionType,
              clientDetails: invoice.contentData.clientDetails,
              businessDetails: invoice.contentData.businessDetails,
              paymentDetails: invoice.contentData.paymentDetails
            },
            status: invoice.status,
            createdAt: invoice.createdAt,
            updatedAt: invoice.createdAt
          })));
          setTotalPages(Math.ceil(data.total / limit));
        }
      } catch (error) {
        console.error('Error fetching Solana invoices:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [address, isConnected, page, limit]);

  return { invoices, isLoading, totalPages };
}; 