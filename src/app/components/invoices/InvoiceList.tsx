import { format } from 'date-fns';

const dummyInvoices = [
  {
    id: 'INV-001',
    client: 'Acme Corp',
    amount: 1500,
    currency: 'USDC',
    status: 'paid',
    dueDate: new Date('2024-03-01'),
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 'INV-002',
    client: 'TechStart Inc',
    amount: 2500,
    currency: 'USDC',
    status: 'pending',
    dueDate: new Date('2024-03-15'),
    createdAt: new Date('2024-02-15'),
  },
  // Add more dummy invoices as needed
];

export const InvoiceList = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dummyInvoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {invoice.id}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(invoice.createdAt, 'MMM d, yyyy')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{invoice.client}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {invoice.amount} {invoice.currency}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    invoice.status === 'paid' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(invoice.dueDate, 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-primary-600 hover:text-primary-900 mr-4">
                    View
                  </button>
                  <button className="text-gray-600 hover:text-gray-900">
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
