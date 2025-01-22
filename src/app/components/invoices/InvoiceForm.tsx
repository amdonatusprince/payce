import { useState } from 'react';
import { supportedCurrencies, supportedChains } from '@/lib/constants';
import { createRequest, REQUEST_STATUS } from '@/app/requests/CreateRequest';
import { createInvoiceRequest } from '@/app/requests/solana/createInvoiceRequest';
import { useWalletClient } from 'wagmi';
import { Types } from "@requestnetwork/request-client.js";
import { CurrencyTypes } from "@requestnetwork/types";
import { formatTransactionError } from '@/app/requests/utils/errorHandler';
import { InvoicePreview } from './InvoicePreview';
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { CheckIcon } from "@heroicons/react/24/outline";

export const InvoiceForm = () => {
  const { address, isConnected } = useAppKitAccount();
  const { caipNetwork } = useAppKitNetwork();
  const { data: walletClient } = useWalletClient();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const network = caipNetwork?.name
  
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
    network: caipNetwork?.name || supportedChains[0],
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
    setShowModal(false);

    try {
      if (!isConnected || !address || !walletClient) {
        throw new Error('Please connect your wallet first');
      }

      if (!formData.clientWallet || !calculateTotal()) {
        throw new Error('Please fill in all required fields');
      }

      const isSolanaNetwork = formData.network.toLowerCase().includes('solana');
      
      const params = {
        walletClient,
        payerAddress: formData.clientWallet,
        expectedAmount: calculateTotal(),
        currency: {
          type: Types.RequestLogic.CURRENCY.ETH as const,
          value: formData.currency,
          network: formData.network.toLowerCase() as CurrencyTypes.ChainName,
          decimals: supportedCurrencies[formData.currency as keyof typeof supportedCurrencies].decimals,
        },
        payeeAddress: address,
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

      let result;
      if (isSolanaNetwork) {
        result = await createInvoiceRequest(params);
        console.log('IPFS Upload Result:', result);
        if (result?.requestId) {
          setShowModal(true);
          resetForm();
        }
      } else {
        result = await createRequest({
          ...params,
          recipientAddress: params.payeeAddress
        });
      }

    } catch (error) {
      console.error('Form submission error:', error);
      setError(formatTransactionError(error));
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };



  return (
    <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm p-4 sm:p-6">
      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                    {Object.keys(supportedCurrencies).map((currency) => (
                      <option key={currency} value={currency} className="truncate">
                        {currency}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Network</label>
                  <select 
                    name="network"
                    value={formData.network}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg"
                    disabled={true}
                  >
                    <option value={network || ''}>
                      {network || 'Please connect wallet'}
                    </option>
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
                disabled={isLoading || !isConnected}
                className="btn-primary flex items-center justify-center min-w-[150px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span className="mr-2">{loadingStatus}</span>
                    <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                  </>
                ) : !isConnected ? (
                  'Connect Wallet First'
                ) : (
                  'Create Invoice'
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="hidden lg:block sticky top-4">
          <InvoicePreview 
            formData={formData}
            items={items}
            calculateTotal={calculateTotal}
          />
        </div>

        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="w-full py-2 px-4 text-sm border rounded-lg hover:bg-gray-50"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          {showPreview && (
            <InvoicePreview 
              formData={formData}
              items={items}
              calculateTotal={calculateTotal}
            />
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">
                      Invoice Created Successfully
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Your invoice has been uploaded to IPFS successfully. The payer will be notified shortly.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 