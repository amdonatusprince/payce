import { useState } from 'react';
import { format } from 'date-fns';

interface DateRangePickerProps {
  dateRange: {
    from: Date;
    to: Date;
  };
  onChange: (dateRange: { from: Date; to: Date }) => void;
}

export const DateRangePicker = ({ dateRange, onChange }: DateRangePickerProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">From:</label>
        <input
          type="date"
          className="px-3 py-2 border rounded-lg"
          value={format(dateRange.from, 'yyyy-MM-dd')}
          onChange={(e) => {
            onChange({
              ...dateRange,
              from: new Date(e.target.value),
            });
          }}
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">To:</label>
        <input
          type="date"
          className="px-3 py-2 border rounded-lg"
          value={format(dateRange.to, 'yyyy-MM-dd')}
          onChange={(e) => {
            onChange({
              ...dateRange,
              to: new Date(e.target.value),
            });
          }}
        />
      </div>

      <div className="flex gap-2">
        <button
          className="btn-secondary text-sm"
          onClick={() => {
            const today = new Date();
            onChange({
              from: new Date(today.setMonth(today.getMonth() - 1)),
              to: new Date(),
            });
          }}
        >
          Last 30 Days
        </button>
        <button
          className="btn-secondary text-sm"
          onClick={() => {
            const today = new Date();
            onChange({
              from: new Date(today.setMonth(today.getMonth() - 3)),
              to: new Date(),
            });
          }}
        >
          Last 90 Days
        </button>
      </div>
    </div>
  );
}; 