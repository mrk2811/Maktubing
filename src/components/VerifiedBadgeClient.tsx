"use client";

import { useAdminStore } from "@/lib/useAdminStore";

export default function VerifiedBadgeClient({
  profileId,
  phoneVerified,
  defaultAdminVerified,
}: {
  profileId: string;
  phoneVerified: boolean;
  defaultAdminVerified: boolean;
}) {
  const { isAdminVerified } = useAdminStore();
  const adminOverride = isAdminVerified(profileId);
  const adminVerified = adminOverride !== null ? adminOverride : defaultAdminVerified;
  const showVerified = phoneVerified && adminVerified;

  if (!showVerified) return null;

  return (
    <span className="inline-flex items-center gap-1 bg-maktub-green/20 text-maktub-green text-xs px-2 py-0.5 rounded-full font-medium">
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
      Verified
    </span>
  );
}
