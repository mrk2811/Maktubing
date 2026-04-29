"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Profile } from "@/lib/types";

const STORAGE_KEY = "maktub-user-profile";

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
  if (typeof window === "undefined") return "null";
  return localStorage.getItem(STORAGE_KEY) || "null";
}

function getServerSnapshot(): string {
  return "null";
}

export function useUserProfile() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const profile: Profile | null = raw === "null" ? null : JSON.parse(raw);

  const saveProfile = useCallback((data: Profile) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    emitChange();
  }, []);

  const clearProfile = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    emitChange();
  }, []);

  return { profile, saveProfile, clearProfile };
}
