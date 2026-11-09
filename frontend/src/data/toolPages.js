/**
 * Una URL por herramienta (Fase 4.8 del plan SEO). El detector de BPM y el de
 * tonalidad son la misma herramienta (AudioAnalyzer) con dos páginas, porque
 * se buscan por separado.
 */
export const TOOL_PAGES = [
  {
    slug: 'detector-bpm',
    tool: 'audio-analyzer',
    name: 'Detector de BPM',
    title: 'Detector de BPM online gratis: saber el tempo de una canción',
    description: 'Detecta el BPM de cualquier canción o beat desde el navegador, gratis y sin subir el archivo a ningún servidor. Para productores, DJs y artistas de trap y música urbana.',
    h1: 'Detector de BPM online',
    intro: 'Arrastra un MP3 o WAV y en unos segundos tendrás el tempo en BPM. El análisis se hace en tu dispositivo: el archivo no sale de tu ordenador.',
    guide: [
      { h2: 'Para qué sirve saber el BPM', p: 'Para buscar beats que encajen con una voz ya grabada, preparar una sesión de DJ, hacer un remix o elegir samples al tempo correcto. En el trap el tempo suele estar entre 130 y 160 BPM (o la mitad, 65–80, según cómo se cuente) y en el reggaetón entre 88 y 100.' },
      { h2: 'Cómo detecta el tempo', p: 'La herramienta analiza los golpes de la percusión (los transitorios) y busca la periodicidad más estable. En temas con mucho swing o sin batería puede dar el doble o la mitad del tempo real: si ves 70 en un tema de trap, probablemente sean 140.' }
    ],
    faq: [
      { q: '¿Es gratis?', a: 'Sí, sin registro y sin límite de archivos.' },
      { q: '¿Se suben mis canciones a algún servidor?', a: 'No. El análisis se hace en tu navegador; el archivo nunca sale de tu dispositivo.' },
      { q: '¿Qué formatos acepta?', a: 'Los que reproduzca tu navegador: MP3, WAV, M4A, OGG y FLAC en la mayoría de los casos.' }
    ]
  },
  {
    slug: 'detector-tonalidad',
    tool: 'audio-analyzer',
    name: 'Detector de tonalidad',
    title: 'Detector de tonalidad online: saber la tonalidad de una canción',
    description: 'Averigua la tonalidad de una canción o un beat desde el navegador, con notación Camelot para mezclar en armonía. Gratis y sin subir el archivo a ningún servidor.',
    h1: 'Detector de tonalidad online',
    intro: 'Sube un MP3 o WAV y la herramienta te dice en qué tonalidad está (por ejemplo, La menor) y su código Camelot (8A), para que sepas qué escalas, samples o temas encajan con él.',
    guide: [
      { h2: 'Para qué sirve saber la tonalidad', p: 'Para escribir melodías y armonías que no choquen con el beat, afinar bien la voz, elegir samples compatibles o mezclar dos temas en una sesión sin que desafinen.' },
      { h2: 'Qué es la notación Camelot', p: 'Es una rueda que numera las tonalidades del 1 al 12, con A para las menores y B para las mayores. Dos temas con el mismo número, o con números vecinos, mezclan bien: 8A (La menor) encaja con 7A, 9A y 8B.' }
    ],
    faq: [
      { q: '¿Es fiable?', a: 'En beats con melodía y bajo claros acierta casi siempre. En temas muy percusivos o con cambios de tonalidad, tómalo como una orientación y compruébalo de oído.' },
      { q: '¿Detecta también el BPM?', a: 'Sí, el mismo análisis te da el tempo. Tienes la explicación en el detector de BPM.' },
      { q: '¿Se suben mis canciones a algún servidor?', a: 'No. Todo se procesa en tu navegador.' }
    ]
  },
  {
    slug: 'generador-qr',
    tool: 'qr-generator',
    name: 'Generador de QR',
    title: 'Generador de códigos QR gratis para músicos y artistas',
    description: 'Crea códigos QR gratis para tu lanzamiento, tu Linktree, tu perfil de Spotify o tus entradas, con colores y tamaño personalizados. Descárgalo al momento, sin registro.',
    h1: 'Generador de códigos QR para músicos',
    intro: 'Crea un QR que lleve a tu nuevo single, a tu página de enlaces o a la venta de entradas, con tus colores, y descárgalo para carteles, flyers o pantallas de concierto.',
    guide: [
      { h2: 'Ideas para usarlo', p: 'En el cartel de un concierto para la venta de entradas, en el merch para tu perfil de Spotify, en la pantalla del directo para tu nuevo tema o en la funda de un vinilo para el videoclip.' },
      { h2: 'Consejos para que se lea bien', p: 'Deja contraste entre el color del código y el fondo, no lo imprimas a menos de 2 × 2 cm y usa URLs cortas: cuantos menos caracteres, más simple y más fácil de leer es el código.' }
    ],
    faq: [
      { q: '¿Caduca el código QR?', a: 'No. El QR lleva la URL dentro, sin intermediarios: funcionará mientras funcione la página a la que apunta.' },
      { q: '¿Puedo usarlo en productos que vendo?', a: 'Sí, sin límites ni atribución.' }
    ]
  }
]

export const toolPagePath = (page) => `/herramientas/${page.slug}`
export const findToolPage = (slug) => TOOL_PAGES.find(p => p.slug === slug) || null
