import { SupportedChain } from '@/lib/constants';

interface BatchRecipient {
  address: string;
  amount: string;
  reason?: string;
}

interface BatchPaymentPreviewProps {
  recipients: BatchRecipient[];
  currency: string;
  network: SupportedChain;
}

export const BatchPaymentPreview = ({ recipients, currency, network }: BatchPaymentPreviewProps) => {
  const formatWalletAddress = (address: string) => {
    if (!address) return '0x...';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const calculateTotal = () => {
    return recipients.reduce((sum, recipient) => sum + (Number(recipient.amount) || 0), 0);
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm w-full">
      {/* Header */}
      <div className="border-b p-4">
        <h3 className="text-lg font-bold text-gray-900">Batch Payment Preview</h3>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Summary */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Recipients:</span>
            <span className="text-sm font-medium">{recipients.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Amount:</span>
            <span className="text-sm font-medium">{calculateTotal()} {currency}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Network:</span>
            <span className="text-sm font-medium">{network}</span>
          </div>
        </div>

        {/* Recipients Table */}
        <div className="-mx-4 -mb-4">
          <div className="max-h-[400px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider w-1/2">
                    Recipient
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  {recipients.some(r => r.reason) && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Reason
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recipients.map((recipient, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                      {formatWalletAddress(recipient.address)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {recipient.amount} {currency}
                    </td>
                    {recipients.some(r => r.reason) && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {recipient.reason || '-'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
