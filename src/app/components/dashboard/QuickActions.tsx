"use client";
import { useRouter } from 'next/navigation';

export const QuickActions = () => {
    const router = useRouter();

    return (
      <div className="flex gap-2 sm:gap-3">
        <button 
          className="btn-primary text-xs sm:text-sm whitespace-nowrap px-3 sm:px-4 py-1.5 sm:py-2"
          onClick={() => router.push('/dashboard/payments')}
        >
          Send Payment
        </button>
        <button 
          className="btn-secondary text-xs sm:text-sm whitespace-nowrap px-3 sm:px-4 py-1.5 sm:py-2"
          onClick={() => router.push('/dashboard/invoices')}
        >
          Create Invoice
        </button>
      </div>
    );
};