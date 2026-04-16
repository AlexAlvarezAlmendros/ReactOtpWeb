import { useState, useEffect, useRef } from 'react'
import { SkeletonImage } from '../Skeleton/Skeleton'
import './LazyImage.css'

export function LazyImage ({ 
  src, 
  alt, 
  className = '', 
  aspectRatio = '1/1',
  ...props 
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef(null)

  useEffect(() => {
    if (!imgRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '50px' // Cargar la imagen 50px antes de que sea visible
      }
    )

    observer.observe(imgRef.current)

    return () => {
      if (observer) observer.disconnect()
    }
  }, [])

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
  }

  return (
    <div 
      ref={imgRef} 
      className={`lazy-image-container ${className}`}
      style={{ aspectRatio }}
    >
      {isLoading && <SkeletonImage />}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`lazy-image ${isLoading ? 'loading' : 'loaded'}`}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
    </div>
  )
}

export default LazyImage
