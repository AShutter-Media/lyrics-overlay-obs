"use client";

import { useState } from "react";
import {
  requestAuthCodeFromBrowser,
  exchangeCodeForTokenFromBrowser,
  setStoredToken,
  getStateFromBrowser,
  getStoredToken,
} from "@/lib/companion-browser";

type Step = "idle" | "requesting" | "show_code" | "exchanging" | "ok" | "error";

export default function ConfigurePage() {
  const [step, setStep] = useState<Step>("idle");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [trackName, setTrackName] = useState<string | null>(null);

  async function handleRequestCode() {
    setStep("requesting");
    setMessage("Pidiendo código al Companion…");

    try {
      let codeValue = "";
      const res = await fetch("/api/companion/auth-code", { method: "POST" });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        codeValue = data.code ?? "";
      } else {
        try {
          const out = await requestAuthCodeFromBrowser();
          codeValue = out.code;
        } catch {
          setStep("error");
          setMessage(data.error ?? "No se pudo conectar al Companion. ¿YTMDA está abierto?");
          return;
        }
      }
      setCode(codeValue);
      setStep("show_code");
      setMessage("");
    } catch {
      setStep("error");
      setMessage("Error de red al pedir el código.");
    }
  }

  async function handleExchangeToken() {
    if (!code.trim()) return;
    setStep("exchanging");
    setMessage("Intercambiando código por token…");

    try {
      const res = await fetch("/api/companion/auth-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setStep("ok");
        setCode("");
        setMessage("");
        try {
          const t = await fetch("/api/track").then((r) => r.json());
          if (t?.title) setTrackName(`${t.title} — ${t.artist}`);
        } catch {
          setTrackName(null);
        }
        return;
      }

      try {
        const out = await exchangeCodeForTokenFromBrowser(code.trim());
        setStoredToken(out.token);
        setStep("ok");
        setCode("");
        setMessage("");
        const token = getStoredToken();
        if (token) {
          const t = await getStateFromBrowser(token);
          if (t?.title) setTrackName(`${t.title} — ${t.artist}`);
        }
      } catch {
        setStep("show_code");
        setMessage("No se pudo obtener el token. ¿Has hecho clic en Allow en YTMDA?");
      }
    } catch {
      setStep("show_code");
      setMessage("Error de red al intercambiar el código.");
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6 flex flex-col items-center justify-center">
      <div className="max-w-lg w-full space-y-6">
        <h1 className="text-2xl font-bold text-white text-center">
          Lyrics Overlay — Conectar a YouTube Music Desktop
        </h1>

        <p className="text-gray-400 text-center text-sm">
          Este overlay usa la <strong>API oficial</strong> del Companion (igual que el widget de
          Nutty). Sigue estos dos pasos:
        </p>

        <div className="flex flex-col items-center gap-4">
          {step === "idle" && (
            <button
              type="button"
              onClick={handleRequestCode}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors"
            >
              Paso 1: Pedir código
            </button>
          )}

          {(step === "requesting" || step === "exchanging") && (
            <p className="text-gray-400 text-sm animate-pulse">{message}</p>
          )}

          {step === "show_code" && (
            <div className="w-full space-y-4">
              <p className="text-gray-300 text-sm text-center">
                En <strong>YouTube Music Desktop</strong> debería haberse abierto una ventana o
                notificación con un <strong>código</strong>. Debe coincidir con el de abajo.
              </p>
              <div className="p-4 rounded-lg bg-gray-800 border border-gray-700 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Código</p>
                <p className="text-2xl font-mono font-bold text-white tracking-widest">{code}</p>
              </div>
              <p className="text-gray-400 text-sm text-center">
                Haz clic en <strong>Allow</strong> (o Aceptar) en esa ventana de YTMDA.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => { setStep("idle"); setCode(""); setMessage(""); }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Volver
                </button>
                <button
                  type="button"
                  onClick={handleExchangeToken}
                  className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors"
                >
                  Paso 2: Ya hice clic en Allow
                </button>
              </div>
              {message && (
                <p className="text-amber-400 text-sm text-center">{message}</p>
              )}
            </div>
          )}

          {step === "ok" && (
            <div className="w-full p-4 rounded-lg bg-green-900/40 border border-green-700 text-green-300 text-sm">
              <p className="font-medium">Conectado correctamente.</p>
              {trackName && (
                <p className="mt-2 text-green-200/80">Ahora sonando: {trackName}</p>
              )}
              <p className="mt-3 text-gray-400">
                Overlay en OBS:{" "}
                <a
                  href="/overlay/lyrics"
                  className="text-red-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  http://localhost:3000/overlay/lyrics
                </a>
              </p>
            </div>
          )}

          {step === "error" && (
            <div className="w-full space-y-3">
              <div className="p-4 rounded-lg bg-red-900/40 border border-red-700 text-red-200 text-sm">
                {message}
              </div>
              <button
                type="button"
                onClick={() => { setStep("idle"); setMessage(""); }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Volver a intentar
              </button>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-gray-800 text-gray-500 text-xs space-y-2">
          <p>Requisitos en YouTube Music Desktop:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Settings → Integrations → Companion Server activado</li>
            <li>Allow browser communication: ON</li>
            <li>Enable companion authorization: ON (para que aparezca la ventana con el código)</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
