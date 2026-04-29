"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "maktub-interests";

export interface Interest {
  fromProfileId: string;
  toProfileId: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
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

function getStoredInterests(): Interest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useInterests() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const interests: Interest[] = JSON.parse(raw);

  const sendInterest = useCallback((fromProfileId: string, toProfileId: string) => {
    const current = getStoredInterests();
    const existing = current.find(
      (i) => i.fromProfileId === fromProfileId && i.toProfileId === toProfileId
    );
    if (existing) return;

    const newInterest: Interest = {
      fromProfileId,
      toProfileId,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    const updated = [...current, newInterest];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    emitChange();
  }, []);

  const updateStatus = useCallback(
    (fromProfileId: string, toProfileId: string, status: "accepted" | "declined") => {
      const current = getStoredInterests();
      const updated = current.map((i) =>
        i.fromProfileId === fromProfileId && i.toProfileId === toProfileId
          ? { ...i, status }
          : i
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      emitChange();
    },
    []
  );

  const getInterestStatus = useCallback(
    (fromProfileId: string, toProfileId: string) => {
      const found = interests.find(
        (i) => i.fromProfileId === fromProfileId && i.toProfileId === toProfileId
      );
      return found?.status ?? null;
    },
    [interests]
  );

  const sentInterests = useCallback(
    (fromProfileId: string) => interests.filter((i) => i.fromProfileId === fromProfileId),
    [interests]
  );

  const receivedInterests = useCallback(
    (toProfileId: string) => interests.filter((i) => i.toProfileId === toProfileId),
    [interests]
  );

  return { interests, sendInterest, updateStatus, getInterestStatus, sentInterests, receivedInterests };
}
