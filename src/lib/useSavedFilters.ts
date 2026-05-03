"use client";

import { useState, useEffect, useCallback } from "react";
import { FilterOptions } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { getDeviceId } from "@/lib/db";

export interface SavedFilter {
  id: string;
  name: string;
  filters: FilterOptions;
  createdAt: string;
}

interface DbSavedFilter {
  id: string;
  user_id: string;
  name: string;
  filters: FilterOptions;
  created_at: string;
}

function toSavedFilter(row: DbSavedFilter): SavedFilter {
  return {
    id: row.id,
    name: row.name,
    filters: row.filters,
    createdAt: row.created_at,
  };
}

export function useSavedFilters() {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  useEffect(() => {
    let ignore = false;
    const userId = getDeviceId();
    supabase
      .from("saved_filters")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!ignore && data) setSavedFilters((data as DbSavedFilter[]).map(toSavedFilter));
      });
    return () => { ignore = true; };
  }, []);

  const saveFilter = useCallback(async (name: string, filters: FilterOptions) => {
    const userId = getDeviceId();
    const { data } = await supabase
      .from("saved_filters")
      .insert({ user_id: userId, name, filters })
      .select()
      .single();
    if (data) {
      setSavedFilters((prev) => [toSavedFilter(data as DbSavedFilter), ...prev]);
    }
  }, []);

  const deleteFilter = useCallback(async (id: string) => {
    await supabase.from("saved_filters").delete().eq("id", id);
    setSavedFilters((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return { savedFilters, saveFilter, deleteFilter };
}
