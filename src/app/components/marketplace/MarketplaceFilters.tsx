export const MarketplaceFilters = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Price Range</h3>
        <div className="space-y-2">
          <div className="flex gap-4">
            <input
              type="number"
              placeholder="Min"
              className="w-full p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Max"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Payment Currency</h3>
        <div className="space-y-2">
          {['USDC', 'ETH', 'USDT'].map((currency) => (
            <label key={currency} className="flex items-center">
              <input type="checkbox" className="mr-2" />
              {currency}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Rating</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center">
              <input type="checkbox" className="mr-2" />
              {rating} Stars & Up
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}; 