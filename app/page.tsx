import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center gap-8 p-8 font-sans">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-4xl font-bold text-white text-balance">
          Karaoke Lyrics Overlay
        </h1>
        <p className="text-gray-400 text-lg max-w-md text-balance">
          Real-time synchronized lyrics for OBS Studio, powered by YouTube Music
          Desktop App and LRCLIB.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 w-full max-w-sm">
        <Link
          href="/overlay/lyrics"
          className="w-full text-center rounded-xl bg-white text-gray-950 font-semibold py-4 px-6 text-lg hover:bg-gray-200 transition-colors"
        >
          Open Overlay
        </Link>
        <Link
          href="/debug"
          className="w-full text-center rounded-xl bg-gray-800 text-gray-100 font-semibold py-4 px-6 text-lg hover:bg-gray-700 transition-colors border border-gray-700"
        >
          Debug Panel
        </Link>
      </div>

      <div className="max-w-md w-full rounded-xl bg-gray-900 border border-gray-800 p-5 text-sm text-gray-400 flex flex-col gap-3">
        <h2 className="text-white font-semibold text-base">OBS Setup</h2>
        <ol className="list-decimal list-inside flex flex-col gap-2 leading-relaxed">
          <li>Start YouTube Music Desktop App with Companion Server enabled.</li>
          <li>Run this app locally: <code className="text-green-400">pnpm dev</code></li>
          <li>
            In OBS, add a{" "}
            <strong className="text-white">Browser Source</strong> and set the
            URL to{" "}
            <code className="text-green-400 break-all">
              http://localhost:3000/overlay/lyrics
            </code>
          </li>
          <li>
            Set the Browser Source dimensions to match your canvas (e.g.
            1920×1080).
          </li>
          <li>
            Enable{" "}
            <em className="text-gray-300">
              &quot;Shutdown source when not visible&quot;
            </em>{" "}
            for clean behavior.
          </li>
        </ol>
      </div>
    </main>
  );
}
