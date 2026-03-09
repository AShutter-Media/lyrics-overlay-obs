"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getStoredToken, getStateFromBrowser } from "@/lib/companion-browser";

export interface TrackInfo {
  title: string;
  artist: string;
  album: string;
  duration: number;
  trackProgress: number;
  isPlaying: boolean;
  fetchedAt: number;
}

interface UseTrackOptions {
  pollInterval?: number;
}

interface UseTrackResult {
  track: TrackInfo | null;
  error: string | null;
  connected: boolean;
  currentTime: number;
}

function applyTrack(
  data: TrackInfo,
  setTrack: (t: TrackInfo | null) => void,
  setError: (e: string | null) => void,
  setConnected: (c: boolean) => void,
  trackRef: React.MutableRefObject<TrackInfo | null>,
  setCurrentTime: (n: number) => void
) {
  setError(null);
  setConnected(true);
  trackRef.current = data;
  setTrack(data);
  if (!data.isPlaying) setCurrentTime(data.trackProgress);
}

/**
 * Polls /api/track (local) o Companion desde el navegador (deploy Vercel).
 */
export function useTrack(options: UseTrackOptions = {}): UseTrackResult {
  const { pollInterval = 1000 } = options;

  const [track, setTrack] = useState<TrackInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const trackRef = useRef<TrackInfo | null>(null);
  const rafRef = useRef<number | null>(null);
  const useBrowserCompanionRef = useRef(false);

  const startRaf = useCallback(() => {
    const tick = () => {
      const t = trackRef.current;
      if (t && t.isPlaying) {
        const elapsed = (Date.now() - t.fetchedAt) / 1000;
        const interpolated = Math.min(t.trackProgress + elapsed, t.duration);
        setCurrentTime(interpolated);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    startRaf();
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [startRaf]);

  const fetchTrack = useCallback(async () => {
    if (!useBrowserCompanionRef.current) {
      try {
        const res = await fetch("/api/track", { cache: "no-store" });
        if (res.status === 503) {
          useBrowserCompanionRef.current = true;
          const token = getStoredToken();
          if (token) {
            const data = await getStateFromBrowser(token);
            if (data) {
              applyTrack(data, setTrack, setError, setConnected, trackRef, setCurrentTime);
              return;
            }
          }
          setError("Sin conexión al Companion. Abre /configure y conecta (o inicia la app en local).");
          setConnected(false);
          return;
        }
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError((data as { error?: string }).error ?? "Error al obtener el tema");
          setConnected(false);
          return;
        }
        const data: TrackInfo = await res.json();
        applyTrack(data, setTrack, setError, setConnected, trackRef, setCurrentTime);
      } catch {
        setError("Error de red.");
        setConnected(false);
      }
      return;
    }

    const token = getStoredToken();
    if (!token) {
      setError("Abre /configure y conecta con YouTube Music Desktop.");
      setConnected(false);
      return;
    }
    const data = await getStateFromBrowser(token);
    if (data) {
      applyTrack(data, setTrack, setError, setConnected, trackRef, setCurrentTime);
    } else {
      setError("Companion desconectado. ¿YTMDA está abierto?");
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    fetchTrack();
    const id = setInterval(fetchTrack, pollInterval);
    return () => clearInterval(id);
  }, [fetchTrack, pollInterval]);

  return { track, error, connected, currentTime };
}
