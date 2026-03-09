# Cómo probar el overlay de lyrics en OBS

## Antes de empezar

1. **YouTube Music Desktop App** debe estar abierta y con música lista (o reproduciendo).
2. **Companion Server** activado en YTMDA:
   - Settings → Integrations → Companion Server
   - Activar: Companion Server, Allow browser communication, Enable companion authorization (o haber autorizado ya este overlay)

## Paso 0: Autorizar este overlay (como con Nutty)

Para que el overlay pueda leer la canción actual, YouTube Music Desktop debe **autorizar** esta app (igual que con el widget de Nutty):

1. Abre en el navegador: **http://localhost:3000/configure**
2. Haz clic en **Conectar**.
3. Si en **YouTube Music Desktop** aparece un popup de autorización, haz clic en **Allow**.
4. Cuando veas "Conectado al Companion Server", ya está listo. Puedes cerrar la pestaña y usar el overlay.

---

## Paso 1: Instalar dependencias (solo la primera vez)

En la carpeta del proyecto:

```bash
pnpm install
```

---

## Paso 2: Arrancar el servidor del overlay

En la carpeta del proyecto:

```bash
pnpm dev
```

Espera a ver algo como: `Local: http://localhost:3000`

---

## Paso 3: Comprobar que todo va bien (opcional)

Abre en el navegador:

- **Debug:** http://localhost:3000/debug  
  Deberías ver "Connected to YouTube Music Desktop App" en verde y los datos del tema actual si hay uno sonando.

- **Overlay:** http://localhost:3000/overlay/lyrics  
  Deberías ver las letras (o "Waiting for YouTube Music..." si no hay conexión/track).

---

## Paso 4: Añadir el overlay en OBS

1. En OBS: **clic derecho** en Fuentes → **Añadir** → **Navegador** (Browser).
2. Pon un nombre (ej. "Lyrics Overlay") y Aceptar.
3. En **URL** escribe exactamente:
   ```
   http://localhost:3000/overlay/lyrics
   ```
4. **Importante:** marca **"Fondo transparente"** (o "Transparent background").
5. Ajusta Ancho/Alto si quieres (ej. 1920×1080 para full HD).
6. Aceptar.

Deberías ver las letras encima de tu escena. Si no ves nada, revisa que el servidor esté en marcha (`pnpm dev`) y que YTMDA tenga el Companion Server activo; luego mira `/debug` para confirmar conexión.

---

## Resumen de URLs

| Qué              | URL                              |
|------------------|-----------------------------------|
| Overlay (OBS)    | http://localhost:3000/overlay/lyrics |
| Debug (navegador)| http://localhost:3000/debug         |
