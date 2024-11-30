"use client";
import { useRouter } from 'next/navigation';

export const QuickActions = () => {
    const router = useRouter();

    return (
      <div className="flex gap-3">
        <button 
          className="btn-primary"
          onClick={() => router.push('/dashboard/payments')}
        >
          Send Payment
        </button>
        <button 
          className="btn-secondary"
          onClick={() => router.push('/dashboard/invoices')}
        >
          Create Invoice
        </button>
      </div>
    );
};