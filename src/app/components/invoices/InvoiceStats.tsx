import { CurrencyDollarIcon, ClockIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { retrieveRequest } from '@/app/requests/RetrieveRequest';
import { formatUnits } from 'viem';
import { Types } from "@requestnetwork/request-client.js";

export const InvoiceStats = () => {
  const { address } = useAccount();
  const [stats, setStats] = useState([
    {
      name: 'Total Outstanding',
      value: '0',
      change: '+0%',
      icon: CurrencyDollarIcon,
      currency: 'ETH'
    },
    {
      name: 'Pending Invoices',
      value: '0',
      change: '+0%',
      icon: ClockIcon,
    },
    {
      name: 'Paid This Month',
      value: '0',
      change: '+0%',
      icon: CheckCircleIcon,
      currency: 'ETH'
    },
    {
      name: 'Overdue',
      value: '0',
      change: '+0%',
      icon: ExclamationCircleIcon,
    },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  const getStatus = (invoice: Types.IRequestData) => {
    if (invoice.balance?.balance && BigInt(invoice.balance.balance) > BigInt(0)) {
      return 'paid';
    }
    if (new Date(invoice.contentData?.dueDate) < new Date()) return 'overdue';
    return 'pending';
  };

  useEffect(() => {
    const calculateStats = async () => {
      if (!address) return;
      setIsLoading(true);
  
      try {
        const requests = await retrieveRequest(address);
        let totalOutstanding = 0;
        let pendingCount = 0;
        let totalPaid = 0;
  
        const invoices = requests.filter(
          (request) =>
            request.contentData?.transactionType === 'invoice' &&
            request.payer?.value.toLowerCase() === address.toLowerCase()
        );
  
        invoices.forEach((invoice) => {
          const currency = invoice.currency.split('-')[0];
          if (!['ETH', 'FAU'].includes(currency)) return;
  
          const amount = parseFloat(formatUnits(BigInt(invoice.expectedAmount), 18));
          const dueDate = new Date(invoice.contentData?.dueDate);
          const balance = invoice.balance?.balance ? BigInt(invoice.balance.balance) : BigInt(0);
  
          if (balance > 0) {
            // Paid invoices
            totalPaid += amount;
          } else {
            // Unpaid invoices
            totalOutstanding += amount;
  
            if (dueDate > new Date()) {
              pendingCount++;
            }
          }
        });
  
        setStats([
          {
            name: 'Total Outstanding',
            value: totalOutstanding.toLocaleString(undefined, { maximumFractionDigits: 4 }),
            change: '-4.75%', // Placeholder for actual change logic
            icon: CurrencyDollarIcon,
            currency: 'ETH',
          },
          {
            name: 'Pending Invoices',
            value: pendingCount.toString(),
            change: '+1.15%', // Placeholder for actual change logic
            icon: ClockIcon,
          },
          {
            name: 'Total Paid',
            value: totalPaid.toLocaleString(undefined, { maximumFractionDigits: 4 }),
            change: '+10.25%', // Placeholder for actual change logic
            icon: CheckCircleIcon,
            currency: 'ETH',
          },
          {
            name: 'Overdue',
            value: '0', // Placeholder or adjust logic for overdue if needed
            change: '-2.30%', // Placeholder for actual change logic
            icon: ExclamationCircleIcon,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
  
    calculateStats();
  }, [address]);
  

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
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
                ) : (
                  <>
                    <p className="text-lg font-semibold text-gray-900 truncate">
                      {stat.value}
                    </p>
                    {stat.currency && (
                      <span className="text-xs text-gray-600">
                        {stat.currency}
                      </span>
                    )}
                    <span className={`inline-flex text-xs font-medium ${
                      stat.change.startsWith('+') 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
