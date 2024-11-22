import { ArrowTrendingDownIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

const stats = [
  {
    id: 1,
    title: 'Total Balance',
    value: '$15,000',
    change: '+12.5%',
    trend: 'up',
    currency: 'USDC'
  },
  {
    id: 2,
    title: 'Monthly Volume',
    value: '$45,000',
    change: '+8.2%',
    trend: 'up',
    currency: 'USDC'
  },
  {
    id: 3,
    title: 'Active Invoices',
    value: '12',
    change: '-2.3%',
    trend: 'down',
  },
  {
    id: 4,
    title: 'Available Credit',
    value: '$25,000',
    change: '+5.1%',
    trend: 'up',
    currency: 'USDC'
  },
];

export const DashboardStats = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start space-x-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-600 truncate">{stat.title}</p>
              <div className="mt-1 flex items-baseline space-x-1">
                <p className="text-lg font-bold truncate">
                  {stat.value}
                </p>
                {stat.currency && (
                  <span className="text-xs text-gray-600">
                    {stat.currency}
                  </span>
                )}
              </div>
            </div>
            <div className={`flex items-center flex-shrink-0 ${
              stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
            }`}>
              {stat.trend === 'up' ? (
                <ArrowTrendingUpIcon className="w-4 h-4" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4" />
              )}
              <span className="ml-1 text-xs whitespace-nowrap">{stat.change}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 