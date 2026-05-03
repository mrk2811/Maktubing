"use client";

import { useEffect, useCallback, useSyncExternalStore } from "react";
import { FilterOptions } from "@/lib/types";

export interface SavedFilter {
  id: string;
  name: string;
  filters: FilterOptions;
  createdAt: string;
}

const STORAGE_KEY = "maktub-saved-filters";

function getStoredFilters(): SavedFilter[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

let listeners: Array<() => void> = [];

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): string {
  if (typeof window === "undefined") return "[]";
  return localStorage.getItem(STORAGE_KEY) || "[]";
}

function getServerSnapshot(): string {
  return "[]";
}

export function useSavedFilters() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const savedFilters: SavedFilter[] = JSON.parse(raw);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) emitChange();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const saveFilter = useCallback((name: string, filters: FilterOptions) => {
    const current = getStoredFilters();
    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name,
      filters,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, newFilter]));
    emitChange();
  }, []);

  const deleteFilter = useCallback((id: string) => {
    const current = getStoredFilters();
    const next = current.filter((f) => f.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    emitChange();
  }, []);

  return { savedFilters, saveFilter, deleteFilter };
}
