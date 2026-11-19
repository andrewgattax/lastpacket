import Papa from "papaparse";
import { FlightData, FlightRecord } from "@/types";
import { calculateSummary, getAvailableMetrics } from "./flight-data";

export interface ParseOptions {
  fileName?: string;
  intervalMs?: number;
}

export function parseCsvText(csvText: string, options: ParseOptions = {}): FlightData {
  const { fileName = "telemetry.csv", intervalMs = 150 } = options;

  const result = Papa.parse<Record<string, string>>(csvText.trim(), {
    header: true,
    skipEmptyLines: "greedy",
    dynamicTyping: false,
  });

  if (result.errors.length > 0 && result.data.length === 0) {
    throw new Error(`CSV Parsing failed: ${result.errors[0]?.message || "Unknown error"}`);
  }

  const rawRows = result.data;
  const records: FlightRecord[] = [];
  const gpsTrack: [number, number][] = [];

  let initialRawTime: number | null = null;

  const parseNum = (val: string | undefined, defaultVal = 0): number => {
    if (val === undefined || val === null || val === "") return defaultVal;
    const n = parseFloat(val);
    return isNaN(n) ? defaultVal : n;
  };

  // Altitude Tare Detection (e.g. EdgeTX logs AMSL 932m then resets to 0m delta)
  let baseAltitude = 0;
  let hasTaredAltitude = false;
  let tareIndex = -1;

  if (rawRows.length > 0) {
    const firstAlt = parseNum(rawRows[0]?.GPS_altitude);
    if (firstAlt > 50) {
      baseAltitude = firstAlt;
      // Search first 30 rows to see if altitude drops to 0 or near 0 (< 10m)
      const checkLimit = Math.min(rawRows.length, 30);
      for (let i = 1; i < checkLimit; i++) {
        const alt = parseNum(rawRows[i]?.GPS_altitude);
        if (alt <= 10) {
          hasTaredAltitude = true;
          tareIndex = i;
          break;
        }
      }
    }
  }

  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];
    const rawTime = parseFloat(row.time ?? `${i * intervalMs * 1000}`);

    if (initialRawTime === null && !isNaN(rawTime)) {
      initialRawTime = rawTime;
    }

    // Time calculation: based on index * intervalMs
    const normalizedTime = Math.round(i * intervalMs);

    // Extract GPS coordinates
    const latStr = row["GPS_coord[0]"] || row.GPS_latitude || row.latitude || row.lat;
    const lonStr = row["GPS_coord[1]"] || row.GPS_longitude || row.longitude || row.lon;

    const lat = latStr ? parseFloat(latStr) : null;
    const lon = lonStr ? parseFloat(lonStr) : null;

    const validLat = lat !== null && !isNaN(lat) && lat >= -90 && lat <= 90 && lat !== 0;
    const validLon = lon !== null && !isNaN(lon) && lon >= -180 && lon <= 180 && lon !== 0;

    const parsedLat = validLat ? lat : null;
    const parsedLon = validLon ? lon : null;

    if (parsedLat !== null && parsedLon !== null) {
      gpsTrack.push([parsedLat, parsedLon]);
    }

    // Compute corrected altitude & relative altitude (AGL)
    const rawAlt = parseNum(row.GPS_altitude);
    let correctedAltitude: number;
    let relativeAltitude: number;

    if (hasTaredAltitude) {
      if (tareIndex !== -1 && i < tareIndex) {
        correctedAltitude = baseAltitude;
        relativeAltitude = 0;
      } else {
        correctedAltitude = baseAltitude + rawAlt;
        relativeAltitude = Math.max(0, rawAlt);
      }
    } else {
      correctedAltitude = rawAlt;
      relativeAltitude = baseAltitude > 0 ? Math.max(0, rawAlt - baseAltitude) : rawAlt;
    }

    const record: FlightRecord = {
      time: normalizedTime,
      rawTime: isNaN(rawTime) ? i * intervalMs : rawTime,
      GPS_numSat: parseNum(row.GPS_numSat),
      lat: parsedLat,
      lon: parsedLon,
      GPS_altitude: correctedAltitude,
      relativeAltitude: relativeAltitude,
      GPS_speed: parseNum(row.GPS_speed),
      GPS_ground_course: parseNum(row.GPS_ground_course),
      VSpd: parseNum(row.VSpd),
      Pitch: parseNum(row.Pitch),
      Roll: parseNum(row.Roll),
      Yaw: parseNum(row.Yaw),
      RxBt: parseNum(row.RxBt),
      Curr: parseNum(row.Curr),
      Capa: parseNum(row.Capa),
      RQly: parseNum(row.RQly),
      TQly: parseNum(row.TQly),
      TPWR: parseNum(row.TPWR),
      Ail: parseNum(row.Ail),
      Ele: parseNum(row.Ele),
      Thr: parseNum(row.Thr),
      Rud: parseNum(row.Rud),
    };

    // Also copy any other numeric headers
    for (const key of Object.keys(row)) {
      if (!(key in record)) {
        const val = parseFloat(row[key]);
        if (!isNaN(val)) {
          record[key] = val;
        }
      }
    }

    records.push(record);
  }

  const durationMs = records.length > 0 ? records[records.length - 1].time : 0;
  const summary = calculateSummary(records, intervalMs);
  const availableMetrics = getAvailableMetrics(records);

  return {
    fileName,
    records,
    durationMs,
    intervalMs,
    hasGps: gpsTrack.length > 0,
    gpsTrack,
    summary,
    availableMetrics,
  };
}

export async function parseCsvFile(file: File, intervalMs = 150): Promise<FlightData> {
  const text = await file.text();
  return parseCsvText(text, { fileName: file.name, intervalMs });
}

export async function parseCsvFromUrl(url: string, intervalMs = 150): Promise<FlightData> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch CSV: ${response.statusText}`);
  }
  const text = await response.text();
  const fileName = url.split("/").pop() || "example_log.csv";
  return parseCsvText(text, { fileName, intervalMs });
}
