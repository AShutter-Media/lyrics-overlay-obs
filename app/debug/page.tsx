"use client";

import { useState } from "react";
import { useTrack } from "@/hooks/use-track";
import { useLyrics } from "@/hooks/use-lyrics";
import { getActiveLyricIndex } from "@/lib/lrc-parser";
import { cn } from "@/lib/utils";

export default function DebugPage() {
  const { track, currentTime, connected, error: trackError } = useTrack({
    pollInterval: 1000,
  });

  const [showRaw, setShowRaw] = useState(false);

  const { lines, synced, loading, error: lyricsError } = useLyrics({
    artist: track?.artist ?? "",
    title: track?.title ?? "",
    album: track?.album ?? "",
    duration: track?.duration,
  });

  const activeIndex = synced ? getActiveLyricIndex(lines, currentTime) : -1;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    const ms = Math.floor((s % 1) * 100);
    return `${m}:${String(sec).padStart(2, "0")}.${String(ms).padStart(2, "0")}`;
  };

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6 font-mono">
      <h1 className="text-2xl font-bold mb-6 text-white">
        Karaoke Overlay — Debug
      </h1>

      {/* Connection Status */}
      <section className="mb-6 p-4 rounded-lg bg-gray-900 border border-gray-800">
        <h2 className="text-sm uppercase tracking-widest text-gray-400 mb-3">
          Connection Status
        </h2>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "w-3 h-3 rounded-full",
              connected ? "bg-green-400 animate-pulse" : "bg-red-500"
            )}
          />
          <span className={connected ? "text-green-400" : "text-red-400"}>
            {connected
              ? "Connected to YouTube Music Desktop App"
              : trackError ?? "Not connected"}
          </span>
        </div>
      </section>

      {/* Current Track */}
      <section className="mb-6 p-4 rounded-lg bg-gray-900 border border-gray-800">
        <h2 className="text-sm uppercase tracking-widest text-gray-400 mb-3">
          Current Track
        </h2>
        {track ? (
          <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-sm">
            <span className="text-gray-400">Title</span>
            <span className="text-white">{track.title}</span>
            <span className="text-gray-400">Artist</span>
            <span className="text-white">{track.artist}</span>
            <span className="text-gray-400">Album</span>
            <span className="text-white">{track.album || "—"}</span>
            <span className="text-gray-400">Duration</span>
            <span className="text-white">{formatTime(track.duration)}</span>
            <span className="text-gray-400">Track Progress</span>
            <span className="text-white">{formatTime(track.trackProgress)}</span>
            <span className="text-gray-400">Interpolated Time</span>
            <span className="text-yellow-300">{formatTime(currentTime)}</span>
            <span className="text-gray-400">Playing</span>
            <span className={track.isPlaying ? "text-green-400" : "text-gray-400"}>
              {track.isPlaying ? "Yes" : "Paused"}
            </span>
          </div>
        ) : (
          <p className="text-gray-500">No track data</p>
        )}
      </section>

      {/* Lyrics Status */}
      <section className="mb-6 p-4 rounded-lg bg-gray-900 border border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm uppercase tracking-widest text-gray-400">
            Lyrics ({lines.length} lines — {synced ? "synced" : "unsynced"})
          </h2>
          <button
            onClick={() => setShowRaw((v) => !v)}
            className="text-xs text-gray-400 hover:text-white border border-gray-700 rounded px-2 py-1 transition-colors"
          >
            {showRaw ? "Hide raw" : "Show raw JSON"}
          </button>
        </div>

        {loading && (
          <p className="text-yellow-400 text-sm animate-pulse">Loading lyrics...</p>
        )}
        {lyricsError && (
          <p className="text-red-400 text-sm">{lyricsError}</p>
        )}

        {showRaw && lines.length > 0 && (
          <pre className="text-xs text-green-300 bg-gray-950 rounded p-3 overflow-auto max-h-48 mb-4">
            {JSON.stringify(lines, null, 2)}
          </pre>
        )}

        {/* Scrollable lyric timing viewer */}
        {!loading && lines.length > 0 && (
          <div className="max-h-80 overflow-y-auto rounded border border-gray-800">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-gray-900">
                <tr>
                  <th className="text-left p-2 text-gray-500 w-16">#</th>
                  <th className="text-left p-2 text-gray-500 w-24">Time</th>
                  <th className="text-left p-2 text-gray-500">Lyric</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, i) => (
                  <tr
                    key={i}
                    className={cn(
                      "border-t border-gray-800/50 transition-colors",
                      i === activeIndex
                        ? "bg-yellow-400/10 text-yellow-300"
                        : i < activeIndex
                        ? "text-gray-500"
                        : "text-gray-300"
                    )}
                  >
                    <td className="p-2 text-gray-600">{i}</td>
                    <td className="p-2 tabular-nums">
                      {synced ? formatTime(line.time) : "—"}
                    </td>
                    <td className="p-2">{line.text || "(empty)"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && lines.length === 0 && !lyricsError && track && (
          <p className="text-gray-500 text-sm">No lyrics available for this track.</p>
        )}
      </section>

      {/* OBS hint */}
      <section className="p-4 rounded-lg bg-gray-900 border border-gray-800">
        <h2 className="text-sm uppercase tracking-widest text-gray-400 mb-2">
          OBS Browser Source URL
        </h2>
        <code className="text-green-400 text-sm break-all">
          http://localhost:3000/overlay/lyrics
        </code>
        <p className="text-gray-500 text-xs mt-2">
          Set width/height to match your canvas. Enable "Shutdown source when not
          visible" and "Refresh browser when scene becomes active" for best results.
        </p>
      </section>
    </main>
  );
}
