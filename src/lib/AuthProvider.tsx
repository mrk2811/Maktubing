"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged as onFirebaseAuthStateChanged, User } from "firebase/auth";
import { auth as firebaseAuth } from "@/lib/firebase";
import { initAuth, getUserId, setFirebaseUid, onAuthStateChanged } from "@/lib/auth";

interface AuthContextType {
  userId: string | null;
  firebaseUser: User | null;
  isReady: boolean;
  isPhoneVerified: boolean;
}

const AuthContext = createContext<AuthContextType>({
  userId: null,
  firebaseUser: null,
  isReady: false,
  isPhoneVerified: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initAuth()
      .then((uid) => {
        setUserId(uid);
        setIsReady(true);
      })
      .catch(() => {
        setUserId(getUserId());
        setIsReady(true);
      });

    const unsubscribe = onAuthStateChanged((uid) => {
      if (uid) setUserId(uid);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = onFirebaseAuthStateChanged(firebaseAuth, (user) => {
      setFirebaseUser(user);
      setFirebaseUid(user?.uid ?? null);
    });
    return unsubscribe;
  }, []);

  const isPhoneVerified = firebaseUser?.phoneNumber != null;

  return (
    <AuthContext.Provider value={{ userId, firebaseUser, isReady, isPhoneVerified }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
