import Link from "next/link";
import Image from "next/image";
import { Profile } from "@/lib/types";
import SaveButton from "@/components/SaveButton";
import VerifiedBadgeClient from "@/components/VerifiedBadgeClient";
import InterestButton from "@/components/InterestButton";
import ShareButton from "@/components/ShareButton";

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block bg-maktub-input text-maktub-text-secondary text-sm px-2.5 py-1 rounded-full">
      {children}
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
          <div className="w-14 h-14 rounded-full bg-maktub-green/20 flex items-center justify-center text-maktub-green font-bold text-lg shrink-0 overflow-hidden">
            {profile.imageUrl ? (
              <Image src={profile.imageUrl} alt={profile.name} width={56} height={56} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-semibold text-maktub-text truncate">
                {profile.name}
              </h3>
              <VerifiedBadgeClient
                profileId={profile.id}
                phoneVerified={profile.phoneVerified}
                defaultAdminVerified={profile.adminVerified}
              />
            </div>
            <p className="text-maktub-text-secondary text-base mt-0.5">
              {profile.age} yrs &middot; {profile.height} &middot;{" "}
              {profile.gender}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <ShareButton profileId={profile.id} profileName={profile.name} size="sm" />
            <SaveButton profileId={profile.id} size="sm" />
          </div>
        </div>

        {/* Key details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-base mb-4">
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
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <Badge>{profile.ethnicity.split("(")[0].trim()}</Badge>
          <Badge>{profile.religiousSect}</Badge>
          {profile.languages.map((lang) => (
            <Badge key={lang}>{lang}</Badge>
          ))}
        </div>

        {/* Interest + CTA */}
        <div className="mt-4 flex items-center justify-between">
          <InterestButton profileId={profile.id} size="sm" />
          <span className="text-xs text-maktub-green font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            View full profile &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
