"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { Profile } from "@/lib/types";
import { fetchProfiles } from "@/lib/db";
import { useAdminStore } from "@/lib/useAdminStore";
import { useReports, Report, ReportReason } from "@/lib/useReports";

type AdminTab = "profiles" | "flagged";

const REASON_LABELS: Record<ReportReason, string> = {
  fake_profile: "Fake Profile",
  inappropriate_content: "Inappropriate Content",
  spam: "Spam",
  other: "Other",
};

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("profiles");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const { setVerified } = useAdminStore();
  const { pendingReports, updateReportStatus } = useReports();

  useEffect(() => {
    let ignore = false;
    fetchProfiles().then((data) => {
      if (!ignore) setProfiles(data);
    });
    return () => { ignore = true; };
  }, []);

  const handleVerify = useCallback(async (profileId: string) => {
    await setVerified(profileId, true);
    setProfiles((prev) =>
      prev.map((p) => (p.id === profileId ? { ...p, adminVerified: true } : p))
    );
  }, [setVerified]);

  const pendingProfiles = profiles.filter((p) => !p.adminVerified);
  const verifiedProfiles = profiles.filter((p) => p.adminVerified);

  return (
    <div className="flex flex-1 flex-col bg-maktub-darker">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-maktub-text">
            Admin Dashboard
          </h1>
          <p className="text-sm text-maktub-text-secondary mt-1">
            Review profiles and manage reports
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-maktub-input rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab("profiles")}
            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "profiles"
                ? "bg-maktub-panel text-maktub-text shadow-sm"
                : "text-maktub-text-secondary hover:text-maktub-text"
            }`}
          >
            Profiles
          </button>
          <button
            onClick={() => setActiveTab("flagged")}
            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors relative ${
              activeTab === "flagged"
                ? "bg-maktub-panel text-maktub-text shadow-sm"
                : "text-maktub-text-secondary hover:text-maktub-text"
            }`}
          >
            Flagged
            {pendingReports.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-red-500 text-white rounded-full">
                {pendingReports.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "profiles" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-maktub-panel rounded-xl border border-maktub-border p-4">
                <p className="text-2xl font-bold text-maktub-text">
                  {profiles.length}
                </p>
                <p className="text-xs text-maktub-text-secondary">Total Profiles</p>
              </div>
              <div className="bg-maktub-panel rounded-xl border border-maktub-border p-4">
                <p className="text-2xl font-bold text-amber-600">
                  {pendingProfiles.length}
                </p>
                <p className="text-xs text-maktub-text-secondary">Pending Review</p>
              </div>
              <div className="bg-maktub-panel rounded-xl border border-maktub-border p-4">
                <p className="text-2xl font-bold text-maktub-green">
                  {verifiedProfiles.length}
                </p>
                <p className="text-xs text-maktub-text-secondary">Verified</p>
              </div>
            </div>

            {/* Pending Profiles */}
            {pendingProfiles.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-maktub-text mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Pending Review ({pendingProfiles.length})
                </h2>
                <div className="space-y-3">
                  {pendingProfiles.map((profile) => (
                    <AdminProfileCard
                      key={profile.id}
                      profile={profile}
                      onVerify={() => handleVerify(profile.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Verified Profiles */}
            <section>
              <h2 className="text-lg font-semibold text-maktub-text mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-maktub-green" />
                Verified ({verifiedProfiles.length})
              </h2>
              <div className="space-y-3">
                {verifiedProfiles.map((profile) => (
                  <AdminProfileCard
                    key={profile.id}
                    profile={profile}
                    onRevoke={() => setVerified(profile.id, false)}
                    isVerified
                  />
                ))}
              </div>
            </section>
          </>
        )}

        {activeTab === "flagged" && (
          <>
            {pendingReports.length > 0 ? (
              <div className="space-y-3">
                {pendingReports.map((report) => (
                  <FlaggedReportCard
                    key={report.id}
                    report={report}
                    profiles={profiles}
                    onDismiss={() => updateReportStatus(report.id, "dismissed")}
                    onRemove={() => updateReportStatus(report.id, "removed")}
                  />
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-maktub-text font-medium">No flagged profiles</p>
                <p className="text-sm text-maktub-text-secondary mt-1">
                  All clear — no reports to review
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function FlaggedReportCard({
  report,
  profiles,
  onDismiss,
  onRemove,
}: {
  report: Report;
  profiles: Profile[];
  onDismiss: () => void;
  onRemove: () => void;
}) {
  const profile = profiles.find((p) => p.id === report.profileId);
  const initials = profile
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <div className="bg-maktub-panel rounded-xl border border-red-200 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 font-bold text-sm shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-maktub-text">
              {profile?.name || "Unknown Profile"}
            </h3>
            <p className="text-sm text-maktub-text-secondary">
              {profile?.age} yrs &middot; {profile?.gender} &middot;{" "}
              {profile?.residence}
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={onDismiss}
            className="px-4 py-2 bg-maktub-input text-maktub-text-secondary text-sm font-medium rounded-lg hover:bg-maktub-panel transition-colors border border-maktub-border"
          >
            Dismiss
          </button>
          <button
            onClick={onRemove}
            className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-maktub-border/50">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
            </svg>
            {REASON_LABELS[report.reason]}
          </span>
          <span className="text-xs text-maktub-text-secondary">
            Reported {new Date(report.createdAt).toLocaleDateString()}
          </span>
        </div>
        {report.details && (
          <p className="text-sm text-maktub-text-secondary mt-2 italic">
            &ldquo;{report.details}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}

function AdminProfileCard({
  profile,
  onVerify,
  onRevoke,
  isVerified,
}: {
  profile: {
    id: string;
    name: string;
    age: number;
    gender: string;
    residence: string;
    education: string;
    phoneVerified: boolean;
    createdAt: string;
  };
  onVerify?: () => void;
  onRevoke?: () => void;
  isVerified?: boolean;
}) {
  return (
    <div className="bg-maktub-panel rounded-xl border border-maktub-border p-4 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-maktub-text">{profile.name}</h3>
          {profile.phoneVerified && (
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full font-medium">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Phone Verified
            </span>
          )}
          {isVerified && (
            <span className="inline-flex items-center gap-1 bg-maktub-green/20 text-maktub-green text-xs px-2 py-0.5 rounded-full font-medium">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Admin Verified
            </span>
          )}
        </div>
        <p className="text-sm text-maktub-text-secondary mt-1">
          {profile.age} yrs &middot; {profile.gender} &middot; {profile.residence}
        </p>
        <p className="text-xs text-maktub-text-secondary mt-0.5 truncate">
          {profile.education}
        </p>
        <p className="text-xs text-maktub-text-secondary/70 mt-1">
          Submitted: {profile.createdAt}
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        {onVerify && (
          <button
            onClick={onVerify}
            className="px-4 py-2 bg-maktub-green text-white text-sm font-medium rounded-lg hover:bg-maktub-green/90 transition-colors"
          >
            Verify
          </button>
        )}
        {onRevoke && (
          <button
            onClick={onRevoke}
            className="px-4 py-2 bg-maktub-input text-maktub-text-secondary text-sm font-medium rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors border border-maktub-border"
          >
            Revoke
          </button>
        )}
      </div>
    </div>
  );
}
