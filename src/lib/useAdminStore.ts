"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "maktub-admin-verified";

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
  if (typeof window === "undefined") return "{}";
  return localStorage.getItem(STORAGE_KEY) || "{}";
}

function getServerSnapshot(): string {
  return "{}";
}

export function useAdminStore() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const verifiedMap: Record<string, boolean> = JSON.parse(raw);

  const setVerified = useCallback((profileId: string, verified: boolean) => {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    current[profileId] = verified;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    emitChange();
  }, []);

  const isAdminVerified = useCallback(
    (profileId: string) => verifiedMap[profileId] ?? null,
    [verifiedMap]
  );

  return { verifiedMap, setVerified, isAdminVerified };
}
