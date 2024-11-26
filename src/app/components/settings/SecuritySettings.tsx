export const SecuritySettings = () => {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            </div>
          </div>
  
          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Add an extra layer of security to your account
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Currently: <span className="text-red-600">Disabled</span>
                </p>
              </div>
              <button className="btn-secondary">Enable 2FA</button>
            </div>
          </div>
  
          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium mb-4">Connected Wallets</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">MetaMask</p>
                  <p className="text-sm text-gray-600">0x1234...5678</p>
                </div>
                <button className="text-red-600 hover:text-red-700">
                  Disconnect
                </button>
              </div>
              <button className="btn-secondary">
                Connect Another Wallet
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };