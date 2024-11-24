import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { HireForm } from './HireForm';
import { TalentProfile } from './TalentProfile';

export interface Talent {
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
  bio?: string;
  experience?: {
    company: string;
    role: string;
    duration: string;
  }[];
  education?: {
    institution: string;
    degree: string;
    year: string;
  }[];
  email?: string;
  calendlyUrl?: string;
}

export interface TalentCardProps {
  talent: Talent;
}

export const TalentCard: React.FC<TalentCardProps> = ({ talent }) => {
  const [isHiring, setIsHiring] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <>
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
                : talent.availability === 'busy'
                ? 'bg-yellow-100 text-yellow-800'
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
          <button 
            className="btn-secondary" 
            onClick={() => setShowProfile(true)}
          >
            View Profile
          </button>
          <button 
            className="btn-primary" 
            onClick={() => setIsHiring(true)}
          >
            Hire Now
          </button>
        </div>
      </div>

      {/* Modal Backdrop */}
      {(isHiring || showProfile) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsHiring(false);
                setShowProfile(false);
              }}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <XMarkIcon className="w-6 h-6 text-gray-500" />
            </button>
            
            {isHiring && <HireForm talent={talent} onClose={() => setIsHiring(false)} />}
            {showProfile && <TalentProfile talent={talent} onClose={() => setShowProfile(false)} />}
          </div>
        </div>
      )}
    </>
  );
}; 