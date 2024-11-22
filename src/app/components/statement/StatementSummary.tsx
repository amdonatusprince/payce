import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

interface StatementSummaryProps {
  dateRange: {
    from: Date;
    to: Date;
  };
}

export const StatementSummary = ({ dateRange }: StatementSummaryProps) => {
  // In a real app, these would be calculated from actual transaction data
  const summary = {
    totalInflow: 25000,
    totalOutflow: 15000,
    netChange: 10000,
    pendingInflow: 5000,
    pendingOutflow: 2000,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Inflow</p>
            <p className="text-lg font-bold text-green-600">
              +${summary.totalInflow.toLocaleString()}
            </p>
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
            <p className="text-lg font-bold text-red-600">
              -${summary.totalOutflow.toLocaleString()}
            </p>
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
            <p className={`text-lg font-bold ${
              summary.netChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {summary.netChange >= 0 ? '+' : '-'}
              ${Math.abs(summary.netChange).toLocaleString()}
            </p>
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
              <span className="text-green-600">
                +${summary.pendingInflow.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Outflow:</span>
              <span className="text-red-600">
                -${summary.pendingOutflow.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 