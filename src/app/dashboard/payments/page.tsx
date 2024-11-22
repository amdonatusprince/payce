import { PaymentForm } from '@/app/components/payments/PaymentForm';

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Payments</h1>
        <div className="flex gap-3">
          <button className="btn-outline">Transaction History</button>
          <button className="btn-primary">New Payment</button>
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
          {/* You can add a TransactionList component here */}
          <p className="text-gray-500">No recent transactions</p>
        </div>
      </div>
    </div>
  );
}
