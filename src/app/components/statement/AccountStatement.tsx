import { TransactionHistory } from '../transactions/TransactionHistory';

interface DateRange {
  from: Date;
  to: Date;
}

export const AccountStatement = ({ dateRange }: { dateRange: DateRange })  => {
  return (
    <div className="w-full max-w-[100vw] px-2 sm:px-0">
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 overflow-x-auto">
        <div className="min-w-[640px] sm:min-w-0"> {/* Minimum width for mobile scroll */}
          <TransactionHistory />
        </div>
      </div>
    </div>
  );
}; 