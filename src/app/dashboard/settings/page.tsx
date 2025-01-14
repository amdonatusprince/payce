import { AccountSettings } from '../../components/settings/AccountSettings';
import { SpendingLimits } from '../../components/settings/SpendingLimits';
import { SecuritySettings } from '../../components/settings/SecuritySettings';
import { NotificationSettings } from '../../components/settings/NotificationSettings';

export default function SettingsPage() {
  return (
    <div className="w-full overflow-hidden px-2 sm:px-6">
      <div className="space-y-4 sm:space-y-8">
        {/* <AccountSettings /> */}
        {/* <SpendingLimits /> */}
        <SecuritySettings />
        {/* <NotificationSettings /> */}
      </div>
    </div>
  );
} 