"use client";

import { useState, useEffect, useSyncExternalStore } from "react";

function subscribeStandalone(callback: () => void) {
  const mql = window.matchMedia("(display-mode: standalone)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getStandaloneSnapshot() {
  return window.matchMedia("(display-mode: standalone)").matches;
}

function getStandaloneServerSnapshot() {
  return false;
}

export default function SplashScreen() {
  const isStandalone = useSyncExternalStore(
    subscribeStandalone,
    getStandaloneSnapshot,
    getStandaloneServerSnapshot
  );
  const [fadeOut, setFadeOut] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!isStandalone) return;

    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1500);

    const hideTimer = setTimeout(() => {
      setHidden(true);
    }, 1900);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [isStandalone]);

  if (!isStandalone || hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#2d6a4f] transition-opacity duration-400 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-4 animate-splash-fade-in">
        <div className="w-24 h-24 rounded-3xl bg-white/10 flex items-center justify-center shadow-2xl">
          <span className="text-5xl font-bold text-[#f5f0e8]" style={{ fontFamily: "Georgia, serif" }}>
            M
          </span>
        </div>
        <h1
          className="text-4xl font-bold text-[#f5f0e8] tracking-wide"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Maktub
        </h1>
        <p className="text-[#d4a843] text-lg italic tracking-widest">
          It is written
        </p>
      </div>
    </div>
  );
}
