"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FlightData, FlightRecord } from "@/types";

interface FlightMapInnerProps {
  flightData: FlightData;
  currentRecord: FlightRecord | null;
  followDrone?: boolean;
  showRoads?: boolean;
}

function createStartIcon() {
  return L.divIcon({
    className: "custom-leaflet-icon",
    html: `
      <div style="background-color: #22c55e; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 0 8px rgba(34,197,94,0.8);"></div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function createEndIcon() {
  return L.divIcon({
    className: "custom-leaflet-icon",
    html: `
      <div style="background-color: #ef4444; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 0 8px rgba(239,68,68,0.8);"></div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function createDroneIcon(heading: number) {
  return L.divIcon({
    className: "drone-marker-icon",
    html: `
      <div style="transform: rotate(${heading}deg); display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
        <div style="background: rgba(168, 85, 247, 0.35); border: 2.5px solid #eab308; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px #eab308; backdrop-filter: blur(4px);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
          </svg>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export default function FlightMapInner({
  flightData,
  currentRecord,
  followDrone = false,
  showRoads = false,
}: FlightMapInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const startMarkerRef = useRef<L.Marker | null>(null);
  const endMarkerRef = useRef<L.Marker | null>(null);
  const droneMarkerRef = useRef<L.Marker | null>(null);

  const fullTrack = flightData.gpsTrack;
  const mapLayer = showRoads ? "hybrid" : "satellite";

  // Initialize native Leaflet map once container is mounted
  useEffect(() => {
    const container = containerRef.current;
    if (!container || fullTrack.length === 0) return;

    // Clean up any stale leaflet ID to prevent "Map container is already initialized"
    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id;
    }

    const defaultCenter = fullTrack[0] || [46.037, 8.896];

    const map = L.map(container, {
      center: defaultCenter,
      zoom: 16,
      scrollWheelZoom: true,
      zoomControl: true,
    });
    mapRef.current = map;

    // Tile layer
    const tileUrl = `/api/tiles/${mapLayer}/{z}/{x}/{y}`;
    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.mapbox.com/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Flight polyline
    const polyline = L.polyline(fullTrack, {
      color: "#eab308",
      weight: 3.5,
      opacity: 0.9,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(map);
    polylineRef.current = polyline;

    // Start marker
    const startPoint = fullTrack[0];
    if (startPoint) {
      const startMarker = L.marker(startPoint, { icon: createStartIcon() })
        .bindPopup('<div class="text-xs font-semibold text-zinc-800">Flight Start</div>')
        .addTo(map);
      startMarkerRef.current = startMarker;
    }

    // End marker
    if (fullTrack.length > 1) {
      const endPoint = fullTrack[fullTrack.length - 1];
      const endMarker = L.marker(endPoint, { icon: createEndIcon() })
        .bindPopup('<div class="text-xs font-semibold text-zinc-800">Flight End</div>')
        .addTo(map);
      endMarkerRef.current = endMarker;
    }

    // Drone current position marker
    const initialCoord: [number, number] =
      currentRecord?.lat && currentRecord?.lon
        ? [currentRecord.lat, currentRecord.lon]
        : startPoint;

    const initialHeading =
      currentRecord?.GPS_ground_course ?? currentRecord?.Yaw ?? 0;

    const droneMarker = L.marker(initialCoord, {
      icon: createDroneIcon(initialHeading),
      zIndexOffset: 1000,
    }).addTo(map);
    droneMarkerRef.current = droneMarker;

    // Fit bounds to flight path
    const bounds = L.latLngBounds(fullTrack);
    map.fitBounds(bounds, { padding: [40, 40] });

    return () => {
      // Clean up map instance on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      tileLayerRef.current = null;
      polylineRef.current = null;
      startMarkerRef.current = null;
      endMarkerRef.current = null;
      droneMarkerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullTrack]);

  // Update tile layer when showRoads changes
  useEffect(() => {
    if (tileLayerRef.current) {
      tileLayerRef.current.setUrl(`/api/tiles/${mapLayer}/{z}/{x}/{y}`);
    }
  }, [mapLayer]);

  // Update drone marker position, heading, and follow mode
  useEffect(() => {
    if (!droneMarkerRef.current) return;

    if (currentRecord?.lat && currentRecord?.lon) {
      const newCoord: [number, number] = [currentRecord.lat, currentRecord.lon];
      const heading =
        currentRecord.GPS_ground_course ?? currentRecord.Yaw ?? 0;

      droneMarkerRef.current.setLatLng(newCoord);
      droneMarkerRef.current.setIcon(createDroneIcon(heading));

      if (followDrone && mapRef.current) {
        mapRef.current.panTo(newCoord, { animate: true, duration: 0.15 });
      }
    }
  }, [currentRecord, followDrone]);

  if (fullTrack.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#121217] text-zinc-500 text-sm">
        No valid GPS track coordinates in log.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full w-full rounded-xl z-0"
      style={{ background: "#0a0a0c", minHeight: "100%" }}
    />
  );
}
