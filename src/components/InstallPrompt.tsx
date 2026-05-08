"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

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

function useIsStandalone() {
  return useSyncExternalStore(subscribeStandalone, getStandaloneSnapshot, getStandaloneServerSnapshot);
}

type PromptMode = "hidden" | "android" | "ios";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [mode, setMode] = useState<PromptMode>("hidden");
  const isStandalone = useIsStandalone();
  const pathname = usePathname();

  useEffect(() => {
    if (isStandalone) return;
    if (pathname !== "/") return;
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem("pwa-install-dismissed")) return;

    // Android / Chrome: listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setMode("android");
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS: detect Safari on iOS — show prompt after a brief delay
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as unknown as Record<string, unknown>).MSStream;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (isIOS) {
      timer = setTimeout(() => setMode("ios"), 1000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      if (timer) clearTimeout(timer);
    };
  }, [isStandalone, pathname]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setMode("hidden");
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setMode("hidden");
    setDeferredPrompt(null);
    sessionStorage.setItem("pwa-install-dismissed", "true");
  }, []);

  if (mode === "hidden" || pathname !== "/") return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[90] md:left-auto md:right-4 md:max-w-sm animate-slide-up">
      <div className="bg-maktub-panel border border-maktub-border rounded-2xl shadow-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#2d6a4f] flex items-center justify-center shrink-0">
            <span className="text-xl font-bold text-[#f5f0e8]">M</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-maktub-text text-base">
              Add Maktub to Home Screen
            </h3>
            <p className="text-sm text-maktub-text-secondary mt-0.5">
              {mode === "ios"
                ? "Tap the share button, then \"Add to Home Screen\""
                : "Install Maktub for a full-screen, app-like experience"}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="shrink-0 p-1 text-maktub-text-secondary hover:text-maktub-text transition-colors"
            aria-label="Dismiss"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {mode === "ios" ? (
          <div className="mt-3 flex items-center gap-2 text-sm text-maktub-text-secondary">
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            <span>
              Tap{" "}
              <strong className="text-maktub-text">
                Share
              </strong>{" "}
              then{" "}
              <strong className="text-maktub-text">
                Add to Home Screen
              </strong>
            </span>
          </div>
        ) : (
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleDismiss}
              className="flex-1 h-10 rounded-full border border-maktub-border text-sm font-medium text-maktub-text-secondary hover:bg-maktub-input transition-colors"
            >
              Not now
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 h-10 rounded-full bg-maktub-green text-white text-sm font-medium hover:bg-maktub-green-dark transition-colors"
            >
              Install
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
