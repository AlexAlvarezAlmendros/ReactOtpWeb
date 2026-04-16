/**
 * Ejemplo de configuración de Beat con Licencias
 * 
 * Este archivo muestra cómo configurar un beat con las tres licencias
 * para que el sistema de generación de licencias funcione correctamente.
 */

const exampleBeat = {
    title: "Dark Trap Beat",
    bpm: 140,
    key: "Am",
    genre: "Trap",
    tags: ["dark", "trap", "aggressive", "808"],
    price: 9.99, // Precio base (opcional si tienes licenses)
    audioUrl: "https://example.com/preview/dark-trap-beat.mp3",
    coverUrl: "https://example.com/covers/dark-trap-beat.jpg",
    producer: "ObjectId('507f1f77bcf86cd799439011')", // ID del artista/productor
    active: true,
    
    // 🎫 LICENCIAS - Importante para la generación automática de PDFs
    licenses: [
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 📄 LICENCIA BÁSICA
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        {
            id: "basic-license-001",
            name: "Licencia Básica", // ⚠️ Importante: debe incluir "Básica" o "Basic"
            price: 29.99,
            description: "Perfecta para artistas emergentes y uso no comercial limitado",
            formats: ["MP3", "WAV"],
            files: {
                mp3Url: "https://example.com/files/dark-trap-beat-mp3.zip",
                wavUrl: "https://example.com/files/dark-trap-beat-wav.zip",
                stemsUrl: null
            },
            terms: {
                usedForRecording: true,
                distributionLimit: 2000, // Copias distribuidas
                audioStreams: 50000, // Streams permitidos
                musicVideos: 1, // Videos musicales
                forProfitPerformances: false, // Actuaciones con ánimo de lucro
                radioBroadcasting: 0 // Sin radio
            }
        },
        
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 📄 LICENCIA PREMIUM
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        {
            id: "premium-license-001",
            name: "Licencia Premium", // ⚠️ Importante: debe incluir "Premium"
            price: 99.99,
            description: "Para artistas profesionales con proyectos comerciales serios",
            formats: ["MP3", "WAV"],
            files: {
                mp3Url: "https://example.com/files/dark-trap-beat-mp3.zip",
                wavUrl: "https://example.com/files/dark-trap-beat-wav.zip",
                stemsUrl: null
            },
            terms: {
                usedForRecording: true,
                distributionLimit: 10000, // Copias físicas
                audioStreams: 500000, // Streams permitidos
                musicVideos: 1, // Videos monetizados
                forProfitPerformances: true, // Actuaciones con ánimo de lucro ✅
                radioBroadcasting: 1 // Radiodifusión permitida ✅
            }
        },
        
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 📄 LICENCIA UNLIMITED (CON STEMS)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        {
            id: "unlimited-license-001",
            name: "Licencia Unlimited", // ⚠️ Importante: debe incluir "Unlimited" o "Ilimitada"
            price: 299.99,
            description: "Máxima flexibilidad con stems para máxima creatividad",
            formats: ["MP3", "WAV", "STEMS"], // Incluye stems
            files: {
                mp3Url: "https://example.com/files/dark-trap-beat-mp3.zip",
                wavUrl: "https://example.com/files/dark-trap-beat-wav.zip",
                stemsUrl: "https://example.com/files/dark-trap-beat-stems.zip" // ✅ Stems incluidos
            },
            terms: {
                usedForRecording: true,
                distributionLimit: 0, // ILIMITADO
                audioStreams: 0, // ILIMITADO
                musicVideos: 0, // ILIMITADO
                forProfitPerformances: true, // ✅ Sí
                radioBroadcasting: 0 // ILIMITADO (0 = ilimitado)
            }
        }
    ]
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 MAPEO AUTOMÁTICO DE TIERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * El sistema automáticamente mapea el nombre de la licencia al tier:
 * 
 * "Licencia Básica"    → "Basic"
 * "Licencia Premium"   → "Premium"
 * "Licencia Unlimited" → "Unlimited"
 * 
 * También funciona con:
 * - "Basic License"
 * - "Premium License"
 * - "Unlimited License"
 * - "Licencia Ilimitada"
 * 
 * ⚠️ Si el nombre no coincide, se asignará "Basic" por defecto.
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📝 NOTAS IMPORTANTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 1. NOMBRES DE LICENCIAS:
 *    Deben incluir keywords: "básica", "premium", o "unlimited"
 *    
 * 2. ARCHIVOS REQUERIDOS:
 *    - Todas las licencias: mp3Url y wavUrl
 *    - Unlimited: stemsUrl (opcional pero recomendado)
 *    
 * 3. TÉRMINOS (terms):
 *    - 0 significa ILIMITADO
 *    - Número específico = límite exacto
 *    
 * 4. PDF GENERADO INCLUIRÁ:
 *    ✅ Número de licencia único
 *    ✅ Términos legales completos
 *    ✅ Limitaciones específicas
 *    ✅ QR code para verificación
 *    ✅ Hash de documento
 *    
 * 5. EMAIL ENVIADO CONTENDRÁ:
 *    ✅ Enlaces de descarga de archivos
 *    ✅ PDF de licencia adjunto
 *    ✅ Número de licencia visible
 *    ✅ Términos resumidos
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 EJEMPLO DE CREACIÓN VÍA API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const createBeatExample = async () => {
    const response = await fetch('http://localhost:5001/api/beats', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_AUTH_TOKEN' // Si usas Auth0
        },
        body: JSON.stringify(exampleBeat)
    });
    
    const beat = await response.json();
    console.log('✅ Beat creado:', beat._id);
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎉 FLUJO COMPLETO DE COMPRA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 1. Usuario selecciona beat y licencia
 * 2. POST /api/beats/checkout-session
 *    → Crea sesión de Stripe
 * 
 * 3. Usuario paga en Stripe
 * 
 * 4. Stripe Webhook → /api/beats/webhook
 *    ✅ Guarda Purchase en BD
 *    ✅ Emite licencia (IssuedLicense)
 *    ✅ Genera PDF con todos los términos
 *    ✅ Envía email con archivos + PDF
 * 
 * 5. Usuario recibe email con:
 *    📧 Confirmación de compra
 *    🔽 Enlaces de descarga (MP3/WAV/STEMS)
 *    📄 PDF de licencia adjunto
 *    🔢 Número de licencia: LILBRU-2026-000123
 * 
 * 6. PDF incluye:
 *    📋 Todos los términos legales
 *    📊 Límites específicos del tier
 *    🔐 Hash y QR para verificación
 *    ⚖️ Jurisdicción y derechos
 */

module.exports = { exampleBeat };
