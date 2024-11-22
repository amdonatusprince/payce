"use client";
import { useState } from "react";
import { TalentGrid } from "../components/talents/TalentGrid";
import { TalentFilters } from "../components/talents/TalentFilters";
import { TalentSearch } from "../components/talents/TalentSearch";

export default function TalentsPage() {
  const [filters, setFilters] = useState({
    skills: [],
    availability: "all",
    rateRange: [0, 1000],
    location: "all",
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Payce Talents</h1>
        <button className="btn-primary">Post a Job</button>
      </div>

      <div className="flex gap-6">
        <div className="w-64 flex-shrink-0">
          <TalentFilters filters={filters} onChange={setFilters} />
        </div>

        <div className="flex-1">
          <TalentSearch />
          <TalentGrid filters={filters} />
        </div>
      </div>
    </div>
  );
}
