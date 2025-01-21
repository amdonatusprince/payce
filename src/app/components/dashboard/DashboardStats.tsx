"use client";
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { retrieveRequest } from '@/app/requests/RetrieveRequest';
import { formatUnits } from 'viem';
import { useAppKitAccount } from "@reown/appkit/react";

export const DashboardStats = () => {
  const { address, isConnected } = useAppKitAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState([
    {
      id: 1,
      title: 'Total Inflow',
      value: '0',
      change: '+0%',
      trend: 'up',
      currency: 'USDC'
    },
    {
      id: 2,
      title: 'Total Outflow',
      value: '0',
      change: '-0%',
      trend: 'down',
      currency: 'USDC'
    },
    {
      id: 3,
      title: 'Pending Invoices',
      value: '0',
      change: '+0%',
      trend: 'up',
    },
    {
      id: 4,
      title: 'Overdue Invoices',
      value: '0',
      change: '+0%',
      trend: 'down',
    },
  ]);

  useEffect(() => {
    const calculateStats = async () => {
      if (!isConnected || !address) return;
      setIsLoading(true);
      
      try {
        const requests = await retrieveRequest(address);
        let inflow = 0;
        let outflow = 0;
        let pendingCount = 0;
        let overdueCount = 0;

        requests.forEach((tx) => {
          const currency = tx.currency.split('-')[0];
          if (!['ETH', 'FAU'].includes(currency)) return;

          const amount = parseFloat(formatUnits(BigInt(tx.expectedAmount), 18));
          const isPaid = tx.balance?.balance && BigInt(tx.balance.balance) > 0;
          const isPayee = address.toLowerCase() === tx.payee?.value.toLowerCase();
          const isOverdue = tx.contentData?.dueDate && new Date(tx.contentData.dueDate) < new Date();

          if (isPaid) {
            if (isPayee) {
              inflow += amount;
            } else {
              outflow += amount;
            }
          } else if (isOverdue) {
            overdueCount++;
          } else {
            pendingCount++;
          }
        });

        setStats([
          {
            id: 1,
            title: 'Total Inflow',
            value: inflow.toLocaleString(),
            change: '+12.5%', 
            trend: 'up',
            currency: 'USDC'
          },
          {
            id: 2,
            title: 'Total Outflow',
            value: outflow.toLocaleString(),
            change: '-4.2%',
            trend: 'down',
            currency: 'USDC'
          },
          {
            id: 3,
            title: 'Pending Invoices',
            value: pendingCount.toString(),
            change: '+5.1%',
            trend: 'up',
          },
          {
            id: 4,
            title: 'Overdue Invoices',
            value: overdueCount.toString(),
            change: '-7.3%',
            trend: 'down',
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    calculateStats();
  }, [address, isConnected]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-600 truncate">{stat.title}</p>
              <div className="mt-1 flex items-baseline gap-1">
                {isLoading && isConnected ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
                ) : (
                  <>
                    <p className="text-base md:text-lg font-bold truncate">
                      {stat.value}
                    </p>
                    {stat.currency && (
                      <span className="text-xs text-gray-600 shrink-0">
                        {stat.currency}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className={`flex items-center shrink-0 ml-2 ${
              stat.title === 'Pending Invoices' 
                ? 'text-yellow-500'
                : stat.trend === 'up' 
                  ? 'text-green-500' 
                  : 'text-red-500'
            }`}>
              {stat.title === 'Pending Invoices' ? (
                <ClockIcon className="w-4 h-4" />
              ) : stat.trend === 'up' ? (
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