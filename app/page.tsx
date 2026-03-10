import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center gap-8 p-8 font-sans">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-4xl font-bold text-white text-balance">
          Karaoke / Lyrics for OBS
        </h1>
        <p className="text-gray-400 text-lg max-w-md text-balance">
          Real-time synchronized lyrics optimized for OBS & Live Streaming.
          <br />
          <span className="text-gray-500 text-sm">
            Created by ZUmbra, Trese & AShutter Media.
          </span>
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 w-full max-w-sm">
        <Link
          href="/configure"
          className="w-full text-center rounded-xl bg-red-600 text-white font-semibold py-4 px-6 text-lg hover:bg-red-500 transition-colors"
        >
          Connect to Youtube Music
        </Link>
        <Link
          href="/overlay/lyrics"
          className="w-full text-center rounded-xl bg-white text-gray-950 font-semibold py-4 px-6 text-lg hover:bg-gray-200 transition-colors"
        >
          Real-time Lyrics
        </Link>
        <Link
          href="#"
          className="w-full text-center rounded-xl bg-amber-600 text-white font-semibold py-4 px-6 text-lg hover:bg-amber-500 transition-colors"
        >
          Donate
        </Link>
        <Link
          href="/debug"
          className="w-full text-center rounded-xl bg-gray-800 text-gray-100 font-semibold py-4 px-6 text-lg hover:bg-gray-700 transition-colors border border-gray-700"
        >
          Debug Panel
        </Link>
      </div>

      <div className="max-w-xl w-full rounded-xl bg-gray-900 border border-gray-800 p-6 text-sm text-gray-400 flex flex-col gap-4">
        <h2 className="text-white font-semibold text-base">Instructions</h2>
        <ol className="list-decimal list-inside flex flex-col gap-4 leading-relaxed space-y-1">
          <li>
            Download and install the{" "}
            <a
              href="https://ytmdesktop.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 underline"
            >
              YouTube Music Desktop App
            </a>
            . Open it and go to <strong className="text-white">Settings</strong> →{" "}
            <strong className="text-white">Integrations</strong>: enable{" "}
            <strong className="text-gray-300">Companion Server</strong>,{" "}
            <strong className="text-gray-300">Allow browser communication</strong>, and{" "}
            <strong className="text-gray-300">Enable companion authorization</strong>.
          </li>
          <li>
            Once YouTube Music is set up, come back to this page and click{" "}
            <strong className="text-red-400">Connect to Youtube Music</strong>, then follow the steps shown on that page.
          </li>
          <li>
            After these two steps you should be able to see the lyrics of whatever you play on YouTube Music in real time. You can try it or use your browser for karaoke by clicking{" "}
            <strong className="text-white">Real-time Lyrics</strong>. The goal of this project is to use it as an overlay/widget for OBS: show lyrics on your live stream in a simple, clean, modern, and automated way — whether as a karaoke tool or just to share the lyrics of your favorite songs with your audience in real time.
          </li>
          <li>
            In OBS, paste the lyrics URL into a new <strong className="text-white">Browser</strong> source. That&apos;s it! You&apos;ll see the lyrics overlay with a transparent background in real time on your stream, synced with YouTube Music. When the next song starts or you pick another one, you and your audience can see the lyrics and — why not — sing along together.
          </li>
          <li>
            <strong className="text-gray-300">Tip:</strong> this overlay can be customized with CSS. If you&apos;re interested in making your own modifications, let us know via{" "}
            <span className="text-white">@zumbra.labs</span> and{" "}
            <span className="text-white">@ashuttermedia</span>. If you like the project, you can support us by donating with the Donate button above. Don&apos;t forget to visit{" "}
            <a
              href="https://zumbra.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 underline"
            >
              zumbra.xyz
            </a>{" "}
            and{" "}
            <a
              href="https://ashuttermedia.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 underline"
            >
              ashuttermedia.com
            </a>{" "}
            for more tools and apps.
          </li>
        </ol>
      </div>
    </main>
  );
}
