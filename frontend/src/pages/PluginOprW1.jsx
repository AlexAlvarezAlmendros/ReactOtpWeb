import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { motion } from 'motion/react'
import GlassSurface from '../components/GlassSurface'
import Footer from '../components/Footer/Footer'
import { useTilt } from '../hooks/useTilt'
import { usePageMeta } from '../hooks/usePageMeta'
import { PLUGINS, DONATION_URL } from '../data/plugins'
import {
  FieldDiagram, XoverDiagram, EngineDiagram, HaasDiagram, MonoDiagram,
  FlowDiagram, KnobGlyph, SegGlyph, ToggleGlyph
} from './PluginOprW1Diagrams'
import './Plugins.css' /* reutiliza .plugin-btn y .plugin-chip */
import './PluginOprW1.css'

const OPR_W1 = PLUGINS.find(plugin => plugin.id === 'opr-w1')
const DAFX_PAPER_URL = 'https://www.dafx.de/paper-archive/2024/papers/DAFx24_paper_92.pdf'

const CONTROLS = [
  { glyph: <KnobGlyph a={0} hot />, name: 'WIDTH LOW / HIGH', range: '0–200 %', desc: 'El ancho de cada banda. 100 % = neutro.' },
  { glyph: <KnobGlyph a={-60} />, name: 'XOVER', range: '100 Hz – 4 kHz', desc: 'La frontera entre graves y agudos.' },
  { glyph: <SegGlyph />, name: 'ENGINE', range: 'M/S · VELVET', desc: 'Cómo se genera la anchura.' },
  { glyph: <KnobGlyph a={-135} />, name: 'HAAS', range: '0–40 ms', desc: 'Micro-retardo en R. Mono-inseguro.', warn: true },
  { glyph: <KnobGlyph a={0} />, name: 'OUTPUT', range: '−12…+12 dB', desc: 'Ganancia de salida.' },
  { glyph: <ToggleGlyph />, name: 'MONO', range: 'on / off', desc: 'Pliega la salida a (L+R)/2.' }
]

function ManualSection ({ num, title, children }) {
  return (
    <section className="opr-man">
      <header className="opr-man__head">
        <span className="opr-man__num">{num}</span>
        <h2 className="opr-man__title">{title}</h2>
      </header>
      {children}
    </section>
  )
}

function PlatformCard ({ download }) {
  return (
    <div className={`opr-platform ${download.available ? '' : 'opr-platform--soon'}`}>
      <FontAwesomeIcon icon={download.icon} className="opr-platform__icon" />
      <span className="opr-platform__name">{download.platform}</span>
      {download.available
        ? (
          <a href={download.url} className="plugin-btn plugin-btn--primary opr-platform__btn">
            <FontAwesomeIcon icon={['fas', 'download']} />
            <span>Descargar .zip</span>
          </a>
          )
        : (
          <span className="plugin-btn opr-platform__btn opr-platform__btn--disabled">
            {download.note}
          </span>
          )}
      {download.platform === 'Linux' && (
        <p className="opr-platform__note">Por ahora, sin interfaz gráfica propia</p>
      )}
    </div>
  )
}

function PluginOprW1 () {
  const tilt = useTilt({ rotateAmplitude: 6, scaleOnHover: 1.02 })

  usePageMeta({
    title: 'OPR-W1 — Ensanchador estéreo',
    description: 'Plugin gratuito de ensanchamiento estéreo en dos bandas (VST3/AU) de Other People Records. Motores M/S y velvet, crossover LR4, Haas y monitor mono.',
    image: OPR_W1.image
  })

  const windows = OPR_W1.downloads.find(d => d.platform === 'Windows')
  const linux = OPR_W1.downloads.find(d => d.platform === 'Linux')

  return (
    <>
      <div className="opr-page">
        {/* ── Hero ── */}
        <header className="opr-hero">
          <div className="opr-hero__inner">
            <Link to="/plugins" className="opr-back">
              <FontAwesomeIcon icon={['fas', 'arrow-left']} />
              <span>Plugins</span>
            </Link>

            <span className="opr-hero__eyebrow">Other People Records · Plugins</span>
            <h1 className="opr-hero__title">OPR-W1</h1>
            <p className="opr-hero__tagline">Ensanchador estéreo de dos bandas</p>
            <p className="opr-hero__sub">
              Graves anclados. Agudos con aire. Y al 100 %, la señal pasa intacta.
            </p>

            <div className="opr-hero__meta">
              <span className="plugin-chip plugin-chip--red">{OPR_W1.version}</span>
              <span className="plugin-chip">{OPR_W1.formats}</span>
              <span className="plugin-chip">Gratis</span>
            </div>

            <div className="opr-hero__actions">
              <a href={windows.url} className="plugin-btn plugin-btn--primary">
                <FontAwesomeIcon icon={['fab', 'windows']} />
                <span>Windows</span>
              </a>
              <a href={linux.url} className="plugin-btn plugin-btn--ghost">
                <FontAwesomeIcon icon={['fab', 'linux']} />
                <span>Linux</span>
              </a>
              <span className="opr-hero__soon">
                <FontAwesomeIcon icon={['fab', 'apple']} />
                macOS próximamente
              </span>
            </div>
          </div>

          <GlassSurface as={motion.figure} {...tilt} className="opr-hero__preview">
            <img src={OPR_W1.image} alt="Interfaz de OPR-W1: dos knobs WIDTH LOW y WIDTH HIGH con rack de controles globales" />
          </GlassSurface>
        </header>

        <div className="opr-body">
          {/* ── 01 · El ancho ── */}
          <ManualSection num="01" title="El ancho">
            <figure className="opr-diagram">
              <FieldDiagram />
            </figure>
            <p className="opr-caption">
              Por debajo del 100 %, el sonido se concentra en el centro.
              Por encima, se despega hacia los lados.
              Al 100 % la señal pasa intacta, bit a bit: déjalo insertado sin miedo.
            </p>
          </ManualSection>

          {/* ── 02 · Dos bandas ── */}
          <ManualSection num="02" title="Dos bandas">
            <figure className="opr-diagram">
              <XoverDiagram />
            </figure>
            <p className="opr-caption">
              Cada banda lleva su propio ancho.
              Graves estrechos: pegada sólida y centrada.
              Agudos anchos: aire.
              XOVER decide dónde está la frontera.
            </p>
          </ManualSection>

          {/* ── 03 · Los mandos ── */}
          <ManualSection num="03" title="Los mandos">
            <ul className="opr-ctl">
              {CONTROLS.map(control => (
                <li key={control.name} className="opr-ctl__item">
                  {control.glyph}
                  <div className="opr-ctl__info">
                    <span className="opr-ctl__name">{control.name}</span>
                    <span className="opr-ctl__range">{control.range}</span>
                    <span className={`opr-ctl__desc ${control.warn ? 'opr-ctl__desc--warn' : ''}`}>
                      {control.desc}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </ManualSection>

          {/* ── 04 · Dos motores ── */}
          <ManualSection num="04" title="Dos motores">
            <div className="opr-engines">
              <figure className="opr-engine">
                <figcaption className="opr-engine__name">M/S</figcaption>
                <EngineDiagram />
                <p className="opr-engine__desc">
                  Transparente. Reordena el estéreo que ya existe; no inventa nada.
                  Sobre una fuente mono, no hace nada.
                </p>
              </figure>
              <figure className="opr-engine">
                <figcaption className="opr-engine__name opr-engine__name--hot">VELVET</figcaption>
                <EngineDiagram widen />
                <p className="opr-engine__desc">
                  Crea estéreo real, incluso desde mono. Colorea un poco.
                </p>
              </figure>
            </div>
            <p className="opr-caption">
              Por debajo del 100 % son idénticos.
              Y el cambio entre ambos es un fundido continuo: automatízalo desde tu DAW.
            </p>
          </ManualSection>

          {/* ── 05 · Haas ── */}
          <ManualSection num="05" title="Haas">
            <figure className="opr-diagram">
              <HaasDiagram />
            </figure>
            <p className="opr-caption">
              Hasta 40 ms de retardo, solo en el canal derecho.
              Anchura extrema — al precio de perderse en mono.
              Úsalo con oído.
            </p>
          </ManualSection>

          {/* ── 06 · La prueba del mono ── */}
          <ManualSection num="06" title="La prueba del mono">
            <figure className="opr-diagram">
              <MonoDiagram />
            </figure>
            <p className="opr-caption">
              Pulsa MONO y escucha por un solo altavoz.
              ¿Sobrevive la mezcla? El ensanchado es sano.
            </p>
          </ManualSection>

          {/* ── 07 · Bajo el capó ── */}
          <ManualSection num="07" title="Bajo el capó">
            <figure className="opr-diagram opr-diagram--scroll">
              <FlowDiagram />
            </figure>
            <p className="opr-caption">
              Crossover Linkwitz-Riley de 4º orden: parte la señal y la recompone
              con respuesta plana.
              VELVET decorrela con ~15 impulsos deterministas en 15 ms — suena igual
              en cada carga.
              Todos los parámetros van suavizados: nada de zipper noise.
            </p>
            <p className="opr-caption">
              Basado en el{' '}
              <a href={DAFX_PAPER_URL} target="_blank" rel="noopener noreferrer">
                paper de DAFx24 de Orchisama Das
              </a>.
            </p>
          </ManualSection>

          {/* ── 08 · Descargas ── */}
          <ManualSection num="08" title="Descargas">
            <div className="opr-platforms" id="descargas">
              {OPR_W1.downloads.map(download => (
                <PlatformCard key={download.platform} download={download} />
              ))}
            </div>
            <p className="opr-caption">
              Descomprime y copia <code>OPR-W1.vst3</code> a{' '}
              <code>C:\Program Files\Common Files\VST3</code> (Windows) o{' '}
              <code>~/.vst3</code> (Linux). Re-escanea plugins en tu DAW.
            </p>
            <p className="opr-warning">
              <FontAwesomeIcon icon={['fas', 'exclamation-triangle']} />
              En Linux suena exactamente igual, pero de momento abre con el editor
              genérico de JUCE. La interfaz REDLINE llegará.
            </p>
          </ManualSection>

          {/* ── 09 · Donaciones ── */}
          <ManualSection num="09" title="Apoya el proyecto">
            <p className="opr-caption">
              OPR-W1 es gratis y lo seguirá siendo.
              Si te sirve en tus mezclas, invítanos a un café.
            </p>
            <a
              href={DONATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="plugin-btn plugin-btn--primary"
            >
              <FontAwesomeIcon icon={['fab', 'paypal']} />
              <span>Hacer una donación</span>
            </a>
            <p className="opr-roadmap">
              cada donación acelera lo que viene: correlómetro · goniómetro · motor allpass · GUI en Linux
            </p>
          </ManualSection>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default PluginOprW1
