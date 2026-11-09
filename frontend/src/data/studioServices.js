/**
 * Servicios del estudio: una URL por intención de búsqueda (Fase 4.5 del plan
 * SEO). Lo usan las páginas /estudio/*, el hub /estudio y los créditos de los
 * lanzamientos (un crédito hecho en casa enlaza al servicio: hace de
 * portfolio).
 */
export const STUDIO_SERVICES = [
  {
    slug: 'produccion-musical',
    name: 'Producción musical',
    short: 'Del boceto al tema terminado: beat, arreglos, dirección de voces y sonido final.',
    creditRoles: ['Producción', 'Composición']
  },
  {
    slug: 'grabacion',
    name: 'Grabación de voces',
    short: 'Sesiones de grabación en la masía, sin prisas y con alguien que conoce el género.',
    creditRoles: ['Grabación']
  },
  {
    slug: 'mezcla-y-mastering',
    name: 'Mezcla y mastering',
    short: 'Mezcla y master de trap y música urbana, en el estudio u online desde cualquier ciudad.',
    creditRoles: ['Mezcla', 'Mastering']
  },
  {
    slug: 'beats-a-medida',
    name: 'Beats a medida',
    short: 'Un instrumental hecho para tu tema, con exclusiva y stems.',
    creditRoles: ['Beat']
  }
]

export const studioServicePath = (service) => `/estudio/${service.slug}`

/** Servicio del estudio que corresponde a un rol de crédito, si lo hay. */
export function serviceForCreditRole (role) {
  return STUDIO_SERVICES.find((service) => service.creditRoles.includes(role)) || null
}
