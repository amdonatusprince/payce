"use client"
import { useState } from 'react';
import { supportedCurrencies, supportedChains } from '../../../lib/constants';
import { parse } from 'papaparse';
import { formatTransactionError } from '@/app/requests/utils/errorHandler';
import { SinglePaymentPreview } from './previews/SinglePaymentPreview';
import { BatchPaymentPreview } from './previews/BatchPaymentPreview';
import { useWalletClient } from 'wagmi';
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useAppKitProvider } from '@reown/appkit/react'
import { useAppKitConnection, type Provider } from '@reown/appkit-adapter-solana/react'
import { PaymentSuccessModal } from './modals/PaymentSuccessModal';
import { handleSinglePayment } from './handlers/SinglePaymentHandler';
import { handleBatchPayment } from './handlers/BatchPaymentHandler';
import { BatchRecipientForm } from './BatchRecipientForm';
import { handleSolanaBatchPayment } from './handlers/SolanaBatchPaymentHandler';
import { BatchPaymentSuccessModal } from './modals/BatchPaymentSuccessModal';

interface BatchRecipient {
  address: string;
  amount: string;
  reason?: string;
}

export const PaymentForm = () => {
  const { address, isConnected } = useAppKitAccount();
  const { caipNetwork } = useAppKitNetwork();
  const { data: walletClient } = useWalletClient();
  const [paymentType, setPaymentType] = useState<'single' | 'batch'>('single');
  const [formData, setFormData] = useState({
    recipientAddress: '',
    recipientName: '',
    amount: '',
    currency: Object.keys(supportedCurrencies)[0],
    network: (caipNetwork?.name as "Base" | "Solana") || supportedChains[0] as "Base" | "Solana",
    reason: '',
    dueDate: '',
    recipientEmail: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [forwarderAddress, setForwarderAddress] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [batchRecipients, setBatchRecipients] = useState<BatchRecipient[]>([]);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [result, setResult] = useState<{
    paymentDetails: {
      recipient: string;
      amount: string;
      recipientName: string;
      reason: string;
      status: 'paid';
      timestamp: number;
      explorerUrl: string;
    };
  } | string | null>(null);
  const [batchResult, setBatchResult] = useState<{
    transactionHash?: string;
    error?: string;
    successCount: number;
    totalCount: number;
  } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { connection } = useAppKitConnection()
  const { walletProvider } = useAppKitProvider<Provider>('solana')
  const isSolanaNetwork = formData.network.toLowerCase().includes('solana');
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
      recipientAddress: '',
      recipientName: '',
      amount: '',
      currency: Object.keys(supportedCurrencies)[0],
      network: (caipNetwork?.name as "Base" | "Solana") || supportedChains[0] as "Base" | "Solana",
      reason: '',
      dueDate: '',
      recipientEmail: '',
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
    
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    if (paymentType === 'batch' && batchRecipients.length === 0) {
      setError('Please add at least one recipient to the batch');
      return;
    }

    setIsLoading(true);
    setError(null);
    setBatchResult(null);
    setShowModal(false);

    try {
      if (paymentType === 'single') {
        if (!formData.recipientAddress || !formData.amount) {
          throw new Error('Please fill in all required fields');
        }
        const result = await handleSinglePayment({
          formData,
          address,
          walletClient,
          connection,
          walletProvider,
          isSolanaNetwork
        });
        
        setResult(result);
        setShowModal(true);
        resetForm();
      } else {
        if (isSolanaNetwork) {
          if (!connection) {
            throw new Error('Solana connection not found');
          }
          
          const results = await handleSolanaBatchPayment({
            recipients: batchRecipients,
            connection,
            walletProvider,
            onStatusUpdate: setLoadingStatus,
            network: formData.network.toLowerCase().includes('devnet') ? 'devnet' : 'mainnet'
          });

          const successfulPayments = results.filter(r => r.status === 'success');
          const failedPayments = results.filter(r => r.status === 'failed');

          setBatchResult({
            transactionHash: successfulPayments.map(r => r.signature).join(','),
            error: failedPayments.length > 0 ? `${failedPayments.length} payments failed` : undefined,
            successCount: successfulPayments.length,
            totalCount: results.length
          });
          setShowModal(true);
        } else {
          const result = await handleBatchPayment({
            formData,
            address,
            walletClient,
            batchRecipients,
            onStatusChange: setLoadingStatus,
            onEmployeeProgress: (completed, total) => {
              setLoadingStatus(`Processing ${completed}/${total} payments...`);
            }
          });
          
          setBatchResult({
            transactionHash: result.transactionHash,
            successCount: result.requests.length,
            totalCount: result.requests.length,
            error: undefined
          });
          setShowModal(true);
        }
        resetForm();
      }
    } catch (error) {
      setError(formatTransactionError(error));
      console.error('Full payment error:', error);
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm p-4 sm:p-6">
        {error && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Payment Type Selection */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-6">
          <button
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              paymentType === 'single'
                ? 'bg-primary-600 text-white'
                : 'border border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setPaymentType('single')}
          >
            Single Pay
          </button>
          <button
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              paymentType === 'batch'
                ? 'bg-primary-600 text-white'
                : 'border border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setPaymentType('batch')}
          >
            Batch Pay
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Form Section */}
          <div className="lg:max-w-xl">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {paymentType === 'single' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {isSolanaNetwork ? "Recipient Name" : "Payer Name"}
                    </label>
                    <input
                      type="text"
                      name="recipientName"
                      value={formData.recipientName}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border rounded-lg text-sm"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {isSolanaNetwork ? "Recipient Address" : "Payer Address"}
                    </label>
                    <input
                      type="text"
                      name="recipientAddress"
                      value={formData.recipientAddress}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border rounded-lg text-sm"
                      placeholder={isSolanaNetwork ? "Solana address..." : "0x..."}
                    />
                  </div>
                  {isSolanaNetwork && (
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        Recipient Email (Optional)
                      </label>
                      <input
                        type="email"
                        name="recipientEmail"
                        value={formData.recipientEmail || ''}
                        onChange={handleInputChange}
                        className="w-full p-2.5 border rounded-lg text-sm"
                        placeholder="recipient@example.com"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Amount
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border rounded-lg text-sm"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Reason for Payment
                    </label>
                    <input
                      type="text"
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border rounded-lg text-sm"
                      placeholder="Enter payment reason"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <BatchRecipientForm
                    recipients={batchRecipients}
                    onRecipientsChange={setBatchRecipients}
                    currency={formData.currency}
                    network={formData.network}
                    handleFileUpload={handleFileUpload}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Currency
                </label>
                <select 
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border rounded-lg text-sm bg-white"
                  disabled={true}
                >
                  {Object.keys(supportedCurrencies).map((currency) => (
                    <option key={currency} value={currency} className="truncate">
                      {currency}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Network
                </label>
                <select 
                  name="network"
                  value={caipNetwork?.name || ''}
                  className="w-full p-2.5 border rounded-lg text-sm bg-white"
                  disabled={true}
                >
                  <option value={caipNetwork?.name || ''}>
                    {caipNetwork?.name || 'Please connect wallet'}
                  </option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading || !address}
                className="w-full py-2.5 bg-primary-600 text-white rounded-lg disabled:opacity-50 
                         flex items-center justify-center text-sm transition-colors hover:bg-primary-700 min-h-[44px]"
              >
                {!address ? 'Connect Wallet First' : (
                  <div className="flex items-center space-x-2 px-2">
                    <span className="truncate text-xs sm:text-sm">
                      {isLoading ? loadingStatus : (isSolanaNetwork ? 'Send Payment' : 'Receive Payment')}
                    </span>
                    {isLoading && (
                      <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent flex-shrink-0"></div>
                    )}
                  </div>
                )}
              </button>
            </form>
          </div>

          {/* Preview Section - Hidden on mobile, always visible on desktop */}
          <div className="hidden lg:block">
            {paymentType === 'single' ? (
              <SinglePaymentPreview formData={formData} />
            ) : (
              <BatchPaymentPreview
                recipients={batchRecipients}
                onRecipientsChange={setBatchRecipients}
                currency={formData.currency}
                network={formData.network}
              />
            )}
          </div>

          {/* Mobile Preview Toggle & Preview */}
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="w-full py-2.5 px-4 text-sm border rounded-lg hover:bg-gray-50 mb-4"
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            {showPreview && (
              <div className="mt-4 overflow-x-auto">
                {paymentType === 'single' ? (
                  <SinglePaymentPreview formData={formData} />
                ) : (
                  <BatchPaymentPreview
                    recipients={batchRecipients}
                    onRecipientsChange={setBatchRecipients}
                    currency={formData.currency}
                    network={formData.network}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {showModal && batchResult && paymentType === 'batch' ? (
          <BatchPaymentSuccessModal
            onClose={() => setShowModal(false)}
            successCount={batchResult.successCount}
            totalCount={batchResult.totalCount}
          />
        ) : showModal && result ? (
          <PaymentSuccessModal
            onClose={() => setShowModal(false)}
            explorerUrl={(typeof result === 'object' && 'paymentDetails' in result) ? result.paymentDetails.explorerUrl : ''}
            amount={(typeof result === 'object' && 'paymentDetails' in result) ? result.paymentDetails.amount : ''}
            recipientName={(typeof result === 'object' && 'paymentDetails' in result) ? result.paymentDetails.recipientName : ''}
            isSolanaNetwork={isSolanaNetwork}
            forwarderAddress={!isSolanaNetwork ? forwarderAddress ?? undefined : undefined}
          />
        ) : null}
      </div>
    </div>
  );
}; 