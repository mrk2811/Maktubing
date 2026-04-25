import Link from "next/link";
import { Profile } from "@/lib/types";

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block bg-maktub-input text-maktub-text-secondary text-xs px-2 py-0.5 rounded-full">
      {children}
    </span>
  );
}

function VerifiedBadge() {
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

export default function ProfileCard({ profile }: { profile: Profile }) {
  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link href={`/profiles/${profile.id}`} className="block group">
      <div className="bg-maktub-panel rounded-2xl p-5 border border-maktub-border transition-all hover:border-maktub-green/50 hover:shadow-lg hover:shadow-maktub-green/5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-maktub-green/20 flex items-center justify-center text-maktub-green font-bold text-lg shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold text-maktub-text truncate">
                {profile.name}
              </h3>
              {profile.verified && <VerifiedBadge />}
            </div>
            <p className="text-maktub-text-secondary text-sm mt-0.5">
              {profile.age} yrs &middot; {profile.height} &middot;{" "}
              {profile.gender}
            </p>
          </div>
        </div>

        {/* Key details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-4">
          <div>
            <span className="text-maktub-text-secondary">Residence:</span>{" "}
            <span className="text-maktub-text">{profile.residence}</span>
          </div>
          <div>
            <span className="text-maktub-text-secondary">Education:</span>{" "}
            <span className="text-maktub-text">
              {profile.education.length > 60
                ? profile.education.slice(0, 60) + "..."
                : profile.education}
            </span>
          </div>
          <div>
            <span className="text-maktub-text-secondary">Marital Status:</span>{" "}
            <span className="text-maktub-text">{profile.maritalStatus}</span>
          </div>
          <div>
            <span className="text-maktub-text-secondary">Legal Status:</span>{" "}
            <span className="text-maktub-text">{profile.legalStatus}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <Badge>{profile.ethnicity.split("(")[0].trim()}</Badge>
          <Badge>{profile.religiousSect}</Badge>
          {profile.languages.map((lang) => (
            <Badge key={lang}>{lang}</Badge>
          ))}
        </div>

        {/* CTA hint */}
        <div className="mt-4 text-xs text-maktub-green font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          View full profile &rarr;
        </div>
      </div>
    </Link>
  );
}
