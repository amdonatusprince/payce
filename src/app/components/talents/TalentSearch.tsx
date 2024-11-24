import { useState } from 'react';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

export const TalentSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    // Implement search functionality
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl 
              bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 
              focus:border-transparent placeholder:text-gray-400"
            placeholder="Search by skill, role, or keyword..."
          />
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={handleSearch}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 
              transition-colors duration-200 flex items-center gap-2 font-medium"
          >
            Search
          </button>
          
          <button 
            className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 
              transition-colors duration-200 hidden sm:flex items-center"
            title="Advanced Filters"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}; 