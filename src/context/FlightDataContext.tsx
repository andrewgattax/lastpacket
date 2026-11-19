"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { FlightData } from "@/types";
import { parseCsvFromUrl, parseCsvFile, parseCsvText } from "@/lib/csv-parser";

interface FlightDataContextType {
  flightData: FlightData | null;
  setFlightData: React.Dispatch<React.SetStateAction<FlightData | null>>;
  intervalMs: number;
  setIntervalMs: (ms: number) => void;
  isLoading: boolean;
  error: string | null;
  setError: (err: string | null) => void;
  loadExampleData: () => Promise<void>;
  loadFile: (file: File) => Promise<void>;
  rawCsvText: string | null;
}

const FlightDataContext = createContext<FlightDataContextType | undefined>(undefined);

export function FlightDataProvider({ children }: { children: React.ReactNode }) {
  const [flightData, setFlightData] = useState<FlightData | null>(null);
  const [intervalMs, setIntervalMsState] = useState<number>(150);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rawCsvText, setRawCsvText] = useState<string | null>(null);

  // If interval changes and we have raw CSV text, re-parse to update timeline accurately
  const setIntervalMs = useCallback(
    (newInterval: number) => {
      setIntervalMsState(newInterval);
      if (rawCsvText && flightData) {
        try {
          const reParsed = parseCsvText(rawCsvText, {
            fileName: flightData.fileName,
            intervalMs: newInterval,
          });
          setFlightData(reParsed);
        } catch (e) {
          console.error("Failed to re-parse with new interval", e);
        }
      }
    },
    [rawCsvText, flightData]
  );

  const loadExampleData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/example_log.csv");
      if (!response.ok) throw new Error("Could not find /example_log.csv");
      const text = await response.text();
      setRawCsvText(text);
      const data = parseCsvText(text, { fileName: "example_log.csv", intervalMs });
      setFlightData(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load example log";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [intervalMs]);

  const loadFile = useCallback(
    async (file: File) => {
      setIsLoading(true);
      setError(null);
      try {
        const text = await file.text();
        setRawCsvText(text);
        const data = parseCsvText(text, { fileName: file.name, intervalMs });
        setFlightData(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to parse log file";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [intervalMs]
  );

  return (
    <FlightDataContext.Provider
      value={{
        flightData,
        setFlightData,
        intervalMs,
        setIntervalMs,
        isLoading,
        error,
        setError,
        loadExampleData,
        loadFile,
        rawCsvText,
      }}
    >
      {children}
    </FlightDataContext.Provider>
  );
}

export function useFlightData() {
  const context = useContext(FlightDataContext);
  if (!context) {
    throw new Error("useFlightData must be used within a FlightDataProvider");
  }
  return context;
}
