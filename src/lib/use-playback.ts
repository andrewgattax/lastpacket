"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { FlightData, FlightRecord, PlaybackState } from "@/types";

export function usePlayback(flightData: FlightData | null) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(1);
  const [direction, setDirection] = useState<1 | -1>(1);

  const totalRecords = flightData?.records.length ?? 0;
  const intervalMs = flightData?.intervalMs ?? 150;

  // Refs for animation loop state to avoid closure staleness
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  const speedRef = useRef(speed);
  speedRef.current = speed;

  const directionRef = useRef(direction);
  directionRef.current = direction;

  const lastFrameTimeRef = useRef<number | null>(null);
  const accumulatedMsRef = useRef<number>(0);

  // Play / Pause controls
  const play = useCallback(() => {
    if (totalRecords === 0) return;
    // If at end and forward, reset to beginning
    if (directionRef.current === 1 && currentIndexRef.current >= totalRecords - 1) {
      setCurrentIndex(0);
      currentIndexRef.current = 0;
    }
    // If at beginning and reverse, reset to end
    if (directionRef.current === -1 && currentIndexRef.current <= 0) {
      setCurrentIndex(totalRecords - 1);
      currentIndexRef.current = totalRecords - 1;
    }
    lastFrameTimeRef.current = null;
    accumulatedMsRef.current = 0;
    setIsPlaying(true);
  }, [totalRecords]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlayingRef.current) {
      pause();
    } else {
      play();
    }
  }, [play, pause]);

  const seek = useCallback(
    (targetIndex: number) => {
      const clamped = Math.max(0, Math.min(totalRecords - 1, Math.round(targetIndex)));
      setCurrentIndex(clamped);
      currentIndexRef.current = clamped;
      accumulatedMsRef.current = 0;
    },
    [totalRecords]
  );

  const seekOffset = useCallback(
    (offsetSeconds: number) => {
      if (totalRecords === 0) return;
      const stepFrames = (offsetSeconds * 1000) / intervalMs;
      seek(currentIndexRef.current + stepFrames);
    },
    [totalRecords, intervalMs, seek]
  );

  const toggleDirection = useCallback(() => {
    setDirection((prev) => (prev === 1 ? -1 : 1));
  }, []);

  // Animation frame loop
  useEffect(() => {
    if (!isPlaying || totalRecords <= 1) return;

    let animationFrameId: number;

    const tick = (now: number) => {
      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = now;
      }

      const elapsed = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      // Add elapsed time scaled by speed
      accumulatedMsRef.current += elapsed * speedRef.current;

      const framesToAdvance = Math.floor(accumulatedMsRef.current / intervalMs);
      if (framesToAdvance > 0) {
        accumulatedMsRef.current -= framesToAdvance * intervalMs;
        const nextIndex = currentIndexRef.current + framesToAdvance * directionRef.current;

        if (directionRef.current === 1) {
          if (nextIndex >= totalRecords - 1) {
            setCurrentIndex(totalRecords - 1);
            currentIndexRef.current = totalRecords - 1;
            setIsPlaying(false);
            return;
          } else {
            setCurrentIndex(nextIndex);
            currentIndexRef.current = nextIndex;
          }
        } else {
          if (nextIndex <= 0) {
            setCurrentIndex(0);
            currentIndexRef.current = 0;
            setIsPlaying(false);
            return;
          } else {
            setCurrentIndex(nextIndex);
            currentIndexRef.current = nextIndex;
          }
        }
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lastFrameTimeRef.current = null;
    };
  }, [isPlaying, totalRecords, intervalMs]);

  // Current record
  const currentRecord = useMemo<FlightRecord | null>(() => {
    if (!flightData || flightData.records.length === 0) return null;
    return flightData.records[currentIndex] ?? null;
  }, [flightData, currentIndex]);

  const currentTimeMs = currentRecord?.time ?? 0;
  const progress = totalRecords > 1 ? currentIndex / (totalRecords - 1) : 0;

  // Global Keyboard shortcuts (Space = play/pause, Left = -2s, Right = +2s)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        seekOffset(-2);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        seekOffset(2);
      } else if (e.code === "KeyR") {
        e.preventDefault();
        toggleDirection();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, seekOffset, toggleDirection]);

  return {
    isPlaying,
    currentIndex,
    currentTimeMs,
    speed,
    direction,
    currentRecord,
    progress,
    totalRecords,
    play,
    pause,
    togglePlay,
    seek,
    seekOffset,
    setSpeed,
    setDirection,
    toggleDirection,
  };
}
