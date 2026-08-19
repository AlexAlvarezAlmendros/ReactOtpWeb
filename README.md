<div align="center">

# Other People Records

**El sello entero en una web: artistas, discografía, entradas con QR, tienda de beats con su licencia en PDF y las newsletters.**

[![En producción](https://img.shields.io/badge/en%20producci%C3%B3n-otherpeople.es-4dd4ac)](https://www.otherpeople.es/)
[![React + Vite](https://img.shields.io/badge/React-Vite-61dafb)](frontend/)
[![Express 5](https://img.shields.io/badge/Express-5%20%2B%20MongoDB-000000)](backend/)
[![Auth0](https://img.shields.io/badge/Auth0-JWT-eb5424)](backend/routes/)
[![Stripe](https://img.shields.io/badge/Stripe-pagos-635bff)](backend/controllers/)

[Qué hace](#qué-hace) ·
[Entradas](#entradas-que-se-generan-solas-y-se-validan-en-la-puerta) ·
[Licencias](#una-licencia-firmada-por-cada-beat-vendido) ·
[Arrancarlo](#arrancarlo)

</div>

---

Un sello discográfico pequeño acaba con la información repartida en seis sitios: los artistas en
Instagram, la discografía en Spotify, las entradas en una plataforma que se lleva su comisión, los
beats en un marketplace que se lleva otra, y la newsletter en una herramienta que cuesta al mes más
que lo que factura el sello.

Esto lo junta todo en una sola web, con su panel detrás.

## Qué hace

| | |
|---|---|
| **Artistas** | Fichas, releases y beats por artista, y una página de enlaces (`/links`) por artista para la bio de redes |
| **Discografía** | Sincronizada desde **Spotify**: `sync:discography` rellena el catálogo en vez de teclearlo |
| **Eventos** | Con venta de entradas, QR y validación en puerta |
| **Beats** | Tienda con reproductor, compra por Stripe y **licencia en PDF** emitida al momento |
| **Estudios** | Reserva de las salas del sello |
| **Newsletters** | Editor propio (`NewsletterBuilder`), envío con React Email y baja con un clic |
| **Contacto y booking** | Formularios de contacto y de contratación de artistas |
| **Plugins** | Página del **OPR-W1**, el plugin de audio del sello, con sus diagramas |

## Entradas que se generan solas, y se validan en la puerta

Al comprar, `ticketGenerator` emite un código legible **`TKT-XXXX-XXXX`**, un UUID interno y un
**QR**, y monta el PDF de la entrada con `pdfkit`. El comprador lo recibe por correo; en la puerta
se abre `/scanner`, se escanea y el ticket queda marcado.

El código legible existe para el caso real de las nueve de la noche: alguien llega con la batería
al 2 % y hay que encontrar su entrada a mano.

## Una licencia firmada por cada beat vendido

Vender un beat sin contrato es una discusión futura garantizada. `licenseService` emite, por cada
compra, una **licencia numerada `OTP-<año>-000123`** —correlativa por año natural— con su plantilla
(`LicenseTemplate`), el registro de lo emitido (`IssuedLicense`), un **hash del documento** y un QR
de verificación, todo en PDF.

El sello puede demostrar qué vendió, a quién y bajo qué condiciones, sin abrir una hoja de cálculo.

## Arrancarlo

```bash
npm install                  # workspaces: frontend + backend
npm run dev                  # front (Vite) y API (nodemon) a la vez
npm run dev:frontend         # solo la web
npm run dev:backend          # solo la API
npm test                     # Jest en los dos paquetes
```

El backend necesita en su `.env`: **MongoDB** (Mongoose), **Auth0** (`express-jwt` + `jwks-rsa`),
**Stripe**, **Cloudinary** (imágenes y audio), SMTP para `nodemailer` y credenciales de la API de
**Spotify**.

```bash
npm run migrate:tickets --workspace=backend     # añade entradas a los eventos existentes
npm run migrate:licenses --workspace=backend    # siembra las plantillas de licencia
npm run sync:discography --workspace=backend    # trae la discografía desde Spotify
```

## Cómo está montado

```
backend/     Express 5 — routes → controllers → services, modelos Mongoose
  models/    Artist · Release · Beat · Event · Ticket · Purchase · Studio
             LicenseTemplate · IssuedLicense · Newsletter · User · Contact · File
  services/  ticketGenerator · licenseService · spotifyService · discographySync
             emailService (React Email) · cronService
frontend/    React + Vite — una página por sección, hooks por recurso
  hooks/     useBeats, useBeatPurchase, useEvents, useArtists, useNewsletter…
  workers/   trabajo pesado fuera del hilo principal
```

Rate limiting con `express-rate-limit`, caché en memoria con `node-cache`, subidas por `multer`
directas a Cloudinary y `sharp` para las imágenes. El SEO va por página con `usePageMeta` y
`useJsonLd`.

## Estado

**En producción** en [otherpeople.es](https://www.otherpeople.es/), con el sello usándolo para
publicar, vender entradas y licenciar beats.

## Licencia

Sin fichero de licencia en el repositorio: es la web de un sello concreto, no una plantilla
reutilizable. Todos los derechos reservados.
