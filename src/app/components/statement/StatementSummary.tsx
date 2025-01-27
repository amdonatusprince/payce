import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ArrowsRightLeftIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useAccountStats } from '@/app/hooks/useAccountStats';
import { retrieveRequest } from '@/app/requests/RetrieveRequest';
import { formatUnits } from 'viem';
import { useState, useEffect } from 'react';

interface StatementSummaryProps {
  dateRange: {
    from: Date;
    to: Date;
  };
}

interface AccountStats {
  inflow: {
    total: number;
    count: number;
  };
  outflow: {
    total: number;
    count: number;
  };
  netChange: {
    amount: number;
    isPositive: boolean;
  };
  pendingInflow: {
    total: number;
    count: number;
  };
  pendingOutflow: {
    total: number;
    count: number;
  };
}

interface RequestStats {
  totalInflow: number;
  totalOutflow: number;
  netChange: number;
  pendingInflow: number;
  pendingOutflow: number;
}

const isSolanaStats = (stats: AccountStats | RequestStats): stats is AccountStats => {
  return 'inflow' in stats;
};

export const StatementSummary = ({ dateRange }: StatementSummaryProps) => {
  const { address, isConnected } = useAppKitAccount();
  const { caipNetwork } = useAppKitNetwork();
  const isSolanaNetwork = caipNetwork?.name?.toLowerCase().includes('solana');

  // Solana stats
  const { stats: solanaStats, isLoading: isSolanaLoading } = useAccountStats() as { 
    stats: AccountStats | null; 
    isLoading: boolean 
  };

  // Request Network stats
  const [requestStats, setRequestStats] = useState({
    totalInflow: 0,
    totalOutflow: 0,
    netChange: 0,
    pendingInflow: 0,
    pendingOutflow: 0,
  });
  const [isRequestLoading, setIsRequestLoading] = useState(false);

  // Fetch Request Network stats
  useEffect(() => {
    const calculateRequestStats = async () => {
      if (!isConnected || !address || isSolanaNetwork) return;
      setIsRequestLoading(true);
      try {
        const requests = await retrieveRequest(address);
        const validCurrencies = ['ETH', 'FAU'];
        
        let inflow = 0;
        let outflow = 0;
        let pendingIn = 0;
        let pendingOut = 0;

        requests.forEach((tx) => {
          const currency = tx.currency.split('-')[0];
          if (!validCurrencies.includes(currency)) return;

          const amount = parseFloat(formatUnits(BigInt(tx.expectedAmount), 18));
          const isPaid = tx.balance?.balance && BigInt(tx.balance.balance) > 0;
          const isPayee = address.toLowerCase() === tx.payee?.value.toLowerCase();

          if (isPaid) {
            if (isPayee) inflow += amount;
            else outflow += amount;
          } else {
            if (isPayee) pendingIn += amount;
            else pendingOut += amount;
          }
        });

        setRequestStats({
          totalInflow: inflow,
          totalOutflow: outflow,
          netChange: inflow - outflow,
          pendingInflow: pendingIn,
          pendingOutflow: pendingOut,
        });
      } finally {
        setIsRequestLoading(false);
      }
    };

    calculateRequestStats();
  }, [address, isConnected, isSolanaNetwork]);

  const stats = isSolanaNetwork ? solanaStats : requestStats;
  const isLoading = isSolanaNetwork ? isSolanaLoading : isRequestLoading;
  const currency = isSolanaNetwork ? 'USDC' : 'ETH';

  const statsConfig = [
    {
      id: 1,
      title: 'Total Inflow',
      value: stats && isSolanaStats(stats) 
        ? stats.inflow.total 
        : stats?.totalInflow || 0,
      count: stats && isSolanaStats(stats) ? stats.inflow.count : undefined,
      icon: ArrowTrendingUpIcon,
      iconBackground: 'bg-green-100',
      iconColor: 'text-green-600',
      textColor: 'text-green-600'
    },
    {
      id: 2,
      title: 'Total Outflow',
      value: stats && isSolanaStats(stats) 
        ? stats.outflow.total 
        : stats?.totalOutflow || 0,
      count: stats && isSolanaStats(stats) ? stats.outflow.count : undefined,
      icon: ArrowTrendingDownIcon,
      iconBackground: 'bg-red-100',
      iconColor: 'text-red-600',
      textColor: 'text-red-600'
    },
    {
      id: 3,
      title: 'Net Change',
      value: stats && isSolanaStats(stats) 
        ? stats.netChange.amount 
        : stats?.netChange || 0,
      isPositive: stats && isSolanaStats(stats) 
        ? stats.netChange.isPositive
        : (stats?.netChange || 0) >= 0,
      icon: ArrowsRightLeftIcon,
      iconBackground: 'bg-blue-100',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-600'
    },
    {
      id: 4,
      title: 'Pending',
      inflow: stats && isSolanaStats(stats) 
        ? stats.pendingInflow.total 
        : stats?.pendingInflow || 0,
      outflow: stats && isSolanaStats(stats) 
        ? stats.pendingOutflow.total 
        : stats?.pendingOutflow || 0,
      icon: ClockIcon,
      iconBackground: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    }
  ];

  return (
    <div className="w-full max-w-[100vw] px-2 sm:px-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsConfig.map((stat) => (
          <div
            key={stat.id}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                {stat.id === 4 ? (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-baseline space-x-1">
                      <p className="text-sm text-green-600">
                        +{isLoading ? '-' : (stat.inflow ?? 0).toLocaleString()}
                      </p>
                      <span className="text-xs text-gray-600">{currency}</span>
                    </div>
                    <div className="flex items-baseline space-x-1">
                      <p className="text-sm text-red-600">
                        -{isLoading ? '-' : (stat.outflow ?? 0).toLocaleString()}
                      </p>
                      <span className="text-xs text-gray-600">{currency}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    <div className="flex items-baseline space-x-1">
                      <p className={`text-lg font-semibold ${
                        stat.id === 3 
                          ? stat.isPositive ? 'text-green-600' : 'text-red-600'
                          : stat.textColor
                      }`}>
                        {stat.id === 3 && (stat.value ?? 0) >= 0 ? '+' : ''}
                        {isLoading ? '-' : (stat.value ?? 0).toLocaleString()}
                      </p>
                      <span className="text-sm text-gray-600">{currency}</span>
                    </div>
                    {stat.count !== undefined && !isLoading && (
                      <p className="mt-1 text-xs text-gray-500">
                        {stat.count} transaction{stat.count !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className={`${stat.iconBackground} p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 