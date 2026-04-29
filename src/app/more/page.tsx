import Link from "next/link";
import Navbar from "@/components/Navbar";

function MenuItem({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 bg-maktub-panel rounded-xl border border-maktub-border p-4 hover:border-maktub-green/50 transition-colors"
    >
      <div className="w-10 h-10 rounded-full bg-maktub-green/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-maktub-text text-sm">{title}</h3>
        <p className="text-xs text-maktub-text-secondary mt-0.5">
          {description}
        </p>
      </div>
      <svg
        className="w-5 h-5 text-maktub-text-secondary shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </Link>
  );
}

export default function MorePage() {
  return (
    <div className="flex flex-1 flex-col bg-maktub-darker">
      <Navbar />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-maktub-text">More</h1>
        </div>

        <div className="space-y-3">
          <MenuItem
            href="/verify"
            icon={
              <svg
                className="w-5 h-5 text-maktub-green"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            }
            title="Verify Phone Number"
            description="Verify your contact number to earn a trust badge"
          />

          <MenuItem
            href="/admin"
            icon={
              <svg
                className="w-5 h-5 text-maktub-green"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            }
            title="Admin Dashboard"
            description="Review and verify submitted profiles"
          />
        </div>
      </main>
    </div>
  );
}
