import { TransactionHistory } from '../transactions/TransactionHistory';

interface DateRange {
  from: Date;
  to: Date;
}

export const AccountStatement = ({ dateRange }: { dateRange: DateRange })  => {
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <TransactionHistory />
    </div>
  );
}; 