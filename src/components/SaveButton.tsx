"use client";

import { useSavedProfiles } from "@/lib/useSavedProfiles";

export default function SaveButton({
  profileId,
  size = "md",
}: {
  profileId: string;
  size?: "sm" | "md";
}) {
  const { isSaved, toggleSave } = useSavedProfiles();
  const saved = isSaved(profileId);

  const sizeClass = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSave(profileId);
      }}
      className={`${sizeClass} flex items-center justify-center rounded-full transition-colors ${
        saved
          ? "bg-red-50 text-red-500"
          : "bg-maktub-input text-maktub-text-secondary hover:text-red-400"
      }`}
      aria-label={saved ? "Unsave profile" : "Save profile"}
    >
      <svg
        className={iconSize}
        fill={saved ? "currentColor" : "none"}
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
    </button>
  );
}
