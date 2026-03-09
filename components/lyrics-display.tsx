"use client";

import { useEffect, useRef } from "react";
import { getActiveLyricIndex, type LyricLine } from "@/lib/lrc-parser";
import { cn } from "@/lib/utils";

interface LyricsDisplayProps {
  lines: LyricLine[];
  currentTime: number;
  synced: boolean;
  /** Duración del tema en segundos; solo se usa para plain (unsynced) para la ventana deslizante */
  duration?: number;
}

const VISIBLE_CONTEXT = 3; // lines above/below active to show
// Plain: ventana centrada en la "línea actual" estimada por progreso (siempre ves el bloque donde deberías estar)
const PLAIN_WINDOW_SIZE = 9; // líneas visibles a la vez
// > 1 = no adelantarse en intros/solos (quedarse un poco atrás); 1.1 = margen suave
const PLAIN_PROGRESS_HOLD = 1.1;

export function LyricsDisplay({ lines, currentTime, synced, duration = 0 }: LyricsDisplayProps) {
  const activeIndex = synced ? getActiveLyricIndex(lines, currentTime) : -1;
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  if (!lines.length) return null;

  // Plain (unsynced): ventana siempre centrada en la "línea actual" estimada por tiempo
  // Así la línea que toca (según el progreso) está en pantalla; el hold evita adelantarse en instrumentales
  if (!synced) {
    const total = lines.length;
    const progress = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;
    const progressHeld = progress ** PLAIN_PROGRESS_HOLD;
    const estimatedLineIndex = progressHeld * Math.max(0, total - 1);
    const halfWindow = Math.floor(PLAIN_WINDOW_SIZE / 2);
    const maxStart = Math.max(0, total - PLAIN_WINDOW_SIZE);
    const startIdx = Math.max(0, Math.min(maxStart, Math.round(estimatedLineIndex) - halfWindow));
    const visibleLines = lines.slice(startIdx, startIdx + PLAIN_WINDOW_SIZE);

    return (
      <div
        ref={containerRef}
        className="flex flex-col items-center gap-5 px-6 text-center overflow-hidden"
      >
        {visibleLines.map((line, i) => (
          <p
            key={`plain-${startIdx + i}`}
            className="text-[clamp(1.5rem,4vw,2.5rem)] font-semibold leading-tight text-overlay-inactive text-balance lyrics-shadow transition-opacity duration-300"
          >
            {line.text || <span className="opacity-0">&#8203;</span>}
          </p>
        ))}
      </div>
    );
  }

  // Sync: posiciones fijas. Siempre 7 ranuras; la del centro (ranura 3) es la línea activa. Sin scroll.
  const SLOT_OFFSETS = [-3, -2, -1, 0, 1, 2, 3];
  const displayIndex = activeIndex < 0 ? 0 : activeIndex;

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center gap-5 px-6 text-center overflow-hidden w-full max-w-3xl"
    >
      {SLOT_OFFSETS.map((offset, slot) => {
        const lineIndex = displayIndex + offset;
        const line = lineIndex >= 0 && lineIndex < lines.length ? lines[lineIndex] : null;
        const isActive = offset === 0;
        const isPast = offset < 0 && line != null;
        const distance = Math.abs(offset);
        const opacity = isActive
          ? 1
          : distance === 1
            ? 0.45
            : distance === 2
              ? 0.25
              : distance === 3
                ? 0.12
                : 0;

        return (
          <div
            key={slot}
            ref={isActive ? activeRef : null}
            style={{ opacity }}
            className={cn(
              "min-h-[1.2em] transition-opacity duration-300 ease-in-out text-balance",
              isActive ? "lyrics-shadow-strong" : "lyrics-shadow",
              isActive
                ? "text-[clamp(2rem,5vw,3.5rem)] font-bold text-overlay-active scale-105"
                : "text-[clamp(1.4rem,3.5vw,2.5rem)] font-semibold text-overlay-inactive",
              isPast && "text-overlay-past"
            )}
          >
            {line ? (
              line.text ? (
                line.text
              ) : (
                <span className="inline-flex items-center gap-1.5 opacity-60">
                  <span className="w-1.5 h-1.5 rounded-full bg-overlay-active inline-block animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-overlay-active inline-block animate-pulse [animation-delay:200ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-overlay-active inline-block animate-pulse [animation-delay:400ms]" />
                </span>
              )
            ) : (
              <span className="opacity-0">&#8203;</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
