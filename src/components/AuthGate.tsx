"use client";

import { useAuth } from "@/lib/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Global auth gate. Wraps the entire app at the layout level.
 * If user is not phone-verified, redirects to /login.
 * The /login page itself is excluded from the gate.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { isReady, isPhoneVerified } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (isReady && !isPhoneVerified && !isLoginPage) {
      router.replace("/login");
    }
  }, [isReady, isPhoneVerified, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!isReady) {
    return null;
  }

  if (!isPhoneVerified) {
    return null;
  }

  return <>{children}</>;
}
