import { useState, useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { PLATFORM_ICONS, getPlatformIcon } from '../../utils/linkIcons'
import './LinkIconPicker.css'

function LinkIconPicker ({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = getPlatformIcon(value)

  useEffect(() => {
    if (!open) return
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const select = (key) => {
    onChange(key)
    setOpen(false)
  }

  return (
    <div className="lip" ref={ref}>
      <button
        type="button"
        className={`lip-trigger${open ? ' lip-trigger--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-label="Seleccionar icono"
        title={selected ? selected.label : 'Auto (favicon)'}
      >
        {selected ? (
          <FontAwesomeIcon icon={selected.fa} style={{ color: selected.color }} />
        ) : (
          <span className="lip-trigger__auto">🌐</span>
        )}
      </button>

      {open && (
        <div className="lip-dropdown">
          <button
            type="button"
            className={`lip-item lip-item--auto${!value ? ' lip-item--selected' : ''}`}
            onClick={() => select('')}
            title="Auto (favicon)"
          >
            <span className="lip-item__icon">🌐</span>
            <span className="lip-item__name">Auto</span>
          </button>

          {PLATFORM_ICONS.map(platform => (
            <button
              key={platform.key}
              type="button"
              className={`lip-item${value === platform.key ? ' lip-item--selected' : ''}`}
              style={{ '--lip-color': platform.color }}
              onClick={() => select(platform.key)}
              title={platform.label}
            >
              <span className="lip-item__icon">
                <FontAwesomeIcon icon={platform.fa} />
              </span>
              <span className="lip-item__name">{platform.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LinkIconPicker
