import { useEffect, useMemo } from 'react'

/**
 * Inyecta un bloque <script type="application/ld+json"> en el <head> mientras
 * la página está montada y lo retira al desmontar.
 *
 * Google acepta varios bloques por página, así que esto convive con el @graph
 * estático de index.html (Organization / WebSite / EntertainmentBusiness).
 *
 * Pásale `null` o `undefined` mientras los datos aún se están cargando: no
 * inyecta nada hasta que haya contenido real.
 *
 * @param {object|Array|null} data Objeto JSON-LD (o array de objetos).
 */
export function useJsonLd (data) {
  // Serializamos aquí para que la dependencia del efecto sea estable aunque el
  // objeto se reconstruya en cada render.
  const json = useMemo(() => (data ? JSON.stringify(data) : null), [data])

  useEffect(() => {
    if (!json) return

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = json
    script.dataset.pageJsonld = 'true'
    document.head.appendChild(script)

    return () => script.remove()
  }, [json])
}
