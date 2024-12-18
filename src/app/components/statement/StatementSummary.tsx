import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { retrieveRequest } from '@/app/requests/RetrieveRequest';
import { formatUnits } from 'viem';

interface StatementSummaryProps {
  dateRange: {
    from: Date;
    to: Date;
  };
}

export const StatementSummary = ({ dateRange }: StatementSummaryProps) => {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalInflow: 0,
    totalOutflow: 0,
    netChange: 0,
    pendingInflow: 0,
    pendingOutflow: 0,
  });

  useEffect(() => {
    const calculateSummary = async () => {
      if (!address) return;
      setIsLoading(true);
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
            if (isPayee) {
              inflow += amount;
            } else {
              outflow += amount;
            }
          } else {
            if (isPayee) {
              pendingIn += amount;
            } else {
              pendingOut += amount;
            }
          }
        });

        setSummary({
          totalInflow: inflow,
          totalOutflow: outflow,
          netChange: inflow - outflow,
          pendingInflow: pendingIn,
          pendingOutflow: pendingOut,
        });
      } finally {
        setIsLoading(false);
      }
    };

    calculateSummary();
  }, [address]);

  const renderValue = (value: number) => {
    if (isLoading) {
      return (
        <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
      );
    }
    return value.toLocaleString();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Inflow</p>
            <div className="flex items-baseline space-x-1">
              <p className="text-lg font-bold text-green-600">
                +{renderValue(summary.totalInflow)}
              </p>
              <span className="text-xs text-gray-600">ETH</span>
            </div>
          </div>
          <div className="p-2 bg-green-50 rounded-lg">
            <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Outflow</p>
            <div className="flex items-baseline space-x-1">
              <p className="text-lg font-bold text-red-600">
                -{renderValue(summary.totalOutflow)}
              </p>
              <span className="text-xs text-gray-600">ETH</span>
            </div>
          </div>
          <div className="p-2 bg-red-50 rounded-lg">
            <ArrowTrendingDownIcon className="w-5 h-5 text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Net Change</p>
            <div className="flex items-baseline space-x-1">
              <p className={`text-lg font-bold ${
                summary.netChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {summary.netChange >= 0 ? '+' : '-'}
                {Math.abs(summary.netChange).toLocaleString()}
              </p>
              <span className="text-xs text-gray-600">ETH</span>
            </div>
          </div>
          <div className={`p-2 rounded-lg ${
            summary.netChange >= 0 ? 'bg-green-50' : 'bg-red-50'
          }`}>
            {summary.netChange >= 0 ? (
              <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
            ) : (
              <ArrowTrendingDownIcon className="w-5 h-5 text-red-600" />
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div>
          <p className="text-sm text-gray-600">Pending</p>
          <div className="mt-1 space-y-1">
            <div className="flex justify-between text-sm">
              <span>Inflow:</span>
              <div className="flex items-baseline space-x-1">
                <span className="text-green-600">
                  +{renderValue(summary.pendingInflow)}
                </span>
                <span className="text-xs text-gray-600">ETH</span>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span>Outflow:</span>
              <div className="flex items-baseline space-x-1">
                <span className="text-red-600">
                  -{renderValue(summary.pendingOutflow)}
                </span>
                <span className="text-xs text-gray-600">ETH</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 