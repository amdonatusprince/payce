export const AccountSettings = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6 w-full overflow-x-hidden">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 flex-shrink-0 mx-auto sm:mx-0">
            <img
              src="/profile.jpg"
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <button className="btn-secondary text-xs sm:text-base px-3 py-1.5 sm:px-4 sm:py-2">
              Change Avatar
            </button>
          </div>
        </div>
  
        <div className="grid grid-cols-1 gap-3 sm:gap-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              className="w-full p-2 sm:p-3 border rounded-lg text-xs sm:text-base"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full p-2 sm:p-3 border rounded-lg text-xs sm:text-base"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">Phone Number</label>
            <input
              type="tel"
              className="w-full p-2 sm:p-3 border rounded-lg text-xs sm:text-base"
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">Time Zone</label>
            <select className="w-full p-2 sm:p-3 border rounded-lg text-xs sm:text-base">
              <option>UTC-8 (Pacific Time)</option>
              <option>UTC-5 (Eastern Time)</option>
              <option>UTC+0 (GMT)</option>
              <option>UTC+1 (Central European Time)</option>
            </select>
          </div>
        </div>
  
        <div className="pt-3 sm:pt-4">
          <button className="w-full sm:w-auto btn-primary text-xs sm:text-base px-3 py-1.5 sm:px-4 sm:py-2">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};