import { CurrencyDollarIcon, ClockIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const stats = [
  {
    name: 'Total Outstanding',
    value: '$12,500',
    change: '+4.75%',
    icon: CurrencyDollarIcon,
  },
  {
    name: 'Pending Invoices',
    value: '8',
    change: '+1.15%',
    icon: ClockIcon,
  },
  {
    name: 'Paid This Month',
    value: '$28,750',
    change: '+10.25%',
    icon: CheckCircleIcon,
  },
  {
    name: 'Overdue',
    value: '2',
    change: '-2.30%',
    icon: ExclamationCircleIcon,
  },
];

export const InvoiceStats = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="bg-white rounded-xl shadow-sm p-4 overflow-hidden"
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 p-2 bg-primary-50 rounded-lg">
              <stat.icon className="h-5 w-5 text-primary-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500 truncate">
                {stat.name}
              </p>
              <div className="flex items-baseline space-x-2">
                <p className="text-lg font-semibold text-gray-900 truncate">
                  {stat.value}
                </p>
                <span className={`inline-flex text-xs font-medium ${
                  stat.change.startsWith('+') 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
