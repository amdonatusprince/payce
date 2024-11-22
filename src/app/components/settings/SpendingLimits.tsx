"use client"
import { useState } from 'react';
import { supportedCurrencies } from '@/lib/constants';

interface LimitSetting {
  amount: number;
  currency: string;
  enabled: boolean;
}

export const SpendingLimits = () => {
  const [dailyLimit, setDailyLimit] = useState<LimitSetting>({
    amount: 1000,
    currency: 'USDC',
    enabled: true
  });

  const [monthlyLimit, setMonthlyLimit] = useState<LimitSetting>({
    amount: 25000,
    currency: 'USDC',
    enabled: true
  });

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Spending Limits</h2>

      <div className="space-y-6">
        {/* Daily Limit */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium">Daily Transaction Limit</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={dailyLimit.enabled}
                onChange={(e) => setDailyLimit({
                  ...dailyLimit,
                  enabled: e.target.checked
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div className="flex gap-4">
            <input
              type="number"
              value={dailyLimit.amount}
              onChange={(e) => setDailyLimit({
                ...dailyLimit,
                amount: Number(e.target.value)
              })}
              className="flex-1 p-3 border rounded-lg"
              disabled={!dailyLimit.enabled}
            />
            <select
              value={dailyLimit.currency}
              onChange={(e) => setDailyLimit({
                ...dailyLimit,
                currency: e.target.value
              })}
              className="w-32 p-3 border rounded-lg"
              disabled={!dailyLimit.enabled}
            >
              {supportedCurrencies.map(currency => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Monthly Limit */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium">Monthly Transaction Limit</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={monthlyLimit.enabled}
                onChange={(e) => setMonthlyLimit({
                  ...monthlyLimit,
                  enabled: e.target.checked
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div className="flex gap-4">
            <input
              type="number"
              value={monthlyLimit.amount}
              onChange={(e) => setMonthlyLimit({
                ...monthlyLimit,
                amount: Number(e.target.value)
              })}
              className="flex-1 p-3 border rounded-lg"
              disabled={!monthlyLimit.enabled}
            />
            <select
              value={monthlyLimit.currency}
              onChange={(e) => setMonthlyLimit({
                ...monthlyLimit,
                currency: e.target.value
              })}
              className="w-32 p-3 border rounded-lg"
              disabled={!monthlyLimit.enabled}
            >
              {supportedCurrencies.map(currency => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-4 border-t">
          <button className="w-full btn-primary">
            Save Limits
          </button>
        </div>
      </div>
    </div>
  );
}; 