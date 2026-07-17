/*
 * Diagramas del manual web de OPR-W1, adaptados de las ilustraciones del
 * manual integrado del plugin (estilo librito Teenage Engineering: un
 * gráfico por concepto y el mínimo texto imprescindible).
 * Todo vectorial e inline, estático — el fotograma quieto ya explica.
 */

const LINE = '#3b3b44'
const TEXT_HI = '#efeff2'
const TEXT_MID = '#9b9ba6'
const RED = '#ff003c'

/* 01 — Campo estéreo: sector rojo abierto más allá de la referencia
   punteada del 100 %. */
export function FieldDiagram () {
  return (
    <svg className="oprd" viewBox="0 0 440 176" aria-hidden="true">
      <path d="M 220 152 L 161 49.8 A 118 118 0 0 1 279 49.8 Z" fill="none" stroke={LINE} strokeWidth="1.5" strokeDasharray="4 4" />
      <path d="M 220 152 L 123.3 84.3 A 118 118 0 0 1 316.7 84.3 Z" fill="rgba(255,0,60,0.07)" stroke={RED} strokeWidth="2" />
      <circle cx="220" cy="152" r="4.5" fill={TEXT_HI} />

      <text x="220" y="16" textAnchor="middle" className="oprd-tag oprd-tag--hot">WIDTH 160 %</text>

      <text x="34" y="156" textAnchor="middle" className="oprd-tag">L</text>
      <text x="406" y="156" textAnchor="middle" className="oprd-tag">R</text>

      <path d="M 140 168 H 162" stroke={LINE} strokeWidth="1.5" strokeDasharray="4 4" />
      <text x="170" y="171" className="oprd-tag">100 % NEUTRO</text>
    </svg>
  )
}

/* 02 — XOVER: el eje de frecuencia partido en dos bandas, cada una con su
   ancho (flecha corta = graves estrechos, flecha larga roja = agudos
   anchos). */
export function XoverDiagram () {
  return (
    <svg className="oprd" viewBox="0 0 440 150" aria-hidden="true">
      <rect x="40" y="40" width="180" height="54" fill="rgba(255,255,255,0.03)" stroke={LINE} strokeWidth="1.5" />
      <rect x="220" y="40" width="180" height="54" fill="rgba(255,255,255,0.07)" stroke={LINE} strokeWidth="1.5" />

      <g stroke={TEXT_MID} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 114 67 H 146" />
        <path d="M 121 62 L 114 67 L 121 72" />
        <path d="M 139 62 L 146 67 L 139 72" />
      </g>
      <g stroke={RED} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 258 67 H 362" />
        <path d="M 266 62 L 258 67 L 266 72" />
        <path d="M 354 62 L 362 67 L 354 72" />
      </g>

      <path d="M 40 94 H 400" stroke={LINE} strokeWidth="1.5" />

      <path d="M 220 30 V 102" stroke={RED} strokeWidth="2" strokeDasharray="3 3" />
      <text x="220" y="22" textAnchor="middle" className="oprd-tag oprd-tag--hot">XOVER</text>

      <text x="40" y="110" className="oprd-tag">100 Hz</text>
      <text x="400" y="110" textAnchor="end" className="oprd-tag">4 kHz</text>

      <text x="130" y="132" textAnchor="middle" className="oprd-tag oprd-tag--lit">◄ GRAVES · WIDTH LOW</text>
      <text x="310" y="132" textAnchor="middle" className="oprd-tag oprd-tag--lit">AGUDOS · WIDTH HIGH ►</text>
    </svg>
  )
}

/* 04 — Motores: la misma fuente mono arriba; M/S la deja clavada en el
   centro, VELVET la abre en dos. */
export function EngineDiagram ({ widen = false }) {
  return (
    <svg className="oprd oprd--engine" viewBox="0 0 200 70" aria-hidden="true">
      <text x="100" y="10" textAnchor="middle" className="oprd-tag">MONO</text>
      <circle cx="100" cy="23" r="3.5" fill={TEXT_MID} />
      <path d="M 100 30 V 39 M 96.5 35.5 L 100 39 L 103.5 35.5" fill="none" stroke={LINE} strokeWidth="1.5" />

      <path d="M 24 56 H 176" stroke={LINE} strokeWidth="1.5" />
      <text x="14" y="59" textAnchor="middle" className="oprd-tag">L</text>
      <text x="186" y="59" textAnchor="middle" className="oprd-tag">R</text>

      {widen
        ? (
          <>
            <circle cx="64" cy="56" r="3.5" fill={RED} />
            <circle cx="136" cy="56" r="3.5" fill={RED} />
          </>
          )
        : <circle cx="100" cy="56" r="3.5" fill={TEXT_MID} />}
    </svg>
  )
}

/* 05 — Haas: el mismo transitorio en L y en R, pero R llega tarde. */
export function HaasDiagram () {
  return (
    <svg className="oprd" viewBox="0 0 440 132" aria-hidden="true">
      <defs>
        <pattern id="oprd-danger" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <rect width="4" height="8" fill={RED} opacity="0.35" />
        </pattern>
      </defs>

      <rect x="318" y="8" width="102" height="6" fill="url(#oprd-danger)" />
      <text x="420" y="26" textAnchor="end" className="oprd-tag oprd-tag--hot">MONO-UNSAFE</text>

      <text x="30" y="48" textAnchor="middle" className="oprd-tag">L</text>
      <path d="M 60 44 H 150 L 158 22 L 166 56 L 172 38 L 180 44 H 400" fill="none" stroke={TEXT_HI} strokeWidth="1.5" />

      <text x="30" y="100" textAnchor="middle" className="oprd-tag">R</text>
      <path d="M 60 96 H 186 L 194 74 L 202 108 L 208 90 L 216 96 H 400" fill="none" stroke={RED} strokeWidth="1.5" />

      <path d="M 158 16 V 118" stroke={LINE} strokeWidth="1" strokeDasharray="3 3" />
      <path d="M 194 68 V 118" stroke={LINE} strokeWidth="1" strokeDasharray="3 3" />
      <path d="M 158 114 H 194" stroke={RED} strokeWidth="1.5" />
      <text x="202" y="118" className="oprd-tag oprd-tag--hot">0–40 ms</text>
    </svg>
  )
}

/* 06 — La prueba del mono: el campo abierto se pliega a un solo punto. */
export function MonoDiagram () {
  return (
    <svg className="oprd" viewBox="0 0 440 110" aria-hidden="true">
      <path d="M 40 62 H 190" stroke={LINE} strokeWidth="1.5" />
      <text x="30" y="66" textAnchor="middle" className="oprd-tag">L</text>
      <text x="200" y="66" textAnchor="middle" className="oprd-tag">R</text>
      <circle cx="78" cy="62" r="3.5" fill={RED} />
      <circle cx="152" cy="62" r="3.5" fill={RED} />
      <text x="115" y="34" textAnchor="middle" className="oprd-tag">STEREO</text>

      <path d="M 216 62 H 248 M 242 57 L 248 62 L 242 67" fill="none" stroke={TEXT_MID} strokeWidth="1.5" />
      <text x="232" y="48" textAnchor="middle" className="oprd-tag oprd-tag--hot">MONO</text>

      <path d="M 270 62 H 420" stroke={LINE} strokeWidth="1.5" />
      <circle cx="345" cy="62" r="3.5" fill={TEXT_MID} />
      <text x="345" y="86" textAnchor="middle" className="oprd-tag">(L+R)/2</text>
    </svg>
  )
}

/* 07 — Ruta de señal: cadena principal arriba, rama VELVET punteada abajo. */
export function FlowDiagram () {
  const box = (x, w, label, y = 32) => (
    <g key={label + x}>
      <rect x={x} y={y} width={w} height="26" rx="3" fill="#131316" stroke={LINE} strokeWidth="1.5" />
      <text x={x + w / 2} y={y + 17} textAnchor="middle" className="oprd-tag oprd-tag--box">{label}</text>
    </g>
  )
  return (
    <svg className="oprd oprd--flow" viewBox="0 0 440 340" aria-hidden="true">
      {box(145, 110, 'IN', 12)}
      {box(145, 110, 'HAAS', 60)}
      {box(145, 110, 'XOVER LR4', 108)}
      {box(145, 110, 'WIDTH L·H', 156)}
      {box(145, 110, 'Σ', 204)}
      {box(145, 110, 'OUTPUT', 252)}
      {box(145, 110, 'MONO', 300)}

      <g stroke={TEXT_MID} strokeWidth="1.5" fill="none">
        <path d="M 200 38 V 60 M 196 55 L 200 60 L 204 55" />
        <path d="M 200 86 V 108 M 196 103 L 200 108 L 204 103" />
        <path d="M 200 134 V 156 M 196 151 L 200 156 L 204 151" />
        <path d="M 200 182 V 204 M 196 199 L 200 204 L 204 199" />
        <path d="M 200 230 V 252 M 196 247 L 200 252 L 204 247" />
        <path d="M 200 278 V 300 M 196 295 L 200 300 L 204 295" />
      </g>

      {box(290, 100, 'VELVET', 108)}
      {box(290, 100, 'XOVER LR4', 156)}
      <g stroke={RED} strokeWidth="1.5" fill="none" strokeDasharray="4 3">
        <path d="M 255 73 H 340 V 108 M 336 103 L 340 108 L 344 103" />
        <path d="M 340 134 V 156 M 336 151 L 340 156 L 344 151" />
        <path d="M 290 169 H 255 M 260 165 L 255 169 L 260 173" />
      </g>
      <text x="340" y="202" textAnchor="middle" className="oprd-tag oprd-tag--hot">MOTOR VELVET</text>
    </svg>
  )
}

/* Glifos pequeños para la lista de mandos. */
export function KnobGlyph ({ a = 0, hot = false }) {
  const rad = ((a - 90) * Math.PI) / 180
  const r = 15
  const c = 18
  return (
    <svg className="oprd-glyph" viewBox="0 0 36 36" aria-hidden="true">
      <circle cx={c} cy={c} r={r} fill="none" stroke={LINE} strokeWidth="2" />
      <line
        x1={c}
        y1={c}
        x2={c + r * 0.8 * Math.cos(rad)}
        y2={c + r * 0.8 * Math.sin(rad)}
        stroke={hot ? RED : TEXT_HI}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function SegGlyph () {
  return (
    <svg className="oprd-glyph" viewBox="0 0 36 36" aria-hidden="true">
      <rect x="3" y="12" width="14" height="12" fill="#1c1c21" stroke={LINE} strokeWidth="1.5" />
      <rect x="19" y="12" width="14" height="12" fill="none" stroke={LINE} strokeWidth="1.5" />
      <rect x="3" y="26" width="14" height="2" fill={RED} />
    </svg>
  )
}

export function ToggleGlyph () {
  return (
    <svg className="oprd-glyph" viewBox="0 0 36 36" aria-hidden="true">
      <rect x="5" y="12" width="26" height="12" rx="6" fill="#1c1c21" stroke={LINE} strokeWidth="1.5" />
      <circle cx="12" cy="18" r="4" fill={LINE} />
    </svg>
  )
}
