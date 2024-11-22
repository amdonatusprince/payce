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
  location: string;
} 