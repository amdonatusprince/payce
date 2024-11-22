import { useState } from 'react';

interface TalentFiltersProps {
  filters: {
    skills: string[];
    availability: string;
    rateRange: number[];
    location: string;
  };
  onChange: (filters: any) => void;
}

export const TalentFilters = ({ filters, onChange }: TalentFiltersProps) => {
  const [selectedSkills, setSelectedSkills] = useState(filters.skills);
  const [availability, setAvailability] = useState(filters.availability);
  const [rateRange, setRateRange] = useState(filters.rateRange);
  const [location, setLocation] = useState(filters.location);

  const handleSkillChange = (skill: string) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    setSelectedSkills(newSkills);
    onChange({ ...filters, skills: newSkills });
  };

  const handleAvailabilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAvailability(e.target.value);
    onChange({ ...filters, availability: e.target.value });
  };

  const handleRateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setRateRange([value, rateRange[1]]);
    onChange({ ...filters, rateRange: [value, rateRange[1]] });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>

      <div className="mb-4">
        <h3 className="text-sm font-medium">Skills</h3>
        <div className="flex flex-col">
          {['JavaScript', 'Python', 'React', 'Node.js'].map(skill => (
            <label key={skill} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedSkills.includes(skill)}
                onChange={() => handleSkillChange(skill)}
                className="mr-2"
              />
              {skill}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium">Availability</h3>
        <select
          value={availability}
          onChange={handleAvailabilityChange}
          className="w-full p-2 border rounded-lg"
        >
          <option value="all">All</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
          <option value="busy">Busy</option>
        </select>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium">Rate Range</h3>
        <input
          type="range"
          min="0"
          max="1000"
          value={rateRange[0]}
          onChange={handleRateRangeChange}
          className="w-full"
        />
        <p>Rate: ${rateRange[0]} - ${rateRange[1]}</p>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium">Location</h3>
        <input
          type="text"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            onChange({ ...filters, location: e.target.value });
          }}
          className="w-full p-2 border rounded-lg"
          placeholder="Enter location"
        />
      </div>
    </div>
  );
}; 