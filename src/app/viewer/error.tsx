"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, ArrowLeft } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Telemetry Viewer Error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0a0a0c] text-center max-w-md mx-auto">
      <div className="w-12 h-12 rounded-xl bg-red-950/40 border border-red-800/50 flex items-center justify-center text-red-400 mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h2 className="text-lg font-bold text-zinc-100 mb-2">Error Loading Telemetry</h2>
      <p className="text-zinc-400 text-sm mb-6">
        {error.message || "An unexpected error occurred while parsing or rendering the telemetry viewer."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Retry
        </button>
        <Link
          href="/"
          className="px-4 py-2 bg-[#181820] border border-[#272730] text-zinc-300 hover:text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Upload
        </Link>
      </div>
    </div>
  );
}
