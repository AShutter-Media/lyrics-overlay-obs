/**
 * Utilidad para normalizar la respuesta del Companion Server de YTMDA
 * y para intentar conexión desde el navegador (necesario si el companion
 * solo acepta orígenes autorizados).
 */

export const COMPANION_PORTS = [9863, 26538];

export interface TrackInfo {
  title: string;
  artist: string;
  album: string;
  duration: number;
  trackProgress: number;
  isPlaying: boolean;
  fetchedAt: number;
}

export function normalizeCompanionData(data: unknown): TrackInfo {
  const d = data as Record<string, unknown> | null | undefined;
  return {
    title: (d?.track as { title?: string })?.title ?? (d?.title as string) ?? "Unknown Title",
    artist:
      (d?.track as { author?: string; artist?: string })?.author ??
      (d?.track as { artist?: string })?.artist ??
      (d?.artist as string) ??
      "Unknown Artist",
    album: (d?.track as { album?: string })?.album ?? (d?.album as string) ?? "",
    duration: Number((d?.track as { duration?: number })?.duration ?? d?.duration ?? 0),
    trackProgress: Number(
      (d?.player as { trackProgress?: number })?.trackProgress ??
        (d?.trackProgress as number) ??
        0
    ),
    isPlaying:
      (d?.player as { isPaused?: boolean })?.isPaused === false ||
      (d?.isPlaying as boolean) === true,
    fetchedAt: Date.now(),
  };
}

/**
 * Llamar solo desde el navegador. Prueba ambos puertos del Companion.
 * Si YTMDA pide autorización, aquí es cuando saldrá el popup.
 */
export async function fetchTrackFromBrowser(): Promise<{ port: number; track: TrackInfo } | null> {
  if (typeof window === "undefined") return null;

  for (const port of COMPANION_PORTS) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/query`, {
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      return { port, track: normalizeCompanionData(data) };
    } catch {
      continue;
    }
  }
  return null;
}
