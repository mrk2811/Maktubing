"use client";

import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import ProfileCard from "@/components/ProfileCard";
import FilterBar from "@/components/FilterBar";
import { mockProfiles } from "@/lib/mock-data";
import { FilterOptions } from "@/lib/types";
import { useSavedFilters } from "@/lib/useSavedFilters";

const emptyFilters: FilterOptions = {
  gender: "",
  ageMin: "",
  ageMax: "",
  ethnicity: "",
  religiousSect: "",
  maritalStatus: "",
  legalStatus: "",
  residence: "",
};

export default function ProfilesPage() {
  const [filters, setFilters] = useState<FilterOptions>(emptyFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);
  const { savedFilters, saveFilter, deleteFilter } = useSavedFilters();

  const filteredProfiles = useMemo(() => {
    return mockProfiles.filter((p) => {
      if (filters.gender && p.gender !== filters.gender) return false;
      if (filters.ageMin && p.age < parseInt(filters.ageMin)) return false;
      if (filters.ageMax && p.age > parseInt(filters.ageMax)) return false;
      if (
        filters.ethnicity &&
        !p.ethnicity.toLowerCase().includes(filters.ethnicity.toLowerCase())
      )
        return false;
      if (
        filters.religiousSect &&
        p.religiousSect.toLowerCase() !== filters.religiousSect.toLowerCase()
      )
        return false;
      if (
        filters.maritalStatus &&
        !p.maritalStatus
          .toLowerCase()
          .includes(filters.maritalStatus.toLowerCase())
      )
        return false;
      if (
        filters.legalStatus &&
        !p.legalStatus
          .toLowerCase()
          .includes(filters.legalStatus.toLowerCase())
      )
        return false;
      if (
        filters.residence &&
        !p.residence.toLowerCase().includes(filters.residence.toLowerCase())
      )
        return false;
      return true;
    });
  }, [filters]);

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== ""
  ).length;

  return (
    <div className="flex flex-1 flex-col bg-maktub-darker">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-maktub-text">
              Browse Profiles
            </h1>
            <p className="text-base text-maktub-text-secondary mt-1">
              {filteredProfiles.length} profile
              {filteredProfiles.length !== 1 ? "s" : ""} available
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-maktub-panel border border-maktub-border text-base font-medium text-maktub-text hover:border-maktub-green transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-maktub-green text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Saved Filter Pills */}
        {savedFilters.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {savedFilters.map((sf) => (
              <div key={sf.id} className="flex items-center gap-1">
                <button
                  onClick={() => {
                    if (activeFilterId === sf.id) {
                      setFilters(emptyFilters);
                      setActiveFilterId(null);
                    } else {
                      setFilters(sf.filters);
                      setActiveFilterId(sf.id);
                      setShowFilters(false);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeFilterId === sf.id
                      ? "bg-maktub-green text-white shadow-sm"
                      : "bg-maktub-panel text-maktub-text border border-maktub-border hover:border-maktub-green/50"
                  }`}
                >
                  {sf.name}
                </button>
                <button
                  onClick={() => {
                    deleteFilter(sf.id);
                    if (activeFilterId === sf.id) {
                      setFilters(emptyFilters);
                      setActiveFilterId(null);
                    }
                  }}
                  className="w-5 h-5 flex items-center justify-center rounded-full text-maktub-text-secondary hover:bg-maktub-input hover:text-red-500 transition-colors"
                  aria-label={`Delete saved filter ${sf.name}`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="mb-6">
            <FilterBar
              filters={filters}
              onFilterChange={(f) => {
                setFilters(f);
                setActiveFilterId(null);
              }}
              onReset={() => {
                setFilters(emptyFilters);
                setActiveFilterId(null);
              }}
              onSave={(name) => saveFilter(name, filters)}
            />
          </div>
        )}

        {/* Profile Grid */}
        {filteredProfiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProfiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-maktub-panel flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-maktub-text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <p className="text-maktub-text font-medium">No profiles found</p>
            <p className="text-sm text-maktub-text-secondary mt-1">
              Try adjusting your filters
            </p>
            <button
              onClick={() => setFilters(emptyFilters)}
              className="mt-4 text-sm text-maktub-green hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
