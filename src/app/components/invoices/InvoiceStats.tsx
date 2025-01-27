import { CurrencyDollarIcon, ClockIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useInvoiceStats } from '@/app/hooks/useInvoiceStats';
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useRequestData } from '@/app/hooks/useRequestData';

export const InvoiceStats = () => {
  const { isConnected } = useAppKitAccount();
  const { caipNetwork } = useAppKitNetwork();
  const isSolanaNetwork = caipNetwork?.name.toLowerCase().includes('solana');

  // Use MongoDB stats for Solana network
  const { stats: solanaStats, isLoading: isSolanaLoading } = useInvoiceStats();
  
  // Use original request data for other networks
  const { stats: requestStats, isLoading: isRequestLoading } = useRequestData();

  const stats = isSolanaNetwork ? solanaStats : requestStats;
  const isLoading = isSolanaNetwork ? isSolanaLoading : isRequestLoading;

  const statsConfig = [
    {
      id: 1,
      title: 'Total Outstanding',
      value: stats ? stats.outstanding.amount.toLocaleString(undefined, { maximumFractionDigits: 4 }) : '0',
      count: stats?.outstanding.count || 0,
      icon: CurrencyDollarIcon,
      iconBackground: 'bg-blue-100',
      iconColor: 'text-blue-600',
      currency: isSolanaNetwork ? 'USDC' : 'ETH'
    },
    {
      id: 2,
      title: 'Pending Invoices',
      value: stats ? stats.outstanding.count.toString() : '0',
      icon: ClockIcon,
      iconBackground: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    {
      id: 3,
      title: 'Total Paid',
      value: stats ? stats.paid.amount.toLocaleString(undefined, { maximumFractionDigits: 4 }) : '0',
      count: stats?.paid.count || 0,
      icon: CheckCircleIcon,
      iconBackground: 'bg-green-100',
      iconColor: 'text-green-600',
      currency: 'USDC'
    },
    {
      id: 4,
      title: 'Overdue',
      value: stats ? stats.overdue.count.toString() : '0',
      icon: ExclamationCircleIcon,
      iconBackground: 'bg-red-100',
      iconColor: 'text-red-600'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsConfig.map((stat) => (
        <div
          key={stat.id}
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className={`${stat.iconBackground} p-3 rounded-lg`}>
              <stat.icon className={`h-6 w-6 ${stat.iconColor}`} aria-hidden="true" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <div className="flex items-baseline gap-1">
                {isLoading && isConnected ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
                ) : (
                  <>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </p>
                    {stat.currency && (
                      <span className="text-sm text-gray-600">
                        {stat.currency}
                      </span>
                    )}
                  </>
                )}
              </div>
              {(stat.id === 1 || stat.id === 3) && !isLoading && isConnected && (
                <p className="mt-1 text-xs text-gray-500">
                  {stat.count} invoice{stat.count !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
