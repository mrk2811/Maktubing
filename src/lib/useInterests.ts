"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface Interest {
  fromProfileId: string;
  toProfileId: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

interface DbInterest {
  id: string;
  from_profile_id: string;
  to_profile_id: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
}

function toInterest(row: DbInterest): Interest {
  return {
    fromProfileId: row.from_profile_id,
    toProfileId: row.to_profile_id,
    status: row.status,
    createdAt: row.created_at,
  };
}

async function loadInterests(): Promise<Interest[]> {
  const { data } = await supabase
    .from("interests")
    .select("*")
    .order("created_at", { ascending: false });
  return data ? (data as DbInterest[]).map(toInterest) : [];
}

export function useInterests() {
  const [interests, setInterests] = useState<Interest[]>([]);

  useEffect(() => {
    let ignore = false;
    loadInterests().then((data) => {
      if (!ignore) setInterests(data);
    });
    return () => { ignore = true; };
  }, []);

  const sendInterest = useCallback(
    async (fromProfileId: string, toProfileId: string) => {
      const { error } = await supabase.from("interests").insert({
        from_profile_id: fromProfileId,
        to_profile_id: toProfileId,
        status: "pending",
      });
      if (!error) {
        setInterests((prev) => [
          {
            fromProfileId,
            toProfileId,
            status: "pending",
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    },
    []
  );

  const updateStatus = useCallback(
    async (
      fromProfileId: string,
      toProfileId: string,
      status: "accepted" | "declined"
    ) => {
      await supabase
        .from("interests")
        .update({ status })
        .eq("from_profile_id", fromProfileId)
        .eq("to_profile_id", toProfileId);
      setInterests((prev) =>
        prev.map((i) =>
          i.fromProfileId === fromProfileId && i.toProfileId === toProfileId
            ? { ...i, status }
            : i
        )
      );
    },
    []
  );

  const getInterestStatus = useCallback(
    (fromProfileId: string, toProfileId: string) => {
      const found = interests.find(
        (i) =>
          i.fromProfileId === fromProfileId && i.toProfileId === toProfileId
      );
      return found?.status ?? null;
    },
    [interests]
  );

  const sentInterests = useCallback(
    (fromProfileId: string) =>
      interests.filter((i) => i.fromProfileId === fromProfileId),
    [interests]
  );

  const receivedInterests = useCallback(
    (toProfileId: string) =>
      interests.filter((i) => i.toProfileId === toProfileId),
    [interests]
  );

  return {
    interests,
    sendInterest,
    updateStatus,
    getInterestStatus,
    sentInterests,
    receivedInterests,
  };
}
