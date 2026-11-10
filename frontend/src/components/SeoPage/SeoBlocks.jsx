import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import GlassSurface from '../GlassSurface'
import './SeoBlocks.css'

/**
 * Bloques de las páginas de contenido (SeoPage): mismo lenguaje que Estudio
 * y Contacto. Títulos en mayúsculas con la barra roja centrada, tarjetas de
 * cristal y botones rojos en mayúsculas.
 */

/** Columnas de una rejilla: hasta 4 en una fila; con más, filas de 4 o de 3. */
const columnsFor = (n) => (n <= 4 ? n : n % 4 === 0 ? 4 : 3)

/** Enlace interno o externo según venga `to` o `href`. */
function SmartLink ({ to, href, children, ...rest }) {
  if (href) return <a href={href} {...rest}>{children}</a>
  return <Link to={to} {...rest}>{children}</Link>
}

/** Botón rojo (o secundario) de las landings. */
export function SeoButton ({ to, href, onClick, variant = 'primary', icon, children, ...rest }) {
  return (
    <SmartLink to={to} href={href} onClick={onClick} className={`seo-button seo-button--${variant}`} {...rest}>
      {children}
      {icon && <FontAwesomeIcon icon={['fas', icon]} className="seo-button__icon" aria-hidden="true" />}
    </SmartLink>
  )
}

/** Sección con título centrado, barra roja y entradilla opcional. */
export function SeoSection ({ title, intro, children, id, wide = false }) {
  return (
    <section className={`seo-section${wide ? ' seo-section--wide' : ''}`} id={id}>
      <header className="seo-section__header">
        <h2 className="seo-section__title">{title}</h2>
        <div className="seo-accent" aria-hidden="true" />
        {intro && <p className="seo-section__intro">{intro}</p>}
      </header>
      {children}
    </section>
  )
}

/** Texto corrido centrado, para los párrafos sueltos de una sección. */
export function SeoProse ({ children }) {
  return <div className="seo-prose">{children}</div>
}

/**
 * Rejilla de tarjetas con icono. Cada item: { icon, title, text, to?, href? }.
 * Si lleva enlace, la tarjeta entera es el enlace y muestra «Ver más».
 */
export function SeoFeatures ({ items, more = 'Ver más' }) {
  return (
    <ul className={`seo-features seo-grid--${columnsFor(items.length)}`}>
      {items.map(item => {
        const linked = Boolean(item.to || item.href)
        const content = (
          <>
            {item.icon && (
              <span className="seo-feature__icon" aria-hidden="true">
                <FontAwesomeIcon icon={['fas', item.icon]} />
              </span>
            )}
            <h3 className="seo-feature__title">{item.title}</h3>
            <p className="seo-feature__text">{item.text}</p>
            {linked && (
              <span className="seo-feature__more" aria-hidden="true">
                {more} <FontAwesomeIcon icon={['fas', 'arrow-right']} />
              </span>
            )}
          </>
        )
        return (
          <li key={item.title}>
            {linked
              ? <GlassSurface as={SmartLink} to={item.to} href={item.href} className="seo-feature seo-feature--link">{content}</GlassSurface>
              : <GlassSurface className="seo-feature">{content}</GlassSurface>}
          </li>
        )
      })}
    </ul>
  )
}

/** Pasos numerados en tarjetas. Cada item: { title, text } (text admite JSX). */
export function SeoSteps ({ items }) {
  return (
    <ol className={`seo-steps seo-grid--${columnsFor(items.length)}`}>
      {items.map((item, i) => (
        <li key={item.title}>
          <GlassSurface className="seo-step">
            <span className="seo-step__number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="seo-step__title">{item.title}</h3>
            <p className="seo-step__text">{item.text}</p>
          </GlassSurface>
        </li>
      ))}
    </ol>
  )
}

/** Franja de cifras. Cada item: { value, label }. */
export function SeoStats ({ stats, label = 'En cifras' }) {
  if (!stats || stats.length < 2) return null
  return (
    <GlassSurface className="seo-stats">
      <ul className="seo-stats__list" aria-label={label}>
        {stats.map(s => (
          <li key={s.label} className="seo-stats__item">
            <strong className="seo-stats__value">{s.value}</strong>
            <span className="seo-stats__label">{s.label}</span>
          </li>
        ))}
      </ul>
    </GlassSurface>
  )
}

/**
 * Píldoras con miniatura opcional (roster, eventos, trabajos, salas).
 * Cada item: { key?, to?, label, meta?, img? }. Sin `to` no es un enlace.
 */
export function SeoChips ({ items, round = false }) {
  return (
    <ul className={`seo-chips${round ? ' seo-chips--people' : ''}`}>
      {items.map(item => {
        const body = (
          <>
            {item.img && (
              <img
                src={item.img}
                alt=""
                loading="lazy"
                width="40"
                height="40"
                className={`seo-chip__img${round ? ' seo-chip__img--round' : ''}`}
              />
            )}
            <span className="seo-chip__body">
              <span className="seo-chip__label">{item.label}</span>
              {item.meta && <span className="seo-chip__meta">{item.meta}</span>}
            </span>
          </>
        )
        return (
          <li key={item.key || item.to || item.label}>
            {item.to
              ? <Link to={item.to} className="seo-chip">{body}</Link>
              : <span className="seo-chip seo-chip--static">{body}</span>}
          </li>
        )
      })}
    </ul>
  )
}

/** Preguntas frecuentes en acordeón (el texto está en el HTML aunque esté plegado). */
export function SeoFaq ({ items }) {
  return (
    <div className="seo-faq">
      {items.map(({ q, a }) => (
        <details className="seo-faq__item" key={q}>
          <summary className="seo-faq__question">
            <h3>{q}</h3>
            <FontAwesomeIcon icon={['fas', 'chevron-down']} className="seo-faq__chevron" aria-hidden="true" />
          </summary>
          <p className="seo-faq__answer">{a}</p>
        </details>
      ))}
    </div>
  )
}

/** Llamada a la acción final: { title, text?, label, to?, href?, onClick?, eyebrow?, children? }. */
export function SeoCta ({ eyebrow, title, text, label, to, href, onClick, children }) {
  return (
    <GlassSurface as="section" className="seo-cta" borderRadius={20}>
      {eyebrow && <span className="seo-eyebrow">{eyebrow}</span>}
      <h2 className="seo-cta__title">{title}</h2>
      {text && <p className="seo-cta__text">{text}</p>}
      {children}
      {label && (
        <SeoButton to={to} href={href} onClick={onClick} icon="arrow-right">{label}</SeoButton>
      )}
    </GlassSurface>
  )
}

/** Tarjeta de ubicación del estudio. */
export function SeoLocation ({ name, place, mapsUrl, note, children }) {
  return (
    <GlassSurface className="seo-location">
      <span className="seo-feature__icon" aria-hidden="true">
        <FontAwesomeIcon icon={['fas', 'location-dot']} />
      </span>
      <div className="seo-location__body">
        <h3 className="seo-location__name">{name}</h3>
        <p className="seo-location__place">{place}</p>
        {note && <p className="seo-location__note">{note}</p>}
        {children}
      </div>
      {mapsUrl && (
        <SeoButton href={mapsUrl} variant="secondary" icon="external-link-alt" target="_blank" rel="noopener noreferrer">
          Cómo llegar
        </SeoButton>
      )}
    </GlassSurface>
  )
}
