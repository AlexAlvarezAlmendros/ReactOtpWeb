import './CreateCard.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function CreateCard () {
  return (
    <>
    <button className='create-card' aria-label='Crear nueva tarjeta'>
        <FontAwesomeIcon icon={['fas', 'plus']} />
    </button>

    <div className='createCardModal'>
        <h2>Crear nueva tarjeta</h2>
        <div className='createCardModal__buttons'>
            <button>Nuevo Release</button>
            <button>Nuevo Artista</button>
            <button>Nuevo Evento</button>
            <button>Nuevo Estudio</button>
        </div>
        <section>
            <form className="createCardModal__form">
        <div className="form-group">
            <label htmlFor='title'>Título</label>
            <input type='text' id='title' name='title' required />
        </div>

        <div className="form-group">
            <label htmlFor='artist'>Artista</label>
            <input type='text' id='artist' name='artist' required />
        </div>

        <div className="form-group">
            <label htmlFor='img'>Imagen URL</label>
            <input type='url' id='img' name='img' required />
        </div>

        <div className="form-group">
            <label htmlFor='spotify'>Spotify URL</label>
            <input type='url' id='spotify' name='spotify' required />
        </div>

        <div className="form-group">
            <label htmlFor='youtube'>Youtube URL</label>
            <input type='url' id='youtube' name='youtube' required />
        </div>

        <div className="form-group">
            <label htmlFor='apple'>Apple URL</label>
            <input type='url' id='apple' name='apple' required />
        </div>

        <div className="form-group">
            <label htmlFor='instagram'>Instagram URL</label>
            <input type='url' id='instagram' name='instagram' required />
        </div>

        <div className="form-group">
            <label htmlFor='soundcloud'>SoundCloud URL</label>
            <input type='url' id='soundcloud' name='soundcloud' required />
        </div>

        <div className="form-group form-group--full-width">
            <label htmlFor='type'>Tipo</label>
            <select id='type' name='type' required>
                <option value=''>Seleccione un tipo</option>
                <option value='song'>Song</option>
                <option value='album'>Album</option>
                <option value='ep'>EP</option>
                <option value='videoclip'>Videoclip</option>
            </select>
        </div>

        <button type='submit' className="form-submit">Crear Tarjeta</button>
    </form>
        </section>
    </div>
    </>
  )
}
