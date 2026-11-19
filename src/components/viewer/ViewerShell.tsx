"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFlightData } from "@/context/FlightDataContext";
import { usePlayback } from "@/lib/use-playback";
import { FlightMap } from "./FlightMap";
import { TimeSeriesChart } from "./TimeSeriesChart";
import { ParameterPicker } from "./ParameterPicker";
import { TimelineControls } from "./TimelineControls";
import { TelemetryGauges } from "./TelemetryGauges";
import { AVAILABLE_METRICS } from "@/types";
import { formatTime } from "@/lib/flight-data";
import {
  Upload,
  ArrowLeft,
  FileText,
  Sliders,
  Clock,
  Sparkles,
  Zap,
  Info,
  Maximize2,
} from "lucide-react";

export function ViewerShell() {
  const router = useRouter();
  const { flightData, loadExampleData, isLoading, intervalMs, setIntervalMs } = useFlightData();

  // Playback engine
  const playback = usePlayback(flightData);

  // Selected metrics state (default to 4 key telemetry metrics)
  const [selectedMetricIds, setSelectedMetricIds] = useState<string[]>([
    "GPS_altitude",
    "GPS_speed",
    "RxBt",
    "RQly",
  ]);

  const availableMetrics = flightData?.availableMetrics || AVAILABLE_METRICS;

  const selectedMetricsConfig = useMemo(() => {
    return selectedMetricIds
      .map((id) => availableMetrics.find((m) => m.id === id))
      .filter((m): m is NonNullable<typeof m> => !!m);
  }, [selectedMetricIds, availableMetrics]);

  // If no flight data is loaded yet, show prompt to load example or upload
  if (!flightData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-[#121217] border border-[#272730] flex items-center justify-center text-yellow-500 mb-4 shadow-xl">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-100 mb-2">No Telemetry Log Loaded</h2>
        <p className="text-zinc-400 text-sm mb-6">
          Upload your own EdgeTX / OpenTX CSV log or launch the bundled example flight to inspect.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link
            href="/"
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#181820] border border-[#272730] text-zinc-200 hover:text-white hover:border-[#3f3f4e] text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Upload Log
          </Link>
          <button
            type="button"
            onClick={async () => {
              await loadExampleData();
            }}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20"
          >
            <Zap className="w-4 h-4 fill-black" />
            Load Example
          </button>
        </div>
      </div>
    );
  }

  const { summary } = flightData;

  return (
    <div className="flex-1 flex flex-col w-full h-full p-3 sm:p-5 gap-3.5 max-w-[1600px] mx-auto">
      {/* Top Application Bar */}
      <header className="flex flex-wrap items-center justify-between gap-3 bg-[#121217] border border-[#272730] rounded-2xl px-4 py-3 shadow-lg">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 rounded-xl bg-[#181820] border border-[#272730] text-zinc-400 hover:text-zinc-100 hover:border-[#3f3f4e] transition-colors"
            title="Return to upload"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-black text-sm">
            LP
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-zinc-100 font-mono">
                {flightData.fileName}
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {flightData.records.length.toLocaleString()} pts
              </span>
            </div>
            <div className="text-[11px] text-zinc-400">
              Duration: {formatTime(flightData.durationMs)} • Interval: {flightData.intervalMs}ms
            </div>
          </div>
        </div>

        {/* Right side stats summary & actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Stats Pill */}
          <div className="hidden lg:flex items-center gap-4 px-3 py-1.5 rounded-xl bg-[#181820] border border-[#272730] text-xs font-mono">
            <div>
              <span className="text-zinc-500">Max Alt: </span>
              <span className="text-sky-400 font-semibold">{summary.maxAltitude.toFixed(0)}m</span>
            </div>
            <div>
              <span className="text-zinc-500">Max Spd: </span>
              <span className="text-yellow-400 font-semibold">{summary.maxSpeed.toFixed(0)}km/h</span>
            </div>
            <div>
              <span className="text-zinc-500">Min Volt: </span>
              <span className="text-red-400 font-semibold">{summary.minVoltage.toFixed(1)}V</span>
            </div>
            <div>
              <span className="text-zinc-500">Max Curr: </span>
              <span className="text-amber-400 font-semibold">{summary.maxCurrent.toFixed(1)}A</span>
            </div>
          </div>

          {/* Interval Adjuster */}
          <div className="flex items-center gap-2 bg-[#181820] border border-[#272730] rounded-xl px-2.5 py-1 text-xs">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-400 font-mono text-[11px]">Interval:</span>
            <input
              type="number"
              min={20}
              max={1000}
              step={10}
              value={intervalMs}
              onChange={(e) => setIntervalMs(Number(e.target.value))}
              className="w-14 bg-transparent text-yellow-400 font-mono font-bold focus:outline-none"
            />
            <span className="text-[10px] text-zinc-500 font-mono">ms</span>
          </div>

          {/* Upload another file button */}
          <Link
            href="/"
            className="px-3 py-1.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-yellow-500/10"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Log</span>
          </Link>
        </div>
      </header>

      {/* Main Grid: Left = Map, Right = Charts + Metric Picker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1 min-h-[460px]">
        {/* Left: Map */}
        <div className="lg:col-span-6 h-[420px] lg:h-auto min-h-[380px] flex flex-col">
          <FlightMap flightData={flightData} currentRecord={playback.currentRecord} />
        </div>

        {/* Right: Parameter Picker + Time Series Chart */}
        <div className="lg:col-span-6 flex flex-col gap-2.5 h-[420px] lg:h-auto min-h-[380px]">
          <ParameterPicker
            availableMetrics={availableMetrics}
            selectedMetricIds={selectedMetricIds}
            onChange={setSelectedMetricIds}
            maxMetrics={4}
          />
          <div className="flex-1 min-h-[300px]">
            <TimeSeriesChart
              records={flightData.records}
              selectedMetrics={selectedMetricsConfig}
              currentRecord={playback.currentRecord}
              onSeekRecord={playback.seek}
            />
          </div>
        </div>
      </div>

      {/* Bottom Controls & HUD */}
      <div className="space-y-3.5">
        <TimelineControls
          isPlaying={playback.isPlaying}
          currentIndex={playback.currentIndex}
          totalRecords={playback.totalRecords}
          currentTimeMs={playback.currentTimeMs}
          totalDurationMs={flightData.durationMs}
          speed={playback.speed}
          direction={playback.direction}
          onTogglePlay={playback.togglePlay}
          onSeek={playback.seek}
          onSeekOffset={playback.seekOffset}
          onSetSpeed={playback.setSpeed}
          onToggleDirection={playback.toggleDirection}
        />

        <TelemetryGauges currentRecord={playback.currentRecord} />
      </div>
    </div>
  );
}
