"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `px-4 py-2 rounded-full text-sm font-medium transition-colors ${
      pathname === href
        ? "bg-maktub-green text-white"
        : "text-maktub-text-secondary hover:text-maktub-text hover:bg-maktub-input"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-maktub-panel border-b border-maktub-border shadow-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-maktub-gold tracking-wide">
            Maktub
          </span>
          <span className="hidden sm:inline text-xs text-maktub-text-secondary italic">
            It is written
          </span>
        </Link>
        {/* Desktop nav links - hidden on mobile (bottom nav used instead) */}
        <nav className="hidden md:flex items-center gap-2">
          <Link href="/profiles" className={linkClass("/profiles")}>
            Browse
          </Link>
          <Link href="/create" className={linkClass("/create")}>
            Post Profile
          </Link>
        </nav>
      </div>
    </header>
  );
}
