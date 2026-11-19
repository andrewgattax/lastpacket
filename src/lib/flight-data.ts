import { FlightRecord, FlightSummary, MetricConfig, AVAILABLE_METRICS } from "@/types";

export function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const tenths = Math.floor((totalSeconds % 1) * 10);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${tenths}`;
}

export function formatTimeShort(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function calculateSummary(records: FlightRecord[], intervalMs: number): FlightSummary {
  if (records.length === 0) {
    return {
      totalRecords: 0,
      durationMs: 0,
      maxAltitude: 0,
      maxSpeed: 0,
      minVoltage: 0,
      maxCurrent: 0,
      totalCapacity: 0,
      minLinkQuality: 100,
    };
  }

  let maxAltitude = -Infinity;
  let maxSpeed = -Infinity;
  let minVoltage = Infinity;
  let maxCurrent = -Infinity;
  let totalCapacity = 0;
  let minLinkQuality = Infinity;

  let startCoords: [number, number] | undefined;
  let endCoords: [number, number] | undefined;

  for (let i = 0; i < records.length; i++) {
    const r = records[i];

    if (r.GPS_altitude > maxAltitude) maxAltitude = r.GPS_altitude;
    if (r.GPS_speed > maxSpeed) maxSpeed = r.GPS_speed;
    if (r.RxBt > 0 && r.RxBt < minVoltage) minVoltage = r.RxBt;
    if (r.Curr > maxCurrent) maxCurrent = r.Curr;
    if (r.Capa > totalCapacity) totalCapacity = r.Capa;
    if (r.RQly > 0 && r.RQly < minLinkQuality) minLinkQuality = r.RQly;

    if (r.lat !== null && r.lon !== null && r.lat !== 0 && r.lon !== 0) {
      if (!startCoords) {
        startCoords = [r.lat, r.lon];
      }
      endCoords = [r.lat, r.lon];
    }
  }

  const durationMs = records[records.length - 1].time;

  return {
    totalRecords: records.length,
    durationMs,
    maxAltitude: maxAltitude === -Infinity ? 0 : maxAltitude,
    maxSpeed: maxSpeed === -Infinity ? 0 : maxSpeed,
    minVoltage: minVoltage === Infinity ? 0 : minVoltage,
    maxCurrent: maxCurrent === -Infinity ? 0 : maxCurrent,
    totalCapacity,
    minLinkQuality: minLinkQuality === Infinity ? 100 : minLinkQuality,
    startCoords,
    endCoords,
  };
}

export function getAvailableMetrics(records: FlightRecord[]): MetricConfig[] {
  if (records.length === 0) return AVAILABLE_METRICS;
  const sample = records[0];

  return AVAILABLE_METRICS.filter((metric) => {
    return metric.id in sample && sample[metric.id] !== null;
  });
}
