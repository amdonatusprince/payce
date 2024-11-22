import { useState } from 'react';
import { format } from 'date-fns';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

interface Transaction {
  id: string;
  date: Date;
  description: string;
  type: 'inflow' | 'outflow';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  reference: string;
}

interface DateRange {
  from: Date;
  to: Date;
}

export const AccountStatement = ({ dateRange }: { dateRange: DateRange })  => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    // Dummy data
    {
      id: '1',
      date: new Date(),
      description: 'Payment from Client A',
      type: 'inflow',
      amount: 1500,
      currency: 'USDC',
      status: 'completed',
      reference: 'INV-001'
    },
    // Add more dummy transactions
  ]);

  const exportStatement = (format: 'csv' | 'pdf') => {
    // Implementation for export functionality
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Transaction History</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => exportStatement('csv')}
              className="btn-secondary"
            >
              Export CSV
            </button>
            <button 
              onClick={() => exportStatement('pdf')}
              className="btn-secondary"
            >
              Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {format(transaction.date, 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center">
                    {transaction.type === 'inflow' ? (
                      <ArrowUpIcon className="w-4 h-4 text-green-500 mr-2" />
                    ) : (
                      <ArrowDownIcon className="w-4 h-4 text-red-500 mr-2" />
                    )}
                    {transaction.description}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {transaction.reference}
                </td>
                <td className={`px-6 py-4 text-sm text-right whitespace-nowrap ${
                  transaction.type === 'inflow' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'inflow' ? '+' : '-'}
                  {transaction.amount} {transaction.currency}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    transaction.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : transaction.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 