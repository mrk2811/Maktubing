import Link from "next/link";

function CloudLeft() {
  return (
    <svg
      viewBox="0 0 200 120"
      className="w-32 sm:w-40 md:w-48 text-white/20"
      fill="currentColor"
    >
      <path d="M170,90 Q170,110 150,110 L40,110 Q10,110 10,85 Q10,65 35,60 Q30,35 55,30 Q80,10 110,30 Q130,15 155,30 Q180,40 175,65 Q190,70 190,85 Q190,90 170,90 Z" />
    </svg>
  );
}

function CloudRight() {
  return (
    <svg
      viewBox="0 0 200 120"
      className="w-32 sm:w-40 md:w-48 text-white/20"
      fill="currentColor"
    >
      <path d="M30,90 Q30,110 50,110 L160,110 Q190,110 190,85 Q190,65 165,60 Q170,35 145,30 Q120,10 90,30 Q70,15 45,30 Q20,40 25,65 Q10,70 10,85 Q10,90 30,90 Z" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-maktub-darker px-4">
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Cloud + Logo */}
        <div className="relative flex items-center justify-center">
          <div className="transition-transform duration-700 -translate-x-2 hover:-translate-x-6">
            <CloudLeft />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-wide text-maktub-gold drop-shadow-lg select-none">
              Maktub
            </h1>
          </div>
          <div className="transition-transform duration-700 translate-x-2 hover:translate-x-6">
            <CloudRight />
          </div>
        </div>

        <p className="text-lg sm:text-xl text-maktub-gold-light font-light italic tracking-widest">
          It is written
        </p>

        <p className="max-w-md text-maktub-text-secondary text-base sm:text-lg leading-relaxed mt-2">
          A simple, trust-based matrimony platform for Muslim families.
          Structured profiles, easy browsing, meaningful connections.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-xs sm:max-w-md">
          <Link
            href="/profiles"
            className="flex-1 flex items-center justify-center h-14 rounded-full bg-maktub-green text-white text-lg font-semibold transition-colors hover:bg-maktub-green-dark shadow-lg"
          >
            Browse Profiles
          </Link>
          <Link
            href="/create"
            className="flex-1 flex items-center justify-center h-14 rounded-full border-2 border-maktub-green text-maktub-green text-lg font-semibold transition-colors hover:bg-maktub-green hover:text-white"
          >
            Post a Profile
          </Link>
        </div>

        <p className="text-sm text-maktub-text-secondary mt-6">
          Designed for families. Inspired by the way you already connect.
        </p>
      </div>
    </div>
  );
}
