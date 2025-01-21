import { AccountSettings } from '../../components/settings/AccountSettings';
import { SpendingLimits } from '../../components/settings/SpendingLimits';
import { SecuritySettings } from '../../components/settings/SecuritySettings';
import { NotificationSettings } from '../../components/settings/NotificationSettings';

export default function SettingsPage() {
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <SecuritySettings />
            </div>
          </div>
          {/* Uncomment these when ready to implement
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <AccountSettings />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <SpendingLimits />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <NotificationSettings />
            </div>
          </div>
          */}
        </div>
      </div>
    </div>
  );
} 