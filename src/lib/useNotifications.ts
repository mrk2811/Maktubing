"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface Notification {
  id: string;
  type: "interest_received" | "interest_accepted" | "interest_declined";
  fromProfileId: string;
  toProfileId: string;
  read: boolean;
  createdAt: string;
}

interface DbNotification {
  id: string;
  type: string;
  from_profile_id: string;
  to_profile_id: string;
  read: boolean;
  created_at: string;
}

function toNotification(row: DbNotification): Notification {
  return {
    id: row.id,
    type: row.type as Notification["type"],
    fromProfileId: row.from_profile_id,
    toProfileId: row.to_profile_id,
    read: row.read,
    createdAt: row.created_at,
  };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    let ignore = false;
    supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!ignore && data) setNotifications((data as DbNotification[]).map(toNotification));
      });
    return () => { ignore = true; };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback(
    async (notification: Omit<Notification, "id" | "read" | "createdAt">) => {
      const { data } = await supabase
        .from("notifications")
        .insert({
          type: notification.type,
          from_profile_id: notification.fromProfileId,
          to_profile_id: notification.toProfileId,
        })
        .select()
        .single();
      if (data) {
        setNotifications((prev) => [toNotification(data as DbNotification), ...prev]);
      }
    },
    []
  );

  const markAllRead = useCallback(async () => {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback(async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  return { notifications, unreadCount, addNotification, markAllRead, markRead };
}
