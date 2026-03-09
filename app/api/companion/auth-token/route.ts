import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, saveToken } from "@/lib/companion-server";

/**
 * Intercambia el código por un token y lo guarda. Llamar después de que el usuario haga Allow en YTMDA.
 */
export async function POST(request: NextRequest) {
  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 });
  }
  const code = body?.code?.trim();
  if (!code) {
    return NextResponse.json({ error: "Falta el campo 'code'" }, { status: 400 });
  }
  try {
    const { token } = await exchangeCodeForToken(code);
    saveToken(token);
    return NextResponse.json({ ok: true, token });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        error:
          "No se pudo obtener el token. Asegúrate de haber hecho clic en Allow en YouTube Music Desktop y vuelve a intentar.",
        detail: message,
      },
      { status: 400 }
    );
  }
}
