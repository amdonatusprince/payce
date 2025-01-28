import { SupportedChain } from '@/lib/constants';
import { XCircleIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface BatchRecipient {
  address: string;
  amount: string;
  recipientName?: string;
  email?: string;
  reason?: string;
}

interface BatchPaymentPreviewProps {
  recipients: BatchRecipient[];
  currency: string;
  network: SupportedChain;
  onRecipientsChange: (recipients: BatchRecipient[]) => void;
}

export const BatchPaymentPreview = ({ recipients, currency, network, onRecipientsChange }: BatchPaymentPreviewProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const recipientsPerPage = 5;
  const totalPages = Math.ceil(recipients.length / recipientsPerPage);

  const formatWalletAddress = (address: string) => {
    if (!address) return '0x...';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const calculateTotal = () => {
    return recipients.reduce((sum, recipient) => sum + (Number(recipient.amount) || 0), 0);
  };

  const updateRecipient = (index: number, field: keyof BatchRecipient, value: string) => {
    const updatedRecipients = recipients.map((recipient, i) => {
      if (i === index) {
        return { ...recipient, [field]: value };
      }
      return recipient;
    });
    onRecipientsChange(updatedRecipients);
  };

  const removeRecipient = (index: number) => {
    onRecipientsChange(recipients.filter((_, i) => i !== index));
    if (currentPage > Math.ceil((recipients.length - 1) / recipientsPerPage)) {
      setCurrentPage(prev => Math.max(prev - 1, 1));
    }
  };

  const getCurrentPageRecipients = () => {
    const startIndex = (currentPage - 1) * recipientsPerPage;
    return recipients.slice(startIndex, startIndex + recipientsPerPage);
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm w-full h-[calc(200vh-500px)] flex flex-col">
      {/* Summary Header - Fixed */}
      <div className="border-b p-4 flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Batch Payment Preview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-gray-50 px-3 py-2 rounded-lg text-center">
            <p className="text-xs text-gray-600">Total Recipients</p>
            <p className="text-lg font-medium text-gray-900">{recipients.length}</p>
          </div>
          <div className="bg-gray-50 px-3 py-2 rounded-lg text-center">
            <p className="text-xs text-gray-600">Total Amount</p>
            <p className="text-lg font-medium text-gray-900">
              {calculateTotal()} <span className="text-base">{currency}</span>
            </p>
          </div>
          <div className="bg-gray-50 px-3 py-2 rounded-lg text-center">
            <p className="text-xs text-gray-600">Network</p>
            <p className="text-lg font-medium text-gray-900">{network}</p>
          </div>
        </div>
      </div>

      {/* Recipients Cards - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <div className="p-6 h-full overflow-y-auto">
          <div className="space-y-6">
            {getCurrentPageRecipients().map((recipient, index) => {
              const actualIndex = (currentPage - 1) * recipientsPerPage + index;
              return (
                <div key={actualIndex} className="border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        Recipient #{actualIndex + 1}
                      </span>
                      <button
                        onClick={() => removeRecipient(actualIndex)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <XCircleIcon className="h-6 w-6" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Recipient Address
                        </label>
                        <input
                          type="text"
                          value={recipient.address}
                          onChange={(e) => updateRecipient(actualIndex, 'address', e.target.value)}
                          className="w-full p-2.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Amount
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={recipient.amount}
                            onChange={(e) => updateRecipient(actualIndex, 'amount', e.target.value)}
                            className="w-full p-2.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Recipient Name
                        </label>
                        <input
                          type="text"
                          value={recipient.recipientName || ''}
                          onChange={(e) => updateRecipient(actualIndex, 'recipientName', e.target.value)}
                          className="w-full p-2.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Optional"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={recipient.email || ''}
                          onChange={(e) => updateRecipient(actualIndex, 'email', e.target.value)}
                          className="w-full p-2.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Optional"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Reason
                        </label>
                        <input
                          type="text"
                          value={recipient.reason || ''}
                          onChange={(e) => updateRecipient(actualIndex, 'reason', e.target.value)}
                          className="w-full p-2.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination - Fixed at bottom of scrollable area */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="flex items-center">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * recipientsPerPage + 1}</span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * recipientsPerPage, recipients.length)}
                  </span>{' '}
                  of <span className="font-medium">{recipients.length}</span> recipients
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="h-5 w-5 mr-1" />
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRightIcon className="h-5 w-5 ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
