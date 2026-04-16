# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projects

Two projects live under `~/Documentos/GIT/`:

- **OtpWebBack** — Node.js/Express REST API (backend)
- **ReactOtpWeb** — React/Vite SPA (frontend)

Both are deployed on **Vercel**. The product is the website for **Other People Records**, a music label.

---

## OtpWebBack

### Commands

```bash
cd ~/Documentos/GIT/OtpWebBack
npm run dev          # Start with nodemon (development)
npm start            # Start with node (production)
npm test             # Run Jest tests
npm run test:license # Run license generation test script
npm run migrate:tickets   # Run tickets migration
npm run migrate:licenses  # Run license templates migration
```

### Architecture

Express 5 app deployed as a Vercel serverless function (exports `app` from `index.js`).

- **`index.js`** — Entry point: registers all routes under `/api/*`, sets up CORS (whitelist includes `otherpeople.es`), and handles Stripe webhooks **before** `express.json()` (raw body required).
- **`routes/`** — One file per resource, maps HTTP verbs to controllers.
- **`controllers/`** — Business logic per resource.
- **`models/`** — Mongoose schemas: `Artist`, `Beat`, `Contact`, `Event`, `File`, `IssuedLicense`, `LicenseTemplate`, `Newsletter`, `NewsletterSubscription`, `Purchase`, `Release`, `Studio`, `Ticket`, `User`.
- **`middleware/auth.js`** — Auth0 JWT validation via `express-jwt` + `jwks-rsa`. Exports: `checkJwt`, `optionalJwt`, `requireStaffOrAdmin`, `requireAdmin`. Roles are read from the custom Auth0 claim `https://otp-records.com/roles`.
- **`services/`** — `spotifyService.js` (Spotify API + 1h cache), `emailService.js` (Nodemailer/Gmail), `licenseService.js`, `ticketGenerator.js` (PDFKit + QR codes), `cronService.js`.

### Auth pattern

- GET endpoints: no auth or `optionalJwt`
- POST/PATCH/DELETE: `checkJwt` (authenticated user)
- Admin actions (ticket validation, sales stats): `requireStaffOrAdmin` or `requireAdmin`

### Required `.env` variables

`MONGO_URI`, `PORT`, `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

---

## ReactOtpWeb

### Commands

```bash
cd ~/Documentos/GIT/ReactOtpWeb
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # Production build
npm test             # Run Jest tests
npm run test:watch   # Jest in watch mode
npm run test:coverage # Jest with coverage report

# Run a single test file
npm test -- src/tests/MyComponent.test.jsx
```

### Architecture

React 19 + Vite SPA with React Router v7 (using `createBrowserRouter`).

- **`src/main.jsx`** — Root: wraps app in `Auth0Provider`, sets up `RouterProvider`. Auth config from `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, `VITE_AUTH0_AUDIENCE`. Uses `cacheLocation="localstorage"` and refresh tokens.
- **`src/layouts/RootLayout.jsx`** — Shared shell (Header, Footer, MobileNav) with `<Outlet />`.
- **`src/pages/`** — One file per route (Spanish names: `Artistas`, `Eventos`, `Discografia`, `Beats`, `Scanner`, etc.).
- **`src/components/`** — Feature components. Key ones: `SpotifyImport/`, `TicketPurchase/`, `BeatLicenseModal/`, `RichTextEditor/` (Tiptap), `FileUploader/`, `ImageUploader/`.
- **`src/contexts/`** — `AudioPlayerContext`, `ToastContext`, `MobileNavContext`.
- **`src/hooks/`** — Custom hooks (e.g., `useSpotifyImport.js`).
- **`src/utils/`** — Helpers (Spotify URL parsing, history, etc.).

### Styling

CSS Modules (`.module.css` co-located with components) + plain CSS files for pages.

### Testing

Jest + React Testing Library. Config in `jest.config.json`. Babel config in `babel.config.json`. CSS modules are mocked via `identity-obj-proxy`.

### Required `.env` variables

`VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, `VITE_AUTH0_AUDIENCE`, `VITE_AUTH0_REDIRECT_URI` (optional)
