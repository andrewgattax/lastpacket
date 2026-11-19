import type { Metadata } from "next";
import { FlightDataProvider } from "@/context/FlightDataContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "LastPacket — Drone Telemetry Inspector",
  description: "Desktop PWA to inspect and replay FPV drone flight telemetry logs",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased dark"
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0c] text-[#e4e4e7]">
        <FlightDataProvider>{children}</FlightDataProvider>
      </body>
    </html>
  );
}
