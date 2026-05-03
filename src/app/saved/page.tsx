"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ProfileCard from "@/components/ProfileCard";
import { Profile } from "@/lib/types";
import { fetchProfiles } from "@/lib/db";
import { useSavedProfiles } from "@/lib/useSavedProfiles";

export default function SavedPage() {
  const { savedIds } = useSavedProfiles();
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    let ignore = false;
    fetchProfiles().then((data) => { if (!ignore) setAllProfiles(data); });
    return () => { ignore = true; };
  }, []);

  const savedProfiles = useMemo(
    () => allProfiles.filter((p) => savedIds.includes(p.id)),
    [savedIds, allProfiles]
  );

  return (
    <div className="flex flex-1 flex-col bg-maktub-darker">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-maktub-text">
            Saved Profiles
          </h1>
          <p className="text-sm text-maktub-text-secondary mt-1">
            {savedProfiles.length} profile
            {savedProfiles.length !== 1 ? "s" : ""} saved
          </p>
        </div>

        {savedProfiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedProfiles.map((profile) => (
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
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <p className="text-maktub-text font-medium">No saved profiles yet</p>
            <p className="text-sm text-maktub-text-secondary mt-1">
              Tap the heart icon on any profile to save it here
            </p>
            <Link
              href="/profiles"
              className="mt-4 px-6 py-2 rounded-full bg-maktub-green text-white text-sm font-medium hover:bg-maktub-green-dark transition-colors"
            >
              Browse Profiles
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
