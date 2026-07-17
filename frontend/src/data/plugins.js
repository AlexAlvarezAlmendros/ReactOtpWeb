// Catálogo estático de los plugins de audio publicados en la web.
// Las descargas apuntan a los instaladores publicados como releases del
// repo OPR-W1 (Windows: .exe · Linux: .sh).

// Enlace de donaciones de la sección de plugins (Stripe Payment Link).
export const DONATION_URL = 'https://donate.stripe.com/fZu00i9tT1hg0It9UcgUM00'

export const PLUGINS = [
  {
    id: 'opr-w1',
    name: 'OPR-W1',
    tagline: 'Ensanchador estéreo de dos bandas',
    version: 'v0.1.0',
    formats: 'VST3',
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
        url: 'https://github.com/AlexAlvarezAlmendros/OPR-W1/releases/download/plugin/OPR-W1-Setup.exe',
        available: true
      },
      {
        platform: 'Linux',
        icon: ['fab', 'linux'],
        url: 'https://github.com/AlexAlvarezAlmendros/OPR-W1/releases/download/OPR-W1/OPR-W1-Setup.sh',
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
