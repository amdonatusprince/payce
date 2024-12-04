import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Types } from "@requestnetwork/request-client.js";
import { retrieveRequest } from '@/app/requests/RetrieveRequest';
import { formatUnits } from 'viem';
import { TransactionModal } from '../transactions/TransactionModal';

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

  const getStatus = (invoice: Types.IRequestData) => {
    if (invoice.balance?.balance && BigInt(invoice.balance.balance) >= BigInt(invoice.expectedAmount)) {
      return 'paid';
    }
    if (new Date(invoice.contentData?.dueDate) < new Date()) return 'overdue';
    return 'pending';
  };

  const formatCurrency = (currency: string) => {
    return currency.split('-')[0];
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-gray-600">Loading recent invoices...</p>
      </div>
    );
  }
  if (invoices.length === 0) {
    return <p className="text-gray-500 flex justify-center py-12">No recent invoices</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr 
                key={invoice.requestId}
                onClick={() => {
                  setSelectedTx(invoice);
                  setIsModalOpen(true);
                }}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {format(new Date(invoice.timestamp * 1000), 'MMM d, yyyy')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {`${invoice.requestId.slice(0, 6)}...${invoice.requestId.slice(-4)}`}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {invoice.contentData?.clientDetails?.name || 'Unknown Client'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatAmount(invoice.expectedAmount)} {formatCurrency(invoice.currency)}
                  </div>
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
