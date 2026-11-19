"use client";

import { useEffect, useState } from "react";
import { WifiOff, CheckCircle2 } from "lucide-react";

export function ServiceWorkerRegister() {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker for offline PWA caching
    if ("serviceWorker" in navigator) {
      const syncLoadedAssets = () => {
        if (!navigator.serviceWorker.controller) return;
        try {
          const resources = performance
            .getEntriesByType("resource")
            .map((entry) => entry.name)
            .filter((url) => url.includes("/_next/static/") || url.endsWith(".png") || url.endsWith(".svg"));

          if (resources.length > 0) {
            navigator.serviceWorker.controller.postMessage({
              type: "CACHE_RESOURCES",
              resources,
            });
          }
        } catch {
          // ignore
        }
      };

      const registerSW = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[PWA] Service Worker registered with scope:", registration.scope);

            // Sync already loaded scripts/chunks once controller is ready
            if (navigator.serviceWorker.controller) {
              syncLoadedAssets();
            } else {
              navigator.serviceWorker.addEventListener("controllerchange", syncLoadedAssets, { once: true });
            }

            // Warm up /viewer route in background cache if online
            if (navigator.onLine) {
              fetch("/viewer", { cache: "no-cache" }).catch(() => {});
            }
          })
          .catch((error) => {
            console.warn("[PWA] Service Worker registration failed:", error);
          });
      };

      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
      }
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
