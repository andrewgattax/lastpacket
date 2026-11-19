"use client";

import React from "react";
import { MetricConfig } from "@/types";
import { SlidersHorizontal, Check } from "lucide-react";

interface ParameterPickerProps {
  availableMetrics: MetricConfig[];
  selectedMetricIds: string[];
  onChange: (ids: string[]) => void;
  maxMetrics?: number;
}

export function ParameterPicker({
  availableMetrics,
  selectedMetricIds,
  onChange,
  maxMetrics = 4,
}: ParameterPickerProps) {
  const toggleMetric = (id: string) => {
    if (selectedMetricIds.includes(id)) {
      // Don't allow deselecting the last metric
      if (selectedMetricIds.length <= 1) return;
      onChange(selectedMetricIds.filter((item) => item !== id));
    } else {
      if (selectedMetricIds.length >= maxMetrics) {
        // Replace oldest or shift
        onChange([...selectedMetricIds.slice(1), id]);
      } else {
        onChange([...selectedMetricIds, id]);
      }
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#121217] border border-[#272730] rounded-xl text-xs">
      <div className="flex items-center gap-1.5 px-2 py-1 text-zinc-500 font-mono text-[11px] uppercase tracking-wider">
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>Metrics ({selectedMetricIds.length}/{maxMetrics})</span>
      </div>

      <div className="h-4 w-[1px] bg-[#272730] hidden sm:block mx-1" />

      <div className="flex flex-wrap items-center gap-1.5">
        {availableMetrics.map((metric) => {
          const isSelected = selectedMetricIds.includes(metric.id);
          return (
            <button
              key={metric.id}
              type="button"
              onClick={() => toggleMetric(metric.id)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 ${
                isSelected
                  ? "bg-[#181820] text-zinc-100 border-[#3f3f4e] shadow-sm"
                  : "bg-transparent text-zinc-400 border-transparent hover:bg-[#181820]/60 hover:text-zinc-300"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  backgroundColor: metric.color,
                  boxShadow: isSelected ? `0 0 6px ${metric.color}` : "none",
                }}
              />
              <span>{metric.label}</span>
              {metric.unit && <span className="text-[10px] text-zinc-500">({metric.unit})</span>}
              {isSelected && <Check className="w-3 h-3 text-yellow-400 ml-0.5" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
