import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isObjectId } from '../utils/paths'

/**
 * Si la ficha se abrió por su URL antigua (/artistas/<ObjectId>) y ya tiene
 * slug, cambia la URL a la del slug sin recargar. Para los bots, la
 * redirección 301 la hace api/og.js.
 *
 * @param {string} param    El :id de la ruta.
 * @param {object} item     La entidad cargada (con `slug`).
 * @param {(item) => string} toPath  Función que construye la URL buena.
 */
export function useCanonicalSlug (param, item, toPath) {
  const navigate = useNavigate()
  useEffect(() => {
    if (!item?.slug || !isObjectId(param)) return
    navigate(`${toPath(item)}${window.location.search}${window.location.hash}`, { replace: true })
  }, [param, item, toPath, navigate])
}
