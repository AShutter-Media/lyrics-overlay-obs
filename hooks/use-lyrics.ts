"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { buildTrackKey, type LyricLine } from "@/lib/lrc-parser";

interface LyricsData {
  lines: LyricLine[];
  synced: boolean;
  trackName: string;
  artistName: string;
}

interface UseLyricsOptions {
  artist: string;
  title: string;
  album?: string;
  duration?: number;
  /** Debounce delay in ms before fetching on track change (default 600) */
  debounceMs?: number;
}

interface UseLyricsResult {
  lines: LyricLine[];
  synced: boolean;
  loading: boolean;
  error: string | null;
}

// Module-level cache survives component remounts
const lyricsCacheModule = new Map<string, LyricsData>();

export function useLyrics(options: UseLyricsOptions): UseLyricsResult {
  const { artist, title, album = "", duration, debounceMs = 600 } = options;

  const [data, setData] = useState<LyricsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchLyrics = useCallback(
    async (a: string, t: string, al: string, dur?: number) => {
      if (!a || !t) return;

      const key = buildTrackKey(a, t);
      if (lyricsCacheModule.has(key)) {
        setData(lyricsCacheModule.get(key)!);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setData(null);

      try {
        const params = new URLSearchParams({ artist: a, title: t });
        if (al) params.set("album", al);
        if (dur) params.set("duration", String(dur));

        const res = await fetch(`/api/lyrics?${params.toString()}`);
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          setError(d.error ?? "Failed to fetch lyrics");
          setLoading(false);
          return;
        }

        const result: LyricsData = await res.json();
        lyricsCacheModule.set(key, result);
        setData(result);
      } catch {
        setError("Network error fetching lyrics");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!artist || !title) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchLyrics(artist, title, album, duration);
    }, debounceMs);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [artist, title, album, duration, debounceMs, fetchLyrics]);

  return {
    lines: data?.lines ?? [],
    synced: data?.synced ?? false,
    loading,
    error,
  };
}
