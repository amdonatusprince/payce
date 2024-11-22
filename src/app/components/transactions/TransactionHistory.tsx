import { useState } from 'react';
import { format } from 'date-fns';
import { Transaction } from '@/types';
import { exportTransactions } from '@/lib/exportUtils';

export const TransactionHistory = () => {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');
  const [type, setType] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [currency, setCurrency] = useState<string>('all');

  const handleExport = (format: 'csv' | 'pdf') => {
    exportTransactions(filteredTransactions, format);
  };

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

        <div className="flex gap-4 mt-4">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="p-2 border rounded-lg"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>

          <select 
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="p-2 border rounded-lg"
          >
            <option value="all">All Types</option>
            <option value="incoming">Incoming</option>
            <option value="outgoing">Outgoing</option>
          </select>

          <select 
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="p-2 border rounded-lg"
          >
            <option value="all">All Currencies</option>
            {supportedCurrencies.map(curr => (
              <option key={curr} value={curr}>{curr}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="divide-y">
        {filteredTransactions.map((transaction) => (
          <TransactionRow 
            key={transaction.id} 
            transaction={transaction} 
          />
        ))}
      </div>
    </div>
  );
}; 