import { useState, useEffect } from 'react';
import { useAppKitAccount } from "@reown/appkit/react";

export interface SolanaInvoice {
  _id: string;
  timestamp: number;
  transactionId: string;
  network: string;
  payerAddress: string;
  payeeAddress: string;
  expectedAmount: string;
  currency: string;
  dueDate: string;
  reason: string;
  contentData: {
    transactionType: string;
    businessDetails: {
      name: string;
      address: string;
      email: string;
    };
    clientDetails: {
      name: string;
      address: string;
      email: string;
    };
    invoiceDetails: {
      items: Array<{
        description: string;
        amount: string;
      }>;
    };
  };
  status: string;
  createdAt: string;
  updatedAt: string;
  explorerUrl?: string;
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
          setInvoices(data.data.map((dbInvoice: any) => ({
            _id: dbInvoice._id,
            timestamp: new Date(dbInvoice.createdAt).getTime(),
            transactionId: dbInvoice.transactionId,
            network: 'solana',
            payerAddress: dbInvoice.contentData.clientDetails.walletAddress,
            payeeAddress: dbInvoice.contentData.metadata.createdBy,
            expectedAmount: dbInvoice.contentData.invoiceDetails.totalAmount,
            currency: dbInvoice.contentData.invoiceDetails.currency,
            dueDate: dbInvoice.contentData.invoiceDetails.dueDate,
            reason: dbInvoice.contentData.invoiceDetails.notes,
            contentData: {
              transactionType: dbInvoice.contentData.transactionType,
              businessDetails: dbInvoice.contentData.businessDetails,
              clientDetails: dbInvoice.contentData.clientDetails,
              invoiceDetails: {
                items: dbInvoice.contentData.invoiceDetails.items
              }
            },
            status: dbInvoice.status,
            createdAt: dbInvoice.createdAt,
            updatedAt: dbInvoice.updatedAt
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