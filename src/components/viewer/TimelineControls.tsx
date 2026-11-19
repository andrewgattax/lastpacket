"use client";

import React, { ChangeEvent } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Repeat,
  Gauge,
  FastForward,
} from "lucide-react";
import { formatTime, formatTimeShort } from "@/lib/flight-data";

interface TimelineControlsProps {
  isPlaying: boolean;
  currentIndex: number;
  totalRecords: number;
  currentTimeMs: number;
  totalDurationMs: number;
  speed: number;
  direction: 1 | -1;
  onTogglePlay: () => void;
  onSeek: (index: number) => void;
  onSeekOffset: (seconds: number) => void;
  onSetSpeed: (speed: number) => void;
  onToggleDirection: () => void;
}

const SPEED_OPTIONS = [0.25, 0.5, 1, 2, 5, 10];

export function TimelineControls({
  isPlaying,
  currentIndex,
  totalRecords,
  currentTimeMs,
  totalDurationMs,
  speed,
  direction,
  onTogglePlay,
  onSeek,
  onSeekOffset,
  onSetSpeed,
  onToggleDirection,
}: TimelineControlsProps) {
  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSeek(Number(e.target.value));
  };

  const progressPercent =
    totalRecords > 1 ? ((currentIndex / (totalRecords - 1)) * 100).toFixed(1) : "0";

  return (
    <div className="bg-[#121217] border border-[#272730] rounded-2xl p-4 space-y-3 shadow-xl">
      {/* Scrubber slider and time labels */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 font-semibold text-sm">
              {formatTime(currentTimeMs)}
            </span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-400">{formatTime(totalDurationMs)}</span>
          </div>

          <div className="flex items-center gap-2 text-zinc-500 text-[11px]">
            <span>
              Frame <strong className="text-zinc-300">{currentIndex + 1}</strong> of {totalRecords}
            </span>
            <span className="text-zinc-700">•</span>
            <span>{progressPercent}%</span>
          </div>
        </div>

        {/* Custom Scrubber Track */}
        <div className="relative flex items-center group">
          <input
            type="range"
            min={0}
            max={Math.max(0, totalRecords - 1)}
            value={currentIndex}
            onChange={handleSliderChange}
            className="w-full h-2.5 bg-[#181820] rounded-lg appearance-none cursor-pointer accent-yellow-500 focus:outline-none transition-all group-hover:h-3"
            style={{
              background: `linear-gradient(to right, #eab308 0%, #eab308 ${progressPercent}%, #272730 ${progressPercent}%, #272730 100%)`,
            }}
          />
        </div>
      </div>

      {/* Playback Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#272730]/60">
        {/* Left: Direction & Stepping */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleDirection}
            title="Toggle playback direction (R)"
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              direction === -1
                ? "bg-purple-900/40 text-purple-300 border-purple-500/50"
                : "bg-[#181820] text-zinc-400 border-[#272730] hover:text-zinc-200"
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px]">{direction === 1 ? "FWD" : "REV"}</span>
          </button>

          <button
            type="button"
            onClick={() => onSeekOffset(-2)}
            title="Seek back 2 seconds (Left Arrow)"
            className="p-1.5 rounded-xl bg-[#181820] border border-[#272730] text-zinc-300 hover:text-white hover:border-[#3f3f4e] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onSeekOffset(2)}
            title="Seek forward 2 seconds (Right Arrow)"
            className="p-1.5 rounded-xl bg-[#181820] border border-[#272730] text-zinc-300 hover:text-white hover:border-[#3f3f4e] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Main Play/Pause Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onSeek(0)}
            title="Restart from beginning"
            className="p-2 rounded-xl bg-[#181820] border border-[#272730] text-zinc-400 hover:text-zinc-200 hover:border-[#3f3f4e] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onTogglePlay}
            title="Play / Pause (Space)"
            className="px-6 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold flex items-center gap-2 shadow-lg shadow-yellow-500/20 active:scale-95 transition-all"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-black" />
                <span className="text-sm">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-black ml-0.5" />
                <span className="text-sm">Play</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Speed Multiplier */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-zinc-500 font-mono hidden sm:inline mr-1">Speed:</span>
          <div className="flex items-center bg-[#181820] border border-[#272730] rounded-xl p-1 gap-1">
            {SPEED_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSetSpeed(s)}
                className={`px-2 py-0.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  speed === s
                    ? "bg-yellow-500 text-black font-bold shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-[#272730]"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
