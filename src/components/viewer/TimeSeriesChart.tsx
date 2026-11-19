"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Brush,
  ReferenceLine,
} from "recharts";
import { FlightRecord, MetricConfig } from "@/types";
import { formatTimeShort, formatTime } from "@/lib/flight-data";

interface TimeSeriesChartProps {
  records: FlightRecord[];
  selectedMetrics: MetricConfig[];
  currentRecord: FlightRecord | null;
  onSeekRecord: (index: number) => void;
}

export function TimeSeriesChart({
  records,
  selectedMetrics,
  currentRecord,
  onSeekRecord,
}: TimeSeriesChartProps) {
  // Downsample if more than 1000 points to ensure 60fps responsiveness
  const chartData = useMemo(() => {
    if (records.length <= 800) {
      return records.map((r, idx) => ({
        ...r,
        index: idx,
        displayTime: formatTimeShort(r.time),
      }));
    }

    const step = Math.ceil(records.length / 800);
    const sampled: Array<FlightRecord & { index: number; displayTime: string }> = [];

    for (let i = 0; i < records.length; i += step) {
      const r = records[i];
      sampled.push({
        ...r,
        index: i,
        displayTime: formatTimeShort(r.time),
      });
    }

    // Always include last record
    if (sampled[sampled.length - 1]?.index !== records.length - 1) {
      const last = records[records.length - 1];
      sampled.push({
        ...last,
        index: records.length - 1,
        displayTime: formatTimeShort(last.time),
      });
    }

    return sampled;
  }, [records]);

  // Current record time representation
  const currentTimeDisplay = currentRecord ? formatTimeShort(currentRecord.time) : "";

  // Handle click on chart area to seek
  const handleChartClick = (e: any) => {
    if (e && e.activePayload && e.activePayload.length > 0) {
      const payload = e.activePayload[0].payload;
      if (typeof payload?.index === "number") {
        onSeekRecord(payload.index);
      }
    }
  };

  return (
    <div className="w-full h-full min-h-[300px] flex flex-col bg-[#121217] border border-[#272730] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
            Telemetry Timeline
          </div>
          <div className="text-xs text-zinc-500 font-mono">
            {records.length.toLocaleString()} points
          </div>
        </div>

        {/* Legend pills */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {selectedMetrics.map((m) => {
            const currentVal = currentRecord ? currentRecord[m.id] : null;
            return (
              <div key={m.id} className="flex items-center gap-1.5 font-mono">
                <span
                  className="w-2.5 h-1.5 rounded-full"
                  style={{ backgroundColor: m.color }}
                />
                <span className="text-zinc-400">{m.label}:</span>
                <span className="text-zinc-100 font-medium">
                  {currentVal !== null && currentVal !== undefined
                    ? `${typeof currentVal === "number" ? currentVal.toFixed(1) : currentVal} ${m.unit}`
                    : "—"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 w-full min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            onClick={handleChartClick}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <XAxis
              dataKey="displayTime"
              stroke="#52525b"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: "#272730" }}
            />

            {/* Individual Y-Axes per selected metric to handle scale differences */}
            {selectedMetrics.map((metric, idx) => (
              <YAxis
                key={metric.id}
                yAxisId={metric.id}
                orientation={idx === 0 ? "left" : "right"}
                hide={idx > 1}
                stroke={metric.color}
                fontSize={9}
                tickLine={false}
                axisLine={false}
                domain={["auto", "auto"]}
              />
            ))}

            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-[#0a0a0c]/95 border border-[#272730] rounded-xl p-3 shadow-xl backdrop-blur-md text-xs font-mono space-y-1.5">
                    <div className="text-zinc-400 border-b border-[#272730] pb-1 font-semibold flex items-center justify-between gap-4">
                      <span>Flight Time</span>
                      <span className="text-yellow-400">{formatTime(data.time)}</span>
                    </div>
                    {selectedMetrics.map((m) => {
                      const val = data[m.id];
                      return (
                        <div key={m.id} className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-zinc-300">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: m.color }}
                            />
                            {m.label}
                          </span>
                          <span className="font-bold text-zinc-100">
                            {typeof val === "number" ? val.toFixed(2) : val} {m.unit}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              }}
            />

            {/* Scrubber Reference Line indicating current playback position */}
            {currentTimeDisplay && (
              <ReferenceLine
                x={currentTimeDisplay}
                stroke="#eab308"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: "▶ Current",
                  position: "insideTopRight",
                  fill: "#eab308",
                  fontSize: 10,
                  fontWeight: "bold",
                }}
              />
            )}

            {/* Metric Lines */}
            {selectedMetrics.map((metric) => (
              <Line
                key={metric.id}
                yAxisId={metric.id}
                type="monotone"
                dataKey={metric.id}
                stroke={metric.color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))}

            <Brush
              dataKey="displayTime"
              height={26}
              stroke="#3f3f4e"
              fill="#121217"
              travellerWidth={10}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
