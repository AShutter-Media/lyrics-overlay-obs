# Lyrics Overlay for OBS

Overlay de letras para OBS Studio sincronizado con **YouTube Music Desktop App**. Muestra letras con o sin sync (plain) y se puede usar en local o desplegado en Vercel.

**Roadmap V2:** notas para la siguiente versión (más plataformas, refresco de arquitectura) → [`docs/V2-ROADMAP.md`](docs/V2-ROADMAP.md).

## Requisitos

- [YouTube Music Desktop App](https://github.com/ytmdesktop/ytmdesktop) con el **Companion Server** activado (Settings → Integrations).
- OBS Studio (Browser Source).

## Uso rápido (URL desplegada en Vercel)

1. Abre tu URL desplegada (ej. `https://tu-proyecto.vercel.app`).
2. Ve a **/configure**, haz clic en **Paso 1: Pedir código**.
3. En YouTube Music Desktop aparecerá un código; haz clic en **Allow**.
4. Vuelve a la página y haz clic en **Paso 2: Ya hice clic en Allow**.
5. En OBS: **Añadir** → **Navegador** → URL: `https://tu-proyecto.vercel.app/overlay/lyrics` → marcar **Fondo transparente**.

El token se guarda en el navegador (localStorage), así que solo necesitas configurar una vez por dispositivo/navegador.

## Uso en local (localhost)

```bash
pnpm install
pnpm dev
```

- Configurar: http://localhost:3000/configure  
- Overlay en OBS: http://localhost:3000/overlay/lyrics  

## Deploy en Vercel (con GitHub)

### 1. Subir el proyecto a GitHub

En la carpeta del proyecto:

```bash
git init
git add .
git commit -m "Initial commit: Lyrics Overlay for OBS"
```

Crea un repositorio nuevo en GitHub (por ejemplo `lyrics-overlay-obs`) y enlázalo:

```bash
git remote add origin https://github.com/TU_USUARIO/lyrics-overlay-obs.git
git branch -M main
git push -u origin main
```

### 2. Conectar con Vercel

1. Entra en [vercel.com](https://vercel.com) e inicia sesión (con GitHub si quieres).
2. **Add New** → **Project**.
3. Importa el repo **lyrics-overlay-obs** (o el nombre que hayas usado).
4. Deja **Framework Preset: Next.js** y **Build Command**: `pnpm build` (o el que Vercel detecte).
5. **Deploy**.

Cuando termine, tendrás una URL como `https://lyrics-overlay-obs.vercel.app`.

### 3. Usar la URL en OBS

- **Configurar (una vez):** `https://tu-url.vercel.app/configure`  
- **Overlay:** `https://tu-url.vercel.app/overlay/lyrics`  

En la Browser Source de OBS activa **Fondo transparente**.

## Rutas

| Ruta | Uso |
|------|-----|
| `/` | Página principal |
| `/configure` | Conectar con YouTube Music Desktop (código + Allow) |
| `/overlay/lyrics` | Overlay de letras para OBS |
| `/debug` | Estado de conexión y metadatos del tema |

## Notas

- Con **letras sincronizadas** se muestra la línea actual en una posición fija (tipo karaoke).
- Con **letras plain** (sin sync) se usa una ventana deslizante según el progreso de la canción.
- Si la app está desplegada en Vercel, el navegador se conecta directamente a tu YTMDA en `127.0.0.1:9863`; no hace falta levantar ningún servidor local.
