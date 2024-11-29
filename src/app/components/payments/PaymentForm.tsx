"use client"
import { useState } from 'react';
import { supportedCurrencies, supportedChains } from '../../../lib/constants';
import { createPaymentRequest } from '../../requests/PaymentForwarder';
import { Types } from "@requestnetwork/request-client.js";
import { CurrencyTypes } from "@requestnetwork/types";
import { useAccount, useWalletClient } from 'wagmi';


export const PaymentForm = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [paymentType, setPaymentType] = useState<'single' | 'batch'>('single');
  const [formData, setFormData] = useState({
    payerAddress: '',
    amount: '',
    currency: Object.keys(supportedCurrencies)[0],
    network: supportedChains[0],
    reason: '',
    dueDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forwarderAddress, setForwarderAddress] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
      payerAddress: '',
      amount: '',
      currency: Object.keys(supportedCurrencies)[0],
      network: supportedChains[0],
      reason: '',
      dueDate: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setForwarderAddress(null);

    try {
      if (!address || !walletClient) {
        throw new Error('Please connect your wallet first');
      }

      if (!formData.payerAddress || !formData.amount) {
        throw new Error('Please fill in all required fields');
      }

      if (paymentType === 'single') {
        const params = {
          payerAddress: formData.payerAddress,
          expectedAmount: formData.amount,
          currency: {
            type: Types.RequestLogic.CURRENCY.ERC20 as const,
            value: '0x370DE27fdb7D1Ff1e1BaA7D11c5820a324Cf623C',
            network: formData.network.toLowerCase() as CurrencyTypes.ChainName,
            decimals: supportedCurrencies[formData.currency as keyof typeof supportedCurrencies].decimals,
          },
          recipientAddress: address,
          reason: formData.reason,
          dueDate: formData.dueDate,
          walletClient,
          contentData: {
            transactionType: 'single_forwarder' as const,
            paymentDetails: {
              reason: formData.reason,
              dueDate: formData.dueDate,
            },
            metadata: {
              createdAt: new Date().toISOString(),
              builderId: "payce-finance",
              createdBy: address,
            }
          }
        };

        const result = await createPaymentRequest({ params });
        setForwarderAddress(result);
        setShowModal(true);
        resetForm();
      }
      // Handle batch payment logic here
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      console.error('Payment error:', error);
      resetForm();
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-6">
      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

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

      <form onSubmit={handleSubmit} className="space-y-6">
        {paymentType === 'single' ? (
          <div>
            <label className="block text-sm font-medium mb-2">
              Payer Address
            </label>
            <input
              type="text"
              name="payerAddress"
              value={formData.payerAddress}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg"
              placeholder="0x..."
            />
          </div>
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
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className="flex-1 p-3 border rounded-lg"
              placeholder="0.00"
            />
            <select 
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
              className="w-40 p-3 border rounded-lg text-sm truncate"
            >
              {Object.keys(supportedCurrencies).map((currency) => {
                const [token, network] = currency.split('-');
                const displayText = network === 'sepolia-sepolia' 
                  ? `${token} - Sepolia`
                  : `${token} - ${network.charAt(0).toUpperCase() + network.slice(1)}`;
                
                return (
                  <option key={currency} value={currency} className="truncate">
                    {displayText}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Network
          </label>
          <select 
            name="network"
            value={formData.network}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg"
          >
            {supportedChains.map((chain) => (
              <option key={chain} value={chain}>
                {chain}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Reason for Payment
          </label>
          <input
            type="text"
            name="reason"
            value={formData.reason}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg"
            placeholder="Enter payment reason"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Due Date
          </label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg"
          />
        </div>

        {/* Loading State */}
        {isSubmitting && (
          <div className="flex items-center justify-center space-x-2 my-4">
            <div className="animate-spin h-5 w-5 border-2 border-primary-600 rounded-full border-t-transparent"></div>
            <span className="text-sm text-gray-600">{loadingState}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !address}
          className="w-full py-3 bg-primary-600 text-white rounded-lg disabled:opacity-50 flex items-center justify-center"
        >
          {!address ? 'Connect Wallet First' : (
            <>
              <span className="mr-2">
                {isLoading ? 'Generating payment forwarder address' : 'Receive Payment'}
              </span>
              {isLoading && (
                <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
              )}
            </>
          )}
        </button>
      </form>

      {/* Modal */}
      {showModal && forwarderAddress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Payment Forwarder Created</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium mb-2">Forwarder Contract Address:</p>
              <p className="text-sm font-mono break-all">{forwarderAddress}</p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(forwarderAddress);
                    setCopySuccess(true);
                    setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
                  } catch (err) {
                    console.error('Failed to copy:', err);
                  }
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center space-x-2"
              >
                <span>{copySuccess ? 'Copied!' : 'Copy Address'}</span>
                {copySuccess && (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 