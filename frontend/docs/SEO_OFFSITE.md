# SEO fuera de la web: guía paso a paso

> Complemento de `SEO_PLAN.md` (Fases 5, 6 y 7 y sección 5). Es lo que no se puede hacer con código:
> fichas, directorios, entidad, reseñas, prensa y medición. Todos los textos están listos para copiar.
>
> **Antes de nada, confirmar la dirección (NAP).** La web declara ahora el sello en Igualada y el estudio en
> la Masia Agullons (Sant Joan de Mediona). Si no es así, cámbialo primero en `index.html` (JSON-LD), el footer
> y `src/data/studioServices.js`, y usa la versión buena en todo lo de abajo.

## NAP: los datos que tienen que coincidir en todas partes

Copiar **exactamente igual** en Google, Apple, Bing, directorios y redes:

```
Other People Records
Masia Agullons, 08773 Sant Joan de Mediona (Barcelona)   ← estudio (ficha de Google)
Carrer de Dinamarca, 35, 08700 Igualada (Barcelona)       ← sello (domicilio social)
+34 625 029 056
https://www.otherpeople.es
```

Recomendado: pasar el correo público a uno del dominio (`hola@otherpeople.es`, `booking@otherpeople.es`)
y cambiarlo en `index.html`, el footer y `DiscograficaBarcelona.jsx`.

---

## Fase 5 — Local y marca

### 5.1 Google Business Profile (la ficha que ya existe)

- **Nombre:** Other People Records (sin palabras clave añadidas: Google penaliza el «keyword stuffing»).
- **Categoría principal:** Estudio de grabación.
- **Secundarias:** Productora musical · Compañía discográfica.
- **Dirección:** la del estudio. **Zona de servicio:** Anoia, Alt Penedès, Barcelona.
- **Web:** `https://www.otherpeople.es/estudio` (no la home: la ficha es del estudio).
- **Servicios** (con enlace a su página):
  Producción musical → `/estudio/produccion-musical` · Grabación de voces → `/estudio/grabacion` ·
  Mezcla y mastering → `/estudio/mezcla-y-mastering` · Beats a medida → `/estudio/beats-a-medida`.
- **Descripción** (≤ 750 caracteres):

  > Estudio de grabación y producción musical de trap y música urbana en la Masia Agullons, en Sant Joan de
  > Mediona, a una hora de Barcelona. Grabamos voces, producimos temas de principio a fin, hacemos beats a
  > medida y mezclamos y masterizamos, también online para artistas de toda España. Somos el estudio de Other
  > People Records, sello independiente que desde 2020 firma y desarrolla nuevos talentos de trap, rap,
  > drill, R&B y reggaetón. Trabajamos sin prisas, en un entorno natural, con presupuesto cerrado antes de
  > empezar.

- **Fotos:** sala, cabina, equipo, exterior de la masía, artistas grabando (con su permiso). Mínimo 10.
- **Publicaciones:** una por semana (lanzamiento nuevo, evento, beat de la semana, artículo de la revista).

### 5.2 Reseñas (de 1 a 25+)

1. En la ficha: *Pedir reseñas* → copiar el enlace corto.
2. Hacer un QR con `/herramientas/generador-qr` y ponerlo en el estudio.
3. Mensaje para cada cliente y artista al acabar la sesión:

   > ¡Gracias por venir al estudio! Si te ha gustado cómo ha quedado, nos ayudas muchísimo con una reseña
   > en Google: [enlace]. Son 30 segundos. 🙏

4. Responder a **todas**, con el nombre del servicio («gracias por confiar en nosotros para la mezcla de…»).

### 5.3 Directorios (mismo NAP)

| Directorio | Nota |
|---|---|
| Apple Business Connect | Para Apple Maps y Siri. |
| Bing Places | Se puede importar desde Google Business Profile. |
| Sortlist | Sale 4º en «productora discográfica Barcelona». Perfil de estudio de producción. |
| Páginas Amarillas | Categoría «Estudios de grabación». |
| Yelp | Categoría «Estudios de grabación». |
| Cylex / Hotfrog | Opcionales: enlaces de cita, poco peso. |

### 5.4 Entidad musical (separar la marca de «Other People» de Nicolas Jaar)

**Wikidata** (crear el elemento):
- *etiqueta:* Other People Records · *alias:* OTP Records · *descripción:* sello discográfico independiente
  español de música urbana.
- *es una instancia de* (P31): compañía discográfica (Q18127) · *país* (P17): España ·
  *ubicación de la sede* (P159): Igualada · *fecha de fundación* (P571): 2020 ·
  *género* (P136): trap, música urbana · *sitio web oficial* (P856): https://www.otherpeople.es ·
  *usuario de Instagram* (P2003): otherpeople.records · *canal de YouTube* (P2397): el ID del canal.

**MusicBrainz** (añadir sello): tipo *Original Production* · área *Igualada* · inicio *2020* · URLs: web,
Instagram, YouTube, Discogs. Después, asociar el sello a los lanzamientos.

**Discogs** (página del sello): perfil «Sello independiente de trap y música urbana de Igualada (Barcelona),
fundado en 2020», enlaces a la web y redes, y los lanzamientos del catálogo.

Cuando existan, añadir sus URLs al `sameAs` de la organización en `index.html`.

**Línea (P)/(C) de todos los lanzamientos:** `℗ 2026 Other People Records` (nunca «Other People» a secas).

### 5.5 Redes

Misma bio en Instagram, TikTok, YouTube, Threads, Spotify (playlists) y SoundCloud:

> Sello independiente de trap y música urbana · Estudio en Barcelona · Envía tu maqueta 👇
> otherpeople.es/enviar-maqueta

---

## Fase 6 — Autoridad y enlaces externos

### 6.1 Prensa por lanzamiento

Medios: HHGroups, Mondo Sonoro, Jenesaispop, Neo2, Rolling Stone en Español y medios locales (Anoia,
Penedès, Barcelona). Plantilla:

> **Asunto:** [Artista] estrena «[Tema]», producido en Other People Records
>
> Hola, [nombre]:
>
> [Artista], de [ciudad], publica el [fecha] «[Tema]», [una frase sobre el tema: estilo, colaboración,
> historia]. Lo ha producido [productor] en el estudio del sello, en la Masia Agullons.
>
> Escúchalo: [enlace privado de Spotify o SoundCloud]
> Ficha y créditos: https://www.otherpeople.es/discografia/[slug]
> Fotos y portada: [carpeta]
>
> Si os encaja, tenemos al artista disponible para entrevista.

Pedir siempre que el enlace apunte a la **ficha del lanzamiento o del artista**, no a la home.

### 6.2 Listas y directorios del sector

Buscar artículos tipo «discográficas independientes en España», «sellos de trap españoles» o «estudios
de grabación en Barcelona» y escribir al autor con una línea sobre el sello y el enlace a `/discografica`.

### 6.3 YouTube *type beats*

- Título: `[Artista de referencia] Type Beat — "[Título]" | [Estilo] [BPM] BPM`
- Descripción, en la primera línea: `Licencia este beat: https://www.otherpeople.es/beats/[slug]`
  y debajo `Más beats de [estilo]: https://www.otherpeople.es/beats/[estilo]`.

### 6.4 Plugins

Publicar OPR-W1 en KVR Audio (Developer → Add product) y en Plugins4Free, con enlace a
`https://www.otherpeople.es/plugins/opr-w1`.

### 6.5 Escuelas

Ofrecer una masterclass (producción de trap, mezcla de voces) a escuelas como SAE Barcelona o
escuelas de música de la Anoia y el Penedès, a cambio de enlace en su agenda o blog.

### 6.6 Eventos

Cada evento en Resident Advisor, Bandsintown, la agenda de la sala y las agendas locales, con enlace a
`https://www.otherpeople.es/eventos/[slug]`.

### 6.7 Roster

Mensaje para cada artista:

> Pon el enlace a tu ficha en tu web, tu Linktree y tu bio de Spotify:
> https://www.otherpeople.es/artistas/[slug] — así Google entiende que eres del sello y te ayuda a salir
> cuando busquen tu nombre.

**Nunca comprar enlaces.**

---

## Fase 7 — Búsqueda con IA

Ya está en la web: HTML prerenderizado para todos los bots, `llms.txt` y los bots de IA permitidos en
`robots.txt`. Lo que falta es fuera: que los mismos datos (fundación 2020, Igualada, servicios) aparezcan
igual en Wikidata, Discogs, MusicBrainz y las redes (ver 5.4 y 5.5).

---

## Medición

### Configuración (una vez)

1. **Search Console:** propiedad de dominio `otherpeople.es`. Enviar `https://www.otherpeople.es/sitemap.xml`
   (es un índice: Search Console verá cada sitemap hijo por separado).
2. **Bing Webmaster Tools:** importar desde Search Console. IndexNow ya avisa en cada alta o edición; Bing
   verifica la clave en `https://www.otherpeople.es/d48e5d37f374c357498fb3325989885b.txt`.
3. **Umami:** crear como objetivos los eventos `maqueta-enviada`, `reserva-estudio`, `estudio-presupuesto`,
   `booking-presupuesto`, `beat-checkout` y `entradas-checkout`.
4. **Rank tracker** con localización España para estas búsquedas:
   other people records · discográfica de trap · discográfica independiente música urbana · enviar maqueta
   discográfica · discográficas que buscan artistas · producción musical trap · productora musical
   Barcelona · estudio de grabación Igualada · estudio de grabación Penedès · mezcla y mastering online ·
   mastering trap · beats de trap · beats de reggaetón · detector de bpm online · detector de tonalidad.

### Revisión mensual

- Search Console → Páginas: la curva de «Indexadas» sube; los «Rastreada: sin indexar» bajan.
- Rendimiento con el filtro «la consulta no contiene "other people"»: búsquedas nuevas (ideas para la
  revista) y páginas con impresiones y CTR bajo (reescribir title y description).
- Umami: conversiones por canal.
- Reseñas nuevas y respondidas.
