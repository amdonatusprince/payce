import { DashboardStats } from '../components/dashboard/DashboardStats';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { AccountOverview } from '../components/dashboard/AccountOverview';
import { QuickActions } from '../components/dashboard/QuickActions';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <QuickActions />
      </div>

      <DashboardStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>
        <div>
          <AccountOverview />
        </div>
      </div>
    </div>
  );
}