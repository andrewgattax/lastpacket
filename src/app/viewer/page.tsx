import React from "react";
import { Metadata } from "next";
import { ViewerShell } from "@/components/viewer/ViewerShell";

export const metadata: Metadata = {
  title: "Flight Telemetry Inspector — LastPacket",
  description: "Synchronized flight map and time-series telemetry replay",
};

export default function ViewerPage() {
  return (
    <main className="flex-1 flex flex-col w-full h-full min-h-screen bg-[#0a0a0c]">
      <ViewerShell />
    </main>
  );
}
