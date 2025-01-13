'use client';
import { useState } from 'react';
import { AccountStatement } from '../../components/statement/AccountStatement';
import { StatementSummary } from '../../components/statement/StatementSummary';
import { DateRangePicker } from '../../components/statement/DateRangePicker';

export default function StatementPage() {
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date()
  });

  return (
    <div className="w-full max-w-[100vw] space-y-4 px-2 sm:px-4 overflow-hidden">
      {/* Header Section */}
      <div className="w-full">
        {/* Date Range Picker */}
        <div className="w-full mb-4">
          <DateRangePicker
            dateRange={dateRange}
            onChange={setDateRange}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="w-full">
        <StatementSummary dateRange={dateRange} />
      </div>

      {/* Transaction Table */}
      <div className="w-full">
        <AccountStatement dateRange={dateRange} />
      </div>
    </div>
  );
} 