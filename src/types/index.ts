export interface FlightRecord {
  time: number; // Normalized time offset in ms from start (0, 150, ...)
  rawTime: number; // Original timestamp from log file
  GPS_numSat: number;
  lat: number | null;
  lon: number | null;
  GPS_altitude: number;
  relativeAltitude: number;
  GPS_speed: number;
  GPS_ground_course: number;
  VSpd: number;
  Pitch: number;
  Roll: number;
  Yaw: number;
  RxBt: number;
  Curr: number;
  Capa: number;
  RQly: number;
  TQly: number;
  TPWR: number;
  Ail: number;
  Ele: number;
  Thr: number;
  Rud: number;
  [key: string]: any;
}

export interface FlightSummary {
  totalRecords: number;
  durationMs: number;
  maxAltitude: number;
  maxSpeed: number;
  minVoltage: number;
  maxCurrent: number;
  totalCapacity: number;
  minLinkQuality: number;
  startCoords?: [number, number];
  endCoords?: [number, number];
}

export interface MetricConfig {
  id: string;
  label: string;
  unit: string;
  color: string;
  category: "power" | "nav" | "attitude" | "radio" | "sticks";
  description?: string;
}

export interface FlightData {
  fileName: string;
  records: FlightRecord[];
  durationMs: number;
  intervalMs: number;
  hasGps: boolean;
  gpsTrack: [number, number][]; // Array of [lat, lon]
  summary: FlightSummary;
  availableMetrics: MetricConfig[];
}

export interface PlaybackState {
  isPlaying: boolean;
  currentIndex: number;
  currentTimeMs: number;
  speed: number; // e.g. 0.25, 0.5, 1, 2, 5, 10
  direction: 1 | -1;
}

export const AVAILABLE_METRICS: MetricConfig[] = [
  { id: "GPS_altitude", label: "Altitude (AMSL)", unit: "m", color: "#38bdf8", category: "nav" },
  { id: "relativeAltitude", label: "Altitude (Relative/AGL)", unit: "m", color: "#0ea5e9", category: "nav" },
  { id: "GPS_speed", label: "Speed", unit: "km/h", color: "#facc15", category: "nav" },
  { id: "VSpd", label: "Vertical Speed", unit: "m/s", color: "#34d399", category: "nav" },
  { id: "RxBt", label: "Battery Voltage", unit: "V", color: "#f87171", category: "power" },
  { id: "Curr", label: "Current", unit: "A", color: "#fb923c", category: "power" },
  { id: "Capa", label: "Capacity Used", unit: "mAh", color: "#e879f9", category: "power" },
  { id: "RQly", label: "Uplink Quality (RQly)", unit: "%", color: "#a855f7", category: "radio" },
  { id: "TQly", label: "Downlink Quality (TQly)", unit: "%", color: "#c084fc", category: "radio" },
  { id: "TPWR", label: "TX Power", unit: "mW", color: "#ec4899", category: "radio" },
  { id: "GPS_numSat", label: "Satellites", unit: "", color: "#22d3ee", category: "nav" },
  { id: "Pitch", label: "Pitch", unit: "°", color: "#60a5fa", category: "attitude" },
  { id: "Roll", label: "Roll", unit: "°", color: "#818cf8", category: "attitude" },
  { id: "Yaw", label: "Yaw", unit: "°", color: "#a78bfa", category: "attitude" },
  { id: "Thr", label: "Throttle", unit: "", color: "#eab308", category: "sticks" },
  { id: "Ail", label: "Aileron (Roll)", unit: "", color: "#4ade80", category: "sticks" },
  { id: "Ele", label: "Elevator (Pitch)", unit: "", color: "#2dd4bf", category: "sticks" },
  { id: "Rud", label: "Rudder (Yaw)", unit: "", color: "#f472b6", category: "sticks" },
];
