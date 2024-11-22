export const AccountSettings = () => {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* <h2 className="text-xl font-semibold mb-6">Account Settings</h2> */}
        
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex-shrink-0">
              <img
                src="/avatars/default.png"
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="flex-1">
              <button className="btn-secondary">Change Avatar</button>
            </div>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                className="w-full p-3 border rounded-lg"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                className="w-full p-3 border rounded-lg"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Time Zone</label>
              <select className="w-full p-3 border rounded-lg">
                <option>UTC-8 (Pacific Time)</option>
                <option>UTC-5 (Eastern Time)</option>
                <option>UTC+0 (GMT)</option>
                <option>UTC+1 (Central European Time)</option>
              </select>
            </div>
          </div>
  
          <div className="pt-4">
            <button className="btn-primary">Save Changes</button>
          </div>
        </div>
      </div>
    );
  };