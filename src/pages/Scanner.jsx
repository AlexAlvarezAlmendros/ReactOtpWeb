import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useUser } from '../hooks/useUser';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import './Scanner.css';

function Scanner () {
  const { canValidateTickets, loading } = useUser()
  const navigate = useNavigate()
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!loading && !canValidateTickets) {
      navigate('/') // Redirige si no tiene permisos
    }
  }, [canValidateTickets, loading, navigate])

  useEffect(() => {
    if (!canValidateTickets || loading) return

    let scanner = null
    let isActive = true // Flag para evitar updates después del cleanup

    // Función para extraer código de la URL del QR
    const extractCodeFromUrl = (url) => {
      try {
        // Esperamos URLs como: https://tuapp.com/ticket/{code}
        const parts = url.split('/')
        const code = parts[parts.length - 1]
        return code || null
      } catch (err) {
        console.error('Error extrayendo código:', err)
        return null
      }
    }

    const onScanSuccess = (decodedText) => {
      if (!isActive) return // Evitar procesamiento después del cleanup
      
      console.log('QR escaneado:', decodedText)
      
      // Detener el scanner
      if (scanner) {
        scanner.clear().catch(console.error)
      }
      setScanning(false)

      // Extraer el código del QR
      const code = extractCodeFromUrl(decodedText)
      
      if (code) {
        navigate(`/ticket/${code}`)
      } else {
        setError('QR inválido. No se pudo extraer el código.')
      }
    }

    const onScanError = (err) => {
      // Ignorar errores de escaneo normales (cuando no detecta QR)
      if (err.includes && err.includes('NotFoundException')) return
      // No loguear errores normales para evitar spam en consola
    }

    const initScanner = () => {
      if (!isActive) return // No iniciar si ya se desmontó
      
      try {
        scanner = new Html5QrcodeScanner(
          'qr-reader',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
            showZoomSliderIfSupported: true
          },
          false
        )

        scanner.render(onScanSuccess, onScanError)
        if (isActive) {
          setScanning(true)
        }
      } catch (err) {
        console.error('Error iniciando scanner:', err)
        if (isActive) {
          setError('Error al iniciar el scanner. Verifica los permisos de cámara.')
        }
      }
    }

    initScanner()

    // Cleanup al desmontar
    return () => {
      isActive = false
      if (scanner) {
        scanner.clear().catch(console.error)
      }
    }
  }, [canValidateTickets, loading, navigate])

  if (loading) return <LoadingSpinner />

  if (!canValidateTickets) {
    return (
      <div className='scanner-access-denied'>
        <h1>Acceso Denegado</h1>
        <p>No tienes permisos para acceder al scanner.</p>
        <button onClick={() => navigate('/')}>Volver al inicio</button>
      </div>
    )
  }

  return (
    <div className='scanner-page'>
      <div className='scanner-container'>
        <h1>🎫 Escanear Entrada</h1>
        <p className='scanner-instructions'>
          Apunta la cámara al código QR del ticket
        </p>

        {error && (
          <div className='scanner-error'>
            <p>{error}</p>
          </div>
        )}

        <div id='qr-reader' className='qr-reader' />

        {scanning && (
          <div className='scanner-status'>
            <div className='scanning-animation' />
            <p>Buscando código QR...</p>
          </div>
        )}

        <button
          onClick={() => navigate('/')}
          className='btn-back-scanner'
        >
          Volver al inicio
        </button>
      </div>
    </div>
  )
}

export default Scanner
