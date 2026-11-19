"use client";

import { useEffect, useState } from "react";
import { WifiOff, CheckCircle2 } from "lucide-react";

export function ServiceWorkerRegister() {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker for offline PWA caching
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[PWA] Service Worker registered with scope:", registration.scope);
          })
          .catch((error) => {
            console.warn("[PWA] Service Worker registration failed:", error);
          });
      });
    }

    // 2. Network connectivity listeners
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    // Check initial state
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setIsOffline(true);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOffline) {
    return (
      <div className="fixed bottom-4 right-4 z-[9999] bg-[#181820]/95 backdrop-blur-md border border-amber-500/30 shadow-2xl rounded-xl px-3.5 py-2 flex items-center gap-2.5 text-xs text-amber-300 font-mono animate-in fade-in slide-in-from-bottom-2">
        <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
        <span>Offline Mode • Cached Telemetry Engine Active</span>
      </div>
    );
  }

  if (showReconnected) {
    return (
      <div className="fixed bottom-4 right-4 z-[9999] bg-[#181820]/95 backdrop-blur-md border border-emerald-500/30 shadow-2xl rounded-xl px-3.5 py-2 flex items-center gap-2.5 text-xs text-emerald-300 font-mono animate-in fade-in slide-in-from-bottom-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        <span>Back Online</span>
      </div>
    );
  }

  return null;
}
