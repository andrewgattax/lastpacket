"use client";

import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useFlightData } from "@/context/FlightDataContext";
import { Upload, FileText, Play, CheckCircle2, AlertCircle, Clock, Zap, ArrowRight, Loader2 } from "lucide-react";

export function UploadDropzone() {
  const router = useRouter();
  const { loadFile, loadExampleData, isLoading, error, intervalMs, setIntervalMs, flightData } = useFlightData();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith(".csv") || file.type.includes("csv") || file.type.includes("text")) {
        await loadFile(file);
        router.push("/viewer");
      }
    }
  };

  const handleFileInput = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await loadFile(files[0]);
      router.push("/viewer");
    }
  };

  const handleLoadExample = async () => {
    await loadExampleData();
    router.push("/viewer");
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Interval Adjustment Control */}
      <div className="bg-[#121217] border border-[#272730] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#181820] text-yellow-500 border border-[#272730]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="font-medium text-sm text-zinc-200">Log Sampling Interval</div>
            <div className="text-xs text-zinc-400">Time between telemetry frames (EdgeTX / OpenTX)</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="range"
            min={50}
            max={500}
            step={10}
            value={intervalMs}
            onChange={(e) => setIntervalMs(Number(e.target.value))}
            className="w-36 h-2 bg-[#272730] rounded-lg appearance-none cursor-pointer accent-yellow-500"
          />
          <div className="flex items-center gap-1.5 bg-[#181820] border border-[#272730] px-3 py-1.5 rounded-lg">
            <span className="text-sm font-semibold text-yellow-400 tabular-nums">{intervalMs}</span>
            <span className="text-xs text-zinc-500">ms</span>
          </div>
        </div>
      </div>

      {/* Main Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-8 sm:p-12 transition-all duration-200 flex flex-col items-center justify-center text-center ${
          isDragOver
            ? "border-yellow-500 bg-yellow-500/5 shadow-[0_0_30px_rgba(234,179,8,0.15)] scale-[1.01]"
            : "border-[#272730] bg-[#121217]/80 hover:border-yellow-500/50 hover:bg-[#181820]/80"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv,text/plain"
          className="hidden"
          onChange={handleFileInput}
        />

        <div className="w-16 h-16 rounded-2xl bg-[#181820] border border-[#272730] flex items-center justify-center text-yellow-500 mb-4 group-hover:scale-110 group-hover:border-yellow-500/50 transition-all duration-200">
          {isLoading ? (
            <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
          ) : (
            <Upload className="w-8 h-8" />
          )}
        </div>

        <h3 className="text-lg font-semibold text-zinc-100 mb-1">
          {isLoading ? "Parsing Telemetry Log..." : "Drop your drone CSV log here"}
        </h3>
        <p className="text-sm text-zinc-400 max-w-sm mb-6">
          Support EdgeTX & OpenTX logs with GPS, battery, stick positions, and RF telemetry.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            className="px-5 py-2.5 rounded-xl bg-yellow-500 text-black font-semibold text-sm hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/20 flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            <FileText className="w-4 h-4" />
            Browse File
          </button>

          <button
            type="button"
            className="px-5 py-2.5 rounded-xl bg-[#181820] border border-purple-500/40 text-purple-300 hover:text-purple-200 hover:border-purple-400 hover:bg-purple-950/20 font-semibold text-sm transition-colors flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              handleLoadExample();
            }}
            disabled={isLoading}
          >
            <Zap className="w-4 h-4 text-purple-400" />
            Load Example Log (1,787 rows)
          </button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-950/30 border border-red-800/50 rounded-xl p-4 flex items-center gap-3 text-red-200 text-sm">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <div className="flex-1">{error}</div>
        </div>
      )}

      {/* Quick Status / Active Log Preview */}
      {flightData && (
        <div className="bg-[#121217] border border-[#272730] rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-sm font-medium text-zinc-200">
                Loaded: <span className="text-yellow-400 font-mono">{flightData.fileName}</span>
              </div>
              <div className="text-xs text-zinc-400">
                {flightData.records.length.toLocaleString()} points •{" "}
                {(flightData.durationMs / 1000).toFixed(1)}s flight time
                {flightData.hasGps ? " • GPS Track Available" : " • No GPS"}
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push("/viewer")}
            className="px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors"
          >
            Open Viewer
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
