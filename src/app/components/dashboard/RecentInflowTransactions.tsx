'use client';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Types } from "@requestnetwork/request-client.js";
import { retrieveRequest } from '@/app/requests/RetrieveRequest';
import { formatUnits } from 'viem';
import { TransactionModal } from '../transactions/TransactionModal';
import { useRouter } from 'next/navigation';

export const RecentInflowTransactions = () => {
  const router = useRouter();
  const { address } = useAccount();
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
        if (address) {
          const allRequests = await retrieveRequest(address);
          
          // Filter only created transactions where the current user is the payee
          const filteredRequests = allRequests.filter(request => 
            request.state === 'created' || 
            (request.state === 'accepted' && request.payee?.value.toLowerCase() === address.toLowerCase())
          );

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
  }, [address]);

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Recent Inflows</h2>
          <button 
            onClick={() => router.push('/dashboard/statement')}
            className="text-primary-600 text-sm hover:text-primary-700"
          >
            View All
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">Loading recent inflows...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex justify-center py-12">
          <p className="text-gray-500">No recent inflows</p>
        </div>
      ) : (
        <div className="divide-y">
          {transactions.map((tx) => (
            <div 
              key={tx.requestId} 
              className="p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                setSelectedTx(tx);
                setIsModalOpen(true);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    ↓
                  </div>
                  <div>
                    <p className="font-medium">{tx.contentData?.reason || 'No reason provided'}</p>
                    <p className="text-sm text-gray-600">
                      From: {`${tx.payer?.value.slice(0, 6)}...${tx.payer?.value.slice(-4)}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    +{formatAmount(tx.expectedAmount)} {formatCurrency(tx.currency)}
                  </p>
                  <p className="text-sm text-gray-600">
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