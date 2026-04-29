const SVG_PROPS = {
  viewBox: '0 0 120 120',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
  'aria-hidden': true,
  focusable: 'false'
}

export const IsoShop = () => (
  <svg {...SVG_PROPS}>
    <ellipse cx="60" cy="108" rx="44" ry="6" fill="rgba(255,0,60,0.18)" />

    {/* counter top */}
    <path d="M22 78 L60 60 L98 78 L60 96 Z" fill="#2b2b2b" stroke="rgba(255,255,255,0.18)" strokeWidth="0.6" />
    {/* counter front-left */}
    <path d="M22 78 L60 96 L60 110 L22 92 Z" fill="#161616" />
    {/* counter front-right */}
    <path d="M98 78 L60 96 L60 110 L98 92 Z" fill="#202020" />
    {/* counter front skirt (cloth) */}
    <path d="M22 92 L60 110 L98 92 L98 96 L60 114 L22 96 Z" fill="#0a0a0a" opacity="0.7" />

    {/* merchandise on counter — vinyl stack (left) */}
    <ellipse cx="36" cy="76" rx="9" ry="2.6" fill="#0a0a0a" />
    <ellipse cx="36" cy="73" rx="9" ry="2.6" fill="#1a1a1a" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
    <circle cx="36" cy="73" r="1.6" fill="#ff003c" />

    {/* cap (center) */}
    <path d="M52 75 Q52 67 60 66 Q68 67 68 75 Z" fill="#ff003c" />
    <path d="M50 75 L70 75 L67 78 L53 78 Z" fill="#cc002f" />
    <ellipse cx="60" cy="69" rx="2" ry="1" fill="rgba(255,255,255,0.4)" />

    {/* folded merch / t-shirt (right) */}
    <path d="M76 72 L90 67 L93 70 L79 76 Z" fill="#f0f0f0" />
    <path d="M76 72 L79 76 L79 82 L76 79 Z" fill="#bdbdbd" />
    <path d="M90 67 L93 70 L93 76 L90 73 Z" fill="#d6d6d6" />
    <path d="M82 72 L88 70" stroke="#ff003c" strokeWidth="1" strokeLinecap="round" />

    {/* posts holding the awning (back-left, back-center, back-right) */}
    <line x1="22" y1="78" x2="22" y2="48" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="60" y1="60" x2="60" y2="30" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="98" y1="78" x2="98" y2="48" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" />
    {/* post highlights */}
    <line x1="22" y1="48" x2="22" y2="78" stroke="rgba(255,255,255,0.18)" strokeWidth="0.6" />
    <line x1="98" y1="48" x2="98" y2="78" stroke="rgba(255,255,255,0.18)" strokeWidth="0.6" />

    {/* awning canvas top */}
    <path d="M16 48 L60 27 L104 48 L60 69 Z" fill="#ff003c" />
    {/* white stripes radiating from peak */}
    <path d="M60 27 L60 69" stroke="#ffffff" strokeWidth="3" opacity="0.85" />
    <path d="M38 38 L46 60" stroke="#ffffff" strokeWidth="2.5" opacity="0.85" />
    <path d="M82 38 L74 60" stroke="#ffffff" strokeWidth="2.5" opacity="0.85" />
    <path d="M27 43 L36 65" stroke="#ffffff" strokeWidth="1.6" opacity="0.7" />
    <path d="M93 43 L84 65" stroke="#ffffff" strokeWidth="1.6" opacity="0.7" />

    {/* awning hanging valance (front edges) */}
    <path d="M16 48 L60 69 L60 75 L16 54 Z" fill="#cc002f" />
    <path d="M104 48 L60 69 L60 75 L104 54 Z" fill="#e60036" />
    {/* scalloped trim on the front-left edge */}
    <path d="M22 51 L26 56 L30 53 L34 58 L38 55 L42 60 L46 57 L50 62 L54 59 L58 64 L60 69 L60 75 L16 54 L16 50 Z" fill="#a8002a" opacity="0.6" />
    <path d="M98 51 L94 56 L90 53 L86 58 L82 55 L78 60 L74 57 L70 62 L66 59 L62 64 L60 69 L60 75 L104 54 L104 50 Z" fill="#a8002a" opacity="0.6" />

    {/* hanging price tag from front peak */}
    <line x1="60" y1="69" x2="60" y2="74" stroke="rgba(255,255,255,0.5)" strokeWidth="0.6" />
    <path d="M55 74 L65 74 L68 78 L65 82 L55 82 Z" fill="#f5f5f5" />
    <circle cx="65" cy="78" r="0.9" fill="#0a0a0a" />
    <line x1="57" y1="77" x2="62" y2="77" stroke="#0a0a0a" strokeWidth="0.5" opacity="0.6" />
    <line x1="57" y1="79" x2="61" y2="79" stroke="#0a0a0a" strokeWidth="0.5" opacity="0.5" />
  </svg>
)

export const IsoSpray = () => (
  <svg {...SVG_PROPS}>
    <ellipse cx="55" cy="108" rx="26" ry="4" fill="rgba(255,0,60,0.18)" />
    {/* paint splash on the wall */}
    <circle cx="92" cy="36" r="11" fill="#ff003c" />
    <circle cx="83" cy="26" r="3" fill="#ff003c" opacity="0.75" />
    <circle cx="103" cy="46" r="3" fill="#ff003c" opacity="0.75" />
    <circle cx="106" cy="30" r="1.8" fill="#ff003c" />
    <circle cx="80" cy="44" r="1.6" fill="#ff003c" opacity="0.6" />
    <path d="M92 36 L96 64" stroke="#ff003c" strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
    {/* spray dotted line */}
    <path d="M58 38 Q72 30 86 32" stroke="#ff003c" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.55" strokeDasharray="2 2.4" />
    {/* can — left face */}
    <path d="M40 56 L40 98 L55 106 L55 64 Z" fill="#1d1d1d" />
    {/* can — right face */}
    <path d="M55 64 L55 106 L70 98 L70 56 Z" fill="#0f0f0f" />
    {/* can — top ellipse */}
    <ellipse cx="55" cy="60" rx="15" ry="5" fill="#2c2c2c" stroke="rgba(255,255,255,0.18)" strokeWidth="0.5" />
    {/* label band */}
    <path d="M40 78 L55 86 L70 78 L70 84 L55 92 L40 84 Z" fill="#ff003c" />
    <path d="M40 78 L55 86 L55 92 L40 84 Z" fill="#cc002f" />
    {/* cap */}
    <ellipse cx="55" cy="50" rx="8" ry="3" fill="#1f1f1f" />
    <path d="M47 42 L47 50 L63 50 L63 42 Z" fill="#2c2c2c" />
    <ellipse cx="55" cy="42" rx="8" ry="3" fill="#3a3a3a" />
    {/* nozzle */}
    <circle cx="55" cy="38" r="1.6" fill="#ff003c" />
  </svg>
)

export const IsoBeer = () => (
  <svg {...SVG_PROPS}>
    <ellipse cx="60" cy="108" rx="32" ry="5" fill="rgba(255,0,60,0.18)" />
    {/* mug body left/front */}
    <path d="M38 40 L42 100 L60 108 L60 48 Z" fill="#d4951c" />
    {/* mug body right */}
    <path d="M60 48 L60 108 L78 100 L82 40 Z" fill="#a76d09" />
    {/* mug rim */}
    <ellipse cx="60" cy="40" rx="22" ry="7" fill="#7a4d00" />
    {/* foam */}
    <ellipse cx="60" cy="34" rx="22" ry="8" fill="#f7f3ea" />
    <ellipse cx="55" cy="32" rx="6" ry="2.5" fill="#fff" />
    <ellipse cx="68" cy="33" rx="4" ry="2" fill="#fff" />
    {/* bubbles */}
    <circle cx="48" cy="22" r="2.4" fill="#fff" opacity="0.85" />
    <circle cx="72" cy="20" r="1.8" fill="#fff" opacity="0.7" />
    <circle cx="60" cy="14" r="2" fill="#fff" opacity="0.55" />
    {/* handle */}
    <path d="M82 50 Q98 60 96 80 Q94 92 78 92" stroke="#a76d09" strokeWidth="6" fill="none" strokeLinecap="round" />
    <path d="M82 56 Q92 64 90 80" stroke="#7a4d00" strokeWidth="2" fill="none" />
    {/* glass shine */}
    <path d="M48 52 L46 96" stroke="rgba(255,255,255,0.28)" strokeWidth="2" strokeLinecap="round" />
    <path d="M70 60 L72 94" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

export const IsoHam = () => (
  <svg {...SVG_PROPS}>
    <ellipse cx="60" cy="110" rx="52" ry="6" fill="rgba(255,0,60,0.18)" />

    {/* steam wisps */}
    <path d="M38 28 Q32 20 40 12" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M60 22 Q68 14 60 6" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M82 28 Q88 20 82 12" stroke="rgba(255,255,255,0.32)" strokeWidth="1.6" strokeLinecap="round" fill="none" />

    {/* tray (oven dish) */}
    <ellipse cx="60" cy="94" rx="54" ry="14" fill="#0a0a0a" />
    <ellipse cx="60" cy="91" rx="52" ry="12" fill="#2a2a2a" stroke="rgba(255,255,255,0.18)" strokeWidth="0.6" />
    <ellipse cx="60" cy="89" rx="48" ry="10" fill="#161616" />

    {/* back-row potatoes */}
    <ellipse cx="20" cy="78" rx="7" ry="4.5" fill="#c98e3e" />
    <ellipse cx="19" cy="76" rx="3" ry="1.6" fill="#f0c068" />
    <ellipse cx="34" cy="82" rx="6" ry="4" fill="#a87030" />
    <ellipse cx="34" cy="80" rx="2.6" ry="1.4" fill="#d4a04a" />
    <circle cx="38" cy="79" r="0.7" fill="#3a1208" opacity="0.6" />
    <ellipse cx="100" cy="76" rx="7" ry="4.5" fill="#c98e3e" />
    <ellipse cx="101" cy="74" rx="3" ry="1.6" fill="#f0c068" />
    <ellipse cx="86" cy="82" rx="6" ry="4" fill="#b07c34" />
    <ellipse cx="86" cy="80" rx="2.6" ry="1.4" fill="#e0b058" />
    <circle cx="84" cy="79" r="0.7" fill="#3a1208" opacity="0.6" />

    {/* rosemary sprig */}
    <path d="M58 38 L50 22" stroke="#3d6b2c" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M50 22 L46 21" stroke="#5a8c3a" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M51 25 L47 25" stroke="#5a8c3a" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M53 28 L49 29" stroke="#5a8c3a" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M55 31 L52 33" stroke="#5a8c3a" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M50 22 L52 18" stroke="#5a8c3a" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M52 26 L55 23" stroke="#5a8c3a" strokeWidth="1.2" strokeLinecap="round" />

    {/* ham body (bottom/dark side) */}
    <path d="M16 64 Q16 42 48 40 Q72 40 86 50 Q94 56 92 66 Q86 80 56 82 Q22 82 16 64 Z" fill="#4a1808" />
    {/* ham body top (lighter glaze) */}
    <path d="M20 60 Q20 42 48 42 Q72 42 84 52 Q90 58 84 60 Q60 56 40 58 Q22 60 20 60 Z" fill="#7a2a10" />
    {/* upper glaze/highlight */}
    <path d="M24 56 Q26 44 50 44 Q72 44 80 54 Q66 50 48 52 Q30 54 24 56 Z" fill="#a0421c" />
    {/* glossy shine */}
    <path d="M30 50 Q44 44 60 46 Q72 48 78 52" stroke="rgba(255,210,150,0.55)" strokeWidth="2.2" fill="none" strokeLinecap="round" />

    {/* diamond scoring (crispy crosshatch) */}
    <line x1="32" y1="52" x2="42" y2="62" stroke="#2a0c04" strokeWidth="0.8" opacity="0.7" />
    <line x1="42" y1="50" x2="52" y2="60" stroke="#2a0c04" strokeWidth="0.8" opacity="0.7" />
    <line x1="52" y1="48" x2="62" y2="58" stroke="#2a0c04" strokeWidth="0.8" opacity="0.7" />
    <line x1="62" y1="48" x2="72" y2="58" stroke="#2a0c04" strokeWidth="0.8" opacity="0.7" />
    <line x1="72" y1="50" x2="80" y2="58" stroke="#2a0c04" strokeWidth="0.8" opacity="0.7" />
    <line x1="42" y1="50" x2="32" y2="60" stroke="#2a0c04" strokeWidth="0.8" opacity="0.7" />
    <line x1="52" y1="48" x2="42" y2="58" stroke="#2a0c04" strokeWidth="0.8" opacity="0.7" />
    <line x1="62" y1="48" x2="52" y2="58" stroke="#2a0c04" strokeWidth="0.8" opacity="0.7" />
    <line x1="72" y1="50" x2="62" y2="60" stroke="#2a0c04" strokeWidth="0.8" opacity="0.7" />
    <line x1="80" y1="52" x2="72" y2="60" stroke="#2a0c04" strokeWidth="0.8" opacity="0.7" />

    {/* dark caramelized spots */}
    <ellipse cx="34" cy="68" rx="5" ry="2.5" fill="#2a0c04" opacity="0.55" />
    <ellipse cx="64" cy="72" rx="6" ry="2.8" fill="#2a0c04" opacity="0.55" />
    <ellipse cx="80" cy="66" rx="4" ry="2" fill="#2a0c04" opacity="0.55" />

    {/* bone protruding */}
    <path d="M88 56 L102 56 Q104 58 104 60 L104 64 Q104 66 102 66 L88 66 Z" fill="#f0e8d0" stroke="#a89876" strokeWidth="0.6" />
    <ellipse cx="103" cy="61" rx="3.2" ry="4" fill="#fff7e0" stroke="#a89876" strokeWidth="0.6" />
    <line x1="92" y1="59" x2="100" y2="59" stroke="#c4b48a" strokeWidth="0.5" opacity="0.7" />
    <line x1="92" y1="63" x2="100" y2="63" stroke="#c4b48a" strokeWidth="0.5" opacity="0.7" />

    {/* front-row potatoes (in front of ham) */}
    <ellipse cx="42" cy="86" rx="6.5" ry="3.8" fill="#c98e3e" />
    <ellipse cx="40" cy="84" rx="2.8" ry="1.4" fill="#f0c068" />
    <circle cx="46" cy="85" r="0.7" fill="#3a1208" opacity="0.55" />
    <ellipse cx="60" cy="88" rx="6.5" ry="3.8" fill="#a87030" />
    <ellipse cx="62" cy="86" rx="2.8" ry="1.4" fill="#e0b058" />
    <circle cx="58" cy="87" r="0.7" fill="#3a1208" opacity="0.55" />
    <ellipse cx="78" cy="86" rx="6.5" ry="3.8" fill="#b07c34" />
    <ellipse cx="80" cy="84" rx="2.8" ry="1.4" fill="#d4a04a" />
    <circle cx="76" cy="85" r="0.7" fill="#3a1208" opacity="0.55" />
  </svg>
)

export const IsoTent = () => (
  <svg {...SVG_PROPS}>
    <ellipse cx="60" cy="106" rx="46" ry="6" fill="rgba(255,0,60,0.18)" />
    {/* night dots */}
    <circle cx="100" cy="40" r="1.2" fill="#fff" opacity="0.7" />
    <circle cx="108" cy="30" r="1" fill="#fff" opacity="0.5" />
    <circle cx="92" cy="34" r="1" fill="#fff" opacity="0.45" />
    <circle cx="20" cy="38" r="1" fill="#fff" opacity="0.5" />
    <circle cx="14" cy="50" r="0.9" fill="#fff" opacity="0.4" />
    {/* tent right slope */}
    <path d="M60 24 L102 96 L60 96 Z" fill="#cc002f" />
    {/* tent left slope */}
    <path d="M60 24 L18 96 L60 96 Z" fill="#ff003c" />
    {/* center seam */}
    <line x1="60" y1="24" x2="60" y2="96" stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
    {/* opening (V door) */}
    <path d="M60 96 L50 60 L60 70 L70 60 L60 96 Z" fill="#160006" />
    <path d="M55 90 L60 78 L65 90 Z" fill="rgba(255,255,255,0.06)" />
    {/* peak knob */}
    <circle cx="60" cy="24" r="2" fill="#fff" opacity="0.5" />
    {/* guy lines */}
    <line x1="18" y1="96" x2="10" y2="102" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
    <line x1="102" y1="96" x2="110" y2="102" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
    {/* pegs */}
    <circle cx="10" cy="103" r="1.3" fill="#0a0a0a" stroke="rgba(255,255,255,0.4)" strokeWidth="0.4" />
    <circle cx="110" cy="103" r="1.3" fill="#0a0a0a" stroke="rgba(255,255,255,0.4)" strokeWidth="0.4" />
    {/* small fire */}
    <ellipse cx="92" cy="98" rx="6" ry="2" fill="rgba(255,0,60,0.4)" />
    <path d="M92 100 Q88 94 92 88 Q96 94 92 100 Z" fill="#ff003c" />
    <path d="M92 99 Q90 95 92 91 Q94 95 92 99 Z" fill="#ffa600" />
  </svg>
)
