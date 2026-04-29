"use client";

import { useAdminStore } from "@/lib/useAdminStore";

export default function VerificationBadges({
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
  const showVerifiedBadge = phoneVerified && adminVerified;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {showVerifiedBadge && (
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
      )}
      {phoneVerified && (
        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full font-medium">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          Phone Verified
        </span>
      )}
    </div>
  );
}
