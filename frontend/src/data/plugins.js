// Catálogo estático de los plugins de audio publicados en la web.
// Las URLs de descarga apuntan a los assets de la release "latest" de GitHub:
// publicar una release con assets llamados `opr-w1-windows.zip` y
// `opr-w1-linux.zip` activa los enlaces sin tocar el código.
export const PLUGINS_REPO_URL = 'https://github.com/AlexAlvarezAlmendros/plugins'

// Enlace de donaciones de la sección de plugins. Cambiar por el handle
// real de PayPal (o Ko-fi/Stripe) cuando exista la cuenta.
export const DONATION_URL = 'https://paypal.me/otherpeoplerecords'

export const PLUGINS = [
  {
    id: 'opr-w1',
    name: 'OPR-W1',
    tagline: 'Ensanchador estéreo de dos bandas',
    version: 'v0.1.0',
    formats: 'VST3 · AU',
    image: '/img/plugins/opr-w1.webp',
    detailPath: '/plugins/opr-w1',
    description:
      'Controla cuánto se abre el sonido entre los altavoces: por debajo del 100 % ' +
      'lo concentra en el centro y por encima lo despega hacia los lados. Parte la ' +
      'señal en dos bandas con su propio ancho cada una — graves sólidos y centrados, ' +
      'agudos con aire — y al 100 % la señal pasa intacta, sin colorear nada.',
    downloads: [
      {
        platform: 'Windows',
        icon: ['fab', 'windows'],
        url: `${PLUGINS_REPO_URL}/releases/latest/download/opr-w1-windows.zip`,
        available: true
      },
      {
        platform: 'Linux',
        icon: ['fab', 'linux'],
        url: `${PLUGINS_REPO_URL}/releases/latest/download/opr-w1-linux.zip`,
        available: true
      },
      {
        platform: 'macOS',
        icon: ['fab', 'apple'],
        url: null,
        available: false,
        note: 'Próximamente'
      }
    ]
  }
]
