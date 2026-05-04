"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import SaveButton from "@/components/SaveButton";
import VerificationBadges from "@/components/VerificationBadges";
import InterestButton from "@/components/InterestButton";
import ShareButton from "@/components/ShareButton";
import ReportButton from "@/components/ReportButton";
import { Profile } from "@/lib/types";
import { fetchProfile } from "@/lib/db";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-maktub-green mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-2 border-b border-maktub-border/50 last:border-0">
      <span className="text-maktub-text-secondary text-base sm:w-40 shrink-0">
        {label}
      </span>
      <span className="text-maktub-text text-base font-medium">{value}</span>
    </div>
  );
}

export default function ProfileDetailClient({ id }: { id: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile(id).then((p) => {
      setProfile(p);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col bg-maktub-darker">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-maktub-text-secondary">Loading...</div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-1 flex-col bg-maktub-darker">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-maktub-text font-medium">Profile not found</p>
            <Link href="/profiles" className="text-sm text-maktub-green hover:underline mt-2 block">
              Back to profiles
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-1 flex-col bg-maktub-darker">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        <Link
          href="/profiles"
          className="inline-flex items-center gap-2 text-base text-maktub-text-secondary hover:text-maktub-text mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to profiles
        </Link>

        <div className="bg-maktub-panel rounded-2xl border border-maktub-border overflow-hidden">
          <div className="bg-maktub-bubble-out/30 px-6 py-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-maktub-green/20 flex items-center justify-center text-maktub-green font-bold text-2xl shrink-0 overflow-hidden">
                {profile.imageUrl ? (
                  <Image src={profile.imageUrl} alt={profile.name} width={80} height={80} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-maktub-text">{profile.name}</h1>
                </div>
                <VerificationBadges
                  profileId={profile.id}
                  phoneVerified={profile.phoneVerified}
                  defaultAdminVerified={profile.adminVerified}
                />
                <p className="text-maktub-text-secondary text-base mt-1">{profile.residence}</p>
              </div>
              <div className="flex flex-col gap-2 items-end shrink-0">
                <div className="flex items-center gap-1">
                  <ShareButton profileId={profile.id} profileName={profile.name} />
                  <SaveButton profileId={profile.id} />
                </div>
                <InterestButton profileId={profile.id} />
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            <Section title="Personal Information">
              <InfoRow label="Age" value={`${profile.age} years old`} />
              <InfoRow label="Gender" value={profile.gender} />
              <InfoRow label="Height" value={profile.height} />
              <InfoRow label="Education" value={profile.education} />
              <InfoRow label="Profession" value={profile.profession} />
              <InfoRow label="Legal Status" value={profile.legalStatus} />
              <InfoRow label="Marital Status" value={profile.maritalStatus} />
              <InfoRow label="Children" value={profile.children} />
              <InfoRow label="Ethnicity" value={profile.ethnicity} />
              <InfoRow label="Religious Sect" value={profile.religiousSect} />
              <InfoRow label="Languages" value={profile.languages.join(", ")} />
              <InfoRow label="Relocate" value={profile.relocate} />
            </Section>

            <Section title="About Me">
              <p className="text-maktub-text text-base leading-relaxed">{profile.aboutMe}</p>
            </Section>

            <Section title="Looking For">
              <InfoRow label="Age Range" value={profile.lookingFor.ageRange} />
              <InfoRow label="Height" value={profile.lookingFor.height} />
              <InfoRow label="Ethnicity" value={profile.lookingFor.ethnicity} />
              <InfoRow label="Residence" value={profile.lookingFor.residence} />
              <InfoRow label="Legal Status" value={profile.lookingFor.legalStatus} />
              <InfoRow label="Marital Status" value={profile.lookingFor.maritalStatus} />
              <InfoRow label="Religious Sect" value={profile.lookingFor.religiousSect} />
            </Section>

            {profile.comments && (
              <Section title="Additional Comments">
                <p className="text-maktub-text text-base leading-relaxed">{profile.comments}</p>
              </Section>
            )}

            <Section title="Contact Information">
              <InfoRow label="Contact Person" value={profile.contactName} />
              <InfoRow label="Phone" value={profile.contactPhone} />
            </Section>
          </div>
        </div>

        <div className="mt-6 flex justify-center pb-8">
          <ReportButton profileId={profile.id} />
        </div>
      </main>
    </div>
  );
}
