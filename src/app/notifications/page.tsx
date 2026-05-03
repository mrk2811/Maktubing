"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Profile } from "@/lib/types";
import { fetchProfiles } from "@/lib/db";
import { useNotifications, Notification } from "@/lib/useNotifications";

export default function NotificationsPage() {
  const { notifications, markAllRead } = useNotifications();
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    let ignore = false;
    fetchProfiles().then((data) => { if (!ignore) setAllProfiles(data); });
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    if (notifications.some((n) => !n.read)) {
      markAllRead();
    }
  }, [notifications, markAllRead]);

  return (
    <div className="flex flex-1 flex-col bg-maktub-darker">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-maktub-text">Notifications</h1>
          <p className="text-sm text-maktub-text-secondary mt-1">
            Stay updated on interest activity
          </p>
        </div>

        {notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                allProfiles={allProfiles}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-maktub-panel flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-maktub-text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <p className="text-maktub-text font-medium">No notifications yet</p>
            <p className="text-sm text-maktub-text-secondary mt-1">
              You&apos;ll be notified when someone expresses interest in your profile
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function NotificationItem({ notification, allProfiles }: { notification: Notification; allProfiles: Profile[] }) {
  const profile = allProfiles.find(
    (p) =>
      p.id === notification.fromProfileId || p.id === notification.toProfileId
  );

  const initials = profile
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  const getMessage = () => {
    const name = profile?.name || "Someone";
    switch (notification.type) {
      case "interest_received":
        return (
          <>
            <strong>{name}</strong> sent you interest
          </>
        );
      case "interest_accepted":
        return (
          <>
            <strong>{name}</strong> accepted your interest
          </>
        );
      case "interest_declined":
        return (
          <>
            <strong>{name}</strong> declined your interest
          </>
        );
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case "interest_received":
        return (
          <div className="w-6 h-6 rounded-full bg-maktub-green/20 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-maktub-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        );
      case "interest_accepted":
        return (
          <div className="w-6 h-6 rounded-full bg-maktub-green/20 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-maktub-green" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case "interest_declined":
        return (
          <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
    }
  };

  const timeAgo = getTimeAgo(notification.createdAt);
  const profileLink = profile ? `/profiles/${profile.id}` : "#";

  return (
    <Link
      href={profileLink}
      className={`flex items-center gap-3 p-4 rounded-xl border transition-colors hover:border-maktub-green/50 ${
        notification.read
          ? "bg-maktub-panel border-maktub-border"
          : "bg-maktub-green/5 border-maktub-green/20"
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-maktub-green/20 flex items-center justify-center text-maktub-green font-bold text-sm shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-maktub-text">{getMessage()}</p>
        <p className="text-xs text-maktub-text-secondary mt-0.5">{timeAgo}</p>
      </div>
      {getIcon()}
    </Link>
  );
}

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
