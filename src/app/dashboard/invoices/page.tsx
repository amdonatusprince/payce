'use client';
import { useState } from 'react';
import { RecentInvoiceTransactions } from '../../components/invoices/RecentInvoiceTransaction';
import { InvoiceStats } from '../../components/invoices/InvoiceStats';
import { InvoiceForm } from '../../components/invoices/InvoiceForm';

export default function InvoicesPage() {
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);

  if (showCreateInvoice) {
    return (
      <div className="w-full max-w-[100vw] space-y-4 px-2 sm:px-4 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-lg sm:text-xl font-bold">Create Invoice</h1>
          <button 
            onClick={() => setShowCreateInvoice(false)}
            className="btn-secondary text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 whitespace-nowrap"
          >
            Back to Invoices
          </button>
        </div>
        <InvoiceForm />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[100vw] space-y-4 px-2 sm:px-4 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg sm:text-xl font-bold">Invoices</h1>
        <button 
          onClick={() => setShowCreateInvoice(true)}
          className="btn-primary text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 whitespace-nowrap"
        >
          Create Invoice
        </button>
      </div>

      <InvoiceStats />
      
      <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Search invoices..."
            className="w-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm border rounded-lg"
          />
          <select 
            className="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm border rounded-lg bg-white"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button 
            className="flex-1 sm:flex-none btn-secondary text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 whitespace-nowrap"
          >
            Export CSV
          </button>
          <button 
            className="flex-1 sm:flex-none btn-secondary text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 whitespace-nowrap"
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="w-full">
        <RecentInvoiceTransactions />
      </div>
    </div>
  );
} 