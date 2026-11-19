"use client";

import React from "react";
import { FlightRecord } from "@/types";
import { Battery, Zap, Gauge, ArrowUpRight, Signal, Compass, Crosshair } from "lucide-react";

interface TelemetryGaugesProps {
  currentRecord: FlightRecord | null;
}

export function TelemetryGauges({ currentRecord }: TelemetryGaugesProps) {
  if (!currentRecord) {
    return (
      <div className="bg-[#121217] border border-[#272730] rounded-2xl p-6 text-center text-zinc-500 text-xs">
        No telemetry frame loaded.
      </div>
    );
  }

  // Battery calculations: Assuming 6S or 4S LiPo based on total voltage
  const voltage = currentRecord.RxBt ?? 0;
  const is6S = voltage > 17;
  const cellCount = is6S ? 6 : 4;
  const cellVoltage = voltage > 0 ? (voltage / cellCount).toFixed(2) : "0.00";
  const numCellV = parseFloat(cellVoltage);

  let batteryColor = "text-emerald-400";
  let batteryBadgeBg = "bg-emerald-500/10 border-emerald-500/30";
  if (numCellV < 3.5) {
    batteryColor = "text-red-400";
    batteryBadgeBg = "bg-red-500/10 border-red-500/30";
  } else if (numCellV < 3.75) {
    batteryColor = "text-yellow-400";
    batteryBadgeBg = "bg-yellow-500/10 border-yellow-500/30";
  }

  const currentAmps = (currentRecord.Curr ?? 0).toFixed(1);
  const capacityUsed = (currentRecord.Capa ?? 0).toFixed(0);
  const altitude = (currentRecord.GPS_altitude ?? 0).toFixed(0);
  const relAltitude = (currentRecord.relativeAltitude ?? 0).toFixed(0);
  const vSpeed = (currentRecord.VSpd ?? 0).toFixed(1);
  const speed = (currentRecord.GPS_speed ?? 0).toFixed(1);
  const linkQuality = currentRecord.RQly ?? 0;
  const txPower = currentRecord.TPWR ?? 0;

  // Attitude values
  const pitch = (currentRecord.Pitch ?? 0).toFixed(1);
  const roll = (currentRecord.Roll ?? 0).toFixed(1);
  const yaw = (currentRecord.Yaw ?? 0).toFixed(1);

  // Stick positions (-1024 to +1024 -> normalized 0 to 100%)
  const normalizeStick = (val: number | null | undefined) => {
    if (val === null || val === undefined) return 50;
    const clamped = Math.max(-1024, Math.min(1024, val));
    return ((clamped + 1024) / 2048) * 100;
  };

  const thrPercent = normalizeStick(currentRecord.Thr);
  const ailPercent = normalizeStick(currentRecord.Ail);
  const elePercent = normalizeStick(currentRecord.Ele);
  const rudPercent = normalizeStick(currentRecord.Rud);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Battery & Power */}
      <div className="bg-[#121217] border border-[#272730] rounded-2xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
          <span className="flex items-center gap-1.5 font-medium">
            <Battery className="w-3.5 h-3.5 text-yellow-400" /> Battery ({cellCount}S)
          </span>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${batteryBadgeBg} ${batteryColor}`}>
            {cellVoltage}V/c
          </span>
        </div>
        <div className="my-1">
          <div className="text-xl font-black font-mono tracking-tight text-zinc-100">
            {voltage.toFixed(1)} <span className="text-xs font-normal text-zinc-400">V</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1 border-t border-[#272730]/60">
          <span>{currentAmps} A</span>
          <span>{capacityUsed} mAh</span>
        </div>
      </div>

      {/* 2. Altitude & Climb */}
      <div className="bg-[#121217] border border-[#272730] rounded-2xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
          <span className="flex items-center gap-1.5 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 text-sky-400" /> Altitude
          </span>
          <span className="text-[10px] font-mono text-sky-400 font-semibold">+{relAltitude}m AGL</span>
        </div>
        <div className="my-1">
          <div className="text-xl font-black font-mono tracking-tight text-zinc-100">
            {altitude} <span className="text-xs font-normal text-zinc-400">m</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1 border-t border-[#272730]/60">
          <span>Climb:</span>
          <span className={parseFloat(vSpeed) >= 0 ? "text-emerald-400" : "text-amber-400"}>
            {vSpeed} m/s
          </span>
        </div>
      </div>

      {/* 3. Speed & Heading */}
      <div className="bg-[#121217] border border-[#272730] rounded-2xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
          <span className="flex items-center gap-1.5 font-medium">
            <Gauge className="w-3.5 h-3.5 text-yellow-400" /> Speed
          </span>
          <span className="text-[10px] font-mono text-zinc-500">GPS 2D</span>
        </div>
        <div className="my-1">
          <div className="text-xl font-black font-mono tracking-tight text-zinc-100">
            {speed} <span className="text-xs font-normal text-zinc-400">km/h</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1 border-t border-[#272730]/60">
          <span>Heading:</span>
          <span className="text-zinc-200">
            {currentRecord.GPS_ground_course ? `${currentRecord.GPS_ground_course.toFixed(0)}°` : "—"}
          </span>
        </div>
      </div>

      {/* 4. RF Link Quality */}
      <div className="bg-[#121217] border border-[#272730] rounded-2xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
          <span className="flex items-center gap-1.5 font-medium">
            <Signal className="w-3.5 h-3.5 text-purple-400" /> Link Quality
          </span>
          <span className="text-[10px] font-mono text-purple-300">
            {txPower > 0 ? `${txPower}mW` : ""}
          </span>
        </div>
        <div className="my-1">
          <div className="text-xl font-black font-mono tracking-tight text-zinc-100">
            {linkQuality} <span className="text-xs font-normal text-zinc-400">%</span>
          </div>
        </div>
        <div className="pt-1 border-t border-[#272730]/60">
          <div className="w-full bg-[#181820] h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-150 ${
                linkQuality > 80 ? "bg-purple-500" : linkQuality > 50 ? "bg-yellow-500" : "bg-red-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, linkQuality))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 5. Attitude (Artificial Horizon & Angles) */}
      <div className="bg-[#121217] border border-[#272730] rounded-2xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
          <span className="flex items-center gap-1.5 font-medium">
            <Compass className="w-3.5 h-3.5 text-indigo-400" /> Attitude
          </span>
          <span className="text-[10px] font-mono text-zinc-500">P / R / Y</span>
        </div>

        {/* Mini Horizon Indicator */}
        <div className="relative h-10 w-full bg-[#181820] rounded-lg overflow-hidden flex items-center justify-center border border-[#272730] my-1">
          {/* Pitch tilt */}
          <div
            className="absolute inset-0 transition-transform duration-100"
            style={{
              transform: `rotate(${-parseFloat(roll)}deg) translateY(${parseFloat(pitch) * 0.5}px)`,
            }}
          >
            <div className="h-1/2 bg-sky-950/60 border-b border-indigo-400/80" />
            <div className="h-1/2 bg-amber-950/40" />
          </div>
          {/* Fixed crosshair center */}
          <div className="relative z-10 w-4 h-0.5 bg-yellow-400 shadow-sm" />
          <div className="relative z-10 w-1.5 h-1.5 rounded-full border border-yellow-400" />
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1 border-t border-[#272730]/60">
          <span>P:{pitch}°</span>
          <span>R:{roll}°</span>
          <span>Y:{yaw}°</span>
        </div>
      </div>

      {/* 6. Stick Inputs HUD */}
      <div className="bg-[#121217] border border-[#272730] rounded-2xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
          <span className="flex items-center gap-1.5 font-medium">
            <Crosshair className="w-3.5 h-3.5 text-yellow-400" /> Stick Inputs
          </span>
          <span className="text-[10px] font-mono text-zinc-500">Thr {thrPercent.toFixed(0)}%</span>
        </div>

        <div className="grid grid-cols-2 gap-2 my-1">
          {/* Left Stick (Thr, Rud) */}
          <div className="relative h-10 bg-[#181820] rounded-lg border border-[#272730] flex items-center justify-center">
            <div
              className="absolute w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_6px_#eab308] transition-all duration-75"
              style={{
                left: `calc(${rudPercent}% - 4px)`,
                top: `calc(${100 - thrPercent}% - 4px)`,
              }}
            />
          </div>

          {/* Right Stick (Ail, Ele) */}
          <div className="relative h-10 bg-[#181820] rounded-lg border border-[#272730] flex items-center justify-center">
            <div
              className="absolute w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_6px_#a855f7] transition-all duration-75"
              style={{
                left: `calc(${ailPercent}% - 4px)`,
                top: `calc(${100 - elePercent}% - 4px)`,
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1 border-t border-[#272730]/60">
          <span>Left: Thr/Yaw</span>
          <span>Right: Pitch/Roll</span>
        </div>
      </div>
    </div>
  );
}
