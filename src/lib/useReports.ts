"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

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

interface DbReport {
  id: string;
  profile_id: string;
  reporter_id: string;
  reason: string;
  details: string;
  status: string;
  created_at: string;
}

function toReport(row: DbReport): Report {
  return {
    id: row.id,
    profileId: row.profile_id,
    reporterId: row.reporter_id,
    reason: row.reason as ReportReason,
    details: row.details,
    status: row.status as Report["status"],
    createdAt: row.created_at,
  };
}

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    let ignore = false;
    supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!ignore && data) setReports((data as DbReport[]).map(toReport));
      });
    return () => { ignore = true; };
  }, []);

  const submitReport = useCallback(
    async (report: Omit<Report, "id" | "status" | "createdAt">) => {
      const { data: existing } = await supabase
        .from("reports")
        .select("id")
        .eq("profile_id", report.profileId)
        .eq("reporter_id", report.reporterId)
        .eq("status", "pending")
        .single();

      if (existing) return false;

      const { data } = await supabase
        .from("reports")
        .insert({
          profile_id: report.profileId,
          reporter_id: report.reporterId,
          reason: report.reason,
          details: report.details,
          status: "pending",
        })
        .select()
        .single();

      if (data) {
        setReports((prev) => [toReport(data as DbReport), ...prev]);
      }
      return true;
    },
    []
  );

  const updateReportStatus = useCallback(
    async (reportId: string, status: "dismissed" | "removed") => {
      await supabase.from("reports").update({ status }).eq("id", reportId);
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status } : r))
      );
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

  return {
    reports,
    pendingReports,
    submitReport,
    updateReportStatus,
    hasReported,
  };
}
