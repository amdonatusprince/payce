import { AccountSettings } from '../../components/settings/AccountSettings';
import { SpendingLimits } from '../../components/settings/SpendingLimits';
import { SecuritySettings } from '../../components/settings/SecuritySettings';
import { NotificationSettings } from '../../components/settings/NotificationSettings';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Account Settings</h1>
      
      <div className="space-y-8">
        <AccountSettings />
        <SpendingLimits />
        <SecuritySettings />
        <NotificationSettings />
      </div>
    </div>
  );
} 