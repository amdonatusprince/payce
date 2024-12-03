import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Types } from "@requestnetwork/request-client.js";
import { retrieveRequest } from '@/app/requests/RetrieveRequest';
import { format } from 'date-fns';
import { formatUnits } from 'viem';
import { TransactionModal } from './TransactionModal';

export function RecentPaymentTransactions() {
  const { address } = useAccount();
  const [recentTransactions, setRecentTransactions] = useState<Types.IRequestData[]>([]);
  const [selectedTx, setSelectedTx] = useState<Types.IRequestData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const formatCurrency = (currency: string) => {
    return currency.split('-')[0];
  };

  useEffect(() => {
    const fetchRecentTransactions = async () => {
      setIsLoading(true);
      try {
        if (address) {
          const allRequests = await retrieveRequest(address);
          
          // Filter only payment transactions
          const filteredRequests = allRequests.filter(request => 
            request.contentData?.transactionType === 'single_forwarder' || 
            request.contentData?.transactionType === 'batch_payment'
          );

          const recent = filteredRequests
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 5);
          setRecentTransactions(recent);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentTransactions();
  }, [address]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-gray-600">Loading recent transactions...</p>
      </div>
    );
  }

  const formatAmount = (amount: number | string, decimals: number = 18) => {
    return parseFloat(formatUnits(BigInt(amount.toString()), decimals));
  };

  const handleRowClick = (tx: Types.IRequestData) => {
    setSelectedTx(tx);
    setIsModalOpen(true);
  };

  const getStatus = (tx: Types.IRequestData) => {
    if (tx.balance?.balance && BigInt(tx.balance.balance) >= 0 ) {
      return 'paid';
    }
    if (tx.contentData?.dueDate && new Date(tx.contentData.dueDate) < new Date()) return 'overdue';
    return 'pending';
  };

  if (recentTransactions.length === 0) {
    return <p className="text-gray-500 flex justify-center py-12">No recent transactions</p>;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Txn ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Currency</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {recentTransactions.map((tx) => (
              <tr 
                key={tx.requestId} 
                onClick={() => handleRowClick(tx)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {format(new Date(tx.timestamp * 1000), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center">
                    {`${tx.requestId.slice(0, 6)}...${tx.requestId.slice(-4)}`}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {`${tx.payer?.value.slice(0, 6)}...${tx.payer?.value.slice(-4)}`}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {`${tx.payee?.value.slice(0, 6)}...${tx.payee?.value.slice(-4)}`}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatCurrency(tx.currency)}
                </td>
                <td className={`px-6 py-4 text-sm text-right whitespace-nowrap ${
                  address?.toLowerCase() === tx.payee?.value.toLowerCase() ? 'text-green-600' : 'text-red-600'
                }`}>
                  {address?.toLowerCase() === tx.payee?.value.toLowerCase() ? '+' : '-'}
                  {formatAmount(tx.expectedAmount, 18)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    getStatus(tx) === 'paid' 
                      ? 'bg-green-100 text-green-800'
                      : getStatus(tx) === 'overdue'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {getStatus(tx)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Transaction Modal */}
      {selectedTx && (
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          transaction={selectedTx}
        />
      )}
    </>
  );
}
