import { Link } from 'react-router-dom'
import './Breadcrumbs.css'

/**
 * Migas de pan visibles (el JSON-LD BreadcrumbList lo pone cada página).
 * @param {{ items: Array<{ label: string, to?: string }>, align?: 'start' | 'center' }} props
 *   El último item, sin `to`.
 */
export default function Breadcrumbs ({ items, align = 'start' }) {
  return (
    <nav className={`breadcrumbs${align === 'center' ? ' breadcrumbs--center' : ''}`} aria-label="Migas de pan">
      <ol>
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`}>
            {item.to && i < items.length - 1
              ? <Link to={item.to}>{item.label}</Link>
              : <span aria-current="page">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}
