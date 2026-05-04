"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useToast } from "@/components/Toast";
import { InterestListSkeleton } from "@/components/Skeleton";
import { Profile } from "@/lib/types";
import { fetchProfiles } from "@/lib/db";
import { useInterests } from "@/lib/useInterests";
import { useNotifications } from "@/lib/useNotifications";

const CURRENT_USER_ID = "current-user";

type Tab = "sent" | "received";

export default function InterestsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("sent");
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { sentInterests, receivedInterests, updateStatus } = useInterests();
  const { addNotification } = useNotifications();
  const { showToast } = useToast();

  useEffect(() => {
    let ignore = false;
    fetchProfiles()
      .then((data) => {
        if (!ignore) {
          setAllProfiles(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setLoading(false);
          showToast("Failed to load interests.");
        }
      });
    return () => { ignore = true; };
  }, [showToast]);

  const handleAccept = useCallback(
    (fromProfileId: string, toProfileId: string) => {
      updateStatus(fromProfileId, toProfileId, "accepted");
      addNotification({
        type: "interest_accepted",
        fromProfileId: toProfileId,
        toProfileId: fromProfileId,
      });
    },
    [updateStatus, addNotification]
  );

  const handleDecline = useCallback(
    (fromProfileId: string, toProfileId: string) => {
      updateStatus(fromProfileId, toProfileId, "declined");
      addNotification({
        type: "interest_declined",
        fromProfileId: toProfileId,
        toProfileId: fromProfileId,
      });
    },
    [updateStatus, addNotification]
  );

  const sent = sentInterests(CURRENT_USER_ID);
  const received = receivedInterests(CURRENT_USER_ID);

  const sentProfiles = useMemo(
    () =>
      sent.map((interest) => ({
        interest,
        profile: allProfiles.find((p) => p.id === interest.toProfileId),
      })).filter((item) => item.profile),
    [sent, allProfiles]
  );

  const receivedProfiles = useMemo(
    () =>
      received.map((interest) => ({
        interest,
        profile: allProfiles.find((p) => p.id === interest.fromProfileId),
      })).filter((item) => item.profile),
    [received, allProfiles]
  );

  return (
    <div className="flex flex-1 flex-col bg-maktub-darker">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-maktub-text">Interests</h1>
          <p className="text-sm text-maktub-text-secondary mt-1">
            Track interest sent and received
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-maktub-input rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab("sent")}
            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "sent"
                ? "bg-maktub-panel text-maktub-text shadow-sm"
                : "text-maktub-text-secondary hover:text-maktub-text"
            }`}
          >
            Sent ({sent.length})
          </button>
          <button
            onClick={() => setActiveTab("received")}
            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "received"
                ? "bg-maktub-panel text-maktub-text shadow-sm"
                : "text-maktub-text-secondary hover:text-maktub-text"
            }`}
          >
            Received ({received.length})
          </button>
        </div>

        {/* Sent Tab */}
        {activeTab === "sent" && (
          <div>
            {loading ? (
              <InterestListSkeleton />
            ) : sentProfiles.length > 0 ? (
              <div className="space-y-3">
                {sentProfiles.map(({ interest, profile }) => (
                  <Link
                    key={interest.toProfileId}
                    href={`/profiles/${profile!.id}`}
                    className="block"
                  >
                    <div className="bg-maktub-panel rounded-xl border border-maktub-border p-4 flex items-center gap-4 hover:border-maktub-green/50 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-maktub-green/20 flex items-center justify-center text-maktub-green font-bold shrink-0">
                        {profile!.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-maktub-text">
                          {profile!.name}
                        </h3>
                        <p className="text-sm text-maktub-text-secondary">
                          {profile!.age} yrs &middot; {profile!.gender} &middot; {profile!.residence}
                        </p>
                      </div>
                      <StatusBadge status={interest.status} />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                message="No interests sent yet"
                description="Browse profiles and send interest to someone you like"
                ctaLabel="Browse Profiles"
                ctaHref="/profiles"
              />
            )}
          </div>
        )}

        {/* Received Tab */}
        {activeTab === "received" && (
          <div>
            {loading ? (
              <InterestListSkeleton />
            ) : receivedProfiles.length > 0 ? (
              <div className="space-y-3">
                {receivedProfiles.map(({ interest, profile }) => (
                  <div
                    key={interest.fromProfileId}
                    className="bg-maktub-panel rounded-xl border border-maktub-border p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <Link
                      href={`/profiles/${profile!.id}`}
                      className="flex items-center gap-4 flex-1 min-w-0"
                    >
                      <div className="w-12 h-12 rounded-full bg-maktub-green/20 flex items-center justify-center text-maktub-green font-bold shrink-0">
                        {profile!.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-maktub-text">
                          {profile!.name}
                        </h3>
                        <p className="text-sm text-maktub-text-secondary">
                          {profile!.age} yrs &middot; {profile!.gender} &middot; {profile!.residence}
                        </p>
                      </div>
                    </Link>
                    {interest.status === "pending" ? (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() =>
                            handleAccept(interest.fromProfileId, interest.toProfileId)
                          }
                          className="px-4 py-2 bg-maktub-green text-white text-sm font-medium rounded-lg hover:bg-maktub-green/90 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            handleDecline(interest.fromProfileId, interest.toProfileId)
                          }
                          className="px-4 py-2 bg-maktub-input text-maktub-text-secondary text-sm font-medium rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors border border-maktub-border"
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      <StatusBadge status={interest.status} />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                message="No interests received yet"
                description="When someone expresses interest in your profile, it will appear here"
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "accepted") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-maktub-green/10 text-maktub-green text-xs font-medium">
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        Accepted
      </span>
    );
  }
  if (status === "declined") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-400 text-xs font-medium">
        Declined
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 text-xs font-medium">
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      Pending
    </span>
  );
}

function EmptyState({
  message,
  description,
  ctaLabel,
  ctaHref,
}: {
  message: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
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
      <p className="text-maktub-text font-medium">{message}</p>
      <p className="text-sm text-maktub-text-secondary mt-1">{description}</p>
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="mt-4 px-6 py-2 rounded-full bg-maktub-green text-white text-sm font-medium hover:bg-maktub-green/90 transition-colors"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
