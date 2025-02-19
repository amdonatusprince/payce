import { DashboardStats } from '../components/dashboard/DashboardStats';
import { RecentInflowTransactions } from '../components/dashboard/RecentInflowTransactions';
import { AccountOverview } from '../components/dashboard/AccountOverview';
import { QuickActions } from '../components/dashboard/QuickActions';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <QuickActions />
      </div>

      <DashboardStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentInflowTransactions />
        </div>
        <div>
          <AccountOverview />
        </div>
      </div>
    </div>
  );
}