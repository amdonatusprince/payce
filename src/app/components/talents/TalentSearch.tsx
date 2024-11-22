import { useState } from 'react';

export const TalentSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    // Implement search functionality
  };

  return (
    <div className="mb-4">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-3 border rounded-lg"
        placeholder="Search talents..."
      />
      <button onClick={handleSearch} className="btn-primary mt-2">
        Search
      </button>
    </div>
  );
}; 