"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "maktub-notifications";

export interface Notification {
  id: string;
  type: "interest_received" | "interest_accepted" | "interest_declined";
  fromProfileId: string;
  toProfileId: string;
  read: boolean;
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

export function useNotifications() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const notifications: Notification[] = JSON.parse(raw);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "read" | "createdAt">) => {
      const current: Notification[] = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );
      const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        read: false,
        createdAt: new Date().toISOString(),
      };
      const updated = [newNotification, ...current];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      emitChange();
    },
    []
  );

  const markAllRead = useCallback(() => {
    const current: Notification[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );
    const updated = current.map((n) => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    emitChange();
  }, []);

  const markRead = useCallback((id: string) => {
    const current: Notification[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );
    const updated = current.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    emitChange();
  }, []);

  return { notifications, unreadCount, addNotification, markAllRead, markRead };
}
