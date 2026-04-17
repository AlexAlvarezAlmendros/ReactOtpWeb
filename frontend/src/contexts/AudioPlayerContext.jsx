import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react'

const AudioPlayerContext = createContext(null)

export function AudioPlayerProvider({ children }) {
  const [currentPlaying, setCurrentPlaying] = useState(null)
  const [playlist, setPlaylistState] = useState([])
  const audioRefs = useRef({})
  const metadataRefs = useRef({})
  const playlistRef = useRef([])
  const currentPlayingRef = useRef(null)
  const endedListeners = useRef({})

  // Mantener refs sincronizados con el estado
  useEffect(() => {
    playlistRef.current = playlist
  }, [playlist])

  useEffect(() => {
    currentPlayingRef.current = currentPlaying
  }, [currentPlaying])

  const setPlaylist = useCallback((newPlaylist) => {
    setPlaylistState(newPlaylist)
    playlistRef.current = newPlaylist
  }, [])

  // Actualizar Media Session API con los metadatos del beat actual
  const updateMediaSession = useCallback((beatId) => {
    if (!('mediaSession' in navigator)) return

    const meta = metadataRefs.current[beatId]
    if (!meta) return

    const artwork = meta.artwork
      ? [{ src: meta.artwork, sizes: '512x512', type: 'image/jpeg' }]
      : []

    navigator.mediaSession.metadata = new MediaMetadata({
      title: meta.title || 'Beat',
      artist: meta.artist || 'OTP Records',
      album: 'OTP Records Beats',
      artwork
    })

    // Controles de la notificación — usan refs para evitar dependencias circulares
    navigator.mediaSession.setActionHandler('play', () => {
      const current = currentPlayingRef.current
      if (current) {
        const el = audioRefs.current[current]
        if (el) { el.play(); setCurrentPlaying(current); currentPlayingRef.current = current }
      }
    })

    navigator.mediaSession.setActionHandler('pause', () => {
      const current = currentPlayingRef.current
      if (current) {
        const el = audioRefs.current[current]
        if (el) el.pause()
        setCurrentPlaying(null)
        currentPlayingRef.current = null
      }
    })

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      const list = playlistRef.current
      const current = currentPlayingRef.current
      const idx = list.indexOf(current)
      if (idx > 0) {
        const prevId = list[idx - 1]
        if (audioRefs.current[prevId]) {
          // Pausar actual
          Object.entries(audioRefs.current).forEach(([id, el]) => {
            if (id !== prevId && el) { el.pause(); el.currentTime = 0 }
          })
          audioRefs.current[prevId].play()
          setCurrentPlaying(prevId)
          currentPlayingRef.current = prevId
          updateMediaSession(prevId)
        }
      }
    })

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      const list = playlistRef.current
      const current = currentPlayingRef.current
      const idx = list.indexOf(current)
      if (idx !== -1 && idx < list.length - 1) {
        const nextId = list[idx + 1]
        if (audioRefs.current[nextId]) {
          Object.entries(audioRefs.current).forEach(([id, el]) => {
            if (id !== nextId && el) { el.pause(); el.currentTime = 0 }
          })
          audioRefs.current[nextId].play()
          setCurrentPlaying(nextId)
          currentPlayingRef.current = nextId
          updateMediaSession(nextId)
        }
      }
    })
  }, [])

  const playAudioInternal = useCallback((beatId) => {
    // Pausar y resetear todos los demás audios
    Object.entries(audioRefs.current).forEach(([id, audioElement]) => {
      if (id !== beatId && audioElement) {
        audioElement.pause()
        audioElement.currentTime = 0
      }
    })

    // Reproducir el audio seleccionado
    const audioElement = audioRefs.current[beatId]
    if (audioElement) {
      audioElement.play()
      setCurrentPlaying(beatId)
      currentPlayingRef.current = beatId
      updateMediaSession(beatId)
    }
  }, [updateMediaSession])

  // Reproducir el siguiente beat de la playlist
  const handleAudioEnded = useCallback((beatId) => {
    const list = playlistRef.current
    const currentIndex = list.indexOf(beatId)

    if (currentIndex !== -1 && currentIndex < list.length - 1) {
      const nextBeatId = list[currentIndex + 1]
      if (audioRefs.current[nextBeatId]) {
        playAudioInternal(nextBeatId)
        return
      }
    }

    // Último beat o no hay playlist: parar
    setCurrentPlaying(null)
    currentPlayingRef.current = null
  }, [playAudioInternal])

  const registerAudio = useCallback((beatId, audioElement, metadata = {}) => {
    // Limpiar listener anterior si existía
    if (endedListeners.current[beatId] && audioRefs.current[beatId]) {
      audioRefs.current[beatId].removeEventListener('ended', endedListeners.current[beatId])
    }

    audioRefs.current[beatId] = audioElement
    metadataRefs.current[beatId] = metadata

    // Añadir listener para auto-play del siguiente beat
    const onEnded = () => handleAudioEnded(beatId)
    endedListeners.current[beatId] = onEnded
    audioElement.addEventListener('ended', onEnded)
  }, [handleAudioEnded])

  const unregisterAudio = useCallback((beatId) => {
    const audioElement = audioRefs.current[beatId]
    if (audioElement && endedListeners.current[beatId]) {
      audioElement.removeEventListener('ended', endedListeners.current[beatId])
    }
    delete endedListeners.current[beatId]
    delete audioRefs.current[beatId]
    delete metadataRefs.current[beatId]
  }, [])

  const pauseAudio = useCallback((beatId) => {
    const audioElement = audioRefs.current[beatId]
    if (audioElement) {
      audioElement.pause()
    }
    if (currentPlayingRef.current === beatId) {
      setCurrentPlaying(null)
      currentPlayingRef.current = null
    }
  }, [])

  const stopAllAudio = useCallback(() => {
    Object.values(audioRefs.current).forEach(audioElement => {
      if (audioElement) {
        audioElement.pause()
        audioElement.currentTime = 0
      }
    })
    setCurrentPlaying(null)
    currentPlayingRef.current = null
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = null
    }
  }, [])

  return (
    <AudioPlayerContext.Provider
      value={{
        currentPlaying,
        playlist,
        setPlaylist,
        registerAudio,
        unregisterAudio,
        playAudio: playAudioInternal,
        pauseAudio,
        stopAllAudio
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  )
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext)
  if (!context) {
    throw new Error('useAudioPlayer must be used within AudioPlayerProvider')
  }
  return context
}
