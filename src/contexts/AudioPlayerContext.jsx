import { createContext, useContext, useState, useRef, useCallback } from 'react'

const AudioPlayerContext = createContext(null)

export function AudioPlayerProvider({ children }) {
  const [currentPlaying, setCurrentPlaying] = useState(null)
  const audioRefs = useRef({})

  const registerAudio = useCallback((beatId, audioElement) => {
    audioRefs.current[beatId] = audioElement
  }, [])

  const unregisterAudio = useCallback((beatId) => {
    delete audioRefs.current[beatId]
  }, [])

  const playAudio = useCallback((beatId) => {
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
    }
  }, [])

  const pauseAudio = useCallback((beatId) => {
    const audioElement = audioRefs.current[beatId]
    if (audioElement) {
      audioElement.pause()
    }
    if (currentPlaying === beatId) {
      setCurrentPlaying(null)
    }
  }, [currentPlaying])

  const stopAllAudio = useCallback(() => {
    Object.values(audioRefs.current).forEach(audioElement => {
      if (audioElement) {
        audioElement.pause()
        audioElement.currentTime = 0
      }
    })
    setCurrentPlaying(null)
  }, [])

  return (
    <AudioPlayerContext.Provider
      value={{
        currentPlaying,
        registerAudio,
        unregisterAudio,
        playAudio,
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
