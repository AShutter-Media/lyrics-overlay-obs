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
          Donar
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
            Descarga e instala{" "}
            <a
              href="https://ytmdesktop.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 underline"
            >
              YouTube Music Desktop App
            </a>
            . Ábrela y ve a <strong className="text-white">Settings</strong> →{" "}
            <strong className="text-white">Integrations</strong>: activa{" "}
            <strong className="text-gray-300">Companion Server</strong>,{" "}
            <strong className="text-gray-300">Allow browser communication</strong> y{" "}
            <strong className="text-gray-300">Enable companion authorization</strong>.
          </li>
          <li>
            Una vez configurada la app de YouTube Music, vuelve a esta página y haz clic en{" "}
            <strong className="text-red-400">Connect to Youtube Music</strong>, luego sigue los pasos que se muestran en esa pantalla.
          </li>
          <li>
            Después de estos dos pasos ya deberías poder ver los lyrics de las canciones que reproduzcas en YouTube Music en tiempo real. Puedes comprobarlo o usar tu navegador para hacer karaoke haciendo clic en{" "}
            <strong className="text-white">Real-time Lyrics</strong>. La finalidad del proyecto es usarlo como overlay/widget para OBS: mostrar los lyrics en tu live stream de manera sencilla, limpia, moderna y automatizada — ya sea como herramienta de karaoke o para ver las letras de tus canciones favoritas junto a tu audiencia en tiempo real.
          </li>
          <li>
            En OBS, el enlace donde aparecen los lyrics debe pegarse en una nueva fuente de tipo <strong className="text-white">Browser</strong>. ¡Y listo! Verás el overlay de lyrics con fondo transparente y en tiempo real en tu stream, sincronizado con tu YouTube Music. Cuando empiece la siguiente canción o elijas otra, tú y tu audiencia podréis ver los lyrics y, por qué no, cantar juntos.
          </li>
          <li>
            <strong className="text-gray-300">Tip:</strong> este overlay se puede personalizar con CSS. Si te interesa hacer tus propias modificaciones, déjanos saber a través de{" "}
            <span className="text-white">@zumbra.labs</span> y{" "}
            <span className="text-white">@ashuttermedia</span>. Si te gusta el proyecto, puedes apoyarnos donando con el botón Donar de arriba. No olvides visitar{" "}
            <a
              href="https://zumbra.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 underline"
            >
              zumbra.xyz
            </a>{" "}
            y{" "}
            <a
              href="https://ashuttermedia.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 underline"
            >
              ashuttermedia.com
            </a>{" "}
            para más herramientas y apps.
          </li>
        </ol>
      </div>
    </main>
  );
}
