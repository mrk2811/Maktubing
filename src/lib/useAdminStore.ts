"use client";

import { useCallback } from "react";
import { supabase } from "@/lib/supabase";

export function useAdminStore() {
  const setVerified = useCallback(
    async (profileId: string, verified: boolean) => {
      await supabase
        .from("profiles")
        .update({ admin_verified: verified })
        .eq("id", profileId);
    },
    []
  );

  const isAdminVerified = useCallback((_id: string): boolean | null => {
    void _id;
    return null;
  }, []);

  return { verifiedMap: {} as Record<string, boolean>, setVerified, isAdminVerified };
}
