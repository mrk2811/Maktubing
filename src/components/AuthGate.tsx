"use client";

import { useAuth } from "@/lib/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";

/**
 * Wrap a page that requires phone authentication.
 * Shows a loading spinner while checking auth, redirects to /login if not verified.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { isReady, isPhoneVerified } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isReady && !isPhoneVerified) {
      router.replace("/login");
    }
  }, [isReady, isPhoneVerified, router]);

  if (!isReady) {
    return (
      <div className="flex flex-1 flex-col bg-maktub-darker">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-maktub-green/30 border-t-maktub-green rounded-full animate-spin mx-auto mb-4" />
            <p className="text-maktub-text-secondary">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!isPhoneVerified) {
    return null;
  }

  return <>{children}</>;
}
