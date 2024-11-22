import { useState } from 'react';
import { HireForm } from './HireForm';

interface TalentCardProps {
  talent: {
    id: string;
    name: string;
    title: string;
    skills: string[];
    hourlyRate: number;
    currency: string;
    rating: number;
    completedJobs: number;
    avatar: string;
    availability: 'available' | 'busy' | 'unavailable';
  };
}

export const TalentCard: React.FC<TalentCardProps> = ({ talent }) => {
  const [isHiring, setIsHiring] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        <img
          src={talent.avatar}
          alt={talent.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div>
          <h3 className="font-semibold text-lg">{talent.name}</h3>
          <p className="text-gray-600">{talent.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm">★ {talent.rating}</span>
            <span className="text-sm text-gray-600">
              ({talent.completedJobs} jobs)
            </span>
          </div>
        </div>
        <div className="ml-auto text-right">
          <p className="font-semibold">
            {talent.hourlyRate} {talent.currency}/hr
          </p>
          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
            talent.availability === 'available'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {talent.availability}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex flex-wrap gap-2">
          {talent.skills.map((skill) => (
            <span
              key={skill}
              className="px-3 py-1 bg-gray-100 rounded-full text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t flex justify-between">
        <button className="btn-secondary" onClick={() => setIsHiring(true)}>
          View Profile
        </button>
        <button className="btn-primary" onClick={() => setIsHiring(true)}>
          Hire Now
        </button>
      </div>

      {isHiring && (
        <div className="mt-4">
          <HireForm />
          <button className="mt-2 btn-secondary" onClick={() => setIsHiring(false)}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}; 