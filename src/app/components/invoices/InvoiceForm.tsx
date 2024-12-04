import { useState } from 'react';
import { supportedCurrencies } from '@/lib/constants';
import { createRequest, REQUEST_STATUS } from '@/app/requests/CreateRequest';
import { useAccount, useWalletClient } from 'wagmi';
import { Types } from "@requestnetwork/request-client.js";
import { CurrencyTypes } from "@requestnetwork/types";
import { formatTransactionError } from '@/app/requests/utils/errorHandler';

export const InvoiceForm = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const initialFormData = {
    // Business Details
    businessName: '',
    businessEmail: '',
    businessAddress: '',
    businessWallet: '',
    
    // Client Details
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    clientWallet: '', // Payer address
    
    // Invoice Details
    currency: Object.keys(supportedCurrencies)[0],
    dueDate: '',
    notes: '',
  };

  const initialItems = [{ description: '', amount: 0 }];

  const [formData, setFormData] = useState(initialFormData);
  const [items, setItems] = useState(initialItems);

  const resetForm = () => {
    setFormData(initialFormData);
    setItems(initialItems);
    setError(null);
    setLoadingStatus('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleItemChange = (index: number, field: 'description' | 'amount', value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0).toString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!address || !walletClient) {
        throw new Error('Please connect your wallet first');
      }

      if (!formData.clientWallet || !calculateTotal()) {
        throw new Error('Please fill in all required fields');
      }

      const params = {
        walletClient,
        payerAddress: formData.clientWallet,
        expectedAmount: calculateTotal(),
        currency: {
          type: Types.RequestLogic.CURRENCY.ETH as const,
          value: 'ETH',
          network: 'sepolia' as CurrencyTypes.ChainName,
          decimals: supportedCurrencies[formData.currency as keyof typeof supportedCurrencies].decimals,
        },
        recipientAddress: address,
        reason: formData.notes,
        dueDate: formData.dueDate,
        contentData: {
          transactionType: 'invoice',
          businessDetails: {
            name: formData.businessName,
            email: formData.businessEmail,
            address: formData.businessAddress,
          },
          clientDetails: {
            name: formData.clientName,
            email: formData.clientEmail,
            address: formData.clientAddress,
            walletAddress: formData.clientWallet,
          },
          invoiceDetails: {
            items: items,
            totalAmount: calculateTotal(),
            currency: formData.currency,
            dueDate: formData.dueDate,
            notes: formData.notes,
          },
          metadata: {
            createdAt: new Date().toISOString(),
            builderId: "payce-finance",
            version: "1.0.0",
            createdBy: address,
          }
        },
        onStatusChange: (status: REQUEST_STATUS) => {
          setLoadingStatus(status);
        },
      };

      const result = await createRequest(params);
      setShowModal(true);
      resetForm();
    } catch (error) {
      setError(formatTransactionError(error));
      console.error('Full error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-6">
      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Details Section */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-medium mb-4">Business Details</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Business Name</label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Business Email</label>
              <input
                type="email"
                name="businessEmail"
                value={formData.businessEmail}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Business Address</label>
              <textarea
                name="businessAddress"
                value={formData.businessAddress}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Client Details Section */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-medium mb-4">Client Details</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Client Name</label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Client Email</label>
              <input
                type="email"
                name="clientEmail"
                value={formData.clientEmail}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Client Wallet Address</label>
              <input
                type="text"
                name="clientWallet"
                value={formData.clientWallet}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg"
                placeholder="0x..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Client Address</label>
              <textarea
                name="clientAddress"
                value={formData.clientAddress}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Currency</label>
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
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Invoice Items</label>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className="flex-1 p-3 border rounded-lg"
                    placeholder="Item description"
                  />
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                    className="w-32 p-3 border rounded-lg"
                    placeholder="Amount"
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setItems([...items, { description: '', amount: 0 }])}
              className="mt-4 text-primary-600 hover:text-primary-700"
            >
              + Add Item
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg"
              rows={4}
              placeholder="Reson for invoice, additional notes or payment terms..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={isLoading || !address}
            className="btn-primary flex items-center justify-center min-w-[150px]"
          >
            {isLoading ? (
              <>
                <span className="mr-2">{loadingStatus}</span>
                <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
              </>
            ) : (
              'Create Invoice'
            )}
          </button>
        </div>
      </form>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Invoice Created Successfully</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                The invoice has been successfully created and sent to payer's wallet address.
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
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