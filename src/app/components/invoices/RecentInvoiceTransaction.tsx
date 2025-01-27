import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { TransactionModal } from '../transactions/TransactionModal';
import { useSolanaInvoices } from '@/app/hooks/useSolanaInvoices';
import { useRequestInvoices } from '@/app/hooks/useRequestInvoices';
import Link from 'next/link';
import { formatUnits } from 'viem';
import { Types } from "@requestnetwork/request-client.js";
import { SolanaInvoice } from '@/app/hooks/useSolanaInvoices';

export const RecentInvoiceTransactions = () => {
  const { isConnected } = useAppKitAccount();
  const { caipNetwork } = useAppKitNetwork();
  const [page, setPage] = useState(1);
  const [selectedTx, setSelectedTx] = useState<Types.IRequestData | SolanaInvoice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if network is Solana (either mainnet or devnet)
  const isSolanaNetwork = caipNetwork?.name.toLowerCase().includes('solana');

  // Only fetch Solana invoices if on Solana network
  const {
    invoices: solanaInvoices,
    isLoading: isSolanaLoading,
    totalPages: solanaTotalPages
  } = useSolanaInvoices(isSolanaNetwork ? page : 0);

  // Only fetch Request invoices if not on Solana network
  const {
    invoices: requestInvoices,
    isLoading: isRequestLoading,
    totalPages: requestTotalPages
  } = useRequestInvoices(!isSolanaNetwork ? page : 0);

  // Use appropriate data based on network
  const invoices = isSolanaNetwork ? solanaInvoices : requestInvoices;
  const isLoading = isSolanaNetwork ? isSolanaLoading : isRequestLoading;
  const totalPages = isSolanaNetwork ? solanaTotalPages : requestTotalPages;

  // Reset page when network changes
  useEffect(() => {
    setPage(1);
  }, [caipNetwork]);

  const formatAmount = (amount: string | number, decimals: number = 18) => {
    return parseFloat(formatUnits(BigInt(amount.toString()), decimals));
  };

  const getStatus = (invoice: any) => {
    // If it's a Solana invoice
    if ('status' in invoice) {
      return invoice.status.toLowerCase();
    }
    
    // If it's a Request invoice (keep existing logic)
    const currentTime = Math.floor(Date.now() / 1000);
    const dueDate = new Date(invoice.contentData?.dueDate).getTime() / 1000;
    
    if (invoice.state === 'paid') return 'paid';
    if (currentTime > dueDate) return 'overdue';
    return 'pending';
  };

  const formatCurrency = (currency: string) => {
    return currency.split('-')[0];
  };

  const getInvoiceAmount = (invoice: SolanaInvoice | Types.IRequestData) => {
    if ('expectedAmount' in invoice) {
      return `${formatAmount(invoice.expectedAmount)} ${formatCurrency(invoice.currency)}`;
    }
    return `${invoice.invoice.amount} ${invoice.invoice.currency}`;
  };

  const getInvoiceDetails = (invoice: SolanaInvoice | Types.IRequestData) => {
    if ('invoice' in invoice) {
      return {
        id: invoice.transactionId,
        date: format(new Date(invoice.timestamp), 'MMM d, yyyy'),
        clientName: invoice.contentData.clientDetails.name,
        amount: `${invoice.invoice.amount} ${invoice.invoice.currency}`,
        status: invoice.status.toLowerCase(),
        dueDate: invoice.invoice.dueDate
      };
    }
    return {
      id: invoice.requestId,
      date: format(new Date(invoice.timestamp * 1000), 'MMM d, yyyy'),
      clientName: invoice.contentData?.clientDetails?.name || 'Unknown Client',
      amount: `${formatAmount(invoice.expectedAmount)} ${formatCurrency(invoice.currency)}`,
      status: getStatus(invoice),
      dueDate: invoice.contentData?.dueDate
    };
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-gray-600 text-sm">Loading recent invoices...</p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-600 text-sm">Connect your wallet to view invoices</p>
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

  if (invoices.length === 0) {
    return <p className="text-gray-500 flex justify-center py-12 text-sm">No recent invoices</p>;
  }

  // Add pagination controls
  const Pagination = () => (
    <div className="flex justify-center gap-2 mt-4">
      <button
        onClick={() => setPage(p => Math.max(1, p - 1))}
        disabled={page === 1}
        className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50"
      >
        Previous
      </button>
      <span className="px-3 py-1">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
        disabled={page === totalPages}
        className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop View */}
      <div className="hidden sm:block">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoices.map((invoice) => {
              const details = getInvoiceDetails(invoice);
              return (
                <tr 
                  key={details.id}
                  onClick={() => {
                    setSelectedTx(invoice);
                    setIsModalOpen(true);
                  }}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {details.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {`${details.id.slice(0, 6)}...${details.id.slice(-4)}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {details.clientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {details.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      details.status === 'paid' 
                        ? 'bg-green-100 text-green-800'
                        : details.status === 'overdue'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {details.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {details.dueDate 
                      ? format(new Date(details.dueDate), 'MMM d, yyyy')
                      : 'No due date'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="sm:hidden divide-y divide-gray-200">
        {invoices.map((invoice) => {
          const details = getInvoiceDetails(invoice);
          return (
            <div
              key={details.id}
              onClick={() => {
                setSelectedTx(invoice);
                setIsModalOpen(true);
              }}
              className="p-3 hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="text-xs text-gray-500">
                  {details.date}
                </div>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  details.status === 'paid' 
                    ? 'bg-green-100 text-green-800'
                    : details.status === 'overdue'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {details.status}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-baseline gap-2">
                  <div className="text-xs font-medium text-gray-900 truncate flex-1">
                    {details.clientName}
                  </div>
                  <div className="text-xs font-medium whitespace-nowrap">
                    {details.amount}
                  </div>
                </div>

                <div className="flex justify-between text-xs text-gray-500 gap-2">
                  <div className="truncate flex-1">
                    Due: {details.dueDate 
                      ? format(new Date(details.dueDate), 'MMM d, yyyy')
                      : 'No due date'}
                  </div>
                  <div className="whitespace-nowrap">
                    {details.id.slice(0, 6)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Pagination />
      {selectedTx && (
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          transaction={selectedTx}
        />
      )}
    </>
  );
};
