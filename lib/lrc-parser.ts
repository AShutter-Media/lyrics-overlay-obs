export interface LyricLine {
  time: number; // seconds
  text: string;
}

/**
 * Parses a raw LRC string into an array of timed lyric lines.
 * Handles [MM:SS.xx], [MM:SS.xxx], and [MM:SS] formats.
 * Lines are returned sorted by time.
 */
export function parseLrc(lrc: string): LyricLine[] {
  const lines: LyricLine[] = [];
  const lineRegex = /^\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]\s*(.*)$/;

  for (const raw of lrc.split("\n")) {
    const match = raw.trim().match(lineRegex);
    if (!match) continue;

    const minutes = parseInt(match[1], 10);
    const seconds = parseInt(match[2], 10);
    const fracStr = match[3] ?? "0";
    const frac = parseInt(fracStr.padEnd(3, "0"), 10) / 1000; // normalize to seconds
    const totalSeconds = minutes * 60 + seconds + frac;
    const text = match[4].trim();

    lines.push({ time: totalSeconds, text });
  }

  return lines.sort((a, b) => a.time - b.time);
}

/**
 * Given a list of lyric lines and a current playback position (seconds),
 * returns the index of the currently active line.
 * Returns -1 if the song hasn't started yet.
 */
export function getActiveLyricIndex(lines: LyricLine[], currentTime: number): number {
  if (!lines.length) return -1;

  let activeIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].time <= currentTime) {
      activeIndex = i;
    } else {
      break;
    }
  }

  return activeIndex;
}

/**
 * Returns how many seconds until the next lyric line.
 * Useful for scheduling updates.
 */
export function getTimeUntilNextLine(lines: LyricLine[], currentTime: number): number {
  for (const line of lines) {
    if (line.time > currentTime) {
      return line.time - currentTime;
    }
  }
  return Infinity;
}

/**
 * Builds a stable cache key from track metadata.
 */
export function buildTrackKey(artist: string, title: string): string {
  return `${artist.toLowerCase().trim()}::${title.toLowerCase().trim()}`;
}
