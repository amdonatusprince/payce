const categories = [
  { id: 'all', name: 'All Products' },
  { id: 'digital', name: 'Digital Products' },
  { id: 'physical', name: 'Physical Products' },
  { id: 'services', name: 'Services' },
  { id: 'subscriptions', name: 'Subscriptions' },
];

export const CategoryNav = () => {
  return (
    <nav className="border-b">
      <div className="flex space-x-8">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`py-4 px-2 border-b-2 ${
              category.id === 'all'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent hover:border-gray-300'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </nav>
  );
}; 