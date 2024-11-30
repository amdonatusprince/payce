'use client';
import { useRouter } from 'next/navigation';

export const AccountOverview = () => {
  const router = useRouter();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Account Overview</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-sm text-gray-600 mb-2">Credit Score</h3>
          <div className="flex items-center">
            <div className="flex-1 h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-green-500 rounded-full" 
                style={{ width: '75%' }}
              />
            </div>
            <span className="ml-2 font-semibold">750</span>
          </div>
        </div>

        <div>
          <h3 className="text-sm text-gray-600 mb-2">Spending Limit</h3>
          <div className="flex items-center justify-between">
            <div className="flex-1 h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-blue-500 rounded-full" 
                style={{ width: '45%' }}
              />
            </div>
            <span className="ml-2 text-sm">
              $4,500/$10,000
            </span>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm text-gray-600 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => router.push('/talents')}
              className="p-2 text-sm text-center border rounded-lg hover:bg-gray-50"
            >
              Talent Hub
            </button>
            <button 
              onClick={() => router.push('/marketplace')}
              className="p-2 text-sm text-center border rounded-lg hover:bg-gray-50"
            >
              Marketplace
            </button>
            <button 
              onClick={() => router.push('/dashboard/settings')}
              className="p-2 text-sm text-center border rounded-lg hover:bg-gray-50"
            >
              Settings
            </button>
            <button 
              onClick={() => router.push('/dashboard/statement')}
              className="p-2 text-sm text-center border rounded-lg hover:bg-gray-50"
            >
              My Statement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 