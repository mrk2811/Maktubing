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
import { useToast } from "@/components/Toast";
import { ProfileDetailSkeleton } from "@/components/Skeleton";
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
  const [showPhoto, setShowPhoto] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchProfile(id)
      .then((p) => {
        setProfile(p);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        showToast("Failed to load profile. Please try again.");
      });
  }, [id, showToast]);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col bg-maktub-darker">
        <Navbar />
        <main className="flex-1">
          <ProfileDetailSkeleton />
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
              <button
                type="button"
                onClick={() => profile.imageUrl && setShowPhoto(true)}
                className={`w-20 h-20 rounded-full bg-maktub-green/20 flex items-center justify-center text-maktub-green font-bold text-2xl shrink-0 overflow-hidden ${profile.imageUrl ? "cursor-pointer" : "cursor-default"}`}
              >
                {profile.imageUrl ? (
                  <Image src={profile.imageUrl} alt={profile.name} width={80} height={80} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </button>
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
              {profile.contactPhone && (
                <div className="mt-4">
                  <a
                    href={`https://wa.me/${profile.contactPhone.replace(/[\s\-()]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] text-white rounded-xl text-sm font-medium shadow-sm hover:bg-[#1da851] transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </a>
                </div>
              )}
            </Section>
          </div>
        </div>

        <div className="mt-6 flex justify-center pb-8">
          <ReportButton profileId={profile.id} />
        </div>
      </main>

      {showPhoto && profile.imageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowPhoto(false)}
        >
          <button
            type="button"
            onClick={() => setShowPhoto(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <Image
            src={profile.imageUrl}
            alt={profile.name}
            width={400}
            height={400}
            className="max-w-full max-h-[80vh] rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
