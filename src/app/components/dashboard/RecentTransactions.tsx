import { format } from 'date-fns';

const transactions = [
  {
    id: 1,
    type: 'incoming',
    amount: 1500,
    currency: 'USDC',
    description: 'Payment for design work',
    date: new Date(),
    status: 'completed',
    from: '0x1234...5678',
  },
  // Add more dummy transactions
];

export const RecentTransactions = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <button className="text-primary-600 text-sm hover:text-primary-700">
            View All
          </button>
        </div>
      </div>

      <div className="divide-y">
        {transactions.map((tx) => (
          <div key={tx.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.type === 'incoming' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {tx.type === 'incoming' ? '↓' : '↑'}
                </div>
                <div>
                  <p className="font-medium">{tx.description}</p>
                  <p className="text-sm text-gray-600">
                    From: {tx.from}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  tx.type === 'incoming' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {tx.type === 'incoming' ? '+' : '-'}
                  {tx.amount} {tx.currency}
                </p>
                <p className="text-sm text-gray-600">
                  {format(tx.date, 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 