import React from "react";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { Compass, Activity, Gauge, Radio, Shield, Cpu } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col justify-between p-6 sm:p-10 max-w-6xl mx-auto w-full">
      {/* Top Bar / Branding */}
      <header className="flex items-center justify-between py-2 border-b border-[#272730]/60 pb-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20 text-black font-black text-xl tracking-tighter">
            LP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-zinc-100">LastPacket</h1>
            </div>
            <p className="text-xs text-zinc-400">FPV Drone Flight Telemetry Inspector</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-xs text-zinc-400 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            EdgeTX / OpenTX
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="text-center my-6 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium">
          <Cpu className="w-3.5 h-3.5" /> High-Resolution Telemetry Analysis
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-100">
          Inspect every packet of your flight.
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
          Synchronized OpenStreetMap 2D flight paths, multi-metric time series charts, and full-speed telemetry replay HUD.
        </p>
      </div>

      {/* Upload Dropzone */}
      <div className="my-6">
        <UploadDropzone />
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-[#272730]/60">
        <div className="bg-[#121217] border border-[#272730] rounded-xl p-4 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-sm text-zinc-200">OSM Flight Replay</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Full flight polyline on OpenStreetMap tiles with start/end markers and animated position marker synced to the timeline.
          </p>
        </div>

        <div className="bg-[#121217] border border-[#272730] rounded-xl p-4 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-sm text-zinc-200">Synchronized Charts</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Multi-channel metric picker (Altitude, Speed, Voltage, RQly, Sticks) with zoom & brush scrub controls.
          </p>
        </div>

        <div className="bg-[#121217] border border-[#272730] rounded-xl p-4 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Gauge className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-sm text-zinc-200">Live Telemetry HUD</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Real-time attitude indicators (Pitch/Roll/Yaw), 6S battery cell voltage alerts, throttle levels, and RF link metrics.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-zinc-500 font-mono">
        @ 2026 andrewgattax • Last Packet
      </footer>
    </main>
  );
}
