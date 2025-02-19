'use client';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { Types } from "@requestnetwork/request-client.js";
import { retrieveRequest } from '@/app/requests/RetrieveRequest';
import { formatUnits } from 'viem';
import { TransactionModal } from '../transactions/TransactionModal';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useInflowTransactions } from '@/app/hooks/useInflowTransactions';

export const RecentInflowTransactions = () => {
  const router = useRouter();
  const { address, isConnected } = useAppKitAccount();
  const { caipNetwork } = useAppKitNetwork();
  const isSolanaNetwork = caipNetwork?.name?.toLowerCase().includes('solana');

  // Solana transactions
  const { transactions: solanaTransactions, isLoading: isSolanaLoading } = useInflowTransactions();

  // Request Network transactions
  const [requestTransactions, setRequestTransactions] = useState<Types.IRequestData[]>([]);
  const [isRequestLoading, setIsRequestLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<Types.IRequestData | any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Request Network transactions
  useEffect(() => {
    const fetchRequestTransactions = async () => {
      if (!isSolanaNetwork && isConnected && address) {
        setIsRequestLoading(true);
        try {
          const allRequests: Types.IRequestData[] = await retrieveRequest(address);
          const filteredRequests = allRequests.filter(request => {
            const isPayee = request.payee?.value.toLowerCase() === address.toLowerCase();
            const isPaid = request.balance?.balance && BigInt(request.balance.balance) > 0;
            return isPayee && isPaid;
          });

          const recent = filteredRequests
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 5);
          setRequestTransactions(recent);
        } finally {
          setIsRequestLoading(false);
        }
      }
    };

    fetchRequestTransactions();
  }, [address, isConnected, isSolanaNetwork]);

  const isLoading = isSolanaNetwork ? isSolanaLoading : isRequestLoading;
  const transactions = isSolanaNetwork ? solanaTransactions : requestTransactions;

  const formatCurrency = (currency: string) => {
    return currency.split('-')[0];
  };

  const formatAmount = (amount: string | number, decimals: number = 18) => {
    return parseFloat(formatUnits(BigInt(amount.toString()), decimals));
  };

  const formatAddress = (address: string | undefined) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getAmount = (tx: any) => {
    if (isSolanaNetwork) {
      if (tx.invoice) {
        return `${tx.invoice.amount} ${tx.invoice.currency}`;
      }
      return `${tx.amount} ${tx.currency}`;
    }
    return `${formatAmount(tx.expectedAmount)} ${formatCurrency(tx.currency)}`;
  };
  
  const getSenderAddress = (tx: any) => {
    if (isSolanaNetwork) {
      if (tx.invoice) {
        return formatAddress(tx.invoice.payer);
      }
      return formatAddress(tx.sender);
    }
    return formatAddress(tx.payer?.value);
  };
  
  const getReason = (tx: any) => {
    if (isSolanaNetwork) {
      if (tx.invoice) {
        return tx.invoice.reason || tx.contentData?.paymentDetails?.reason || 'No reason provided';
      }
      return tx.reason || 'No reason provided';
    }
    return tx.contentData?.reason || 'No reason provided';
  };
  
  const getTimestamp = (tx: any) => {
    if (isSolanaNetwork) {
      return new Date(tx.createdAt || tx.timestamp);
    }
    return new Date(tx.timestamp * 1000);
  };
  
  const formatTransactionForModal = (tx: any) => {
    if (isSolanaNetwork) {
      if (tx.invoice) {
        return {
          ...tx,
          expectedAmount: tx.invoice.amount,
          currency: tx.invoice.currency,
          payerAddress: tx.invoice.payer,
          payeeAddress: tx.invoice.payee,
          reason: tx.invoice.reason || tx.contentData?.paymentDetails?.reason,
          dueDate: tx.invoice.dueDate || tx.contentData?.paymentDetails?.dueDate,
          type: 'invoice',
          contentData: {
            ...tx.contentData,
            reason: tx.invoice.reason || tx.contentData?.paymentDetails?.reason
          }
        };
      }
      return tx;
    }
    return tx;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-4 sm:p-6 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-base sm:text-lg font-semibold">Recent Inflows</h2>
          <button 
            onClick={() => router.push('/dashboard/statement')}
            className="text-primary-600 text-sm hover:text-primary-700"
          >
            View All
          </button>
        </div>
      </div>

      {!isConnected ? (
        <div className="flex flex-col items-center justify-center py-8 sm:py-12">
          <p className="text-gray-500 mb-4 text-center px-4">Please connect your wallet to view recent inflows</p>
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
          <p className="text-gray-600">Loading recent inflows...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex justify-center py-8 sm:py-12">
          <p className="text-gray-500">No recent inflows</p>
        </div>
      ) : (
        <div className="divide-y">
          {transactions.map((tx: any) => (
            <div 
              key={isSolanaNetwork ? tx.transactionId : tx.requestId} 
              className="p-3 sm:p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                setSelectedTx(formatTransactionForModal(tx));
                setIsModalOpen(true);
              }}
            >
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    ↓
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">
                      {getReason(tx)}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                      From: {getSenderAddress(tx)}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-green-600 text-sm sm:text-base">
                    +{getAmount(tx)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {format(getTimestamp(tx), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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