export const HireForm = () => {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Hire Talent</h2>

      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Project Title</label>
          <input
            type="text"
            className="w-full p-3 border rounded-lg"
            placeholder="Enter project title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Project Description
          </label>
          <textarea
            className="w-full p-3 border rounded-lg"
            rows={4}
            placeholder="Describe your project requirements..."
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Budget</label>
            <div className="flex gap-4">
              <input
                type="number"
                className="flex-1 p-3 border rounded-lg"
                placeholder="0.00"
              />
              <select className="w-32 p-3 border rounded-lg">
                <option value="USDC">USDC</option>
                <option value="ETH">ETH</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Duration</label>
            <select className="w-full p-3 border rounded-lg">
              <option value="less_than_week">Less than a week</option>
              <option value="1_2_weeks">1-2 weeks</option>
              <option value="2_4_weeks">2-4 weeks</option>
              <option value="1_3_months">1-3 months</option>
              <option value="3_plus_months">3+ months</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Milestones
          </label>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <input
                type="text"
                className="w-full p-3 border rounded-lg mb-4"
                placeholder="Milestone description"
              />
              <div className="flex gap-4">
                <input
                  type="number"
                  className="flex-1 p-3 border rounded-lg"
                  placeholder="Amount"
                />
                <input
                  type="date"
                  className="w-48 p-3 border rounded-lg"
                />
              </div>
            </div>
            <button
              type="button"
              className="text-primary-600 hover:text-primary-700"
            >
              + Add Milestone
            </button>
          </div>
        </div>

        <button type="submit" className="w-full btn-primary">
          Submit Proposal
        </button>
      </form>
    </div>
  );
}; 