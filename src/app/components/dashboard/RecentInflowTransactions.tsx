'use client';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { Types } from "@requestnetwork/request-client.js";
import { retrieveRequest } from '@/app/requests/RetrieveRequest';
import { formatUnits } from 'viem';
import { TransactionModal } from '../transactions/TransactionModal';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppKitAccount } from "@reown/appkit/react";

export const RecentInflowTransactions = () => {
  const router = useRouter();
  const { address, isConnected } = useAppKitAccount();
  const [transactions, setTransactions] = useState<Types.IRequestData[]>([]);
  const [selectedTx, setSelectedTx] = useState<Types.IRequestData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const formatCurrency = (currency: string) => {
    return currency.split('-')[0];
  };

  const formatAmount = (amount: string | number, decimals: number = 18) => {
    return parseFloat(formatUnits(BigInt(amount.toString()), decimals));
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        if (isConnected && address) {
          const allRequests: Types.IRequestData[] = await retrieveRequest(address);
          // Filter only completed inflow transactions (where user is payee and payment is complete)
          const filteredRequests = allRequests.filter(request => {
            const isPayee = request.payee?.value.toLowerCase() === address.toLowerCase();
            const isPaid = request.balance?.balance && 
              BigInt(request.balance.balance) > 0;
            
            return isPayee && isPaid; // Only show completed payments
          });

          const recent = filteredRequests
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 5);
          setTransactions(recent);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [address, isConnected]);

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
          {transactions.map((tx) => (
            <div 
              key={tx.requestId} 
              className="p-3 sm:p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                setSelectedTx(tx);
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
                      {tx.contentData?.reason || 'No reason provided'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                      From: {`${tx.payer?.value.slice(0, 6)}...${tx.payer?.value.slice(-4)}`}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-green-600 text-sm sm:text-base">
                    +{formatAmount(tx.expectedAmount)} {formatCurrency(tx.currency)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {format(new Date(tx.timestamp * 1000), 'MMM d, yyyy')}
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
        />
      )}
    </div>
  );
}; 