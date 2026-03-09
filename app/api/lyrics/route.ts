import { NextRequest, NextResponse } from "next/server";

const LRCLIB_BASE = "https://lrclib.net/api";

export interface LyricLine {
  time: number; // seconds
  text: string;
}

export interface LyricsResponse {
  lines: LyricLine[];
  trackName: string;
  artistName: string;
  synced: boolean;
}

// Simple in-memory cache (per-process, resets on restart)
const lyricsCache = new Map<string, LyricsResponse>();

function buildCacheKey(artist: string, title: string, album: string): string {
  return `${artist.toLowerCase()}::${title.toLowerCase()}::${album.toLowerCase()}`;
}

function parseLrc(lrc: string): LyricLine[] {
  const lines: LyricLine[] = [];
  const lineRegex = /^\[(\d{2}):(\d{2})\.(\d{2,3})\]\s*(.*)$/;

  for (const raw of lrc.split("\n")) {
    const match = raw.trim().match(lineRegex);
    if (!match) continue;

    const minutes = parseInt(match[1], 10);
    const seconds = parseInt(match[2], 10);
    const centisStr = match[3];
    const centis = parseInt(centisStr.padEnd(3, "0"), 10); // normalize to ms
    const totalSeconds = minutes * 60 + seconds + centis / 1000;
    const text = match[4].trim();

    // Skip empty lines that serve as gaps / instrumental markers
    lines.push({ time: totalSeconds, text });
  }

  return lines.sort((a, b) => a.time - b.time);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const artist = searchParams.get("artist") ?? "";
  const title = searchParams.get("title") ?? "";
  const album = searchParams.get("album") ?? "";
  const duration = searchParams.get("duration") ?? "";

  if (!artist || !title) {
    return NextResponse.json({ error: "Missing artist or title" }, { status: 400 });
  }

  const cacheKey = buildCacheKey(artist, title, album);
  if (lyricsCache.has(cacheKey)) {
    return NextResponse.json(lyricsCache.get(cacheKey));
  }

  try {
    const params = new URLSearchParams({
      artist_name: artist,
      track_name: title,
      ...(album && { album_name: album }),
      ...(duration && { duration }),
    });

    const lrclibUrl = `${LRCLIB_BASE}/get?${params.toString()}`;
    const response = await fetch(lrclibUrl, {
      signal: AbortSignal.timeout(5000),
      headers: {
        "User-Agent": "KaraokeOverlay/1.0 (https://github.com/yourname/karaoke-overlay)",
      },
    });

    if (response.status === 404) {
      const fallback: LyricsResponse = {
        lines: [],
        trackName: title,
        artistName: artist,
        synced: false,
      };
      lyricsCache.set(cacheKey, fallback);
      return NextResponse.json(fallback);
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `LRCLIB returned status ${response.status}` },
        { status: 502 }
      );
    }

    const data = await response.json();

    let lines: LyricLine[] = [];
    let synced = false;

    if (data.syncedLyrics) {
      lines = parseLrc(data.syncedLyrics);
      synced = true;
    } else if (data.plainLyrics) {
      // Fallback: plain lyrics without timing
      lines = data.plainLyrics
        .split("\n")
        .filter((l: string) => l.trim().length > 0)
        .map((text: string) => ({ time: 0, text }));
      synced = false;
    }

    const result: LyricsResponse = {
      lines,
      trackName: data.trackName ?? title,
      artistName: data.artistName ?? artist,
      synced,
    };

    lyricsCache.set(cacheKey, result);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch lyrics: ${message}` },
      { status: 500 }
    );
  }
}
