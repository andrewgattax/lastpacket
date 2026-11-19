import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LastPacket - Drone Telemetry Inspector",
    short_name: "LastPacket",
    description: "Desktop PWA to inspect and replay FPV drone flight telemetry logs",
    start_url: "/",
    id: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0a0a0c",
    theme_color: "#0a0a0c",
    orientation: "any",
    categories: ["utilities", "productivity"],
    icons: [
      {
        src: "/icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/desktop-1.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "LastPacket Desktop Flight Telemetry and Map View",
      },
      {
        src: "/screenshots/mobile-1.png",
        sizes: "750x1334",
        type: "image/png",
        form_factor: "narrow",
        label: "LastPacket Mobile Telemetry Overview",
      },
    ],
  };
}
