"use client";
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useDashboardStats } from '@/app/hooks/useDashboardStats';
import { useAppKitNetwork } from "@reown/appkit/react";

export const DashboardStats = () => {
  const { stats, isLoading } = useDashboardStats();
  const { caipNetwork } = useAppKitNetwork();

  const isSolanaNetwork = caipNetwork?.name?.toLowerCase().includes('solana');

  if (!isSolanaNetwork) {
    return null;
  }

  const statsConfig = [
    {
      id: 1,
      title: 'Total Inflow',
      value: stats?.inflow.total.toLocaleString() || '0',
      count: stats?.inflow.count || 0,
      icon: ArrowTrendingUpIcon,
      iconBackground: 'bg-green-100',
      iconColor: 'text-green-600',
      currency: 'USDC'
    },
    {
      id: 2,
      title: 'Total Outflow',
      value: stats?.outflow.total.toLocaleString() || '0',
      count: stats?.outflow.count || 0,
      icon: ArrowTrendingDownIcon,
      iconBackground: 'bg-red-100',
      iconColor: 'text-red-600',
      currency: 'USDC'
    },
    {
      id: 3,
      title: 'Pending Invoices',
      value: stats?.pendingInvoices.count.toString() || '0',
      icon: ClockIcon,
      iconBackground: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
    },
    {
      id: 4,
      title: 'Overdue Invoices',
      value: stats?.overdueInvoices.count.toString() || '0',
      icon: ExclamationCircleIcon,
      iconBackground: 'bg-orange-100',
      iconColor: 'text-orange-600',
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
                {isLoading ? (
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
              {(stat.id === 1 || stat.id === 2) && !isLoading && (
                <p className="mt-1 text-xs text-gray-500">
                  {stat.count} transaction{stat.count !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 