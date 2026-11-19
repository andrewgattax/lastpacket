"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { FlightData, FlightRecord } from "@/types";
import { Navigation, MapPinOff, LocateFixed, Layers, Loader2 } from "lucide-react";

interface FlightMapProps {
  flightData: FlightData;
  currentRecord: FlightRecord | null;
}

// Client-only dynamic import of the actual Leaflet component
const FlightMapInner = dynamic(() => import("./FlightMapInner"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#121217] text-zinc-400 gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
      <span className="text-xs font-mono">Initializing Satellite Map...</span>
    </div>
  ),
});

export function FlightMap({ flightData, currentRecord }: FlightMapProps) {
  const [followDrone, setFollowDrone] = useState(false);
  const [showRoads, setShowRoads] = useState(false);

  if (!flightData.hasGps) {
    return (
      <div className="h-full min-h-[350px] w-full bg-[#121217] border border-[#272730] rounded-2xl flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-[#272730] flex items-center justify-center text-zinc-500 mb-3">
          <MapPinOff className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-300 mb-1">No GPS Data in Log</h3>
        <p className="text-xs text-zinc-500 max-w-xs">
          This flight log did not contain valid latitude and longitude coordinates. Map visualization is disabled for this session.
        </p>
      </div>
    );
  }

  const lat = currentRecord?.lat ? currentRecord.lat.toFixed(6) : "—";
  const lon = currentRecord?.lon ? currentRecord.lon.toFixed(6) : "—";
  const sats = currentRecord?.GPS_numSat ?? 0;
  const course = currentRecord?.GPS_ground_course ? `${currentRecord.GPS_ground_course.toFixed(0)}°` : "—";

  return (
    <div className="relative h-full min-h-[380px] w-full bg-[#121217] border border-[#272730] rounded-2xl overflow-hidden flex flex-col">
      {/* Top Map HUD overlay */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between pointer-events-none gap-2">
        {/* Left: Telemetry badges */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="bg-[#0a0a0c]/85 backdrop-blur-md border border-[#272730] rounded-xl px-3 py-1.5 flex items-center gap-2.5 text-xs font-mono shadow-lg">
            <span className="flex items-center gap-1 text-yellow-400 font-semibold">
              <Navigation className="w-3.5 h-3.5 text-yellow-500" />
              {course}
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-300">
              {lat}, {lon}
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {sats} Sats
            </span>
          </div>
        </div>

        {/* Right: Show Roads toggle & Follow Mode */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Show Roads single toggle switch */}
          <button
            type="button"
            onClick={() => setShowRoads((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all ${
              showRoads
                ? "bg-yellow-500 text-black border-yellow-400 font-semibold shadow-yellow-500/20"
                : "bg-[#0a0a0c]/85 text-zinc-300 border-[#272730] hover:bg-[#181820]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Show Roads</span>
          </button>

          {/* Follow Drone Button */}
          <button
            type="button"
            onClick={() => setFollowDrone((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all ${
              followDrone
                ? "bg-purple-600 text-white border-purple-500 shadow-purple-600/30 font-semibold"
                : "bg-[#0a0a0c]/85 text-zinc-300 border-[#272730] hover:bg-[#181820]"
            }`}
          >
            <LocateFixed className="w-3.5 h-3.5" />
            <span>Follow</span>
          </button>
        </div>
      </div>

      {/* Actual Map Container */}
      <div className="flex-1 w-full h-full">
        <FlightMapInner
          flightData={flightData}
          currentRecord={currentRecord}
          followDrone={followDrone}
          showRoads={showRoads}
        />
      </div>
    </div>
  );
}
