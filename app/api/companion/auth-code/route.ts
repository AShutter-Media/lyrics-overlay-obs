import { NextResponse } from "next/server";
import { requestAuthCode } from "@/lib/companion-server";

/**
 * Pide un código de autorización al Companion de YTMDA.
 * Al llamar esto, en YouTube Music Desktop suele aparecer el popup/card con el código y el botón Allow.
 */
export async function POST() {
  try {
    const { code } = await requestAuthCode();
    return NextResponse.json({ code });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const isConnection =
      message.includes("fetch") ||
      message.includes("ECONNREFUSED") ||
      message.includes("Failed to fetch");
    return NextResponse.json(
      {
        error: isConnection
          ? "No se pudo conectar al Companion. Comprueba que YouTube Music Desktop esté abierto y que en Ajustes > Integrations esté activado el Companion Server y «Allow browser communication»."
          : message,
      },
      { status: 503 }
    );
  }
}
