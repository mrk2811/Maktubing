"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { initAuth, getUserId, onAuthStateChanged } from "@/lib/auth";

interface AuthContextType {
  userId: string | null;
  isReady: boolean;
}

const AuthContext = createContext<AuthContextType>({
  userId: null,
  isReady: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
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

  return (
    <AuthContext.Provider value={{ userId, isReady }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
