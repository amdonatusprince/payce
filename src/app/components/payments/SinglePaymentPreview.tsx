import { format } from 'date-fns';
import { SupportedChain } from '@/lib/constants';

interface SinglePaymentPreviewProps {
  formData: {
    payerName: string;
    payerAddress: string;
    amount: string;
    currency: string;
    network: SupportedChain;
    reason: string;
    dueDate: string;
  };
}

export const SinglePaymentPreview = ({ formData }: SinglePaymentPreviewProps) => {
  const formatWalletAddress = (address: string) => {
    if (!address) return '0x...';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm w-full">
      {/* Header */}
      <div className="border-b p-4 sm:p-6">
        <h3 className="text-lg font-bold text-gray-900">Payment Request Preview</h3>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Payer Details Card */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-sm text-gray-700 mb-3">Payer Details</h4>
          <div className="space-y-2">
            <p className="text-sm font-medium">{formData.payerName || 'Payer Name'}</p>
            <div className="text-sm text-gray-600">
              <span>Wallet: </span>
              <span className="font-mono">{formatWalletAddress(formData.payerAddress)}</span>
              <span className="text-gray-500 ml-1">({formData.network})</span>
            </div>
          </div>
        </div>

        {/* Payment Details Card */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-sm text-gray-700 mb-3">Payment Details</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Amount</span>
              <span className="font-medium text-sm">
                {formData.amount || '0'} {formData.currency}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Network</span>
              <span className="font-medium text-sm">{formData.network}</span>
            </div>
            {formData.reason && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Reason</span>
                <span className="font-medium text-sm">{formData.reason}</span>
              </div>
            )}
            {formData.dueDate && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Due Date</span>
                <span className="font-medium text-sm">
                  {format(new Date(formData.dueDate), 'MMM dd, yyyy')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};