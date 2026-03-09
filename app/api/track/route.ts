import { NextResponse } from "next/server";
import {
  loadToken,
  getCompanionState,
  type TrackInfo,
} from "@/lib/companion-server";

export type { TrackInfo };

export async function GET() {
  const token = loadToken();
  if (!token) {
    return NextResponse.json(
      {
        error:
          "No hay token de Companion. Abre http://localhost:3000/configure, haz clic en Conectar y luego en Allow en YouTube Music Desktop.",
        connected: false,
      },
      { status: 503 }
    );
  }

  try {
    const track: TrackInfo = await getCompanionState(token);
    return NextResponse.json(track);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        error:
          "Error al leer el estado. Comprueba que YTMDA esté abierto y que el Companion esté activo. Si sigue fallando, vuelve a /configure y autoriza de nuevo.",
        detail: message,
        connected: false,
      },
      { status: 503 }
    );
  }
}
