import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Types } from "@requestnetwork/request-client.js";
import { retrieveRequest } from '@/app/requests/RetrieveRequest';
import { format } from 'date-fns';
import { formatUnits } from 'viem';
import { TransactionModal } from './TransactionModal';
import { exportTransactions } from '@/lib/exportUtils';
import { Currency, Transaction, TransactionStatus } from '@/types';

export const TransactionHistory = () => {
  const { address } = useAccount();
  const [transactions, setTransactions] = useState<Types.IRequestData[]>([]);
  const [selectedTx, setSelectedTx] = useState<Types.IRequestData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;

  const formatCurrency = (currency: string) => currency.split('-')[0];
  const formatAmount = (amount: string | number, decimals: number = 18) => 
    parseFloat(formatUnits(BigInt(amount.toString()), decimals));
  const getStatus = (tx: Types.IRequestData) => {
    if (tx.balance?.balance && BigInt(tx.balance.balance) > 0) {
      return 'paid';
    }
    if (tx.contentData?.dueDate && new Date(tx.contentData.dueDate) < new Date()) return 'overdue';
    return 'pending';
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        if (address) {
          const allRequests = await retrieveRequest(address);
          setTransactions(allRequests.sort((a, b) => b.timestamp - a.timestamp));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [address]);

  const handleExport = (format: 'csv' | 'pdf') => {
    const formattedTransactions: Transaction[] = transactions.map(tx => ({
      id: tx.requestId,
      date: new Date(tx.timestamp * 1000),
      type: tx.contentData?.transactionType || 'Unknown',
      reference: tx.requestId,
      amount: formatAmount(tx.expectedAmount),
      currency: formatCurrency(tx.currency) as Currency,
      description: tx.contentData?.reason || 'No reason provided',
      status: getStatus(tx) as TransactionStatus,
      from: tx.payer?.value || 'Unknown',
      balance: tx.balance?.balance ? formatAmount(tx.balance.balance) : 0
    }));

    exportTransactions(formattedTransactions, format);
  };

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Transaction History</h2>
          <div className="flex gap-4">
            <button 
              onClick={() => handleExport('csv')}
              className="btn-secondary"
            >
              Export CSV
            </button>
            <button 
              onClick={() => handleExport('pdf')}
              className="btn-secondary"
            >
              Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
            <p className="text-gray-600">Loading transaction history...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex justify-center py-12">
            <p className="text-gray-500">No transactions</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentTransactions.map((tx) => (
                <tr 
                  key={tx.requestId}
                  onClick={() => {
                    setSelectedTx(tx);
                    setIsModalOpen(true);
                  }}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {format(new Date(tx.timestamp * 1000), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {`${tx.requestId.slice(0, 6)}...${tx.requestId.slice(-4)}`}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {tx.contentData?.transactionType || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {tx.contentData?.reason || 'No reason provided'}
                  </td>
                  <td className={`px-6 py-4 text-sm text-right whitespace-nowrap ${
                    address?.toLowerCase() === tx.payee?.value.toLowerCase() ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {address?.toLowerCase() === tx.payee?.value.toLowerCase() ? '+' : '-'}
                    {formatAmount(tx.expectedAmount)} {formatCurrency(tx.currency)}
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
        )}
      </div>

      {/* Pagination - separated from transaction data */}
      {!isLoading && transactions.length > 0 && (
        <div className="flex justify-center my-6 pb-4">
          {Array.from({ length: Math.ceil(transactions.length / transactionsPerPage) }, (_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation(); 
                paginate(i + 1);
              }}
              className={`mx-1 px-3 py-1 border rounded ${
                currentPage === i + 1 
                  ? 'btn-primary'
                  : 'btn-secondary'
              }`}
            >
              {i + 1}
            </button>
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