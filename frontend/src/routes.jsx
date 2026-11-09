import RootLayout from './layouts/RootLayout.jsx'
import AnalyticsRoot from './layouts/AnalyticsRoot.jsx'

/**
 * Rutas de la web. Cada página se carga bajo demanda (`lazy`), así el bundle
 * inicial no arrastra las ~30 páginas ni las del panel de gestión.
 *
 * Lo comparten el cliente (main.jsx) y el prerender del build
 * (entry-server.jsx), para que el HTML estático y la SPA sean la misma app.
 *
 * Si añades una ruta pública, añádela también a las reescrituras de
 * vercel.json (si no, devolverá 404) y, si es indexable, a PRERENDER_ROUTES
 * en scripts/prerender.mjs y al sitemap (api/sitemap.js).
 */
const page = (load) => () => load().then((module) => ({ Component: module.default }))

export const routes = [
  {
    // Envoltorio de analítica: cubre toda la app, dentro y fuera de RootLayout
    Component: AnalyticsRoot,
    children: [
      { path: '/l/:slug', lazy: page(() => import('./pages/LinksPage.jsx')) },
      {
        Component: RootLayout,
        children: [
          { path: '/', lazy: page(() => import('./pages/Inicio.jsx')) },
          { path: '/artistas', lazy: page(() => import('./pages/Artistas.jsx')) },
          { path: '/artistas/:id', lazy: page(() => import('./pages/ArtistaDetalle.jsx')) },
          { path: '/contacto', lazy: page(() => import('./pages/Contacto.jsx')) },
          { path: '/estudios', lazy: page(() => import('./pages/Estudios.jsx')) },
          { path: '/discografica-barcelona', lazy: page(() => import('./pages/DiscograficaBarcelona.jsx')) },
          { path: '/booking-artistas', lazy: page(() => import('./pages/BookingArtistas.jsx')) },
          { path: '/eventos', lazy: page(() => import('./pages/Eventos.jsx')) },
          { path: '/eventos/:id', lazy: page(() => import('./pages/EventoDetalle.jsx')) },
          { path: '/discografia', lazy: page(() => import('./pages/Discografia.jsx')) },
          { path: '/discografia/:id', lazy: page(() => import('./pages/ReleaseDetalle.jsx')) },
          { path: '/beats', lazy: page(() => import('./pages/Beats.jsx')) },
          // Categorías antes que la ficha: /beats/trap no es un beat.
          ...['trap', 'hoodtrap', 'reggaeton', 'jerk', 'drill'].map(slug => ({
            path: `/beats/${slug}`,
            lazy: page(() => import('./pages/BeatsCategoria.jsx'))
          })),
          { path: '/beats/:id', lazy: page(() => import('./pages/BeatDetalle.jsx')) },
          { path: '/privacidad', lazy: page(() => import('./pages/Privacidad.jsx')) },
          { path: '/terminos', lazy: page(() => import('./pages/Terminos.jsx')) },
          { path: '/cookies', lazy: page(() => import('./pages/Cookies.jsx')) },
          { path: '/newsletters', lazy: page(() => import('./pages/Newsletters.jsx')) },
          { path: '/news/:slug', lazy: page(() => import('./pages/NewsletterViewer.jsx')) },
          { path: '/unsubscribe', lazy: page(() => import('./pages/Unsubscribe.jsx')) },
          { path: '/herramientas', lazy: page(() => import('./pages/Herramientas.jsx')) },
          { path: '/plugins', lazy: page(() => import('./pages/Plugins.jsx')) },
          { path: '/plugins/opr-w1', lazy: page(() => import('./pages/PluginOprW1.jsx')) },
          { path: '/ruralmafia', lazy: page(() => import('./pages/RuralMafia.jsx')) },

          // Privadas: siempre en su propio chunk, nunca en el inicial.
          { path: '/crear', lazy: page(() => import('./pages/Create.jsx')) },
          { path: '/ticket/:validationCode', lazy: page(() => import('./pages/TicketInfo.jsx')) },
          { path: '/scanner', lazy: page(() => import('./pages/Scanner.jsx')) },
          { path: '/admin/newsletter', lazy: page(() => import('./pages/NewsletterBuilder.jsx')) },
          { path: '/perfil', lazy: page(() => import('./pages/Perfil.jsx')) },

          { path: '*', lazy: page(() => import('./pages/NotFound.jsx')) }
        ]
      }
    ]
  }
]
