/**
 * Cliente Companion solo para el navegador (deploy en Vercel).
 * Las peticiones van desde tu PC al YTMDA en localhost:9863.
 */

// Use localhost (matches common Companion examples; CORS requires "Allow browser communication" in YTMDA)
const COMPANION_URL = "http://localhost:9863";
const API = `${COMPANION_URL}/api/v1`;
const STORAGE_KEY = "companion-token";

const APP = {
  appId: "lyrics-overlay-obs",
  appName: "Lyrics Overlay for OBS",
  appVersion: "1.0.0",
};

/** Companion app identity (shown in YTMDA authorized companions; must not collide with other widgets). */
const AUTH_APP = {
  appId: "trese-music-lyrics-widget",
  appName: "Treses Music Lyrics Widget",
  appVersion: "1.0.0",
};

export interface TrackInfo {
  title: string;
  artist: string;
  album: string;
  duration: number;
  trackProgress: number;
  isPlaying: boolean;
  fetchedAt: number;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getStoredToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function setStoredToken(token: string): void {
  if (isBrowser()) localStorage.setItem(STORAGE_KEY, token);
}

/** Pedir código de autorización (desde el navegador). En YTMDA suele aparecer el popup. */
export async function requestAuthCodeFromBrowser(): Promise<{ code: string }> {
  const res = await fetch(`${API}/auth/requestcode`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(AUTH_APP),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) {
    const body = await res.text();
    if (res.status === 403) {
      throw new Error(
        "Turn ON «Allow browser communication» in YouTube Music Desktop (Settings → Integrations, below Companion server). Then try again."
      );
    }
    throw new Error(body || `Companion returned ${res.status}`);
  }
  const data = await res.json().catch(() => ({}));
  const code = data?.code;
  if (!code) throw new Error("No code in response");
  return { code };
}

/** Intercambiar código por token (después de Allow en YTMDA). */
export async function exchangeCodeForTokenFromBrowser(code: string): Promise<{ token: string }> {
  const res = await fetch(`${API}/auth/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ appId: AUTH_APP.appId, code }),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return { token: data.token };
}

/** Obtener estado de reproducción desde el navegador (para overlay en Vercel). */
export async function getStateFromBrowser(token: string): Promise<TrackInfo | null> {
  try {
    const res = await fetch(`${API}/state`, {
      headers: { Authorization: token },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) {
      if (res.status === 429) void res.text(); // consume body to avoid rate-limit response issues
      return null;
    }
    const state = await res.json();
    const video = state.video ?? null;
    const player = state.player ?? {};
    return {
      title: video?.title ?? "Unknown Title",
      artist: video?.author ?? "Unknown Artist",
      album: video?.album ?? "",
      duration: video?.durationSeconds ?? 0,
      trackProgress: player?.videoProgress ?? 0,
      isPlaying: player?.trackState === 1,
      fetchedAt: Date.now(),
    };
  } catch {
    return null;
  }
}
