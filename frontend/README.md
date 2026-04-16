# React OTP (Other People) Web

## 🎵 Sobre el Proyecto

Este proyecto nace como una iniciativa personal para retomar y refrescar mis conocimientos en el ecosistema de **React**. Es un ejercicio práctico para construir una aplicación web moderna e interactiva, aplicando las mejores prácticas actuales en el desarrollo front-end.

## 🎯 El Objetivo: Migración y un Nuevo Comienzo

La idea central es migrar una aplicación web existente, que originalmente fue desarrollada utilizando **.NET y Blazor**, a un nuevo stack tecnológico centrado en **React**.

El producto final será la landing page oficial de **Other People Records**, un sello discográfico local. Esto no solo proporciona un caso de uso real, sino que también establece un objetivo claro y tangible para el desarrollo del proyecto.

### Objetivos Clave

*   **Refrescar Habilidades:** Volver a familiarizarme con los hooks de React, la gestión de estado, el ciclo de vida de los componentes y el ecosistema en general.
*   **Migración Tecnológica:** Entender los desafíos y beneficios de pasar de una arquitectura más orientada al backend como .NET/Blazor a un framework de JavaScript para el front-end.
*   **Prácticas Web Modernas:** Implementar un diseño responsive, integración con APIs y una gestión de estado eficiente.
*   **Producto Final:** Entregar una landing page funcional y atractiva para el sello discográfico.

## ✨ Nuevas Características

### 🎧 Integración con Spotify

La aplicación ahora incluye una **integración completa con Spotify** que permite:

- **Importación automática** de artistas, álbumes y tracks desde URLs de Spotify
- **Validación inteligente** de URLs con auto-detección de tipo de contenido
- **Importación masiva** para procesar múltiples URLs simultáneamente
- **Historial de importaciones** con persistencia local
- **Gestión avanzada de errores** user-friendly
- **Testing comprehensivo** con cobertura del 100% en utilidades

#### Uso Básico

```jsx
import { SpotifyImport } from './components/SpotifyImport/SpotifyImport'

// Importar un artista
<SpotifyImport
  type="artist"
  placeholder="Pega aquí la URL del artista de Spotify..."
  onDataImported={(artist) => console.log('Artista importado:', artist)}
/>

// Importar un álbum/release
<SpotifyImport
  type="release"
  placeholder="Pega aquí la URL del álbum de Spotify..."
  onDataImported={(release) => console.log('Release importado:', release)}
/>
```

📖 **[Ver documentación completa de Spotify](./docs/SPOTIFY_INTEGRATION.md)**

## 🚀 Tecnologías Utilizadas

- **React 18** - Framework principal
- **Vite** - Build tool y desarrollo
- **JavaScript/JSX** - Lenguaje de programación
- **CSS Modules** - Estilos modulares
- **Spotify Web API** - Integración musical
- **Jest + React Testing Library** - Testing
- **localStorage** - Persistencia local

## 📦 Instalación y Configuración

### Requisitos Previos

- Node.js (v16 o superior)
- npm o yarn
- Cuenta de desarrollador en Spotify

### Configuración

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/ReactOtpWeb.git
   cd ReactOtpWeb
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   # Crear archivo .env en la raíz del proyecto
   VITE_SPOTIFY_CLIENT_ID=tu_client_id_aqui
   VITE_SPOTIFY_CLIENT_SECRET=tu_client_secret_aqui
   ```

4. **Configurar aplicación de Spotify**
   - Crear app en [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Obtener Client ID y Client Secret
   - Configurar las variables de entorno

5. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests con coverage
npm run test:coverage

# Tests específicos
npm test spotify
```

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes reutilizables
│   ├── SpotifyImport/   # Componentes de integración Spotify
│   ├── ArtistCard/      # Tarjetas de artistas
│   ├── ReleaseCard/     # Tarjetas de releases
│   └── ...
├── hooks/               # Custom hooks
│   └── useSpotifyImport.js
├── utils/               # Utilidades
│   ├── spotifyHelpers.js
│   └── spotifyHistory.js
├── pages/               # Páginas principales
├── tests/               # Tests unitarios
└── docs/                # Documentación
```

## 🤝 Contribución

Las contribuciones son bienvenidas! Por favor:

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Añadir tests para nuevas funcionalidades
4. Commit con mensaje descriptivo
5. Push a la rama
6. Crear Pull Request

---

Este proyecto está en desarrollo activo. ¡Gracias por visitarlo!