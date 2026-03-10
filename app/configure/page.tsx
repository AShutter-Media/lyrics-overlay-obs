"use client";

import { useState, useEffect } from "react";
import {
  requestAuthCodeFromBrowser,
  exchangeCodeForTokenFromBrowser,
  setStoredToken,
  getStateFromBrowser,
  getStoredToken,
} from "@/lib/companion-browser";

type Step = "idle" | "requesting" | "show_code" | "exchanging" | "ok" | "error";

/** Ensure we never display [object Object]; always show a string. */
function toErrorString(value: unknown, fallback: string): string {
  if (value == null) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "message" in value && typeof (value as { message: unknown }).message === "string")
    return (value as { message: string }).message;
  if (value instanceof Error) return value.message;
  return fallback;
}

export default function ConfigurePage() {
  const [step, setStep] = useState<Step>("idle");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [trackName, setTrackName] = useState<string | null>(null);
  const [connectedToken, setConnectedToken] = useState<string | null>(null);
  const [obsUrl, setObsUrl] = useState("");
  const [isDeployedOrigin, setIsDeployedOrigin] = useState(false);

  useEffect(() => {
    const o = typeof window !== "undefined" ? window.location.origin : "";
    setIsDeployedOrigin(!o.startsWith("http://localhost") && !o.startsWith("http://127.0.0.1"));
  }, []);

  useEffect(() => {
    if (connectedToken && typeof window !== "undefined") {
      setObsUrl(
        `${window.location.origin}/overlay/lyrics#token=${encodeURIComponent(connectedToken)}`
      );
    }
  }, [connectedToken]);

  async function handleRequestCode() {
    setStep("requesting");
    setMessage("Requesting code…");

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
        } catch (err) {
          setStep("error");
          const msg = toErrorString(err, "Could not connect to Companion. Is YTMDA open?");
          const isCorsOrNetwork =
            /fetch|Failed to fetch|access control|CORS|NetworkError|Load failed/i.test(msg);
          setMessage(
            isCorsOrNetwork
              ? "Turn ON «Enable companion authorization» in YouTube Music Desktop (Settings → Integrations — it appears below «Allow browser communication»). If already ON, turn Companion server off and on again, or restart YTMDA."
              : msg
          );
          return;
        }
      }
      setCode(codeValue);
      setStep("show_code");
      setMessage("");
    } catch (err) {
      setStep("error");
      setMessage(toErrorString(err, "Network error while requesting the code."));
    }
  }

  async function handleExchangeToken() {
    if (!code.trim()) return;
    setStep("exchanging");
    setMessage("Exchanging code for token…");

    try {
      const res = await fetch("/api/companion/auth-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const token = data.token ?? null;
        if (token) setStoredToken(token);
        setConnectedToken(token ?? null);
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
        setConnectedToken(out.token);
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
        setMessage("Could not get the token. Did you click Allow in YouTube Music Desktop?");
      }
    } catch (err) {
      setStep("show_code");
      setMessage(toErrorString(err, "Network error while exchanging the code."));
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6 flex flex-col items-center justify-center">
      <div className="max-w-xl w-full space-y-6">
        <h1 className="text-2xl font-bold text-white text-center">
          Karaoke / Lyrics for OBS
          <br />
          Connect to YouTube Music Desktop App
        </h1>

        <p className="text-gray-400 text-center text-sm">
          Real-time synchronized lyrics optimized for OBS & Live Streaming.
          <br />
          <span className="text-gray-500 text-xs">Created by ZUmbra, Trese & AShutter Media.</span>
        </p>
        {isDeployedOrigin && (
          <p className="text-amber-400/90 text-center text-xs max-w-md mx-auto">
            To connect from this page you need <strong>Enable companion authorization</strong> turned ON in YouTube Music Desktop (Settings → Integrations — it appears below &quot;Allow browser communication&quot;).
          </p>
        )}

        <div className="flex flex-col items-center gap-4">
          {step === "idle" && (
            <button
              type="button"
              onClick={handleRequestCode}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors"
            >
              Connect
            </button>
          )}

          {(step === "requesting" || step === "exchanging") && (
            <p className="text-gray-400 text-sm animate-pulse">{message}</p>
          )}

          {step === "show_code" && (
            <div className="w-full space-y-4">
              <p className="text-gray-300 text-sm text-center">
                A window or notification with a <strong>code</strong> should have opened in <strong>YouTube Music Desktop</strong>. It must match the one below.
              </p>
              <div className="p-4 rounded-lg bg-gray-800 border border-gray-700 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Code</p>
                <p className="text-2xl font-mono font-bold text-white tracking-widest">{code}</p>
              </div>
              <p className="text-gray-400 text-sm text-center">
                Click <strong>Allow</strong> (or Accept) in that YouTube Music Desktop window.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => { setStep("idle"); setCode(""); setMessage(""); }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleExchangeToken}
                  className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors"
                >
                  ALLOW
                </button>
              </div>
              {message && (
                <p className="text-amber-400 text-sm text-center">{message}</p>
              )}
            </div>
          )}

          {step === "ok" && (
            <div className="w-full p-4 rounded-lg bg-green-900/40 border border-green-700 text-green-300 text-sm space-y-3">
              <p className="font-medium">Connected successfully.</p>
              {trackName && (
                <p className="text-green-200/80">Now playing: {trackName}</p>
              )}
              {connectedToken && (
                <div className="pt-2 border-t border-green-700/50">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                    URL for OBS (use once)
                  </p>
                  <p className="text-gray-400 text-xs mb-2">
                    Paste this URL into an OBS Browser source. The first load will save the token; after that the overlay will work on its own.
                  </p>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      readOnly
                      value={obsUrl}
                      className="flex-1 min-w-0 px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (obsUrl) navigator.clipboard?.writeText(obsUrl);
                      }}
                      className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm whitespace-nowrap"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "error" && (
            <div className="w-full space-y-3">
              <div className="p-4 rounded-lg bg-red-900/40 border border-red-700 text-red-200 text-sm">
                {typeof message === "string" ? message : "An error occurred."}
              </div>
              <button
                type="button"
                onClick={() => { setStep("idle"); setMessage(""); }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Try again
              </button>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-gray-800 text-gray-400 text-sm space-y-3 max-w-xl">
          <p className="text-white font-medium">Setup in YouTube Music Desktop App</p>
          <p>
            Open the{" "}
            <a
              href="https://ytmdesktop.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 underline"
            >
              YouTube Music Desktop App
            </a>{" "}
            first. You don&apos;t need to sign in to your account, but we recommend it — especially if you have YouTube Premium (to avoid ads and use your recommended music, playlists, etc.).
          </p>
          <p>
            In the app, click <strong className="text-gray-300">Settings</strong>, then go to <strong className="text-gray-300">Integrations</strong> and turn on <strong className="text-gray-300">Companion server</strong>. Then turn on <strong className="text-gray-300">Allow browser communication</strong> and <strong className="text-gray-300">Enable companion authorization</strong>. Once that last one is on, you have <strong className="text-gray-300">5 minutes</strong> to come back to this page (/configure) and click the <strong className="text-gray-300">Connect</strong> button. If the 5 minutes run out, just go back to the YouTube Music app and turn <strong className="text-gray-300">Enable companion authorization</strong> on again — that will give you another 5 minutes to connect.
          </p>
          <p>
            If you followed all the steps correctly, you should see a <strong className="text-gray-300">code</strong>. Click the green <strong className="text-green-400">Allow</strong> button. A popup from <strong className="text-gray-300">YouTube Music Desktop App</strong> will appear saying &quot;<strong className="text-gray-300">Companion Authorization Request</strong>&quot; and showing the same code as in the browser (for security). Click <strong className="text-gray-300">Allow</strong> and you&apos;re done — you&apos;re connected. Copy the <strong className="text-gray-300">link</strong> that appears and paste it into a <strong className="text-gray-300">Browser source</strong> in <strong className="text-gray-300">OBS</strong> to add lyrics to your stream, or open that link in your browser for a dedicated lyrics tab. You can also open the link on your <strong className="text-gray-300">TV</strong> or share your screen for <strong className="text-gray-300">karaoke</strong> at a party or with friends!
          </p>
        </div>
      </div>
    </main>
  );
}
