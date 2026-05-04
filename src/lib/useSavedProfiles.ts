"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { getUserId } from "@/lib/auth";

export function useSavedProfiles() {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    let ignore = false;
    const userId = getUserId();
    supabase
      .from("saved_profiles")
      .select("profile_id")
      .eq("user_id", userId)
      .then(({ data }) => {
        if (!ignore && data) setSavedIds(data.map((r) => r.profile_id));
      });
    return () => { ignore = true; };
  }, []);

  const toggleSave = useCallback(
    async (id: string) => {
      const userId = getUserId();
      if (savedIds.includes(id)) {
        await supabase
          .from("saved_profiles")
          .delete()
          .eq("user_id", userId)
          .eq("profile_id", id);
        setSavedIds((prev) => prev.filter((x) => x !== id));
      } else {
        await supabase
          .from("saved_profiles")
          .insert({ user_id: userId, profile_id: id });
        setSavedIds((prev) => [...prev, id]);
      }
    },
    [savedIds]
  );

  const isSaved = useCallback(
    (id: string) => savedIds.includes(id),
    [savedIds]
  );

  return { savedIds, toggleSave, isSaved };
}
