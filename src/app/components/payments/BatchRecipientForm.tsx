import { useState } from 'react';
import { PlusCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

export interface BatchRecipient {
  address: string;
  amount: string;
  recipientName?: string;
  email?: string;
  reason?: string;
}

interface BatchRecipientFormProps {
  recipients: BatchRecipient[];
  onRecipientsChange: (recipients: BatchRecipient[]) => void;
  currency: string;
  network: string;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BatchRecipientForm = ({ recipients, onRecipientsChange, currency, network, handleFileUpload }: BatchRecipientFormProps) => {
  const [showManualForm, setShowManualForm] = useState(false);
  const [newRecipient, setNewRecipient] = useState<BatchRecipient>({
    address: '',
    amount: '',
    recipientName: '',
    email: '',
    reason: ''
  });

  const addRecipient = () => {
    if (newRecipient.address && newRecipient.amount) {
      onRecipientsChange([...recipients, newRecipient]);
      setNewRecipient({
        address: '',
        amount: '',
        recipientName: '',
        email: '',
        reason: ''
      });
    }
  };

  const updateNewRecipient = (field: keyof BatchRecipient, value: string) => {
    setNewRecipient(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900">CSV File Format</h3>
            <div className="mt-2 flex items-center flex-wrap gap-2 text-xs">
              <span className="font-medium text-blue-800">1. Address*</span>
              <span className="text-gray-400">|</span>
              <span className="font-medium text-blue-800">2. Amount*</span>
              <span className="text-gray-400">|</span>
              <span className="text-blue-700">3. Name</span>
              <span className="text-gray-400">|</span>
              <span className="text-blue-700">4. Email</span>
              <span className="text-gray-400">|</span>
              <span className="text-blue-700">5. Reason</span>
            </div>
          </div>
        </div>
      </div>

      {/* Method Selection */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setShowManualForm(false)}
          className={`px-4 py-2 text-sm font-medium rounded-md ${!showManualForm 
            ? 'bg-primary-100 text-primary-700' 
            : 'text-gray-500 hover:text-gray-700'}`}
        >
          Upload CSV
        </button>
        <button
          onClick={() => setShowManualForm(true)}
          className={`px-4 py-2 text-sm font-medium rounded-md ${showManualForm 
            ? 'bg-primary-100 text-primary-700' 
            : 'text-gray-500 hover:text-gray-700'}`}
        >
          Add Manually
        </button>
      </div>

      {/* Form Content */}
      {showManualForm ? (
        <div className="p-6 border rounded-lg bg-white">
          <h3 className="text-lg font-medium mb-4">Add New Recipient</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Address *
              </label>
              <input
                type="text"
                value={newRecipient.address}
                onChange={(e) => updateNewRecipient('address', e.target.value)}
                className="w-full p-2.5 border rounded-lg text-sm bg-white"
                placeholder="0x... or Solana address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount *
              </label>
              <input
                type="number"
                value={newRecipient.amount}
                onChange={(e) => updateNewRecipient('amount', e.target.value)}
                className="w-full p-2.5 border rounded-lg text-sm bg-white"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Name
              </label>
              <input
                type="text"
                value={newRecipient.recipientName}
                onChange={(e) => updateNewRecipient('recipientName', e.target.value)}
                className="w-full p-2.5 border rounded-lg text-sm bg-white"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={newRecipient.email}
                onChange={(e) => updateNewRecipient('email', e.target.value)}
                className="w-full p-2.5 border rounded-lg text-sm bg-white"
                placeholder="Optional"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason
              </label>
              <input
                type="text"
                value={newRecipient.reason}
                onChange={(e) => updateNewRecipient('reason', e.target.value)}
                className="w-full p-2.5 border rounded-lg text-sm bg-white"
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={addRecipient}
              disabled={!newRecipient.address || !newRecipient.amount}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Add Recipient
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 border rounded-lg bg-white">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="w-full p-2.5 border rounded-lg text-sm"
          />
        </div>
      )}
    </div>
  );
}; 