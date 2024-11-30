'use client';
import { PaymentForm } from '@/app/components/payments/PaymentForm';
import { useRouter } from 'next/navigation';
import { RecentPaymentTransactions } from '@/app/components/transactions/RecentPaymentTransaction';

export default function PaymentsPage() {
  const router = useRouter();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Payments</h1>
        <div className="flex gap-3">
          <button 
            className="btn-secondary"
            onClick={() => router.push('/dashboard/statement')}
          >
            Transaction History
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-medium">Send Payment</h2>
        </div>
        <div className="p-6">
          <PaymentForm />
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-medium">Recent Transactions</h2>
        </div>
        <div className="p-6">
          <RecentPaymentTransactions />
        </div>
      </div>
    </div>
  );
}
