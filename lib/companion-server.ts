/**
 * Servidor: comunicación con YTMDA Companion usando la API oficial (puerto 9863, /api/v1/).
 * Requiere flujo de autorización: getAuthCode() → usuario hace Allow en YTMDA → getAuthToken(code).
 */

import { RestClient, Settings } from "ytmdesktop-ts-companion";
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

const COMPANION_PORT = 9863;
const COMPANION_HOST = "127.0.0.1";

const TOKEN_FILE = path.join(process.cwd(), ".companion-token");

const defaultSettings: Settings = {
  host: COMPANION_HOST,
  port: COMPANION_PORT,
  appId: "lyrics-overlay-obs",
  appName: "Lyrics Overlay for OBS",
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

function getRestClient(token?: string): RestClient {
  const settings: Settings = { ...defaultSettings };
  if (token) settings.token = token;
  return new RestClient(settings);
}

/** Obtener código para mostrar en YTMDA; al pedirlo, en la app suele aparecer el popup de autorización. */
export async function requestAuthCode(): Promise<{ code: string }> {
  const client = getRestClient();
  const out = await client.getAuthCode();
  return { code: out.code };
}

/** Intercambiar el código por un token (llamar después de que el usuario haga Allow en YTMDA). */
export async function exchangeCodeForToken(code: string): Promise<{ token: string }> {
  const client = getRestClient();
  const out = await client.getAuthToken(code);
  return { token: out.token };
}

export function saveToken(token: string): void {
  writeFileSync(TOKEN_FILE, token, "utf-8");
}

export function loadToken(): string | null {
  if (!existsSync(TOKEN_FILE)) return null;
  try {
    return readFileSync(TOKEN_FILE, "utf-8").trim() || null;
  } catch {
    return null;
  }
}

/** Estado actual de reproducción; requiere token guardado. */
export async function getCompanionState(token: string): Promise<TrackInfo> {
  const client = getRestClient(token);
  const state = await client.getState();

  const video = state.video ?? null;
  const player = state.player;

  return {
    title: video?.title ?? "Unknown Title",
    artist: video?.author ?? "Unknown Artist",
    album: video?.album ?? "",
    duration: video?.durationSeconds ?? 0,
    trackProgress: player?.videoProgress ?? 0,
    isPlaying: player?.trackState === 1, // 1 = PLAYING
    fetchedAt: Date.now(),
  };
}

