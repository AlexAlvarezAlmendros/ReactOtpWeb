/**
 * Servicios del estudio: una URL por intención de búsqueda (Fase 4.5 del plan
 * SEO). Lo usan las páginas /estudio/*, el hub /estudio y los créditos de los
 * lanzamientos (un crédito hecho en casa enlaza al servicio: hace de
 * portfolio).
 *
 * Sin precios: el estudio trabaja con presupuesto cerrado por proyecto. Si
 * se deciden publicar tarifas, añádelas aquí (campo `price`) y al JSON-LD.
 */
export const STUDIO_LOCATION = {
  name: 'Masia Agullons',
  town: 'Sant Joan de Mediona',
  province: 'Barcelona',
  mapsUrl: 'https://www.google.com/maps/place/Masia+Agullons/@41.4786912,1.5878298,827m/data=!3m2!1e3!4b1!4m6!3m5!1s0x12a46c2fa4d3840d:0x2f99fa16b0f0a188!8m2!3d41.4786872!4d1.5904047!16s%2Fg%2F11ckqr7mm9'
}

export const STUDIO_SERVICES = [
  {
    slug: 'produccion-musical',
    name: 'Producción musical',
    short: 'Del boceto al tema terminado: beat, arreglos, dirección de voces y sonido final.',
    creditRoles: ['Producción', 'Composición'],
    serviceType: 'Producción musical',
    online: true,
    title: 'Producción musical de trap y música urbana',
    description: 'Producción musical de trap, rap, drill, R&B y reggaetón: beat a medida, arreglos, dirección de voces, mezcla y mastering. En nuestro estudio cerca de Barcelona u online desde toda España.',
    h1: 'Producción musical de trap y música urbana',
    lead: 'Producimos temas de trap, rap, drill, R&B, reggaetón y jerk de principio a fin: partimos de tu idea o de tu maqueta y la convertimos en un tema listo para publicar, con el sonido de la escena urbana actual.',
    sections: [
      {
        h2: 'Qué incluye la producción',
        list: [
          ['Instrumental a medida', 'Un beat hecho para tu tema, no uno de catálogo, con la estructura que pide la canción.'],
          ['Arreglos y estructura', 'Intro, estribillos, puentes y cambios: que el tema crezca y no se haga largo.'],
          ['Dirección de voces', 'Tomas, dobles, ad-libs y armonías, trabajados en la sesión con alguien que conoce el género.'],
          ['Mezcla y mastering', 'El tema sale con sonido final, listo para Spotify, Apple Music y YouTube.']
        ]
      },
      {
        h2: 'Cómo trabajamos',
        steps: [
          ['Referencias', 'Nos mandas la maqueta o la idea y dos o tres temas que te gusten cómo suenan.'],
          ['Boceto', 'Preparamos una primera versión del instrumental y la estructura para validarla contigo.'],
          ['Sesión', 'Grabamos las voces en el estudio o nos las mandas grabadas si estás lejos.'],
          ['Cierre', 'Mezcla, master y entrega de los archivos finales (y de los stems si los necesitas).']
        ]
      },
      {
        h2: 'Presencial u online',
        text: 'Si estás cerca de Barcelona, lo mejor es venir al estudio: las voces se dirigen mejor en persona. Si no, la producción funciona igual a distancia: compartimos versiones, hacemos videollamadas para las decisiones importantes y grabas las voces donde te venga bien.'
      }
    ],
    faq: [
      { q: '¿Cuánto cuesta producir una canción?', a: 'Depende de lo que necesite el tema: no es lo mismo partir de cero que de una maqueta con la voz grabada. Trabajamos con presupuesto cerrado por canción o por proyecto, que te pasamos antes de empezar. Escríbenos con tu maqueta y te lo preparamos.' },
      { q: '¿De quién son los derechos del tema?', a: 'Lo pactamos por escrito antes de empezar: el reparto de autoría del instrumental (split) y el uso del máster quedan claros desde el principio.' },
      { q: '¿Qué estilos producís?', a: 'Trap, rap, drill, R&B, reggaetón, hoodtrap y jerk. Es lo que hacemos a diario para los artistas del sello.' },
      { q: '¿Cuánto se tarda?', a: 'Los plazos se fijan en el presupuesto según el número de temas y la disponibilidad de las sesiones de voz.' }
    ]
  },
  {
    slug: 'grabacion',
    name: 'Grabación de voces',
    short: 'Sesiones de grabación en la masía, sin prisas y con alguien que conoce el género.',
    creditRoles: ['Grabación'],
    serviceType: 'Estudio de grabación',
    online: false,
    title: 'Estudio de grabación de voces para trap y rap cerca de Barcelona',
    description: 'Estudio de grabación de voces para trap, rap y música urbana en la Masia Agullons (Sant Joan de Mediona), a una hora de Barcelona, entre el Penedès y la Anoia. Sesiones sin prisas y dirección de voces.',
    h1: 'Estudio de grabación de voces',
    lead: 'Grabamos voces de trap, rap, drill, R&B y reggaetón en nuestro estudio de la Masia Agullons, en Sant Joan de Mediona, a una hora de Barcelona. Un sitio tranquilo, sin reloj y sin cruzarte con otros tres proyectos el mismo día.',
    sections: [
      {
        h2: 'Cómo es una sesión',
        list: [
          ['Preparación', 'Antes de la sesión revisamos el beat, la letra y las referencias para no perder tiempo en el estudio.'],
          ['Grabación', 'Tomas principales, dobles, ad-libs y coros, con alguien al otro lado del cristal que conoce el género.'],
          ['Edición', 'Selección de las mejores tomas, afinación y limpieza para que la voz quede lista para mezclar.'],
          ['Entrega', 'Te llevas las pistas editadas, o seguimos con la mezcla y el master en el mismo estudio.']
        ]
      },
      {
        h2: 'Qué traer',
        text: 'El beat en WAV (y las pistas por separado si las tienes), la letra y, si quieres, un par de temas de referencia de cómo quieres que suene tu voz. Si aún no tienes beat, mira el catálogo de beats o pídenos uno a medida.'
      },
      {
        h2: 'Dónde estamos',
        text: 'En la Masia Agullons, en Sant Joan de Mediona (Alt Penedès, Barcelona), a una hora de Barcelona. El entorno, en plena naturaleza, ayuda a concentrarse y a trabajar sin prisas.'
      }
    ],
    faq: [
      { q: '¿Cuánto cuesta una sesión de grabación?', a: 'Depende de la duración y de si incluye edición, mezcla y mastering. Te pasamos el presupuesto cerrado antes de reservar.' },
      { q: '¿Puedo venir con mi productor?', a: 'Claro. Puedes venir con tu productor o tu equipo; nosotros nos encargamos de la grabación.' },
      { q: '¿Grabáis también instrumentos?', a: 'Nos centramos en la voz y en la música urbana. Si tu proyecto necesita algo más, cuéntanoslo y lo vemos.' }
    ]
  },
  {
    slug: 'mezcla-y-mastering',
    name: 'Mezcla y mastering',
    short: 'Mezcla y master de trap y música urbana, en el estudio u online desde cualquier ciudad.',
    creditRoles: ['Mezcla', 'Mastering'],
    serviceType: 'Mezcla y mastering',
    online: true,
    title: 'Mezcla y mastering online de trap, rap y música urbana',
    description: 'Mezcla y mastering online de trap, rap, drill, R&B y reggaetón para artistas de toda España. Envía tus pistas y recibe tu tema listo para Spotify, con presupuesto cerrado por canción.',
    h1: 'Mezcla y mastering de trap y música urbana',
    lead: 'Mezclamos y masterizamos temas de trap, rap, drill, R&B, reggaetón y jerk para artistas de toda España. Nos mandas las pistas desde donde estés y te devolvemos el tema con sonido final, listo para publicar.',
    sections: [
      {
        h2: 'Cómo funciona online',
        steps: [
          ['Presupuesto', 'Nos cuentas cuántos temas son y nos mandas una referencia de cómo quieres que suenen.'],
          ['Envío de pistas', 'Subes las pistas a Drive, WeTransfer o similar y nos pasas el enlace.'],
          ['Primera mezcla', 'Te enviamos la mezcla para que la escuches en tus altavoces, en el coche y en el móvil.'],
          ['Revisiones y master', 'Ajustamos lo que haga falta en las rondas de revisión pactadas y entregamos el master final.']
        ]
      },
      {
        h2: 'Cómo preparar las pistas',
        list: [
          ['WAV a 24 bits', 'A la misma frecuencia de muestreo que el proyecto (44,1 o 48 kHz), todas desde el compás 1.'],
          ['Voces por separado', 'Principal, dobles, ad-libs y coros en pistas distintas, sin efectos de mezcla aplicados (o mándanos las dos versiones).'],
          ['Beat en stems', 'Si puedes, el beat separado por grupos: 808, batería, melodías y efectos. Si no, el beat en estéreo.'],
          ['Sin limitador en el máster', 'Nada en el bus principal: el volumen final lo damos en el mastering.']
        ]
      },
      {
        h2: 'Mastering solo',
        text: 'Si ya tienes la mezcla hecha, también hacemos solo el mastering: nos mandas la mezcla en WAV sin limitador y te devolvemos el master para plataformas.'
      }
    ],
    faq: [
      { q: '¿Cuánto cuesta mezclar y masterizar una canción?', a: 'Trabajamos con precio cerrado por canción, que depende del número de pistas y de si es mezcla y master o solo master. Mándanos los detalles y te pasamos el presupuesto.' },
      { q: '¿Cuántas revisiones incluye?', a: 'Las rondas de revisión se fijan en el presupuesto antes de empezar, para que sepas desde el principio qué incluye.' },
      { q: '¿Puedo estar en la mezcla?', a: 'Sí: puedes venir al estudio o seguirla por videollamada. Si no, trabajamos con tus notas sobre cada versión.' },
      { q: '¿Qué formato recibo?', a: 'El master en WAV para distribuir en plataformas, y en MP3 si lo necesitas para redes o para enviarlo a medios.' }
    ]
  },
  {
    slug: 'beats-a-medida',
    name: 'Beats a medida',
    short: 'Un instrumental hecho para tu tema, con exclusiva y stems.',
    creditRoles: ['Beat'],
    serviceType: 'Producción de beats',
    online: true,
    title: 'Beats a medida de trap, drill y reggaetón con exclusiva',
    description: 'Beats a medida de trap, drill, reggaetón, hoodtrap y jerk hechos para tu tema, con licencia exclusiva y stems. Producidos por el equipo de Other People Records, online para toda España.',
    h1: 'Beats a medida',
    lead: 'Si ningún beat del catálogo es el tuyo, lo hacemos para ti: un instrumental de trap, drill, reggaetón, hoodtrap o jerk pensado para tu voz y tu tema, con exclusiva y con las pistas por separado.',
    sections: [
      {
        h2: 'Cómo se hace un beat a medida',
        steps: [
          ['Referencias', 'Nos mandas dos o tres temas de referencia, el tempo aproximado y, si la tienes, una maqueta de voz.'],
          ['Primera versión', 'Te enviamos un boceto del beat para ver si vamos bien encaminados.'],
          ['Ajustes', 'Cambiamos lo que haga falta: estructura, sonidos, cortes para el estribillo.'],
          ['Entrega', 'WAV, MP3 y stems, con un contrato de exclusiva a tu nombre.']
        ]
      },
      {
        h2: 'Beat a medida o beat del catálogo',
        text: 'Un beat del catálogo es más rápido y barato: lo licencias al momento y puedes empezar a grabar hoy. Un beat a medida es solo tuyo desde el principio y se adapta a tu tema. Si dudas, escucha primero el catálogo por estilos.'
      }
    ],
    faq: [
      { q: '¿Cuánto cuesta un beat a medida?', a: 'Depende de si es solo el instrumental o incluye arreglos sobre tu voz. Te pasamos el precio cerrado antes de empezar.' },
      { q: '¿El beat es exclusivo?', a: 'Sí. Un beat a medida se entrega con licencia exclusiva: no se vende a nadie más.' },
      { q: '¿Me dais los stems?', a: 'Sí, las pistas por separado van incluidas para que se pueda mezclar bien el tema.' }
    ]
  }
]

export const studioServicePath = (service) => `/estudio/${service.slug}`

export const findStudioService = (slug) => STUDIO_SERVICES.find((service) => service.slug === slug) || null

/** Servicio del estudio que corresponde a un rol de crédito, si lo hay. */
export function serviceForCreditRole (role) {
  return STUDIO_SERVICES.find((service) => service.creditRoles.includes(role)) || null
}
