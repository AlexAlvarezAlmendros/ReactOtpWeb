# Plan SEO nacional — Other People Records

> Objetivo: que otherpeople.es aparezca arriba en Google en toda España cuando alguien busque
> **trap / música urbana / underground**, una **discográfica joven para nuevos talentos**, o
> **estudio y servicios de producción** en esos géneros.
>
> Versión 2 · 2026-11-09. Incorpora los datos de Search Console (últimos 3 meses, 08/08–07/11/2026)
> y la auditoría externa de YAG Comunicación (07/11/2026). Estado del código: `main` en `aa0a5d7`.
>
> **Estado:** todo el código del plan (Fases 0 a 4 y 7) está en la rama `feat/seo-fase-0`
> (2026-11-09), sin desplegar. Lo que queda es contenido y trabajo fuera de la web: ver
> «Estado de ejecución» justo debajo y `docs/SEO_OFFSITE.md`.

---

## 0. Resumen en cinco líneas

1. **Hoy la web casi no existe para Google**: 9 clics y 341 impresiones en 3 meses, y las páginas
   indexadas han caído de **40 a 12**.
2. La causa principal **no es la falta de keywords**: los bots reciben páginas vacías (las estáticas)
   o plantillas de unas 50 palabras (78 beats, 12 artistas y 13 eventos). Google las rastrea y
   decide no indexarlas.
3. Ni siquiera la marca está asegurada: «other people records» sale de media en la **posición 7,8**,
   y Google muestra la URL antigua `http://otherpeople.es/` por culpa de una redirección temporal.
4. Por eso el orden es **parar la caída de indexación → HTML real para los bots → páginas por
   servicio → autoridad externa**. Sin los dos primeros pasos, el contenido nuevo tampoco se
   indexará.
5. Las búsquedas genéricas («trap», «música urbana») no son un objetivo realista. Las comerciales
   («discográfica de trap», «mezcla y mastering online», «enviar maqueta», «beats de drill») sí se
   pueden ganar en toda España, en un plazo de 6–12 meses.

---

## Estado de ejecución (2026-11-09)

| Fase | Código | Lo que falta (no es código) |
|---|---|---|
| 0 — Indexación | ✅ Hecho (ver «Estado de la Fase 0»). 308 de `otherpeople.es` a `www` puesto en Vercel (10-11-2026). Borradores de las 12 bios y las 78 descripciones de beats en `backend/migrations/data/seo-texts.json` | Revisar esos borradores y aplicarlos con `npm run migrate:textos`; exportar URLs de Search Console |
| 1 — Rendimiento | ✅ Lazy por rutas (chunk inicial 618 → 193 KB gzip), vídeo 34 MB → 1,9/4 MB, póster AVIF/WebP precargado, logo GIF 26 MB → WebP 2 MB, imágenes y fuentes optimizadas (`public/img` 36 → 5 MB) | Medir en pagespeed.web.dev tras desplegar. La tarjeta 3D de Contacto (Lanyard, en otra rama) sigue pendiente de Draco/meshopt |
| 2 — HTML para bots | ✅ Prerender en el build de 31 páginas (`scripts/prerender.mjs`); fichas con `api/og.js`. Comprobado en el despliegue de prueba de Vercel (PR #44): 31/31 en el build, cada página con su H1 y canonical, `/estudios` → `/estudio`, `og.js` con 404 reales y beats sin descripción en noindex | Repetir la comprobación con `curl` en producción |
| 3 — URLs y entidades | ✅ Slugs con 301, `/discografia/:slug`, categorías `/beats/:estilo`, ficha de artista ampliada, sitemap índice con imágenes, IndexNow, migas de pan, NAP en JSON-LD | `npm run migrate:slugs` en el backend (una vez); rellenar ciudad, año, prensa y vídeos de cada artista y créditos de cada lanzamiento |
| 4 — Contenido | ✅ Home, `/discografica`, `/nuevos-talentos`, `/enviar-maqueta` (con backend y bandeja en el panel), estudio por servicios, `/revista` (con editor y RSS), herramientas con URL propia, booking nacional | Revisar los textos; publicar 1 artículo por semana; abrir convocatorias (`src/data/convocatorias.js`) |
| 5 — Local y marca | — | Todo en `docs/SEO_OFFSITE.md`: ficha de Google, reseñas, directorios, Wikidata, MusicBrainz, Discogs |
| 6 — Enlaces | — | `docs/SEO_OFFSITE.md`: prensa, listas, YouTube, KVR, escuelas, eventos, roster |
| 7 — IA | ✅ `llms.txt`, bots de IA permitidos, HTML prerenderizado | Datos coherentes en Wikidata/Discogs (Fase 5) |
| Medición | ✅ Eventos de Umami: `maqueta-enviada`, `reserva-estudio`, `estudio-presupuesto`, `booking-presupuesto`, `beat-checkout`, `entradas-checkout` | Configurar Search Console, Bing Webmaster Tools y el rank tracker (`docs/SEO_OFFSITE.md`) |

**Despliegue, en este orden:**
1. Backend (modelos nuevos, slugs, maquetas, revista, IndexNow).
2. `npm run migrate:slugs -- --dry` y después `npm run migrate:slugs` contra la base de producción.
3. `npm run migrate:textos -- --dry` y después `npm run migrate:textos` (bios, descripciones de beats y etiquetas limpias; no pisa textos ya escritos).
4. Frontend.
5. Search Console: enviar `https://www.otherpeople.es/sitemap.xml` (la propiedad de dominio no tenía ningún sitemap enviado) e inspeccionar la home.

---

## 1. Punto de partida con datos reales

### 1.1 Search Console (web, últimos 3 meses)

| Métrica | Valor | Lectura |
|---|---|---|
| Clics / impresiones | **9 / 341** | Prácticamente sin tráfico orgánico. Es la línea base. |
| Páginas indexadas | **40 → 35 → 24 → 15 → 12** (14/08 → 22/09 → 05/10 → 24/10) | Google va descartando páginas: el sitio no supera su umbral de calidad. |
| Sin indexar | **45**: 36 «Rastreada: actualmente sin indexar», 6 «Soft 404», 3 «Página con redirección» | El primer motivo es de calidad: Google las rastrea y no las quiere. No es un problema de rastreo. |
| URLs en el sitemap | 119: 16 estáticas, **78 beats**, 13 eventos y 12 artistas | Dos tercios del sitemap son fichas de beat casi idénticas. |
| Marca «other people records» | 18 impresiones, **posición 7,8** | Hay que ser el nº 1 para la marca. Compite con «Other People», el sello de Nicolas Jaar. |
| `http://otherpeople.es/` | **165 impresiones**, posición 6,7 | Google muestra la URL vieja. `https://otherpeople.es/` → `www` es un **307 temporal**, así que Google no consolida. |
| `https://www.otherpeople.es/` | 107 impresiones, 8 clics | La URL buena recibe menos impresiones que la vieja. |
| «music production» | 115 impresiones, posición 6,8, 0 clics | Probablemente las mismas impresiones de la URL `http` (posición casi idéntica). Google asocia el dominio a producción musical. |
| «discográfica», «editorial musical», «estudios de música» | 1–6 impresiones, posiciones 4–7,5 | Volumen mínimo y casi seguro local (búsquedas cerca de Igualada). Es la semilla para posicionar el estudio. |
| Nombres de artistas y eventos (tropel nat, uri callejo, cutemobb, soulmates gava…) | Posiciones 30–90 | Las fichas existen para Google, pero están muy abajo. Con contenido propio, estas búsquedas de cola larga son asequibles. |
| Páginas con impresiones | `/estudios` (25, pos. 14,9), `/artistas` (28, pos. 40,9), `/eventos` (19, pos. 50) | `/estudios` es la página interna con mejor posición: es candidata a pilar. |
| Países / dispositivos | España 82 % · ordenador 75 % de las impresiones | El público es nacional y, de momento, busca más desde ordenador. |

### 1.2 Auditoría de YAG Comunicación: qué aprovechar y qué no

Es una pre-auditoría comercial hecha con comprobaciones automáticas y una sola búsqueda
(«Productora discográfica en Barcelona»).

**Puntos válidos que se incorporan al plan:**

- **«10 palabras» y «0 H1»** en la home: su herramienta leyó el HTML sin ejecutar JavaScript, que
  es lo mismo que ven Bing y los rastreadores de IA. Lo confirma un tercero y refuerza la Fase 2.
- **Cabeceras de seguridad**: verificado, solo se envía `strict-transport-security`. Faltan
  `content-security-policy`, `x-frame-options`, `x-content-type-options` y `referrer-policy`. No
  son factor de ranking, pero cuestan poco.
- **Google Business Profile**: existe una ficha con **1 reseña (5,0★)**. Para el SEO local es muy
  poco.
- **SERP de «productora discográfica en Barcelona»**: koalastudios.es, the-punch.com, bso.es,
  sortlist.es (un directorio), satelitek.com, goal-songs.com, LaFresca Productions (ficha de
  Maps), victorgarciamusic.es, jbproductions.es. Conclusión: **para esa búsqueda Google entiende
  «estudio/productor musical», no «sello»**. Hay que atacarla con la página de producción musical,
  no con la de discográfica. Satélite K es el competidor directo como sello.
- **llms.txt**: opcional y de impacto bajo. Se deja para el final.

**Puntos que no se sostienen o que hay que matizar:**

- **«Carpeta /.git/ expuesta» es un falso positivo.** `/.git/HEAD` y `/.git/config` devuelven el
  `index.html` de la SPA (5.709 bytes de HTML), no el repositorio. El escáner lo interpreta mal
  porque **cualquier URL devuelve 200**, el mismo fallo que provoca los «Soft 404» de Search
  Console. No se ha filtrado código ni credenciales, pero arreglar los 404 hará que estos avisos
  desaparezcan.
- **«Peso de la portada 1 KB» y «Velocidad 81/100»** solo miden el HTML, no el JS (2 MB) ni el
  vídeo (34 MB). El rendimiento real en móvil está por medir en pagespeed.web.dev.
- **El alcance es solo local («referencia del nicho en Igualada»)**: el objetivo aquí es nacional.
  Lo local es una pieza más, no la estrategia.
- **Maps para «Barcelona»**: desde Igualada o Sant Joan de Mediona no se va a entrar en el pack
  local de Barcelona ciudad, porque Google lo ordena por proximidad. El objetivo de Maps es
  Anoia/Penedès; Barcelona se trabaja en orgánico.
- **Trustpilot**: en este sector pesa poco. Google y, como mucho, las reseñas de artistas en la web.

---

## 2. Diagnóstico técnico (reordenado por impacto)

### 2.1 Causas de la caída de indexación — prioridad máxima

| # | Problema | Evidencia | Arreglo |
|---|---|---|---|
| **I1** | **Fichas de beat pobres y repetidas.** 78 URLs de unas 56 palabras con la misma plantilla y un title sin keyword («Come Back \| Other People Records»). | `curl -A Googlebot /beats/6a13f14d…`: 56 palabras, contando la navegación. | Fase 0.1 |
| **I2** | **Fichas de artista y evento pobres.** Artista: unas 54 palabras de plantilla. El modelo `Artist` no tiene biografía. | `curl -A Googlebot /artistas/687e5270…`. | Fases 0.2 y 3.2 |
| **I3** | **La descripción de los eventos sale como HTML escapado.** Google lee texto literal `&lt;p style=&quot;text-align: left;&quot;&gt;…` en el cuerpo, la meta description y el JSON-LD. | `api/og.js` hace `esc(description)` sobre el HTML de Tiptap; `EventoDetalle.jsx:24-41` mete el HTML crudo en `description`. | Fase 0.3 |
| **I4** | **Redirección temporal** `https://otherpeople.es/` → `www` (307). | Search Console: `http://otherpeople.es/` con 165 impresiones. `curl -I` → 307. | Fase 0.4 |
| **I5** | **Soft 404**: cualquier URL devuelve 200, incluidos beats borrados (el bot recibe 404, pero el navegador recibe 200 con «no encontrado»). | 6 «Soft 404» en Search Console. `/.git/HEAD` → 200. `/beats/6a9288c4…` tiene impresiones y ya da 404. | Fases 0.5 y 2.5 |
| **I6** | **Las páginas estáticas llegan vacías a los bots** (`<div id="root">`). | `curl -A Googlebot /estudios` → `<body>` vacío. YAG: «10 palabras, 0 H1». | Fase 2 |

### 2.2 Otros problemas técnicos

| # | Problema | Nota |
|---|---|---|
| T1 | `index.html` declara `canonical` = home en el HTML inicial de todas las rutas (el JS lo corrige después). | Search Console **no** muestra incidencias de «duplicada», así que hoy Google usa el canonical renderizado. Se arregla igualmente (1 línea) y desaparece del todo con SSR. |
| T2 | Renderizado por User-Agent (`vercel.json` → `api/og.js`): el bot recibe una página distinta de la del usuario. | Google lo desaconseja como solución permanente. Lo sustituye la Fase 2. |
| T3 | URLs con ObjectId (`/artistas/687cfc16…`). | Fase 3.1. |
| T4 | `/news/:slug` hereda el title y el canonical de la home. | `NewsletterViewer.jsx` no llama a `usePageMeta`. |
| T5 | Cabeceras de seguridad: 1 de 6. | Fase 0.7. |

### 2.3 Rendimiento (Core Web Vitals)

| # | Problema | Evidencia |
|---|---|---|
| P1 | Bundle principal de **2 MB** sin división por rutas (`main.jsx` importa ~30 páginas). | `dist/assets/index-*.js`. CSS de 271 KB. |
| P2 | Vídeo de portada de **34 MB** con `autoPlay`. | `public/video/hero1.mp4`. |
| P3 | Póster y `og:image` en PNG de 1,6–2 MB. | `public/img/hero/portada1.png`. |
| P4 | `public/img` pesa 41 MB, sin formatos modernos ni `srcset`. | |
| P5 | Tarjeta 3D de Contacto (en curso): chunk de 2,4 MB y `.glb` de 2,4 MB. | |

### 2.4 Contenido, marca y local

| # | Problema |
|---|---|
| C1 | Todo el posicionamiento dice «Barcelona»; no hay ninguna página nacional. |
| C2 | La home no tiene texto indexable (el bloque «quiénes somos» se quitó en `0cc4644`). |
| C3 | No hay página por lanzamiento, ni blog, ni páginas por servicio del estudio. |
| C4 | **NAP incoherente**: JSON-LD y footer dicen Igualada (Carrer de Dinamarca 35); `/estudios` dice Sant Joan de Mediona (Masia Agullons). Hay que cuadrarlo también con la ficha de Google. |
| C5 | Colisión de marca con «Other People» (Nicolas Jaar) y un «Other People Records» de Bandcamp. La marca sale en la posición 7,8. |
| C6 | Google Business Profile con 1 reseña. |
| C7 | Erratas: «deOther People Records» (`Discografia.jsx:16`), «Pulido de Volcales Pro», `toLocaleDateString('Milanes-ES')` (`Hero.jsx`). («Ales Agullons», en `/ruralmafia`, no es errata: es la cervecera.) |
| C8 | Favicon WebP con un `TODO`, sin `apple-touch-icon` ni manifest. Email de Gmail en el JSON-LD. La regex de `Contact` rechaza TLD de más de 3 letras (`backend/models/Contact.js:17`). |

---

## 3. Mapa de búsquedas → páginas

Hay que validar los volúmenes con Google Keyword Planner o Ahrefs/Semrush (España) antes de fijar
objetivos numéricos. Search Console aún no tiene datos suficientes.

| Cluster | Búsquedas objetivo | Intención | Página objetivo |
|---|---|---|---|
| **Marca** | other people records, otp records, other people discográfica | Navegacional | Home (nº 1 en 4–8 semanas) |
| **Sello / discográfica** | discográfica de música urbana, discográfica de trap, sello independiente España, discográficas independientes españolas | Comercial (artistas) | Home + `/discografica` (pilar nacional) |
| **Nuevos talentos** | discográfica para artistas nuevos, discográficas que buscan artistas, cómo entrar en una discográfica | Comercial e informativa | `/nuevos-talentos` + guías |
| **Maquetas** | enviar maqueta a discográfica, discográficas que aceptan maquetas | Transaccional | `/enviar-maqueta` (formulario) |
| **Producción musical** | productora musical, productor musical Barcelona, productor de trap, producción musical online, «music production» | Comercial | `/estudio/produccion-musical`. Es donde Google coloca la SERP de «productora discográfica Barcelona». |
| **Estudio (local)** | estudio de grabación Igualada / Anoia / Penedès, estudio de grabación trap/rap, grabar una canción precio | Local | `/estudio` (hub) + `/estudio/grabacion` + Google Business Profile |
| **Servicios online (nacional)** | mezcla y mastering online, mastering trap, mezcla de voces rap, beats a medida | Transaccional | `/estudio/mezcla-y-mastering`, `/estudio/beats-a-medida` |
| **Beats** | comprar beats trap, beats de drill, beats de reggaetón, instrumentales de rap, «type beat» | Transaccional | `/beats` + `/beats/trap`, `/beats/drill`, `/beats/reggaeton`… |
| **Escena / underground** | trap underground España, artistas underground españoles, nuevos raperos españoles, raperos Barcelona | Editorial | `/revista` + fichas de artista |
| **Cola larga de artistas** | nombres del roster, de colaboradores y de eventos (ya aparecen en Search Console en posiciones 30–90) | Navegacional | Fichas de artista, lanzamiento y evento con contenido real |
| **Booking** | contratar artista de trap, booking rap España | B2B | `/booking-artistas` (nacional) |
| **Herramientas** | detector de BPM online, saber la tonalidad de una canción, stereo widener gratis | Informativa | `/herramientas/detector-bpm`, `/herramientas/detector-tonalidad`, `/plugins/opr-w1` |

Reglas:

- **Una intención = una URL.** La home apunta a la marca y a «discográfica de música urbana»;
  `/discografica` desarrolla el cómo y el qué.
- `/discografica-barcelona` se queda como variante local y enlaza a la pilar nacional.
- `/estudios` → `/estudio` solo si se hace con 301 (ahora es la página interna mejor posicionada:
  no se toca sin redirección).
- **Nada de páginas por ciudad** («estudio de grabación en Madrid…») sin presencia real.

---

## 4. Fases de trabajo

Tamaños: **S** ≤ 1 día · **M** 2–4 días · **L** 1–2 semanas.

### Fase 0 — Parar la caída de indexación (semanas 1–2)

| Tarea | Detalle | Tamaño |
|---|---|---|
| **0.1 Beats: menos URLs y mejores** | (a) Title con keyword: «Come Back — Beat de reggaetón 93 BPM (prod. LilBru)». (b) Descripción propia por beat (campo `description` en `Beat`, 40–80 palabras: mood, referencias, para qué tipo de tema sirve), tags visibles, tabla de licencias con precio, preview de audio y beats relacionados. (c) **Mientras un beat no tenga descripción: `noindex` y fuera del sitemap.** Lo que tiene que posicionar son las categorías `/beats/:genero` (Fase 3.4). (d) Beats inactivos o borrados → 410 (o 301 a su categoría si tenían impresiones). | M |
| **0.2 Artistas: biografía mínima** | Campo `bio` en `Artist` (150–400 palabras escritas por el sello: de dónde es, estilo, lanzamientos clave, hitos) y que la ficha para bots la incluya. Sin bio, la ficha no compite. | S (código) + redacción |
| **0.3 Descripción de eventos** | En `api/og.js` y `EventoDetalle.jsx`: texto plano sin etiquetas (`stripHtml`) para la meta description y el JSON-LD, y HTML sanitizado (no escapado) en el cuerpo. Añadir sala, ciudad y artistas del cartel como texto. | S |
| **0.4 Redirección permanente** | `otherpeople.es` → `www.otherpeople.es` con **308** en el panel de dominios de Vercel. Después, en Search Console: inspeccionar `http://otherpeople.es/` y pedir la indexación de `https://www.otherpeople.es/`. | S |
| **0.5 404 reales (sin esperar al SSR)** | Hasta la Fase 2: en `vercel.json`, sustituir el catch-all `/(.*)` por la lista de rutas válidas y dejar que el resto caiga en un `404.html` estático con estado 404. Para fichas inexistentes, `og.js` ya devuelve 404 al bot; en el cliente, `noindex` (ya está en `NotFound`). | S |
| **0.6 Limpiar el sitemap** | Solo URLs indexables con contenido: estáticas, artistas con bio, eventos, beats con descripción y, después, categorías y lanzamientos. Quitar `priority`/`changefreq` (Google los ignora) y dejar `lastmod` real. Volver a enviarlo en Search Console. | S |
| **0.7 Cabeceras de seguridad** | En `vercel.json` → `headers`: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN`, `Permissions-Policy` (cámara solo para `/scanner`). CSP primero en modo `Report-Only`, con la lista de orígenes reales (Auth0, Stripe, Spotify, YouTube, Cloudinary, Umami, Vercel). | S |
| **0.8 Canonical estático y metadatos** | Quitar `<link rel="canonical">` y `og:url` de `index.html` (T1). `usePageMeta` en `NewsletterViewer` (T4). | S |
| **0.9 Títulos nacionales** | Home: «Discográfica independiente de trap y música urbana \| Other People Records». Artistas: «Artistas de trap, rap y drill — Roster del sello». Eventos: «Conciertos de trap y música urbana». Beats: «Comprar beats de trap, drill y reggaetón con licencia». Plugins: «Plugins VST3/AU gratis para productores». Barcelona solo donde haya intención local. | S |
| **0.10 NAP y marca** | Decidir la dirección (sección 7) y cuadrar JSON-LD, footer, `/estudios`, `geo.*` y Google Business Profile. Si sello y estudio están en sitios distintos, dos nodos (`Organization` y `RecordingStudio`, este con `geo`). Email del dominio (`hola@` / `booking@otherpeople.es`). | S |
| **0.11 Erratas y detalles** | C7 y C8: erratas, favicon completo (`favicon.ico`, PNG 48×48, `apple-touch-icon`, `site.webmanifest`), `og:image` de 1200×630 en JPG/WebP de menos de 300 KB, regex de email `\.\w{2,}`. | S |
| **0.12 Exportar las URLs afectadas** | En Search Console → Páginas, abrir «Soft 404» y «Rastreada: actualmente sin indexar» y exportar los ejemplos. Así se confirma qué tipo de página cae (se espera: beats y artistas). | S |

**Criterio de salida:** sitemap limpio y reenviado, el 308 activo y la marca en el top 3 en
Search Console. La curva de «Indexadas» deja de bajar en 4–6 semanas.

#### Estado de la Fase 0 (2026-11-09, rama `feat/seo-fase-0`, sin desplegar)

| Tarea | Estado |
|---|---|
| 0.1 Beats | **Código hecho.** Campo `description` en `Beat` y en el formulario (antes el formulario la copiaba a las licencias y el beat no la guardaba). Title «Come Back — Beat de hoodtrap y reggaeton 93 BPM (prod. LilBru)». Sin descripción: `noindex` (en la SPA y en `og.js`) y fuera del sitemap. Desactivado: 410. **Falta redactar las descripciones: hoy 0 de 78 la tienen**, así que al desplegar el sitemap se queda sin beats hasta que se escriban. |
| 0.2 Artistas | **Código hecho.** Campo `bio` en `Artist` y en el formulario (con contador de palabras), sección «Biografía» en la ficha y bio como meta description. La ficha para bots enlaza además los lanzamientos y los beats del artista: la de LilBru pasa de ~54 a ~300 palabras. **Faltan las 12 biografías.** |
| 0.3 Eventos | **Hecho.** Texto limpio en `og.js`, la meta description y el JSON-LD. Title con lugar y fecha («OTP! — Club P62, 17 de julio de 2026»), porque hay seis eventos llamados «OTP!». |
| 0.4 Redirección 308 | **Pendiente: es un ajuste del panel de Vercel** (Settings → Domains → `otherpeople.es` → Redirect to `www.otherpeople.es` → 308). |
| 0.5 404 reales | **Hecho.** `vercel.json` ya no tiene catch-all: lista las rutas de la SPA y el resto cae en `404.html` (copia de `index.html` generada en el build por `scripts/copy-404.mjs`): el usuario ve la página NotFound y el bot recibe un 404. `og.js` da 404 solo cuando la API dice que no existe y **503** si la API falla (antes, una caída de la API se veía como 404). |
| 0.6 Sitemap | **Hecho.** Sin `priority`/`changefreq` y sin beats no indexables. Falta reenviarlo en Search Console después de desplegar. |
| 0.7 Cabeceras | **Hecho.** `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy` (cámara solo para el propio sitio, para `/scanner`) y CSP en `Report-Only`. No tiene endpoint de informes: hay que revisar la consola del navegador en las páginas principales, la compra y el login antes de pasarla a obligatoria. |
| 0.8 Canonical y metadatos | **Hecho.** Sin `canonical` ni `og:url` estáticos en `index.html`. `NewsletterViewer` con `usePageMeta`. |
| 0.9 Títulos nacionales | **Hecho** en home, artistas, eventos, beats, plugins, booking, contacto, discografía y newsletters. `/estudios` y `/discografica-barcelona` siguen siendo locales a propósito. |
| 0.10 NAP | **Bloqueada** por la dirección (sección 7). Solo se ha añadido `knowsAbout` al JSON-LD de la organización. |
| 0.11 Erratas y detalles | **Hecho.** Erratas de C7, favicons PNG (48, 192, 512), `apple-touch-icon`, `site.webmanifest`, `og:image` de 1200×630 en JPG de 48 KB (antes, un PNG de 2 MB) y regex de email `\.\w{2,}` en `Contact`, `NewsletterSubscription` y `newsletterController`. Encontrado de paso: **editar un artista borraba su enlace de Apple Music y el de SoundCloud nunca se guardaba** (nombres de campo distintos); corregido. |
| 0.12 URLs afectadas | **Pendiente: exportarlas desde Search Console.** |

Verificación: 13 tests nuevos (`src/tests/botHtml.test.js`: estados HTTP, `noindex`, HTML limpio y
sitemap), suite del frontend 108/108 (las 3 suites de Spotify siguen sin cargar, como antes), backend
50/50, build correcto, rutas de `vercel.json` comprobadas con `path-to-regexp` 6 y `og.js` probado contra
la API de producción.

**Orden de despliegue:** primero el backend (si no, los campos `bio` y `description` se descartan al
guardar), después el frontend, y luego reenviar el sitemap y pedir la indexación de la home.

### Fase 1 — Rendimiento (semanas 2–4)

Objetivo: **LCP < 2,5 s, INP < 200 ms y CLS < 0,1 en móvil** (percentil 75). Antes de empezar,
tomar la línea base en pagespeed.web.dev (home, `/estudios`, `/beats` y una ficha).

| Tarea | Detalle | Tamaño |
|---|---|---|
| 1.1 División por rutas | `lazy` de React Router por página. Las rutas admin (`/crear`, `/admin/newsletter`, `/scanner`, `/perfil`) siempre aparte. Objetivo: chunk inicial < 300 KB gzip. | M |
| 1.2 Vídeo de portada | Recodificar a 720p H.264 + WebM/AV1 (2–4 MB), `preload="none"`, cargar el `<source>` cuando el navegador esté libre, y sin vídeo con `saveData` o conexiones lentas. | S |
| 1.3 Póster como LCP | AVIF/WebP de unos 100 KB + `<link rel="preload" as="image" fetchpriority="high">`. | S |
| 1.4 Imágenes | Script con `sharp` (o `vite-imagetools`): WebP/AVIF en varios anchos, `srcset`/`sizes`, `width`/`height` y `loading="lazy"` fuera del primer pantallazo. | M |
| 1.5 3D bajo demanda | Comprimir el `.glb` de Contacto con Draco/meshopt (`gltf-transform`) y montarlo solo al hacerse visible. | S |
| 1.6 Fuentes | Pasar las TTF a WOFF2 con `font-display: swap`. | S |

### Fase 2 — HTML real para todos los bots (semanas 3–7)

Resuelve I5, I6 y T2 de raíz y hace el sitio legible para Bing y los buscadores de IA.

**Recomendación: React Router v7 en *framework mode* con SSR en Vercel y caché en el CDN.**

> **Decisión tomada (2026-11-09): la alternativa de prerender.** El *framework mode* obliga a cambiar el
> preset de framework y la salida del proyecto en el panel de Vercel, y no se puede verificar sin
> desplegar. El prerender deja `dist/` estático y no toca el panel. Se prerenderizan las 31 páginas fijas
> con su contenido; las fichas siguen con `api/og.js`, que ya da el mismo contenido que ve el usuario.
> Los listados salen sin datos en el HTML estático: Google los ve completos al ejecutar el JavaScript.
> Si más adelante se quiere SSR completo, `routes.jsx` y `entry-server.jsx` ya son la base.

| Tarea | Detalle | Tamaño |
|---|---|---|
| 2.1 Migración | `createBrowserRouter` → `app/routes.ts` + `@react-router/dev` + `@vercel/react-router`. Las rutas públicas cargan sus datos con `loader`. | L |
| 2.2 Metadatos en el servidor | `export function meta()` por ruta (o los `<title>`/`<meta>`/`<link>` nativos de React 19). Title, H1, texto, canonical, OG y JSON-LD salen en el HTML. | M |
| 2.3 Solo cliente donde haga falta | `Auth0Provider`, `localStorage` y `window` (p. ej. `window.location.origin` en `main.jsx`) dentro de `ClientOnly`/`useEffect`. Las rutas privadas siguen siendo cliente puro con `noindex`. | M |
| 2.4 Caché | `Cache-Control: s-maxage=3600, stale-while-revalidate=86400`. Legales y herramientas prerenderizadas en el build. | S |
| 2.5 Estados HTTP correctos | El `loader` lanza 404/410 cuando la entidad no existe. Las URLs antiguas con id → 301 al slug. | S |
| 2.6 Retirar el dynamic rendering | Quitar los rewrites por User-Agent y dejar `api/og.js` solo si hace falta para alguna red social. | S |

*Alternativa con menos esfuerzo:* prerenderizar en el build las páginas estáticas de marketing y
mantener `api/og.js` para las fichas, con el mismo contenido que ve el usuario. Es más rápido,
pero deja dos renderizados que mantener.

### Fase 3 — URLs, datos y entidades (semanas 3–6, en paralelo)

| Tarea | Detalle | Tamaño |
|---|---|---|
| 3.1 Slugs | `slug` único en `Artist`, `Event`, `Beat` y `Release`, rellenado con un script. `/artistas/lilbru`, `/eventos/la-secta-sala-river-2026`, `/beats/come-back-reggaeton-93-bpm`. Las URLs con id → **301**. | M |
| 3.2 Fichas de artista completas | Además de `bio`: `city`/`province`, `genres[]`, `activeSince`, `pressQuotes[]` y `videos[]`. La ficha muestra lanzamientos, próximos eventos, beats y vídeos (`VideoObject`). JSON-LD `MusicGroup` con `genre`, `foundingLocation`, `album` y `sameAs`. | M |
| 3.3 Página por lanzamiento | `/discografia/:slug` con portada, embed, fecha, artistas y **créditos** (producción, mezcla, master), enlazados a los servicios del estudio cuando se hicieron en casa: hace de portfolio. JSON-LD `MusicAlbum`/`MusicRecording`. | M |
| 3.4 Categorías de beats | `/beats/:genero` con introducción propia, solo para géneros con ≥ 8 beats. Los filtros de BPM y tonalidad, como parámetros con canonical a la categoría. Estas páginas son las que deben posicionar por «beats de trap», no cada beat. | M |
| 3.5 Enlazado interno | Lanzamiento ↔ artista ↔ productor ↔ beats ↔ eventos. Migas de pan visibles. Footer con enlaces a las pilares. | S |
| 3.6 Sitemap por tipos | Índice de sitemaps (páginas, artistas, lanzamientos, eventos, categorías de beats, revista) con `<image:image>`. | S |
| 3.7 IndexNow | Aviso automático a Bing/Yandex al crear o editar contenido (Bing alimenta a varios buscadores con IA). | S |
| 3.8 Link-in-bio | `/l/:slug` recibe enlaces de Instagram/TikTok pero es `noindex`. O el enlace de la bio apunta a `/artistas/:slug`, o `/l/:slug` declara como canonical la ficha. | S |
| 3.9 Entidad de marca | `Organization` con `knowsAbout` (trap, rap, drill, música urbana), `founder`, `foundingDate`, `foundingLocation` y un `sameAs` completo (Instagram, YouTube, TikTok, Threads, Discogs, MusicBrainz, Wikidata). Escribir siempre «Other People Records» u «OTP Records», nunca «Other People» a secas. | S |

### Fase 4 — Contenido y funcionalidades (semanas 4–12)

Cada página con contenido **propio**: nada de plantillas cambiando una palabra.

#### 4.1 Home (S)
Jerarquía comercial sin perder la estética: el H1 visible sigue siendo la marca, y debajo una línea
de propuesta de valor («Sello independiente de trap y música urbana. Firmamos, producimos y movemos
nuevos talentos»). Después, una franja «Qué hacemos» con 4 tarjetas a las pilares (Discográfica ·
Nuevos talentos · Estudio y producción · Beats) y la prueba (artistas, streams, eventos). Unas
300–500 palabras repartidas entre bloques, no un muro de texto.

#### 4.2 Pilar `/discografica` (M)
Qué hace el sello por un artista, cómo es el contrato, casos reales del roster con cifras, proceso
de firma y FAQ. Enlaza a `/enviar-maqueta` y `/nuevos-talentos`.

#### 4.3 `/enviar-maqueta` — funcionalidad (M)
Formulario (nombre artístico, ciudad, géneros, enlaces, redes, mensaje y RGPD); modelo
`DemoSubmission` (o `Contact` con `type: 'demo'`); aviso al equipo, respuesta automática con los
plazos y vista en `/crear`. Contenido: qué buscamos, qué pasa después y plazos. Evento de
conversión en Umami.

#### 4.4 `/nuevos-talentos` + convocatorias (M)
Programa de desarrollo de artistas y **convocatorias trimestrales** con fecha límite y un showcase
final en un evento propio. Cada convocatoria es noticia: atrae enlaces de medios y escuelas.

#### 4.5 Estudio por servicios (L)
- `/estudio` (hub local): sala, equipo, ubicación, fotos reales, **tarifas**, reseñas y reserva.
- `/estudio/produccion-musical`: la búsqueda donde están Koala Studios, The Punch o BSO. Con
  portfolio (enlaces a `/discografia/:slug`), proceso y precio.
- `/estudio/grabacion`, `/estudio/mezcla-y-mastering` (**online, para toda España**: cómo enviar
  pistas, plazos, revisiones, precio por canción) y `/estudio/beats-a-medida`.
- Cada una con antes/después en audio, FAQ y JSON-LD `Service` con `offers`/`priceRange`.

#### 4.6 Revista `/revista` (L para montarla; después, constante)
Modelo `Post` con el editor Tiptap que ya existe, autor real (`Person`), categorías, RSS y JSON-LD
`Article`. **Un artículo por semana.** Ideas iniciales:
- *Guías para artistas:* cómo enviar una maqueta · qué mirar antes de firmar · cuánto cuesta
  grabar una canción · cómo distribuir en Spotify · registrar canciones · lease vs. exclusiva ·
  preparar pistas para mezcla · split sheets.
- *Escena:* artistas underground españoles a seguir · la escena de trap en Cataluña · crónicas de
  los eventos · entrevistas al roster.
- *Producción:* mezclar voces de trap · plugins gratis para música urbana (con OPR-W1) · sacar el
  BPM y la tonalidad de un sample (con la herramienta).

Nada de artículos genéricos escritos solo con IA: la ventaja es la experiencia real del sello.

#### 4.7 Booking nacional (S)
Ciudades y festivales donde ha tocado el roster, rider por artista, formatos y orientación de cachés.

#### 4.8 Herramientas como URLs propias (S)
`/herramientas/detector-bpm`, `/herramientas/detector-tonalidad` y `/herramientas/generador-qr`,
cada una con explicación y FAQ. Atraen enlaces del mismo público que compra beats.

> Las FAQ ya no dan resultado enriquecido en Google (desde 2023 solo para webs gubernamentales y de
> salud), pero siguen sirviendo como contenido y para la búsqueda con IA.

### Fase 5 — SEO local y marca (desde la semana 1, luego constante)

| Tarea | Detalle |
|---|---|
| 5.1 Google Business Profile | Revisar la ficha que ya existe: categoría principal «Estudio de grabación», secundarias «Productora musical» / «Compañía discográfica»; dirección igual a la de la web; servicios con precio, fotos reales y publicaciones semanales. Zona de servicio: Anoia, Penedès y Barcelona. |
| 5.2 Reseñas (de 1 a 25+) | Pedirla a cada cliente del estudio y a cada artista tras la sesión, con enlace directo y QR en el estudio. Responder a todas. |
| 5.3 Directorios con el mismo NAP | Apple Business Connect, Bing Places, Páginas Amarillas, Yelp y **Sortlist** (sale 4º en la SERP de «productora discográfica Barcelona»). |
| 5.4 Entidad musical | Discogs, MusicBrainz, Wikidata y el nombre exacto «Other People Records» en la línea (P)/(C) de todos los lanzamientos. Es lo que separa el sello del de Nicolas Jaar. |
| 5.5 Redes | El mismo nombre y la misma bio («sello de trap y música urbana») en todas, con enlace a la web. |

### Fase 6 — Autoridad y enlaces externos (desde el mes 2, constante)

Con 12 páginas indexadas y casi sin enlaces, la autoridad del dominio es mínima. Es la fase que
más pesa para las búsquedas comerciales nacionales.

| Táctica | Detalle |
|---|---|
| 6.1 Prensa musical | Nota de prensa por cada lanzamiento y convocatoria (candidatos: HHGroups, Mondo Sonoro, Jenesaispop, Neo2, Rolling Stone en Español). Pedir siempre el enlace a la ficha o al lanzamiento. |
| 6.2 Listas y directorios | Entrar en artículos tipo «discográficas independientes en España» y en directorios como Sortlist. |
| 6.3 YouTube *type beats* | Cada beat como vídeo «[Artista] Type Beat — [título]» con enlace a la categoría o al beat. |
| 6.4 Plugins | OPR-W1 en KVR Audio y en directorios de plugins gratis. |
| 6.5 Escuelas | Masterclasses en escuelas de producción (p. ej. SAE Barcelona). |
| 6.6 Eventos | Cada evento en agendas y ticketeras, con enlace a la ficha. |
| 6.7 Roster y colaboradores | Que cada artista enlace a su ficha desde su web, su Linktree o su bio de Spotify. |

Nada de comprar enlaces.

### Fase 7 — Búsqueda con IA (GEO)

- La Fase 2 hace que los bots de IA, que ya están permitidos, **puedan leer** el contenido.
- Frases citables en las pilares y los mismos datos (fundación, ciudad, servicios) en la web,
  Wikidata, Discogs y las redes.
- `llms.txt` al final, como complemento (lo pide la auditoría; su impacto es bajo).

---

## 5. Medición: línea base y objetivos

| KPI | Línea base (3 meses a 07/11/2026) | Objetivo a 3 meses | Objetivo a 6 meses |
|---|---|---|---|
| Páginas indexadas | 12 | ≥ 80 % de las URLs del sitemap limpio | ≥ 90 % |
| Posición media de la marca | 7,8 | ≤ 1,5 | 1 |
| Impresiones `http://otherpeople.es/` | 165 | ~0 (consolidadas en `www`) | 0 |
| Clics orgánicos (3 meses) | 9 | 60+ | 300+ |
| Impresiones sin marca (3 meses) | ~300 | ×5 | ×20 |
| Búsquedas objetivo en el top 10 | 0 (ninguna comercial) | 5 (locales y de cola larga) | 15 |
| Reseñas en Google | 1 (5,0★) | 10 | 25+ |
| Core Web Vitals móvil | por medir | 100 % «buenas» | 100 % |
| Conversiones (maquetas, reservas, beats, booking) | sin medir | Eventos de Umami activos | Definidos por canal |

Herramientas: Search Console (filtro «la consulta no contiene "other people"» para lo que no es
marca), Bing Webmaster Tools, un rank tracker con localización España, Speed Insights y Umami.
Revisión mensual: páginas que suben, búsquedas nuevas (salen ideas de artículos) y páginas con
impresiones y CTR bajo (reescribir title y description).

---

## 6. Calendario

| Semanas | Trabajo |
|---|---|
| 1–2 | **Fase 0 completa** · revisión de Google Business Profile · línea base de PageSpeed |
| 2–4 | Fase 1 (rendimiento) · biografías de artistas y descripciones de beats (redacción) |
| 3–6 | Fase 3 (slugs, lanzamientos, categorías de beats, sitemap por tipos) |
| 3–7 | Fase 2 (SSR) |
| 4–9 | Pilares: home, `/discografica`, `/enviar-maqueta`, `/nuevos-talentos`, servicios del estudio |
| 7–9 | `/revista` y los 4 primeros artículos |
| 9+ | 1 artículo por semana · convocatoria trimestral · prensa por lanzamiento · reseñas · informe mensual |

Plazos realistas: la marca y la indexación se recuperan en **4–8 semanas**; lo local y la cola
larga en **2–4 meses**; las búsquedas comerciales nacionales, en **6–12 meses**, y dependen sobre
todo de la Fase 6.

---

## 7. Decisiones pendientes y datos que faltan

Para no bloquear el código se han tomado estas decisiones por defecto. Todas son reversibles:

1. **Dirección:** sello en Igualada (Carrer de Dinamarca 35) y estudio en la Masia Agullons (Sant Joan
   de Mediona), que es lo que ya decía la web en el footer y en `/estudios`. **Confirmar** y cuadrar la
   ficha de Google con la del estudio.
2. **Quién redacta** las biografías de artistas y las descripciones de beats (Fase 0.1–0.2). Es
   trabajo de contenido, no de código, y es el que desbloquea la indexación. **Sigue pendiente.**
3. **Tarifas del estudio:** no se publican; las páginas hablan de «presupuesto cerrado antes de
   empezar». Para publicarlas: campo `price` en `src/data/studioServices.js`.
4. **Maquetas:** abiertas todo el año por `/enviar-maqueta` y, además, convocatorias puntuales
   (`src/data/convocatorias.js`, vacío hasta que se abra una).
5. **SSR:** prerender en el build (ver Fase 2). **Mezcla y mastering online para toda España:** las
   páginas lo ofrecen; confirmar que es un servicio real.
6. **Faltan de Search Console**: las URLs concretas de «Soft 404» y «Rastreada: actualmente sin
   indexar» (tarea 0.12) y el cruce consulta × página de «music production».
7. **YAG**: este plan cubre lo que proponen en su hoja de ruta de 90 días y va más allá en lo
   técnico. Si se contrata a alguien, encaja mejor para las Fases 5 y 6 (local, reseñas, prensa y
   enlaces) que para el desarrollo.
