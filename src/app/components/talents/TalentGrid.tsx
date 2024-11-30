import { TalentCard } from '../../components/talents/TalentCard';
import { Talent } from '../../../types/talent';

interface TalentGridProps {
  filters: {
    skills: string[];
    availability: string;
    rateRange: number[];
    location: string;
  };
}

const dummyTalents: Talent[] = [
  {
    id: '1',
    name: 'Justin Shaifer',
    title: 'Frontend Developer',
    skills: ['JavaScript', 'React'],
    hourlyRate: 50,
    currency: 'USDC',
    rating: 4.5,
    completedJobs: 10,
    avatar: '/assets/profiles/justin-shaifer.jpg',
    availability: 'available',
    location: 'New York',
  },
  {
    id: '2',
    name: 'Giselle Gracia',
    title: 'Community Manager',
    skills: ['Content Creation', 'Social Media'],
    hourlyRate: 25,
    currency: 'USDC',
    rating: 4.8,
    completedJobs: 15,
    avatar: '/assets/profiles/giselle.jpg',
    availability: 'busy',
    location: 'San Francisco',
  },
  // Add more dummy talents
];

export const TalentGrid = ({ filters }: TalentGridProps) => {
  const filteredTalents = dummyTalents.filter(talent => {
    const matchesSkills = filters.skills.length === 0 || filters.skills.some(skill => talent.skills.includes(skill));
    const matchesAvailability = filters.availability === 'all' || talent.availability === filters.availability;
    const matchesRate = talent.hourlyRate >= filters.rateRange[0] && talent.hourlyRate <= filters.rateRange[1];
    const matchesLocation = filters.location === 'all' || talent.location.toLowerCase().includes(filters.location.toLowerCase());

    return matchesSkills && matchesAvailability && matchesRate && matchesLocation;
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredTalents.map(talent => (
        <TalentCard key={talent.id} talent={talent} />
      ))}
    </div>
  );
}; 