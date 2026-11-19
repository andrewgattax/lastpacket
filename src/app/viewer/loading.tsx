import React from "react";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0a0a0c] text-zinc-400 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      <p className="text-sm font-mono text-zinc-300">Loading LastPacket Telemetry...</p>
    </div>
  );
}
