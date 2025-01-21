import { useState, useEffect } from 'react';
import { Types } from "@requestnetwork/request-client.js";
import { retrieveRequest } from '@/app/requests/RetrieveRequest';
import { format } from 'date-fns';
import { formatUnits } from 'viem';
import { TransactionModal } from './TransactionModal';
import { exportTransactions } from '@/lib/exportUtils';
import { Currency, Transaction, TransactionStatus } from '@/types';
import { getTransactionStatus } from '@/app/requests/utils/transactionStatus';
import { useAppKitAccount } from "@reown/appkit/react";
import Link from 'next/link';

export const TransactionHistory = () => {
  const { address, isConnected } = useAppKitAccount();
  const [transactions, setTransactions] = useState<Types.IRequestData[]>([]);
  const [selectedTx, setSelectedTx] = useState<Types.IRequestData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;

  const formatCurrency = (currency: string) => currency.split('-')[0];
  const formatAmount = (amount: string | number, decimals: number = 18) => 
    parseFloat(formatUnits(BigInt(amount.toString()), decimals));
  const getStatus = (tx: Types.IRequestData) => getTransactionStatus(tx);

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        if (isConnected && address) {
          const allRequests = await retrieveRequest(address);
          setTransactions(allRequests.sort((a, b) => b.timestamp - a.timestamp));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [address, isConnected]);

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

  const totalPages = Math.ceil(transactions.length / transactionsPerPage);
  
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const showPages = 3; // Show only 3 pages total
    
    let startPage = currentPage;
    let endPage = Math.min(startPage + 2, totalPages);
    
    // If we're near the end, adjust the start page
    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      if (i > 0 && i <= totalPages) {
        pageNumbers.push(
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              paginate(i);
            }}
            className={`min-w-[2rem] px-2 py-1 text-xs border rounded ${
              currentPage === i ? 'btn-primary' : 'btn-secondary'
            }`}
          >
            {i}
          </button>
        );
      }
    }

    return pageNumbers;
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-12 bg-white rounded-xl shadow-sm">
        <p className="text-gray-500 mb-4 text-center px-4">Please connect your wallet to view transaction history</p>
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
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl shadow-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-gray-600 text-sm">Loading transaction history...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex justify-center py-12 bg-white rounded-xl shadow-sm">
        <p className="text-gray-500 text-sm">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm w-full max-w-[100vw] overflow-hidden">
      <div className="p-3 sm:p-6 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <h2 className="text-lg sm:text-xl font-semibold">Transaction History</h2>
          <div className="flex gap-2 sm:ml-auto">
            <button 
              onClick={() => handleExport('csv')}
              className="flex-1 sm:flex-none btn-secondary text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2"
            >
              Export CSV
            </button>
            <button 
              onClick={() => handleExport('pdf')}
              className="flex-1 sm:flex-none btn-secondary text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2"
            >
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden sm:block overflow-x-auto">
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
                <td className="px-6 py-4 text-sm text-gray-900">
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
                <td className={`px-6 py-4 text-sm text-right ${
                  address?.toLowerCase() === tx.payee?.value.toLowerCase() ? 'text-green-600' : 'text-red-600'
                }`}>
                  {address?.toLowerCase() === tx.payee?.value.toLowerCase() ? '+' : '-'}
                  {formatAmount(tx.expectedAmount)} {formatCurrency(tx.currency)}
                </td>
                <td className="px-6 py-4">
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

      {/* Mobile View */}
      <div className="sm:hidden divide-y divide-gray-200">
        {currentTransactions.map((tx) => (
          <div
            key={tx.requestId}
            onClick={() => {
              setSelectedTx(tx);
              setIsModalOpen(true);
            }}
            className="p-3 hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="text-xs text-gray-500">
                {format(new Date(tx.timestamp * 1000), 'MMM d, yyyy')}
              </div>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                getStatus(tx) === 'paid' 
                  ? 'bg-green-100 text-green-800'
                  : getStatus(tx) === 'overdue'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {getStatus(tx)}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-baseline gap-2">
                <div className="text-xs font-medium text-gray-900 truncate flex-1">
                  {tx.contentData?.reason || 'No reason provided'}
                </div>
                <div className={`text-xs font-medium whitespace-nowrap ${
                  address?.toLowerCase() === tx.payee?.value.toLowerCase() 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {address?.toLowerCase() === tx.payee?.value.toLowerCase() ? '+' : '-'}
                  {formatAmount(tx.expectedAmount)} {formatCurrency(tx.currency)}
                </div>
              </div>

              <div className="flex justify-between text-xs text-gray-500 gap-2">
                <div className="truncate flex-1">
                  {tx.contentData?.transactionType || 'Unknown'}
                </div>
                <div className="whitespace-nowrap">
                  #{tx.requestId.slice(0, 6)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {transactions.length > transactionsPerPage && (
        <div className="flex items-center justify-center gap-1 my-4 pb-2 px-2">
          {/* Previous button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (currentPage > 1) paginate(currentPage - 1);
            }}
            disabled={currentPage === 1}
            className={`min-w-[2rem] px-2 py-1 text-xs border rounded ${
              currentPage === 1 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'btn-secondary'
            }`}
          >
            ←
          </button>

          {/* Current page indicator */}
          <span className="text-xs text-gray-500 px-2">
            Page {currentPage} of {totalPages}
          </span>

          {/* Next button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (currentPage < totalPages) paginate(currentPage + 1);
            }}
            disabled={currentPage === totalPages}
            className={`min-w-[2rem] px-2 py-1 text-xs border rounded ${
              currentPage === totalPages ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'btn-secondary'
            }`}
          >
            →
          </button>
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