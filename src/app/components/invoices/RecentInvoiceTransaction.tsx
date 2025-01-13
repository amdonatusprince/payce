import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Types } from "@requestnetwork/request-client.js";
import { retrieveRequest } from '@/app/requests/RetrieveRequest';
import { formatUnits } from 'viem';
import { TransactionModal } from '../transactions/TransactionModal';
import { getTransactionStatus } from '@/app/requests/utils/transactionStatus';

export const RecentInvoiceTransactions = () => {
  const { address } = useAccount();
  const [invoices, setInvoices] = useState<Types.IRequestData[]>([]);
  const [selectedTx, setSelectedTx] = useState<Types.IRequestData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      setIsLoading(true);
      try {
        if (address) {
          const allRequests = await retrieveRequest(address);
          const filteredRequests = allRequests
            .filter(request => request.contentData?.transactionType === 'invoice')
            .sort((a, b) => b.timestamp - a.timestamp);
          setInvoices(filteredRequests);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [address]);

  const formatAmount = (amount: string | number, decimals: number = 18) => {
    return parseFloat(formatUnits(BigInt(amount.toString()), decimals));
  };

  const getStatus = (tx: Types.IRequestData) => getTransactionStatus(tx);


  const formatCurrency = (currency: string) => {
    return currency.split('-')[0];
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-gray-600 text-sm">Loading recent invoices...</p>
      </div>
    );
  }

  if (invoices.length === 0) {
    return <p className="text-gray-500 flex justify-center py-12 text-sm">No recent invoices</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm w-full max-w-[100vw] overflow-hidden">
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
            {invoices.map((invoice) => (
              <tr 
                key={invoice.requestId}
                onClick={() => {
                  setSelectedTx(invoice);
                  setIsModalOpen(true);
                }}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(invoice.timestamp * 1000), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {`${invoice.requestId.slice(0, 6)}...${invoice.requestId.slice(-4)}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {invoice.contentData?.clientDetails?.name || 'Unknown Client'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatAmount(invoice.expectedAmount)} {formatCurrency(invoice.currency)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    getStatus(invoice) === 'paid' 
                      ? 'bg-green-100 text-green-800'
                      : getStatus(invoice) === 'overdue'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {getStatus(invoice)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {invoice.contentData?.dueDate 
                    ? format(new Date(invoice.contentData.dueDate), 'MMM d, yyyy')
                    : 'No due date'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="sm:hidden divide-y divide-gray-200">
        {invoices.map((invoice) => (
          <div
            key={invoice.requestId}
            onClick={() => {
              setSelectedTx(invoice);
              setIsModalOpen(true);
            }}
            className="p-3 hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="text-xs text-gray-500">
                {format(new Date(invoice.timestamp * 1000), 'MMM d, yyyy')}
              </div>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                getStatus(invoice) === 'paid' 
                  ? 'bg-green-100 text-green-800'
                  : getStatus(invoice) === 'overdue'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {getStatus(invoice)}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-baseline gap-2">
                <div className="text-xs font-medium text-gray-900 truncate flex-1">
                  {invoice.contentData?.clientDetails?.name || 'Unknown Client'}
                </div>
                <div className="text-xs font-medium whitespace-nowrap">
                  {formatAmount(invoice.expectedAmount)} {formatCurrency(invoice.currency)}
                </div>
              </div>

              <div className="flex justify-between text-xs text-gray-500 gap-2">
                <div className="truncate flex-1">
                  Due: {invoice.contentData?.dueDate 
                    ? format(new Date(invoice.contentData.dueDate), 'MMM d, yyyy')
                    : 'No due date'}
                </div>
                <div className="whitespace-nowrap">
                  #{invoice.requestId.slice(0, 6)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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
