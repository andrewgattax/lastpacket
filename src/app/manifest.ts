import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LastPacket - Drone Telemetry Inspector",
    short_name: "LastPacket",
    description: "Desktop PWA to inspect and replay FPV drone telemetry logs",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0c",
    theme_color: "#0a0a0c",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
