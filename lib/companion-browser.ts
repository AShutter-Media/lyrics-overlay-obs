/**
 * Cliente Companion solo para el navegador (deploy en Vercel).
 * Las peticiones van desde tu PC al YTMDA en localhost:9863.
 */

// Use localhost (same as Nutty's widget) so Companion CORS may allow cross-origin from deployed sites
const COMPANION_URL = "http://localhost:9863";
const API = `${COMPANION_URL}/api/v1`;
const STORAGE_KEY = "companion-token";

const APP = {
  appId: "lyrics-overlay-obs",
  appName: "Lyrics Overlay for OBS",
  appVersion: "1.0.0",
};

/** Same appId/appName as Nutty's widget so YTMDA Companion CORS allowlist may allow our origin */
const AUTH_APP = {
  appId: "nuttys-ytmdesktop-widget",
  appName: "nuttys YouTube Music Widget",
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

/** Pedir código de autorización (desde el navegador). En YTMDA suele aparecer el popup. Uses AUTH_APP so Companion CORS allowlist accepts cross-origin from deployed site. */
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
      const isLocal =
        typeof window !== "undefined" &&
        (window.location.origin.startsWith("http://localhost") ||
          window.location.origin.startsWith("http://127.0.0.1"));
      throw new Error(
        isLocal
          ? "YouTube Music Desktop rejected the request (403). Check Settings → Integrations: Companion Server, Allow browser communication, and Enable companion authorization must be ON."
          : "YouTube Music Desktop only allows connections from the same machine. Open the app locally (run 'npm run dev' and go to http://localhost:3000/configure), complete the steps there, then copy the OBS URL to use in OBS."
      );
    }
    throw new Error(body || `Companion returned ${res.status}`);
  }
  const data = await res.json().catch(() => ({}));
  const code = data?.code;
  if (!code) throw new Error("No code in response");
  return { code };
}

/** Intercambiar código por token (después de Allow en YTMDA). Uses AUTH_APP.appId so Companion accepts (same CORS as requestcode). */
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
