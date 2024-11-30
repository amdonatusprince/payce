'use client';
import { useState } from 'react';
import { RecentInvoiceTransactions } from '../../components/invoices/RecentInvoiceTransaction';
import { InvoiceStats } from '../../components/invoices/InvoiceStats';
import { InvoiceForm } from '../../components/invoices/InvoiceForm';

export default function InvoicesPage() {
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);

  if (showCreateInvoice) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Create Invoice</h1>
          <button 
            onClick={() => setShowCreateInvoice(false)}
            className="btn-secondary"
          >
            Back to Invoices
          </button>
        </div>
        <InvoiceForm />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <button 
          onClick={() => setShowCreateInvoice(true)}
          className="btn-primary"
        >
          Create Invoice
        </button>
      </div>

      <InvoiceStats />
      
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search invoices..."
            className="px-4 py-2 border rounded-lg"
          />
          <select className="px-4 py-2 border rounded-lg">
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button className="btn-secondary">
            Export CSV
          </button>
          <button className="btn-secondary">
            Export PDF
          </button>
        </div>
      </div>

      <RecentInvoiceTransactions />
    </div>
  );
} 