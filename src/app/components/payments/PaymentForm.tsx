"use client"
import { useState } from 'react';
import { supportedCurrencies, supportedChains } from '../../../lib/constants';

export const PaymentForm = () => {
  const [paymentType, setPaymentType] = useState<'single' | 'batch'>('single');
  
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-6">
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded-lg ${
            paymentType === 'single'
              ? 'bg-primary-600 text-white'
              : 'border'
          }`}
          onClick={() => setPaymentType('single')}
        >
          Single Payment
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            paymentType === 'batch'
              ? 'bg-primary-600 text-white'
              : 'border'
          }`}
          onClick={() => setPaymentType('batch')}
        >
          Batch Payment
        </button>
      </div>

      <form className="space-y-6">
        {paymentType === 'single' ? (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg"
                placeholder="0x..."
              />
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-2">
              Upload Recipients CSV
            </label>
            <input
              type="file"
              accept=".csv"
              className="w-full p-3 border rounded-lg"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">
            Amount
          </label>
          <div className="flex gap-4">
            <input
              type="number"
              className="flex-1 p-3 border rounded-lg"
              placeholder="0.00"
            />
            <select className="w-32 p-3 border rounded-lg">
              {supportedCurrencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Network
          </label>
          <select className="w-full p-3 border rounded-lg">
            {supportedChains.map((chain) => (
              <option key={chain} value={chain}>
                {chain}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-primary-600 text-white rounded-lg"
        >
          Review Payment
        </button>
      </form>
    </div>
  );
}; 