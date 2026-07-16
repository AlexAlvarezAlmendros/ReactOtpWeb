import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { motion } from 'motion/react'
import GlassSurface from '../components/GlassSurface'
import Footer from '../components/Footer/Footer'
import { useTilt } from '../hooks/useTilt'
import { usePageMeta } from '../hooks/usePageMeta'
import { PLUGINS, PLUGINS_REPO_URL } from '../data/plugins'
import './Plugins.css' /* reutiliza .plugin-btn y .plugin-chip */
import './PluginOprW1.css'

const OPR_W1 = PLUGINS.find(plugin => plugin.id === 'opr-w1')
const DAFX_PAPER_URL = 'https://www.dafx.de/paper-archive/2024/papers/DAFx24_paper_92.pdf'

const CONTROLS = [
  { control: 'WIDTH LOW / WIDTH HIGH', range: '0–200 % (100 % = neutro)', what: 'El ancho de cada banda' },
  { control: 'XOVER', range: '100–4000 Hz (log)', what: 'La frontera entre graves y agudos' },
  { control: 'ENGINE', range: 'M/S · VELVET', what: 'Cómo se genera la anchura' },
  { control: 'HAAS', range: '0–40 ms', what: 'Micro-retardo en el canal derecho. Mono-inseguro' },
  { control: 'OUTPUT', range: '−12…+12 dB', what: 'Ganancia de salida' },
  { control: 'MONO', range: 'on/off', what: 'Pliega la salida a (L+R)/2 para comprobar compatibilidad' }
]

const DONE = [
  'Dos bandas con crossover Linkwitz-Riley de 4º orden',
  'Motores de anchura M/S y VELVET',
  'Haas y monitor mono',
  'GUI REDLINE con manual integrado',
  '11 tests de DSP en verde'
]

const PENDING = [
  'Protección de transitorios y motor allpass: diseñados, sin implementar',
  'Correlómetro y goniómetro: necesitan un puente de metering nativo → UI',
  'Tipografías D-DIN / JetBrains Mono sin empaquetar — la UI cae al mono del sistema',
  'Interfaz gráfica en Linux: de momento carga con el editor genérico de JUCE'
]

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
        <p className="opr-platform__note">Sin interfaz gráfica propia, por ahora</p>
      )}
    </div>
  )
}

function PluginOprW1 () {
  const tilt = useTilt({ rotateAmplitude: 6, scaleOnHover: 1.02 })

  usePageMeta({
    title: 'OPR-W1 — Ensanchador estéreo',
    description: 'Plugin gratuito de ensanchamiento estéreo en dos bandas (VST3/AU) de Other People Records. Motores M/S y velvet, crossover LR4, Haas y monitor mono. Código abierto bajo GPLv3.',
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
            <p className="opr-hero__tagline">Plugin de ensanchamiento estéreo — antes «Ancho»</p>
            <p className="opr-hero__sub">
              DSP en JavaScript con Elementary Audio, GUI en React, shell JUCE.
              Basado en la plantilla SRVB de Elementary.
            </p>

            <div className="opr-hero__meta">
              <span className="plugin-chip plugin-chip--red">{OPR_W1.version}</span>
              <span className="plugin-chip">{OPR_W1.formats}</span>
              <span className="plugin-chip">{OPR_W1.license}</span>
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
          {/* ── Qué hace ── */}
          <section className="opr-section">
            <h2 className="opr-section__title"><span>01</span> Qué hace</h2>
            <p>
              OPR-W1 controla cuánto se abre el sonido entre los altavoces. Por debajo
              del 100 % lo concentra en el centro; por encima lo despega hacia los lados.
              La regla de diseño es que al 100 % la señal pasa intacta: el plugin puede
              quedarse insertado sin colorear nada, y a partir de ahí abres o cierras.
            </p>
            <p>
              Lo que lo separa de un widener trivial es que no aplica una anchura única a
              todo el espectro: parte la señal en dos bandas y cada una lleva su propio
              ancho — graves estrechos para que la pegada quede sólida y centrada, agudos
              anchos para dar aire. Basado en el{' '}
              <a href={DAFX_PAPER_URL} target="_blank" rel="noopener noreferrer">
                paper de DAFx24 de Orchisama Das
              </a>.
            </p>
          </section>

          {/* ── Características ── */}
          <section className="opr-section">
            <h2 className="opr-section__title"><span>02</span> Características</h2>
            <div className="opr-table-wrap">
              <table className="opr-table">
                <thead>
                  <tr>
                    <th>Control</th>
                    <th>Rango</th>
                    <th>Qué es</th>
                  </tr>
                </thead>
                <tbody>
                  {CONTROLS.map(row => (
                    <tr key={row.control}>
                      <td className="opr-table__control">{row.control}</td>
                      <td className="opr-table__range">{row.range}</td>
                      <td>{row.what}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Motores ── */}
          <section className="opr-section">
            <h2 className="opr-section__title"><span>03</span> Dos motores de anchura</h2>
            <div className="opr-engines">
              <GlassSurface as="article" className="opr-engine">
                <h3>M/S</h3>
                <p>
                  Sube el canal Side. Transparente: reordena el estéreo que ya existe
                  pero no inventa nada. Sobre una fuente mono no hace nada, porque no
                  hay Side que subir.
                </p>
              </GlassSurface>
              <GlassSurface as="article" className="opr-engine">
                <h3>VELVET</h3>
                <p>
                  Decorrelación por ruido velvet. Crea estéreo real incluso desde mono,
                  a cambio de algo de coloración.
                </p>
              </GlassSurface>
            </div>
            <p>
              Por debajo del 100 % los dos motores son idénticos: el motor solo entra en
              juego al ensanchar. Y aunque la UI ofrece dos botones, por dentro es un
              fundido continuo, así que el host puede automatizarlo y quedarse a medio camino.
            </p>
            <p>
              El monitor mono es la red de seguridad: si la mezcla sobrevive plegada a un
              solo altavoz, el ensanchado es sano. La UI incluye un manual integrado
              (botón ?) de cuatro páginas ilustradas.
            </p>
          </section>

          {/* ── Cómo funciona ── */}
          <section className="opr-section">
            <h2 className="opr-section__title"><span>04</span> Cómo funciona</h2>
            <pre className="opr-flow">
{`in L/R → Haas (retardo en R) → crossover LR4 → widen por banda → suma → gain → monitor mono
                             ↘ decorrelador velvet → crossover LR4 ↗`}
            </pre>
            <p>
              El crossover es un Linkwitz-Riley de 4º orden (dos Butterworth en cascada,
              Q = 1/√2). Es la elección correcta porque las dos bandas vuelven a sumarse:
              un LR4 suma con magnitud plana, así que partir la señal y recomponerla no
              deja baches en la respuesta.
            </p>
            <p>
              El motor M/S convierte a Mid/Side y multiplica el Side por el ancho: a 0 %
              el Side desaparece (mono puro), a 100 % queda intacto, a 200 % se dobla.
            </p>
            <p>
              El motor VELVET decorrela con una convolución dispersa: ~15 impulsos
              repartidos en 15 ms, concentrados al principio, con signos ±1 aleatorios y
              decayendo hasta −60 dB. Al ser impulsos aislados en vez de ruido denso,
              decorrela sin sonar a reverb. Cada canal usa una semilla distinta: es la
              baja correlación entre ambas secuencias lo que abre el estéreo. Las semillas
              son deterministas, así que el plugin suena igual en cada carga y la mezcla
              de ayer sigue siendo la de hoy.
            </p>
            <p>
              Al pasar de 100 %, VELVET funde hacia la señal decorrelada con ley sin/cos,
              que preserva la energía — un crossfade lineal dejaría un bache de volumen a
              mitad de recorrido. Ojo con un detalle práctico: al 200 % el fundido llega
              al final y la señal original desaparece por completo; lo que sale es solo
              el decorrelador.
            </p>
            <p>
              Todos los parámetros van suavizados (~20 ms) antes de entrar al grafo: los
              saltos crudos del host producirían zipper noise.
            </p>
          </section>

          {/* ── Estado ── */}
          <section className="opr-section">
            <h2 className="opr-section__title"><span>05</span> Estado</h2>
            <div className="opr-status">
              <div className="opr-status__col">
                <h3>Funcional</h3>
                <ul>
                  {DONE.map(item => (
                    <li key={item}>
                      <FontAwesomeIcon icon={['fas', 'check']} className="opr-status__icon opr-status__icon--ok" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="opr-status__col">
                <h3>Pendiente</h3>
                <ul>
                  {PENDING.map(item => (
                    <li key={item}>
                      <FontAwesomeIcon icon={['fas', 'clock']} className="opr-status__icon" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* ── Descargas ── */}
          <section className="opr-section" id="descargas">
            <h2 className="opr-section__title"><span>06</span> Descargas</h2>
            <div className="opr-platforms">
              {OPR_W1.downloads.map(download => (
                <PlatformCard key={download.platform} download={download} />
              ))}
            </div>
            <p className="opr-install">
              Descomprime el .zip y copia <code>OPR-W1.vst3</code> a la carpeta VST3 de
              tu sistema — <code>C:\Program Files\Common Files\VST3</code> en Windows,{' '}
              <code>~/.vst3</code> en Linux — y vuelve a escanear plugins en tu DAW.
            </p>
            <p className="opr-warning">
              <FontAwesomeIcon icon={['fas', 'exclamation-triangle']} />
              En Linux el plugin procesa audio con normalidad, pero de momento se abre
              con el editor genérico de JUCE: la interfaz REDLINE solo está disponible
              en Windows (y macOS cuando llegue).
            </p>
          </section>

          {/* ── Licencia ── */}
          <section className="opr-section">
            <h2 className="opr-section__title"><span>07</span> Licencia y código</h2>
            <p>
              OPR-W1 es software libre bajo licencia GPLv3. El código de la plantilla
              original SRVB es MIT © 2023 Nick Thompson; JUCE y el SDK VST3 imponen
              GPLv3 al binario distribuido.
            </p>
            <a
              href={PLUGINS_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="plugin-btn plugin-btn--ghost"
            >
              <FontAwesomeIcon icon={['fab', 'github']} />
              <span>Código fuente</span>
            </a>
          </section>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default PluginOprW1
