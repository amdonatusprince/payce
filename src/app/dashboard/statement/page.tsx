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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Statement</h1>
        <DateRangePicker
          dateRange={dateRange}
          onChange={setDateRange}
        />
      </div>

      <StatementSummary dateRange={dateRange} />
      <AccountStatement dateRange={dateRange} />
    </div>
  );
} 