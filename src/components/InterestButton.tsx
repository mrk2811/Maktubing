"use client";

import { useInterests } from "@/lib/useInterests";
import { useNotifications } from "@/lib/useNotifications";
import { useUserProfile } from "@/lib/useUserProfile";
import { useToast } from "@/components/Toast";

export default function InterestButton({
  profileId,
  size = "md",
}: {
  profileId: string;
  size?: "sm" | "md";
}) {
  const { sendInterest, getInterestStatus } = useInterests();
  const { addNotification } = useNotifications();
  const { profile: myProfile, loading: profileLoading } = useUserProfile();
  const { showToast } = useToast();

  const myProfileId = myProfile?.id ?? null;
  const status = myProfileId ? getInterestStatus(myProfileId, profileId) : null;
  const isOwnProfile = myProfileId === profileId;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!myProfileId) {
      showToast("Create a profile first before sending interest.");
      return;
    }
    if (!status) {
      try {
        await sendInterest(myProfileId, profileId);
        await addNotification({
          type: "interest_received",
          fromProfileId: myProfileId,
          toProfileId: profileId,
        });
      } catch {
        showToast("Failed to send interest. Please try again.");
      }
    }
  };

  const sizeClasses =
    size === "sm"
      ? "px-3 py-1.5 text-xs"
      : "px-4 py-2 text-sm";

  if (status === "accepted") {
    return (
      <span
        className={`${sizeClasses} inline-flex items-center gap-1.5 rounded-full bg-maktub-green/10 text-maktub-green font-medium`}
      >
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
      <span
        className={`${sizeClasses} inline-flex items-center gap-1.5 rounded-full bg-red-50 text-red-400 font-medium`}
      >
        Declined
      </span>
    );
  }

  if (status === "pending") {
    return (
      <span
        className={`${sizeClasses} inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-600 font-medium`}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Interest Sent
      </span>
    );
  }

  if (isOwnProfile) {
    return null;
  }

  if (!myProfileId && !profileLoading) {
    return (
      <button
        onClick={handleClick}
        className={`${sizeClasses} inline-flex items-center gap-1.5 rounded-full bg-gray-300 text-gray-500 font-medium cursor-not-allowed`}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        Create Profile First
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`${sizeClasses} inline-flex items-center gap-1.5 rounded-full bg-maktub-green text-white font-medium hover:bg-maktub-green/90 transition-colors`}
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      Send Interest
    </button>
  );
}
