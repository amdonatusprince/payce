'use client';
import { format } from 'date-fns';
import { useState } from 'react';
import { TransactionModal } from './TransactionModal';
import Link from 'next/link';
import { useAppKitAccount } from "@reown/appkit/react";
import { useSolanaTransactions, SolanaTransaction } from '@/app/hooks/useSolanaTransactions';
import { useRequestTransactions } from '@/app/hooks/useRequestTransactions';
import { Types } from "@requestnetwork/request-client.js";
import { SolanaInvoice } from '@/app/hooks/useSolanaInvoices';

const isSolanaInvoice = (tx: any): tx is SolanaInvoice => 
  'invoice' in tx;

const isSolanaTx = (tx: any): tx is SolanaTransaction => 
  'transactionType' in tx && !('invoice' in tx);

export const RecentPaymentTransactions = () => {
  const { address, isConnected } = useAppKitAccount();
  const [selectedTx, setSelectedTx] = useState<Types.IRequestData | SolanaTransaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage] = useState(1);

  // Fetch both types of transactions
  const { 
    transactions: solanaTransactions, 
    isLoading: isSolanaLoading,
  } = useSolanaTransactions(currentPage);
  
  const { 
    transactions: requestTransactions, 
    isLoading: isRequestLoading 
  } = useRequestTransactions(currentPage);

  const isLoading = isSolanaLoading || isRequestLoading;

  // Combine and sort transactions
  const allTransactions = [...solanaTransactions, ...requestTransactions]
    .sort((a, b) => {
      if ('transaction' in a && 'transaction' in b) {
        return b.timestamp - a.timestamp;
      }
      if ('requestId' in a && 'requestId' in b) {
        return b.timestamp - a.timestamp;
      }
      return 0;
    })
    .slice(0, 5); // Only show latest 5

  const isSolanaTransaction = (tx: any): tx is SolanaTransaction => {
    return 'transaction' in tx;
  };

  const getTransactionDetails = (tx: Types.IRequestData | SolanaTransaction | SolanaInvoice) => {
    if (isSolanaInvoice(tx)) {
      return {
        id: tx._id,
        date: format(new Date(tx.timestamp), 'MMM d, yyyy'),
        amount: tx.invoice.amount,
        currency: tx.invoice.currency,
        recipient: tx.invoice.payee,
        reason: tx.invoice.reason || 'No reason provided'
      };
    }
    if (isSolanaTx(tx)) {
      return {
        id: tx.id,
        date: format(new Date(tx.timestamp), 'MMM d, yyyy'),
        amount: tx.amount,
        currency: tx.currency,
        recipient: tx.recipient,
        reason: tx.reason || 'No reason provided'
      };
    }
    return {
      id: tx.requestId,
      date: format(new Date(tx.timestamp * 1000), 'MMM d, yyyy'),
      amount: tx.expectedAmount,
      currency: tx.currency.split('-')[0],
      recipient: tx.payee?.value || 'Unknown',
      reason: tx.contentData?.reason || 'No reason provided'
    };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {!isConnected ? (
        <div className="flex flex-col items-center justify-center py-8 sm:py-12">
          <p className="text-gray-500 mb-4 text-center px-4">Please connect your wallet to view recent outflows</p>
          <Link 
            href="/dashboard/settings"
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2"
          >
            Go to Settings
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center py-8 sm:py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">Loading recent outflows...</p>
        </div>
      ) : allTransactions.length === 0 ? (
        <div className="flex justify-center py-8 sm:py-12">
          <p className="text-gray-500">No recent outflows</p>
        </div>
      ) : (
        <div className="divide-y">
          {allTransactions.map((tx) => {
            const details = getTransactionDetails(tx);
            const uniqueKey = Math.random().toString();
            
            return (
              <div 
                key={uniqueKey}
                className="p-3 sm:p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSelectedTx(tx);
                  setIsModalOpen(true);
                }}
              >
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      ↑
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">
                        {details.reason}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">
                        To: {`${details.recipient.slice(0, 6)}...${details.recipient.slice(-4)}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-red-600 text-sm sm:text-base">
                      -{details.amount} {details.currency}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {details.date}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Transaction Modal */}
      {selectedTx && (
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          transaction={selectedTx}
          isSolanaTransaction={isSolanaTransaction(selectedTx)}
        />
      )}
    </div>
  );
};
