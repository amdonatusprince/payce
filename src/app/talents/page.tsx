"use client";
import { useState } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { TalentGrid } from "../components/talents/TalentGrid";
import { TalentFilters } from "../components/talents/TalentFilters";
import { TalentSearch } from "../components/talents/TalentSearch";
import payceLogo from '../../../public/payceLogo.png';

export default function TalentsPage() {
  const [filters, setFilters] = useState({
    skills: [],
    availability: "all",
    rateRange: [0, 1000],
    location: "all",
  });

  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      <div className="space-y-6">
        {/* Back to Dashboard Link */}
        <div className="pt-6 sm:pt-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          {/* Header with Logo and Title */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex items-center gap-3">
              <Image 
                src={payceLogo}
                alt="Payce Logo"
                width={32}
                height={32}
                priority
              />
              <h1 className="text-2xl font-bold">Payce Talent Hub</h1>
            </div>
            <button className="btn-primary w-full sm:w-auto">Post a Job</button>
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full btn-secondary mb-4"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters - Hidden on mobile by default */}
          <div className={`
            lg:w-64 lg:flex-shrink-0
            ${showFilters ? 'block' : 'hidden'} 
            lg:block
          `}>
            <div className="sticky top-20">
              <TalentFilters filters={filters} onChange={setFilters} />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-4">
            <TalentSearch />
            <TalentGrid filters={filters} />
          </div>
        </div>
      </div>
    </div>
  );
}
