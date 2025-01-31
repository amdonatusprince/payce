import { useState, useEffect } from 'react';
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { format } from 'date-fns';
import { TransactionModal } from '../transactions/TransactionModal';
import Link from 'next/link';
import { formatUnits } from 'viem';
import { Types } from "@requestnetwork/request-client.js";
import { retrieveRequest } from '@/app/requests/RetrieveRequest';

interface DateRange {
  from: Date;
  to: Date;
}

export const AccountStatement = ({ dateRange }: { dateRange: DateRange }) => {
  const { address, isConnected } = useAppKitAccount();
  const { caipNetwork } = useAppKitNetwork();
  const isSolanaNetwork = caipNetwork?.name?.toLowerCase().includes('solana');
  
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch Solana transactions
  const fetchSolanaTransactions = async () => {
    try {
      const response = await fetch(`/api/transactions/all?address=${address}&page=${page}`);
      const data = await response.json();
      
      if (data.success) {
        setTransactions(data.data.transactions);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error('Error:', err);
    }
  };

  // Fetch Request Network transactions
  const fetchRequestTransactions = async () => {
    try {
      if (!address) return;
      const requests = await retrieveRequest(address);
      setTransactions(requests);
      setTotalPages(1); // Request Network doesn't support pagination
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error('Error:', err);
    }
  };

  useEffect(() => {
    if (!isConnected || !address) return;

    setIsLoading(true);
    setError(null);

    const fetchData = async () => {
      if (isSolanaNetwork) {
        await fetchSolanaTransactions();
      } else {
        await fetchRequestTransactions();
      }
      setIsLoading(false);
    };

    fetchData();
  }, [address, isConnected, isSolanaNetwork, page]);

  const formatAddress = (addr: string) => {
    if (!addr) return 'Unknown';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getTransactionDetails = (tx: any) => {
    if (isSolanaNetwork) {
      if (tx.type === 'invoice') {
        // Format invoice transaction
        return {
          date: format(new Date(tx.date), 'MMM d, yyyy'),
          transactionId: tx.transactionId || '-',
          type: 'invoice',
          amount: `${tx.isOutgoing ? '-' : '+'}${tx.expectedAmount} ${tx.currency}`,
          isDebit: tx.isOutgoing,
          status: tx.status,
          payer: formatAddress(tx.payerAddress),
          recipient: formatAddress(tx.payeeAddress),
          dueDate: tx.dueDate ? format(new Date(tx.dueDate), 'MMM d, yyyy') : '-',
          // Add these fields to match the modal's expected structure
          invoice: {
            payer: tx.payerAddress,
            payee: tx.payeeAddress,
            amount: tx.expectedAmount,
            currency: tx.currency,
            dueDate: tx.dueDate,
            reason: tx.reason
          },
          contentData: {
            transactionType: 'invoice',
            businessDetails: tx.contentData?.businessDetails,
            clientDetails: tx.contentData?.clientDetails,
            invoiceDetails: tx.contentData?.invoiceDetails
          }
        };
      } else {
        // Format regular payment transaction
        return {
          date: format(new Date(tx.date), 'MMM d, yyyy'),
          transactionId: tx.transactionId || '-',
          type: 'payment',
          amount: `${tx.isOutgoing ? '-' : '+'}${tx.amount} ${tx.currency}`,
          isDebit: tx.isOutgoing,
          status: 'completed',
          payer: formatAddress(tx.sender || tx.counterparty),
          recipient: formatAddress(tx.recipient || address),
          dueDate: '-',
          // Add fields for regular transaction
          sender: tx.sender,
          reason: tx.reason,
          network: tx.network,
          explorerUrl: tx.explorerUrl
        };
      }
    } else {
      const amount = formatUnits(BigInt(tx.expectedAmount), 18);
      const currency = tx.currency.split('-')[0];
      const isPaid = tx.balance?.balance && BigInt(tx.balance.balance) > 0;
      const isDebit = address?.toLowerCase() === tx.payer?.value.toLowerCase();
      return {
        date: format(new Date(tx.timestamp * 1000), 'MMM d, yyyy'),
        transactionId: tx.requestId ? `${tx.requestId.slice(0, 4)}...${tx.requestId.slice(-4)}` : '',
        type: 'request',
        amount: `${isDebit ? '-' : '+'}${amount} ${currency}`,
        isDebit,
        status: isPaid ? 'paid' : 'pending',
        payer: formatAddress(tx.payer?.value || ''),
        recipient: formatAddress(tx.payee?.value || ''),
        dueDate: tx.contentData?.dueDate 
          ? format(new Date(tx.contentData.dueDate), 'MMM d, yyyy')
          : '-'
      };
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 mb-4">Connect your wallet to view transactions</p>
        <Link 
          href="/dashboard/settings"
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Go to Settings
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-12">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full max-w-[100vw] px-2 sm:px-0">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Desktop View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-[12%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                <th className="w-[8%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="w-[12%] px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payer</th>
                <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
                <th className="w-[13%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((tx, index) => {
                const details = getTransactionDetails(tx);
                return (
                  <tr 
                    key={index}
                    onClick={() => {
                      setSelectedTx(tx);
                      setIsModalOpen(true);
                    }}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {details.date}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {details.transactionId}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {details.type}
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium text-right ${
                      details.isDebit ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {details.amount}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        details.status === 'completed' || details.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : details.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {details.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {details.payer}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {details.recipient}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {details.dueDate}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View - Updated with new fields */}
        <div className="sm:hidden divide-y divide-gray-200">
          {transactions.map((tx, index) => {
            const details = getTransactionDetails(tx);
            return (
              <div
                key={index}
                onClick={() => {
                  setSelectedTx(tx);
                  setIsModalOpen(true);
                }}
                className="p-4 hover:bg-gray-50 cursor-pointer space-y-2"
              >
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-900">{details.date}</span>
                  <span className={`px-2 text-xs leading-5 font-semibold rounded-full ${
                    details.status === 'completed' || details.status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : details.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {details.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium capitalize">{details.type}</span>
                  <span className={`text-sm font-medium ${
                    details.isDebit ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {details.amount}
                  </span>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>ID: {details.transactionId}</div>
                  <div>From: {details.payer}</div>
                  <div>To: {details.recipient}</div>
                  {details.dueDate !== '-' && (
                    <div>Due: {details.dueDate}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 bg-gray-50 border-t">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-white border disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded bg-white border disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      {selectedTx && (
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          transaction={selectedTx}
          isSolanaTransaction={isSolanaNetwork}
        />
      )}
    </div>
  );
}; 