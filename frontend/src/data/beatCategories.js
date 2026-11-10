/**
 * Categorías de beats (/beats/trap, /beats/reggaeton…). Son las páginas que
 * deben posicionar por «beats de trap» o «comprar beats de reggaetón»; las
 * fichas de cada beat son la cola larga (Fase 3.4 del plan SEO).
 *
 * Una categoría con menos de MIN_INDEXABLE beats se sirve con noindex y no
 * entra en el sitemap: una página con dos beats es contenido pobre.
 *
 * Si añades una categoría, añade también su slug a RESERVED.Beat en
 * backend/utils/slug.js, a vercel.json y a CATEGORY_ROUTES en api/sitemap.js.
 */
export const MIN_INDEXABLE = 8

export const BEAT_CATEGORIES = [
  {
    slug: 'trap',
    name: 'Trap',
    tokens: ['trap'],
    title: 'Beats de trap con licencia',
    intro: [
      'Instrumentales de trap hechos en el estudio de Other People Records: 808 largos y saturados, hi-hats en tresillos y melodías oscuras, desde el trap de Atlanta más clásico hasta cosas más lentas y melódicas para cantar encima.',
      'Todos se pueden escuchar enteros antes de comprar y se licencian al momento. Si quieres que un beat sea solo tuyo, la licencia exclusiva lo retira del catálogo.'
    ]
  },
  {
    slug: 'hoodtrap',
    name: 'Hoodtrap',
    tokens: ['hoodtrap'],
    title: 'Beats de hoodtrap',
    intro: [
      'Hoodtrap: el cruce entre el trap de calle y el dembow que suena en la escena urbana española y latina. Percusión de reggaetón, bajos de trap y melodías pensadas para flows rápidos.',
      'Son beats hechos para temas de calle con gancho, para cantar o rapear, y se licencian al momento desde la web.'
    ]
  },
  {
    slug: 'reggaeton',
    name: 'Reggaetón',
    tokens: ['reggaeton'],
    title: 'Beats de reggaetón con licencia',
    intro: [
      'Beats de reggaetón y dembow: del perreo más clásico al reggaetón oscuro y al jerk, con baterías que pegan y espacio para la voz.',
      'Escúchalos enteros, elige la licencia que necesitas (MP3, WAV o stems) y descárgalos al momento.'
    ]
  },
  {
    slug: 'jerk',
    name: 'Jerk',
    tokens: ['jerk', 'jerketon'],
    title: 'Beats de jerk y jerketón',
    intro: [
      'Jerk y jerketón: baterías rebotadas, sintes brillantes y el tempo del reggaetón llevado al terreno del trap. Es uno de los sonidos que más mueve ahora la escena underground.',
      'Beats producidos por el equipo del sello, listos para licenciar al momento.'
    ]
  },
  {
    slug: 'drill',
    name: 'Drill',
    tokens: ['drill'],
    title: 'Beats de drill',
    intro: [
      'Beats de drill: bajos deslizantes, baterías a contratiempo y melodías tensas, del drill de UK y Nueva York a su versión española.',
      'Estamos preparando el catálogo de drill. Mientras tanto, escucha los beats de trap o pídenos uno a medida.'
    ]
  }
]

function tokensOf (genre) {
  return String(genre || '')
    .split(',')
    .map(g => g.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''))
    .filter(Boolean)
}

/** ¿El beat pertenece a la categoría? Por género exacto: «hoodtrap» no es «trap». */
export function inCategory (beat, category) {
  return tokensOf(beat?.genre).some(token => category.tokens.includes(token))
}

export const categoryPath = (category) => `/beats/${category.slug}`

export const findCategory = (slug) => BEAT_CATEGORIES.find(c => c.slug === slug) || null
