"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "maktub-reports";

export type ReportReason =
  | "fake_profile"
  | "inappropriate_content"
  | "spam"
  | "other";

export interface Report {
  id: string;
  profileId: string;
  reporterId: string;
  reason: ReportReason;
  details: string;
  status: "pending" | "dismissed" | "removed";
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

export function useReports() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const reports: Report[] = JSON.parse(raw);

  const submitReport = useCallback(
    (report: Omit<Report, "id" | "status" | "createdAt">) => {
      const current: Report[] = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );
      const existing = current.find(
        (r) =>
          r.profileId === report.profileId &&
          r.reporterId === report.reporterId &&
          r.status === "pending"
      );
      if (existing) return false;

      const newReport: Report = {
        ...report,
        id: `report-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      const updated = [...current, newReport];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      emitChange();
      return true;
    },
    []
  );

  const updateReportStatus = useCallback(
    (reportId: string, status: "dismissed" | "removed") => {
      const current: Report[] = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );
      const updated = current.map((r) =>
        r.id === reportId ? { ...r, status } : r
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      emitChange();
    },
    []
  );

  const hasReported = useCallback(
    (profileId: string, reporterId: string) => {
      return reports.some(
        (r) =>
          r.profileId === profileId &&
          r.reporterId === reporterId &&
          r.status === "pending"
      );
    },
    [reports]
  );

  const pendingReports = reports.filter((r) => r.status === "pending");

  return { reports, pendingReports, submitReport, updateReportStatus, hasReported };
}
