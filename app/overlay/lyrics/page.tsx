"use client";

import { useEffect, useRef, useState } from "react";
import { useTrack } from "@/hooks/use-track";
import { useLyrics } from "@/hooks/use-lyrics";
import { LyricsDisplay } from "@/components/lyrics-display";
import { buildTrackKey } from "@/lib/lrc-parser";
import { setStoredToken } from "@/lib/companion-browser";

const HIDE_AFTER_PAUSE_MS = 2000;

export default function LyricsOverlayPage() {
  // Al cargar en OBS: si la URL trae token en el hash, guardarlo y limpiar la URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    const m = hash?.match(/[#&]token=([^&]+)/);
    if (m) {
      try {
        setStoredToken(decodeURIComponent(m[1].replace(/\+/g, " ")));
      } catch {
        // ignore
      }
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }
  }, []);

  const { track, currentTime, connected } = useTrack({ pollInterval: 2000 });

  // Debounced stable track identity (avoid flicker on quick poll jitter)
  const [stableTrack, setStableTrack] = useState<{
    title: string;
    artist: string;
    album: string;
    duration: number;
  } | null>(null);

  // Ocultar letras 5s después de pausar; volver a mostrar al dar play
  const [showLyrics, setShowLyrics] = useState(true);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lastKeyRef = useRef<string>("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!track) return;
    const key = buildTrackKey(track.artist, track.title);
    if (key === lastKeyRef.current) return;

    // Debounce 500ms before accepting the new track
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      lastKeyRef.current = key;
      setStableTrack({
        title: track.title,
        artist: track.artist,
        album: track.album,
        duration: track.duration,
      });
    }, 500);
  }, [track]);

  const { lines, synced, loading } = useLyrics({
    artist: stableTrack?.artist ?? "",
    title: stableTrack?.title ?? "",
    album: stableTrack?.album ?? "",
    duration: stableTrack?.duration,
    debounceMs: 400,
  });

  useEffect(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    if (track?.isPlaying) {
      setShowLyrics(true);
    } else if (track && lines.length > 0) {
      hideTimeoutRef.current = setTimeout(() => {
        hideTimeoutRef.current = null;
        setShowLyrics(false);
      }, HIDE_AFTER_PAUSE_MS);
    }
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };
  }, [track?.isPlaying, track, lines.length]);

  const hasLyrics = !loading && lines.length > 0;
  const shouldHideBecausePaused = track && !track.isPlaying && hasLyrics && !showLyrics;

  // Overlay is fully transparent – nothing to show when not connected
  if (!connected && !stableTrack) {
    return (
      <main className="w-full h-screen flex items-center justify-center bg-transparent">
        <p className="text-overlay-dim text-2xl font-semibold animate-pulse">
          Waiting for YouTube Music...
        </p>
      </main>
    );
  }

  const noLyrics = !loading && lines.length === 0;

  return (
    <main className="w-full h-screen flex flex-col items-center justify-center bg-transparent overflow-hidden">
      <div
        className={`w-full max-w-3xl flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${
          shouldHideBecausePaused ? "opacity-0" : "opacity-100"
        }`}
      >
        {loading && (
          <div className="flex items-center gap-2 text-overlay-dim text-xl animate-pulse">
            <span className="w-2 h-2 rounded-full bg-overlay-dim inline-block" />
            <span className="w-2 h-2 rounded-full bg-overlay-dim inline-block [animation-delay:150ms]" />
            <span className="w-2 h-2 rounded-full bg-overlay-dim inline-block [animation-delay:300ms]" />
          </div>
        )}

        {!loading && noLyrics && stableTrack && (
          <div className="flex flex-col items-center gap-3 text-center px-8">
            <p className="text-overlay-dim text-3xl font-semibold">
              {stableTrack.title}
            </p>
            <p className="text-overlay-dim/60 text-xl">{stableTrack.artist}</p>
            <p className="text-overlay-dim/40 text-lg mt-2">No lyrics found</p>
          </div>
        )}

        {hasLyrics && (
          <LyricsDisplay
            lines={lines}
            currentTime={currentTime}
            synced={synced}
            duration={track?.duration ?? stableTrack?.duration ?? 0}
          />
        )}
      </div>
    </main>
  );
}
