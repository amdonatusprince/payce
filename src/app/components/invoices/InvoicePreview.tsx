import { format } from 'date-fns';

interface InvoicePreviewProps {
  formData: {
    businessName: string;
    businessEmail: string;
    businessAddress: string;
    clientName: string;
    clientEmail: string;
    clientAddress: string;
    clientWallet: string;
    currency: string;
    network: string;
    dueDate: string;
    notes: string;
    invoiceReference: string;
  };
  items: Array<{
    description: string;
    amount: number;
  }>;
  logoPreview: string | null;
  calculateTotal: () => string;
}

export const InvoicePreview = ({ formData, items, logoPreview, calculateTotal }: InvoicePreviewProps) => {
  const total = calculateTotal();
  
  const formatWalletAddress = (address: string) => {
    if (!address) return '0x...';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  return (
    <div className="bg-white border rounded-lg p-4 sm:p-6 max-w-full">
      {/* Header with Logo and Invoice Info */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex-1 min-w-0">
          {logoPreview ? (
            <img 
              src={logoPreview} 
              alt="Business Logo" 
              className="max-h-16 object-contain"
            />
          ) : (
            <div className="h-16 w-32 bg-gray-100 flex items-center justify-center rounded">
              <span className="text-gray-400 text-sm">Logo</span>
            </div>
          )}
        </div>
        <div className="text-right ml-4">
          <h3 className="text-xl font-bold text-gray-900">INVOICE</h3>
          <p className="text-sm text-gray-600 mt-1">
            Ref: {formData.invoiceReference || 'INV-0000'}
          </p>
        </div>
      </div>

      {/* Business and Client Details */}
      <div className="grid grid-cols-2 gap-4 sm:gap-8 mb-8">
        {/* From Details */}
        <div className="min-w-0">
          <h4 className="font-medium text-sm text-gray-700 mb-2">From:</h4>
          <div className="text-sm space-y-1">
            <p className="font-medium truncate">{formData.businessName || 'Your Business Name'}</p>
            <p className="text-gray-600 truncate">{formData.businessEmail || 'your@email.com'}</p>
            <p className="text-gray-600 break-words">
              {formData.businessAddress || 'Your Address'}
            </p>
          </div>
        </div>

        {/* Bill To Details */}
        <div className="min-w-0">
          <h4 className="font-medium text-sm text-gray-700 mb-2">Bill To:</h4>
          <div className="text-sm space-y-1">
            <p className="font-medium truncate">{formData.clientName || 'Client Name'}</p>
            <p className="text-gray-600 truncate">{formData.clientEmail || 'client@email.com'}</p>
            <p className="text-gray-600 break-words">
              {formData.clientAddress || 'Client Address'}
            </p>
            <div className="text-gray-600 mt-1">
              <span className="text-sm">Wallet: </span>
              <span className="text-sm">
                {formatWalletAddress(formData.clientWallet)}
              </span>
              <span className="text-sm text-gray-500 ml-1">
                ({formData.network})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="flex justify-between text-sm mb-8">
        <div>
          <p className="text-gray-600">Invoice Date:</p>
          <p className="font-medium">{format(new Date(), 'MMM dd, yyyy')}</p>
        </div>
        <div>
          <p className="text-gray-600">Due Date:</p>
          <p className="font-medium">
            {formData.dueDate ? format(new Date(formData.dueDate), 'MMM dd, yyyy') : 'Not set'}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <div className="border rounded-lg overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-gray-600">Description</th>
              <th className="px-4 py-2 text-right text-gray-600">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={index}>
                <td className="px-4 py-2">{item.description || 'Item description'}</td>
                <td className="px-4 py-2 text-right">
                  {item.amount ? `${item.amount} ${formData.currency} (${formData.network})` : '0'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td className="px-4 py-2 font-medium">Total</td>
              <td className="px-4 py-2 text-right font-medium">
                {total} {formData.currency} ({formData.network})
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Notes */}
      {formData.notes && (
        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-2">Notes:</h4>
          <p className="text-sm text-gray-600 whitespace-pre-line">{formData.notes}</p>
        </div>
      )}
    </div>
  );
};
