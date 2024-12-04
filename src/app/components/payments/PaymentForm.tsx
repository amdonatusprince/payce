"use client"
import { useState } from 'react';
import { supportedCurrencies, supportedChains } from '../../../lib/constants';
import { createPaymentRequest } from '../../requests/PaymentForwarder';
import { Types } from "@requestnetwork/request-client.js";
import { CurrencyTypes } from "@requestnetwork/types";
import { useAccount, useWalletClient } from 'wagmi';
import { parse } from 'papaparse';
import { createBatchPayment } from '@/app/requests/BatchPayment';
import { formatTransactionError } from '@/app/requests/utils/errorHandler';

interface BatchRecipient {
  address: string;
  amount: string;
  reason?: string;
}

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
  const [batchRecipients, setBatchRecipients] = useState<BatchRecipient[]>([]);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [batchResult, setBatchResult] = useState<{
    transactionHash?: string;
    error?: string;
  } | null>(null);

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
    setBatchRecipients([]);
    if (document.querySelector<HTMLInputElement>('input[type="file"]')) {
      (document.querySelector<HTMLInputElement>('input[type="file"]')!).value = '';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      parse(file, {
        header: true,
        complete: (results) => {
          console.log('Parsed CSV data:', results.data);
          setBatchRecipients(results.data as BatchRecipient[]);
        },
        error: (error) => {
          setError('Error parsing CSV file: ' + error.message);
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setBatchResult(null);
    setShowModal(false);

    try {
      if (!address || !walletClient) {
        throw new Error('Please connect your wallet first');
      }

      if (paymentType === 'single') {
        const params = {
          payerAddress: formData.payerAddress,
          expectedAmount: formData.amount,
          currency: {
            type: Types.RequestLogic.CURRENCY.ETH as const,
            value: 'ETH',
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
        if (result) {
          setForwarderAddress(result);
          setShowModal(true);
          resetForm();
          setBatchRecipients([]);
        }
      } else {
        if (!batchRecipients.length) {
          throw new Error('Please upload a CSV file with recipients');
        }

        const params = {
          walletClient,
          payerAddress: address,
          currency: {
            type: Types.RequestLogic.CURRENCY.ETH as const,
            value: 'ETH',
            network: formData.network.toLowerCase() as CurrencyTypes.ChainName,
            decimals: supportedCurrencies[formData.currency as keyof typeof supportedCurrencies].decimals,
          },
          recipients: batchRecipients,
          dueDate: formData.dueDate,
          onStatusChange: (status: string) => {
            setLoadingStatus(status);
            if (status.includes('4/4')) {
              setError(null);
            }
          },
          onEmployeeProgress: (completed: number, total: number) => {
            setLoadingStatus(`Processing ${completed}/${total} payments...`);
            if (completed === total) {
              setError(null);
            }
          }
        };

        const result = await createBatchPayment(params);
        if (result?.transactionHash) {
          setBatchResult({
            transactionHash: result.transactionHash
          });
          setShowModal(true);
          resetForm();
          setBatchRecipients([]);
        }
      }
    } catch (error) {
      setError(formatTransactionError(error));
      setBatchResult(error ? { error: formatTransactionError(error) } : null);
      console.error('Full payment error:', error);
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  const BatchResultModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            {batchResult?.error ? 'Batch Payment Failed' : 'Batch Payment Successful'}
          </h3>
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
        <div className="mb-4">
          {batchResult?.error ? (
            <p className="text-sm text-red-600">
              Error: {batchResult.error}
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Batch payment has been successfully processed.
              </p>
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => setShowModal(false)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  const SinglePaymentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Payment Created Successfully</h3>
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
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Forwarder Address:</p>
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
            <code className="text-sm font-mono break-all">{forwarderAddress}</code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(forwarderAddress || '');
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              {copySuccess ? (
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => setShowModal(false)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

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
          <>
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
            <div>
              <label className="block text-sm font-medium mb-2">
                Amount
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg"
                placeholder="0.00"
              />
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
          </>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-2">
              Upload Recipients CSV
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="w-full p-3 border rounded-lg"
            />
            {batchRecipients.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                {batchRecipients.length} recipients loaded
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">
            Currency
          </label>
          <select 
            name="currency"
            value={formData.currency}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg"
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

        <button
          type="submit"
          disabled={isLoading || !address}
          className="w-full py-3 bg-primary-600 text-white rounded-lg disabled:opacity-50 flex items-center justify-center"
        >
          {!address ? 'Connect Wallet First' : (
            <>
              <span className="mr-2">
                {isLoading ? loadingStatus : paymentType === 'single' ? 'Receive Payment' : 'Send Batch Payment'}
              </span>
              {isLoading && (
                <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
              )}
            </>
          )}
        </button>
      </form>

      {showModal && (
        paymentType === 'single' ? <SinglePaymentModal /> : <BatchResultModal />
      )}
    </div>
  );
}; 