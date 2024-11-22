import { useState } from 'react';
import { supportedCurrencies } from '@/lib/constants';

export const InvoiceForm = () => {
  const [items, setItems] = useState([{ description: '', amount: 0 }]);

  const addItem = () => {
    setItems([...items, { description: '', amount: 0 }]);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Create Invoice</h2>

      <form className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Client Name</label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg"
              placeholder="Enter client name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Client Email</label>
            <input
              type="email"
              className="w-full p-3 border rounded-lg"
              placeholder="client@example.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Due Date</label>
            <input
              type="date"
              className="w-full p-3 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Currency</label>
            <select className="w-full p-3 border rounded-lg">
              {supportedCurrencies.map(currency => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
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
                  className="flex-1 p-3 border rounded-lg"
                  placeholder="Item description"
                />
                <input
                  type="number"
                  className="w-32 p-3 border rounded-lg"
                  placeholder="Amount"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addItem}
            className="mt-4 text-primary-600 hover:text-primary-700"
          >
            + Add Item
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Notes</label>
          <textarea
            className="w-full p-3 border rounded-lg"
            rows={4}
            placeholder="Additional notes or payment terms..."
          />
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" className="btn-secondary">
            Save Draft
          </button>
          <button type="submit" className="btn-primary">
            Send Invoice
          </button>
        </div>
      </form>
    </div>
  );
}; 