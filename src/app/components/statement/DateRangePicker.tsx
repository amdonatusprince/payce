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
    <div className="w-full max-w-[100vw] px-2 sm:px-0">
      {/* Date Inputs - Side by Side */}
      <div className="flex gap-2 mb-2">
        <div className="flex-1 flex items-center min-w-0">
          <label className="text-xs font-medium w-8 shrink-0">From:</label>
          <input
            type="date"
            className="flex-1 min-w-0 px-1.5 py-1 border rounded-lg text-xs"
            value={format(dateRange.from, 'yyyy-MM-dd')}
            onChange={(e) => {
              onChange({
                ...dateRange,
                from: new Date(e.target.value),
              });
            }}
          />
        </div>

        <div className="flex-1 flex items-center min-w-0">
          <label className="text-xs font-medium w-8 shrink-0">To:</label>
          <input
            type="date"
            className="flex-1 min-w-0 px-1.5 py-1 border rounded-lg text-xs"
            value={format(dateRange.to, 'yyyy-MM-dd')}
            onChange={(e) => {
              onChange({
                ...dateRange,
                to: new Date(e.target.value),
              });
            }}
          />
        </div>
      </div>

      {/* Quick Select Buttons */}
      <div className="flex gap-2">
        <button
          className="flex-1 btn-secondary text-xs px-2 py-1.5"
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
          className="flex-1 btn-secondary text-xs px-2 py-1.5"
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