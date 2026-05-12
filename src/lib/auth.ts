/**
 * Authentication abstraction layer.
 * Currently: Supabase Anonymous Auth + Firebase Phone Auth bridge.
 * To switch providers: replace this file only.
 */

import { supabase } from "@/lib/supabase";

const AUTH_UID_KEY = "maktub-auth-uid";
const FIREBASE_UID_KEY = "maktub-firebase-uid";

let cachedUserId: string | null = null;
let cachedFirebaseUid: string | null = null;

export async function initAuth(): Promise<string> {
  const { data: sessionData } = await supabase.auth.getSession();

  if (sessionData.session?.user) {
    const uid = sessionData.session.user.id;
    cachedUserId = uid;
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_UID_KEY, uid);
    }
    return uid;
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  const uid = data.user!.id;
  cachedUserId = uid;
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_UID_KEY, uid);
  }
  return uid;
}

export function setFirebaseUid(uid: string | null): void {
  cachedFirebaseUid = uid;
  if (typeof window !== "undefined") {
    if (uid) {
      localStorage.setItem(FIREBASE_UID_KEY, uid);
    } else {
      localStorage.removeItem(FIREBASE_UID_KEY);
    }
  }
}

export function getUserId(): string {
  if (cachedFirebaseUid) return cachedFirebaseUid;
  if (typeof window !== "undefined") {
    const storedFirebase = localStorage.getItem(FIREBASE_UID_KEY);
    if (storedFirebase) {
      cachedFirebaseUid = storedFirebase;
      return storedFirebase;
    }
  }
  if (cachedUserId) return cachedUserId;
  if (typeof window === "undefined") return "server";
  const stored = localStorage.getItem(AUTH_UID_KEY);
  if (stored) {
    cachedUserId = stored;
    return stored;
  }
  const legacyId = localStorage.getItem("maktub-device-id");
  return legacyId || "anonymous";
}

export async function linkFirebaseAuth(firebaseIdToken: string): Promise<void> {
  await supabase.auth.updateUser({
    data: { firebase_token: firebaseIdToken, phone_verified: true },
  });
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
  cachedUserId = null;
  cachedFirebaseUid = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_UID_KEY);
    localStorage.removeItem(FIREBASE_UID_KEY);
  }
}

export function onAuthStateChanged(callback: (userId: string | null) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      cachedUserId = session.user.id;
      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_UID_KEY, session.user.id);
      }
      callback(session.user.id);
    } else {
      cachedUserId = null;
      callback(null);
    }
  });
  return data.subscription.unsubscribe;
}
