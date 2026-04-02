# V2 — Notas para la siguiente versión (no implementado en V1)

**V1** queda cerrada tal cual está: YouTube Music Desktop + Companion + overlay en OBS/Vercel.

---

## Refresco rápido: cómo funciona hoy (V1)

1. **YouTube Music Desktop App (YTMDA)** corre en el PC con **Companion Server** (puerto 9863, API `/api/v1/`).
2. El usuario autoriza en **`/configure`**: código → Allow en YTMDA → token guardado (`localStorage` o servidor en local).
3. El overlay **`/overlay/lyrics`** consulta el estado de reproducción (vía API local en deploy, o `/api/track` en local con token en archivo).
4. Las letras vienen de **LRCLIB** usando artista/título/duración; sync si hay LRC, si no texto plano.
5. **OBS** usa una URL del overlay (idealmente con `#token=…` la primera vez en Browser Source).

La pieza “reproductor” está acoplada a **un solo origen**: el Companion de YTMDA.

---

## Siguiente paso principal para V2: más plataformas de streaming

**Objetivo:** además de YouTube Music, valorar **Spotify**, **Apple Music** y otros servicios para el mismo tipo de overlay de letras.

**Por qué no es un cambio pequeño:**

- Cada servicio tiene **modelo distinto**: OAuth + APIs remotas (Spotify), MusicKit / ecosistema Apple (Apple Music), o sin API pública útil.
- **No** hay un equivalente universal al Companion de YTMDA en `localhost` para todos.
- La parte **LRCLIB** puede reutilizarse si se obtienen bien **metadatos + tiempo de reproducción**; el trabajo está en **conectar cada fuente de audio**.

**Ideas de enfoque (para cuando se aborde V2):**

| Enfoque | Notas |
|--------|--------|
| **Spotify Web API** | OAuth, dashboard de app, Premium para “currently playing” en muchos casos. |
| **Apple Music** | MusicKit, programa de desarrollador, integración más cerrada. |
| **“Now playing” del SO** | Un solo canal para “lo que suene”, pero fiabilidad y apps variables. |

**Priorización sugerida (cuando toque):** documentar primero Spotify (API madura), luego Apple si hay demanda, luego otros según viabilidad.

---

## Otras mejoras posibles (lista viva)

- Añadir aquí cualquier idea que surja antes de V2 (UI, i18n, rate limits, etc.).
