---
applyTo: '**'
---
# Arquitectura Técnica - ReactOtpWeb

## 📋 Índice
1. [Stack Tecnológico](#stack-tecnológico)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Arquitectura de Componentes](#arquitectura-de-componentes)
4. [Gestión de Estado](#gestión-de-estado)
5. [Routing y Navegación](#routing-y-navegación)
6. [Autenticación y Autorización](#autenticación-y-autorización)
7. [Integración con APIs](#integración-con-apis)
8. [Testing](#testing)
9. [Build y Deployment](#build-y-deployment)
10. [Buenas Prácticas](#buenas-prácticas)
11. [Riesgos y Consideraciones](#riesgos-y-consideraciones)

---

## 🚀 Stack Tecnológico

### Core Technologies

```json
{
  "framework": "React 19.1.0",
  "buildTool": "Vite 7.0.0",
  "language": "JavaScript (ES6+)",
  "routing": "React Router DOM 7.6.3",
  "runtime": "Node.js (v16+)"
}
```

### Principales Dependencias

#### Autenticación y Seguridad
- **@auth0/auth0-react** (^2.3.0) - Autenticación OAuth 2.0 / OpenID Connect
- **@stripe/stripe-js** (^8.2.0) - Procesamiento de pagos

#### UI y Rich Content
- **@fortawesome** (^6.7.2) - Iconografía
- **@tiptap/react** (^3.10.4) - Editor de texto enriquecido (WYSIWYG)
- **html5-qrcode** (^2.3.8) - Escaneo de códigos QR

#### Analytics y Monitoreo
- **@vercel/analytics** (^1.5.0) - Analytics de aplicación
- **@vercel/speed-insights** (^1.2.0) - Métricas de rendimiento

### DevDependencies y Herramientas

#### Build y Transpilación
- **@vitejs/plugin-react-swc** (^3.10.2) - Plugin de React con SWC para mejor rendimiento
- **@babel/core** (^7.24.0) - Compilador JavaScript
- **@babel/preset-react** (^7.24.0) - Presets para JSX

#### Testing
- **Jest** (^29.7.0) - Framework de testing
- **@testing-library/react** (^16.0.0) - Utilidades para testing de componentes
- **@testing-library/jest-dom** (^6.4.0) - Matchers personalizados
- **jest-environment-jsdom** (^29.7.0) - Entorno DOM para tests

#### Linting y Code Quality
- **ESLint** (^8.57.0) - Linter JavaScript
- **eslint-config-standard** (^17.1.0) - Configuración estándar
- **eslint-plugin-react** (^7.37.5) - Reglas específicas de React
- **eslint-plugin-react-hooks** (^5.2.0) - Reglas para hooks

---

## 📁 Estructura del Proyecto

### Arquitectura de Carpetas

```
ReactOtpWeb/
├── public/                    # Recursos estáticos
│   ├── img/                  # Imágenes
│   │   ├── hero/            # Imágenes de hero sections
│   │   └── studio/          # Imágenes de estudios
│   └── video/               # Videos
│
├── src/                      # Código fuente
│   ├── components/          # Componentes reutilizables
│   │   ├── Auth/           # Componentes de autenticación
│   │   ├── Forms/          # Formularios
│   │   ├── Cards/          # Diferentes tipos de tarjetas
│   │   ├── ErrorBoundary/  # Manejo de errores
│   │   └── ...
│   │
│   ├── contexts/           # Context API de React
│   │   └── MobileNavContext.jsx
│   │
│   ├── hooks/              # Custom hooks
│   │   ├── useAuth.js
│   │   ├── usePermissions.js
│   │   ├── useSpotifyImport.js
│   │   └── ...
│   │
│   ├── layouts/            # Layouts de página
│   │   └── RootLayout.jsx
│   │
│   ├── pages/              # Páginas de la aplicación
│   │   ├── Inicio.jsx
│   │   ├── Artistas.jsx
│   │   ├── Eventos.jsx
│   │   └── ...
│   │
│   ├── tests/              # Tests unitarios e integración
│   │   ├── setupTests.js
│   │   └── *.test.js
│   │
│   ├── utils/              # Funciones utilitarias
│   │   ├── spotifyHelpers.js
│   │   └── spotifyHistory.js
│   │
│   ├── main.jsx           # Punto de entrada
│   ├── fontawesome.js     # Configuración de iconos
│   └── index.css          # Estilos globales
│
├── docs/                   # Documentación
│   ├── DESIGN_SYSTEM.md
│   ├── TECHNICAL_ARCHITECTURE.md
│   └── ...
│
├── .eslintrc.js           # Configuración ESLint
├── babel.config.json      # Configuración Babel
├── jest.config.json       # Configuración Jest
├── vite.config.js         # Configuración Vite
├── vercel.json            # Configuración Vercel
└── package.json           # Dependencias y scripts
```

### Convenciones de Nomenclatura

#### Archivos
- **Componentes:** PascalCase (ej. `EventCard.jsx`)
- **Hooks:** camelCase con prefijo 'use' (ej. `useAuth.js`)
- **Utilidades:** camelCase (ej. `spotifyHelpers.js`)
- **CSS:** Mismo nombre que el componente (ej. `EventCard.css`)
- **Tests:** Mismo nombre + `.test.js` (ej. `spotifyHelpers.test.js`)

#### Código
- **Componentes:** PascalCase
- **Funciones/Variables:** camelCase
- **Constantes:** UPPER_SNAKE_CASE
- **CSS Classes:** kebab-case o BEM

---

## 🧩 Arquitectura de Componentes

### Jerarquía de Componentes

```
App (Auth0Provider + RouterProvider)
│
└── RootLayout
    ├── Header
    │   ├── Navigation Links
    │   ├── LoginButton / LogoutButton
    │   └── MobileNavToggle
    │
    ├── MobileNav (Context-based)
    │
    ├── Outlet (React Router)
    │   └── [Página actual]
    │       ├── Cards / Lists
    │       ├── Forms
    │       └── Modals
    │
    └── Footer
```

### Tipos de Componentes

#### 1. Componentes de Presentación (Presentational)
**Propósito:** Solo UI, sin lógica de negocio

```jsx
// Ejemplo: ArtistCard
function ArtistCard({ artist }) {
  return (
    <div className="card">
      <img src={artist.img} alt={artist.name} />
      <h2>{artist.name}</h2>
      <p>{artist.genre}</p>
    </div>
  )
}
```

**Características:**
- Reciben datos vía props
- No gestionan estado complejo
- Reutilizables y testables
- Enfocados en la UI

#### 2. Componentes Contenedores (Container)
**Propósito:** Lógica de negocio y gestión de estado

```jsx
// Ejemplo: Artistas (página)
function Artistas() {
  const { artists, loading, error } = useArtists()
  
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  
  return <Cards cards={artists} type="artist" />
}
```

**Características:**
- Usan hooks personalizados
- Manejan efectos secundarios
- Coordinan múltiples componentes
- Gestionan estado local/global

#### 3. Componentes de Layout
**Propósito:** Estructura y organización visual

```jsx
// Ejemplo: RootLayout
function RootLayout() {
  return (
    <MobileNavProvider>
      <ErrorBoundary>
        <Header />
        <MobileNav />
        <main className="container">
          <Outlet />
        </main>
        <Footer />
      </ErrorBoundary>
    </MobileNavProvider>
  )
}
```

#### 4. Higher-Order Components (HOC)
**Propósito:** Agregar funcionalidad a componentes

```jsx
// ErrorBoundary - Captura errores de componentes hijos
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Log error y mostrar fallback UI
  }
}
```

### Patrones de Composición

#### Composition over Inheritance
```jsx
// ✅ Bueno: Composición
<Card>
  <CardHeader title="Evento" />
  <CardBody content={description} />
  <CardFooter actions={buttons} />
</Card>

// ❌ Malo: Herencia profunda
class EventCard extends BaseCard extends Component { }
```

#### Render Props Pattern
```jsx
<DataFetcher url="/api/artists">
  {({ data, loading, error }) => (
    loading ? <Spinner /> : <ArtistList artists={data} />
  )}
</DataFetcher>
```

#### Children as Function
```jsx
<Form onSubmit={handleSubmit}>
  {({ values, errors }) => (
    <FormFields values={values} errors={errors} />
  )}
</Form>
```

---

## 🔄 Gestión de Estado

### Estado Local (useState)

**Cuándo usar:**
- Estado específico de un componente
- Valores de formularios
- Toggle de UI (modals, dropdowns)

```jsx
function LoginButton() {
  const [isLoading, setIsLoading] = useState(false)
  
  const handleLogin = async () => {
    setIsLoading(true)
    await login()
    setIsLoading(false)
  }
}
```

### Custom Hooks (Lógica Reutilizable)

**Ventajas:**
- Encapsulación de lógica
- Reutilización entre componentes
- Separación de concerns
- Testing más fácil

```jsx
// useAuth - Gestión de autenticación
export const useAuth = () => {
  const { user, isAuthenticated, isLoading } = useAuth0()
  
  const login = useCallback(() => {
    loginWithRedirect()
  }, [loginWithRedirect])
  
  return { user, isAuthenticated, isLoading, login }
}
```

### Context API (Estado Global Ligero)

**Cuándo usar:**
- Estado compartido entre múltiples componentes
- Evitar prop drilling
- Temas, autenticación, preferencias de usuario

```jsx
// MobileNavContext
const MobileNavContext = createContext()

export function MobileNavProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <MobileNavContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </MobileNavContext.Provider>
  )
}

export const useMobileNavContext = () => useContext(MobileNavContext)
```

### Estado Derivado (useMemo)

**Optimización de cálculos:**

```jsx
const filteredArtists = useMemo(() => {
  return artists.filter(a => a.genre === selectedGenre)
}, [artists, selectedGenre])
```

### Estado del Servidor (Custom Hooks + Fetch)

**Patrón implementado:**

```jsx
export function useEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    fetchEvents()
      .then(setEvents)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])
  
  return { events, loading, error }
}
```

**Mejora recomendada:** Considerar React Query o SWR para:
- Cache automático
- Revalidación
- Polling
- Optimistic updates

---

## 🛣️ Routing y Navegación

### React Router DOM v7

#### Configuración del Router

```jsx
const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Inicio /> },
      { path: '/artistas', element: <Artistas /> },
      { path: '/artistas/:id', element: <ArtistaDetalle /> },
      { path: '/eventos/:id', element: <EventoDetalle /> },
      { path: '*', element: <NotFound /> }
    ]
  }
])
```

#### Características Implementadas

1. **Nested Routes:** Layout compartido con `<Outlet />`
2. **Dynamic Routes:** Parámetros en URL (`:id`)
3. **404 Handling:** Ruta wildcard (`*`)
4. **Lazy Loading:** Componentes cargados bajo demanda

```jsx
const SpeedInsights = lazy(() => 
  import('@vercel/speed-insights/react')
)
```

#### Navegación Programática

```jsx
import { useNavigate, useParams, useLocation } from 'react-router-dom'

function Component() {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  
  const handleClick = () => {
    navigate('/eventos', { state: { from: location } })
  }
}
```

#### Active Links

```jsx
<NavLink 
  to="/artistas"
  className={({ isActive }) => isActive ? 'active' : ''}
>
  Artistas
</NavLink>
```

### Estrategia de Routing

#### Client-Side Routing
- SPA (Single Page Application)
- No recarga de página
- Transiciones suaves

#### Configuración en Vercel

```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Propósito:** Todas las rutas se sirven desde `index.html`, permitiendo que React Router maneje la navegación.

---

## 🔐 Autenticación y Autorización

### Auth0 Integration

#### Configuración

```jsx
<Auth0Provider
  domain={VITE_AUTH0_DOMAIN}
  clientId={VITE_AUTH0_CLIENT_ID}
  authorizationParams={{
    redirect_uri: window.location.origin,
    audience: VITE_AUTH0_AUDIENCE
  }}
  useRefreshTokens={true}
  cacheLocation="localstorage"
>
  <App />
</Auth0Provider>
```

#### Variables de Entorno

```bash
VITE_AUTH0_DOMAIN=tu-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=tu_client_id
VITE_AUTH0_AUDIENCE=https://api.otp-records.com
VITE_AUTH0_REDIRECT_URI=http://localhost:5173
```

### Hook de Autenticación (useAuth)

**Funcionalidades:**
- Login/Logout
- Estado de autenticación
- Información de usuario
- Obtención de tokens

```jsx
const { user, isAuthenticated, login, logout, getToken } = useAuth()
```

**Optimizaciones implementadas:**
- Tracking global para evitar logs redundantes
- Callbacks memoizados
- Manejo de errores de refresh token

### Sistema de Permisos (usePermissions)

#### Arquitectura de Roles

```
Admin
├── admin:all (wildcard)
├── CRUD completo en todas las entidades
└── Gestión de usuarios

Editor
├── read/write en releases, artists, events, studios
└── Sin permisos de delete

Artist/Artista
├── read/write en releases, artists, events
└── read en studios

User
└── read en todas las entidades
```

#### Uso de Permisos

```jsx
const { 
  hasPermission, 
  canCreate, 
  canEdit, 
  canDelete,
  isAdmin 
} = usePermissions()

// Verificar permiso específico
if (hasPermission('write:events')) {
  // Mostrar botón de editar
}

// Verificar por entidad
if (canDelete('artists')) {
  // Mostrar botón de eliminar
}

// Verificar rol
if (isAdmin) {
  // Mostrar panel de administración
}
```

#### Custom Claims en JWT

**Formato esperado:**

```json
{
  "https://otp-records.com/roles": ["Admin"],
  "https://otp-records.com/permissions": [
    "admin:all",
    "read:releases",
    "write:releases",
    "delete:releases"
  ]
}
```

**Fallback:** Si no hay permisos explícitos, se mapean desde roles.

### Protección de Rutas

```jsx
function ProtectedRoute({ children, permission }) {
  const { isAuthenticated, isLoading } = useAuth()
  const { hasPermission } = usePermissions()
  
  if (isLoading) return <LoadingSpinner />
  if (!isAuthenticated) return <Navigate to="/" />
  if (permission && !hasPermission(permission)) {
    return <Unauthorized />
  }
  
  return children
}
```

### Seguridad de Tokens

#### Obtención de Access Token

```jsx
const getToken = async () => {
  try {
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: VITE_AUTH0_AUDIENCE
      }
    })
    return token
  } catch (error) {
    if (error.error === 'missing_refresh_token') {
      // Sesión expirada, requerir login
      throw new Error('Sesión expirada')
    }
    throw error
  }
}
```

#### Uso en API Calls

```jsx
const fetchProtectedData = async () => {
  const token = await getToken()
  
  const response = await fetch(`${API_URL}/protected`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
}
```

---

## 🌐 Integración con APIs

### Arquitectura de APIs

#### Backend API

**Base URL:** Configurada en `VITE_API_URL`

**Endpoints principales:**
```
/artists          - CRUD de artistas
/events           - CRUD de eventos
/releases         - CRUD de discografía
/studios          - CRUD de estudios
/contact          - Formulario de contacto
/newsletter       - Suscripción a newsletter
/tickets          - Sistema de tickets (Stripe)
/spotify          - Integración con Spotify
```

### Patrón de Custom Hooks para API

#### Estructura Estándar

```jsx
export function useEntity() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { getToken } = useAuth()
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const token = await getToken()
      
      const response = await fetch(`${API_URL}/entity`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) throw new Error('Error fetching data')
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [getToken])
  
  useEffect(() => {
    fetchData()
  }, [fetchData])
  
  return { data, loading, error, refetch: fetchData }
}
```

### Integración con Spotify

#### Arquitectura

```
Frontend (React)
    ↓
Custom Hook (useSpotifyImport)
    ↓
Utilidades (spotifyHelpers.js)
    ↓
Backend API (/spotify/artist-info o /spotify/release-info)
    ↓
Spotify Web API
```

#### Flujo de Importación

1. **Validación de URL** (Frontend)
   - Verificar formato de URL
   - Extraer tipo (artist/album/track)
   - Extraer ID de Spotify

2. **Llamada a Backend API**
   ```jsx
   const response = await fetch(`${API_URL}/spotify/artist-info`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ spotifyUrl, spotifyId, type })
   })
   ```

3. **Backend obtiene datos de Spotify**
   - Autentica con Client Credentials
   - Hace request a Spotify Web API
   - Transforma datos al formato de la app

4. **Procesamiento en Frontend**
   - Recibe datos normalizados
   - Prepopula formularios
   - Guarda en historial local

#### Utilidades de Spotify

```javascript
// spotifyHelpers.js
export function isValidSpotifyUrl(url)
export function getSpotifyUrlType(url)
export function extractSpotifyId(url)
export function mapSpotifyTypeToAppType(type)
export function formatSpotifyError(error)
```

**Regex soportado:**
```regex
/^https?:\/\/(open\.)?spotify\.com\/(intl-[a-z]{2}\/)?
  (?:embed\/)?(artist|album|track|playlist)\/
  [a-zA-Z0-9]+(\?.*)?$/
```

#### Gestión de Historial

```javascript
// spotifyHistory.js
export const addToHistory = (item) => {
  const history = getHistory()
  history.unshift(item)
  localStorage.setItem('spotify_history', JSON.stringify(history.slice(0, 10)))
}

export const getHistory = () => {
  const stored = localStorage.getItem('spotify_history')
  return stored ? JSON.parse(stored) : []
}
```

**Límite:** 10 importaciones recientes

### Manejo de Errores en APIs

#### Estrategia de Error Handling

```jsx
try {
  const response = await fetch(url)
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Error ${response.status}`)
  }
  
  return await response.json()
} catch (error) {
  if (error.name === 'NetworkError') {
    return { error: 'No hay conexión a internet' }
  }
  
  if (error.status === 404) {
    return { error: 'Recurso no encontrado' }
  }
  
  return { error: error.message || 'Error desconocido' }
}
```

#### Mensajes User-Friendly

**Mapeo de errores HTTP:**
- `400` → "Datos inválidos. Verifica el formulario."
- `401` → "Sesión expirada. Vuelve a iniciar sesión."
- `403` → "No tienes permisos para esta acción."
- `404` → "Contenido no encontrado."
- `429` → "Demasiadas solicitudes. Espera un momento."
- `500+` → "Error del servidor. Inténtalo más tarde."

---

## 🧪 Testing

### Configuración de Jest

```json
// jest.config.json
{
  "testEnvironment": "jsdom",
  "setupFilesAfterEnv": ["<rootDir>/src/tests/setupTests.js"],
  "moduleNameMapper": {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy"
  },
  "transform": {
    "^.+\\.(js|jsx)$": "babel-jest"
  }
}
```

### Testing Library Setup

```javascript
// src/tests/setupTests.js
import '@testing-library/jest-dom'
```

### Estrategia de Testing

#### 1. Unit Tests (Utilidades)

**Ejemplo: spotifyHelpers.test.js**

```javascript
describe('isValidSpotifyUrl', () => {
  it('should validate correct Spotify URLs', () => {
    expect(isValidSpotifyUrl('https://open.spotify.com/artist/123')).toBe(true)
  })
  
  it('should reject invalid URLs', () => {
    expect(isValidSpotifyUrl('https://example.com')).toBe(false)
  })
})
```

**Cobertura actual:** 100% en utilidades de Spotify

#### 2. Component Tests

```javascript
import { render, screen, fireEvent } from '@testing-library/react'
import { LoginButton } from './LoginButton'

describe('LoginButton', () => {
  it('should render login button', () => {
    render(<LoginButton />)
    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument()
  })
  
  it('should call login on click', () => {
    const mockLogin = jest.fn()
    render(<LoginButton onClick={mockLogin} />)
    fireEvent.click(screen.getByText('Iniciar Sesión'))
    expect(mockLogin).toHaveBeenCalled()
  })
})
```

#### 3. Hook Tests

```javascript
import { renderHook, waitFor } from '@testing-library/react'
import { useSpotifyImport } from './useSpotifyImport'

describe('useSpotifyImport', () => {
  it('should import artist data', async () => {
    const { result } = renderHook(() => useSpotifyImport())
    
    await act(async () => {
      await result.current.importFromSpotify(validUrl, 'artist')
    })
    
    expect(result.current.data).toBeDefined()
    expect(result.current.error).toBeNull()
  })
})
```

### Scripts de Testing

```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

### Coverage Goals

**Mínimo recomendado:**
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

**Prioridades de testing:**
1. ✅ Utilidades (helpers, formatters)
2. ✅ Hooks personalizados
3. ⚠️ Componentes críticos (Auth, Forms)
4. ⚠️ Integración de APIs
5. 🔄 E2E tests (pendiente)

---

## 🏗️ Build y Deployment

### Vite Configuration

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'auth': ['@auth0/auth0-react']
        }
      }
    }
  }
})
```

### Optimizaciones de Build

#### 1. Code Splitting
- **Vendor Chunks:** Separación de librerías de terceros
- **Lazy Loading:** Componentes cargados bajo demanda
- **Dynamic Imports:** `React.lazy()` y `Suspense`

```jsx
const SpeedInsights = lazy(() => import('@vercel/speed-insights/react'))

<Suspense fallback={null}>
  <SpeedInsights />
</Suspense>
```

#### 2. SWC Compiler
- **Plugin:** `@vitejs/plugin-react-swc`
- **Beneficio:** ~20x más rápido que Babel
- **Transpilación:** Rust-based, más eficiente

#### 3. Tree Shaking
- **Import selectivo:** Solo importar lo necesario
```javascript
// ✅ Bueno
import { useState } from 'react'

// ❌ Malo
import * as React from 'react'
```

#### 4. Asset Optimization
- **Imágenes:** Compresión, formatos modernos (WebP)
- **Lazy loading:** Imágenes fuera de viewport
- **CSS:** Minificación automática

### Deployment en Vercel

#### Configuración

```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### Variables de Entorno en Vercel

**Dashboard → Settings → Environment Variables:**
```
VITE_API_URL
VITE_AUTH0_DOMAIN
VITE_AUTH0_CLIENT_ID
VITE_AUTH0_AUDIENCE
VITE_AUTH0_REDIRECT_URI
```

#### Build Settings

```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

**Vercel detecta automáticamente:**
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

#### Deployment Pipeline

```
Push to GitHub
    ↓
Vercel Webhook Trigger
    ↓
Install Dependencies
    ↓
Run Build (vite build)
    ↓
Deploy to CDN
    ↓
Invalidate Cache
    ↓
Production URL Live
```

### Performance Monitoring

#### Vercel Analytics
```jsx
import { Analytics } from '@vercel/analytics/react'

<Analytics />
```

#### Speed Insights
```jsx
import { SpeedInsights } from '@vercel/speed-insights/react'

<SpeedInsights />
```

**Métricas monitoreadas:**
- FCP (First Contentful Paint)
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)
- TTFB (Time to First Byte)

---

## ✅ Buenas Prácticas

### 1. Organización de Código

#### Separación de Concerns

```
✅ DO:
components/
  LoginButton/
    LoginButton.jsx      (Componente)
    LoginButton.css      (Estilos)
    LoginButton.test.js  (Tests)
    index.js             (Export barrel)

❌ DON'T:
components/
  LoginButton.jsx       (Todo junto)
```

#### Export Barrels

```javascript
// hooks/index.js
export { useAuth } from './useAuth'
export { usePermissions } from './usePermissions'
export { useEvents } from './useEvents'

// Uso
import { useAuth, usePermissions } from '../hooks'
```

### 2. Performance

#### Memoización Estratégica

```jsx
// ✅ Memoizar cálculos costosos
const expensiveValue = useMemo(() => {
  return heavyComputation(data)
}, [data])

// ✅ Memoizar callbacks pasados como props
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])

// ❌ No memoizar todo innecesariamente
const simpleValue = useMemo(() => prop * 2, [prop]) // Overhead innecesario
```

#### Lazy Loading

```jsx
// ✅ Lazy load rutas pesadas
const AdminPanel = lazy(() => import('./pages/AdminPanel'))

// ✅ Lazy load componentes grandes
const RichTextEditor = lazy(() => import('./components/RichTextEditor'))
```

#### Optimización de Re-renders

```jsx
// ✅ Evitar recreación de objetos en cada render
const config = useMemo(() => ({
  option1: value1,
  option2: value2
}), [value1, value2])

// ❌ Objeto nuevo en cada render
<Component config={{ option1: value1, option2: value2 }} />
```

### 3. Manejo de Estado

#### useState vs useReducer

```jsx
// ✅ useState para estado simple
const [count, setCount] = useState(0)

// ✅ useReducer para estado complejo
const [state, dispatch] = useReducer(reducer, {
  loading: false,
  data: null,
  error: null
})
```

#### Evitar Prop Drilling

```jsx
// ❌ Prop drilling
<Parent>
  <Child data={data}>
    <GrandChild data={data}>
      <GreatGrandChild data={data} />
    </GrandChild>
  </Child>
</Parent>

// ✅ Context API
<DataProvider value={data}>
  <Parent>
    <Child>
      <GrandChild>
        <GreatGrandChild /> {/* usa useContext */}
      </GrandChild>
    </Child>
  </Parent>
</DataProvider>
```

### 4. Seguridad

#### Sanitización de Inputs

```jsx
// ✅ Validar y sanitizar antes de enviar
const sanitizedInput = DOMPurify.sanitize(userInput)

// ✅ Validación de formularios
const schema = Yup.object({
  email: Yup.string().email().required(),
  password: Yup.string().min(8).required()
})
```

#### XSS Prevention

```jsx
// ✅ React escapa automáticamente
<div>{userContent}</div>

// ⚠️ Cuidado con dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
```

#### Secrets Management

```bash
# ✅ Variables de entorno
VITE_API_URL=https://api.example.com

# ❌ Hardcoded secrets
const API_KEY = "abc123secretkey"
```

**Nota:** Solo variables con prefijo `VITE_` se exponen al cliente.

### 5. Accesibilidad

#### Semantic HTML

```jsx
// ✅ Semántico
<nav>
  <ul>
    <li><a href="/home">Home</a></li>
  </ul>
</nav>

// ❌ Divs innecesarios
<div className="nav">
  <div className="list">
    <div className="item">
      <span onClick={handleClick}>Home</span>
    </div>
  </div>
</div>
```

#### ARIA Labels

```jsx
// ✅ ARIA para elementos interactivos
<button 
  aria-label="Cerrar modal"
  onClick={closeModal}
>
  <CloseIcon />
</button>

// ✅ Roles para contenido dinámico
<div role="alert" aria-live="polite">
  {errorMessage}
</div>
```

#### Keyboard Navigation

```jsx
// ✅ Soportar teclado
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Click me
</div>
```

### 6. Error Handling

#### Error Boundaries

```jsx
// ✅ Envolver componentes críticos
<ErrorBoundary fallback={<ErrorPage />}>
  <CriticalComponent />
</ErrorBoundary>
```

#### Graceful Degradation

```jsx
// ✅ Fallbacks para features opcionales
try {
  enableAdvancedFeature()
} catch (error) {
  console.warn('Advanced feature not available:', error)
  useBasicFeature()
}
```

#### User-Friendly Messages

```jsx
// ✅ Mensajes claros para usuarios
if (error.status === 404) {
  return "No encontramos ese contenido. ¿Seguro que existe?"
}

// ❌ Errores técnicos al usuario
if (error.status === 404) {
  return "ERR_NOT_FOUND: Resource at /api/v1/entity/123 returned 404"
}
```

### 7. Código Limpio

#### DRY (Don't Repeat Yourself)

```jsx
// ✅ Extraer lógica común
function useFetch(url) {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    fetch(url).then(r => r.json()).then(setData)
  }, [url])
  
  return data
}

// Usar en múltiples componentes
const artists = useFetch('/api/artists')
const events = useFetch('/api/events')
```

#### KISS (Keep It Simple, Stupid)

```jsx
// ✅ Simple y claro
const isValid = email.includes('@')

// ❌ Sobrecomplejo
const isValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
```

#### Single Responsibility

```jsx
// ✅ Una responsabilidad por función
function fetchUsers() { /* ... */ }
function validateUser(user) { /* ... */ }
function saveUser(user) { /* ... */ }

// ❌ Función que hace todo
function handleUser(user) {
  // fetch, validate, save, todo junto
}
```

### 8. Documentación

#### JSDoc

```javascript
/**
 * Extrae el ID único de Spotify de una URL
 * 
 * @param {string} url - URL de Spotify válida
 * @returns {string|null} ID de Spotify o null si inválida
 * 
 * @example
 * extractSpotifyId('https://open.spotify.com/artist/123')
 * // Returns: '123'
 */
export function extractSpotifyId(url) {
  // ...
}
```

#### README y Documentación

- ✅ README.md en raíz del proyecto
- ✅ Documentación técnica en `/docs`
- ✅ Comentarios en código complejo
- ✅ Guías de estilo y contribución

---

## ⚠️ Riesgos y Consideraciones

### 1. Seguridad

#### 🔴 Riesgos Críticos

**Exposición de Secrets**
```javascript
// ❌ NUNCA hacer esto
const API_KEY = "sk_live_abc123secretkey"

// ✅ Usar variables de entorno
const API_KEY = import.meta.env.VITE_API_KEY
```

**Recomendaciones:**
- Nunca commitear `.env` en Git
- Usar `.env.example` como template
- Rotar secrets comprometidos inmediatamente
- Auditar dependencias con `npm audit`

**XSS (Cross-Site Scripting)**
```jsx
// ⚠️ Peligroso
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ Sanitizar primero
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(userContent) 
}} />
```

**CSRF (Cross-Site Request Forgery)**
- Implementar tokens CSRF en formularios
- Validar origin en backend
- Usar SameSite cookies

**Token Management**
```javascript
// ⚠️ Tokens en localStorage son vulnerables a XSS
// ✅ Usar httpOnly cookies cuando sea posible
// ✅ Implementar refresh token rotation
// ✅ Validar tokens expirados
```

#### 🟡 Riesgos Medios

**Inyección de Código**
- Validar todos los inputs de usuario
- Sanitizar datos antes de renderizar
- Usar librerías de validación (Yup, Zod)

**Dependencias Vulnerables**
```bash
# Ejecutar regularmente
npm audit
npm audit fix

# Mantener dependencias actualizadas
npm outdated
npm update
```

**Rate Limiting**
- Implementar en backend para APIs públicas
- Usar debounce en búsquedas
- Cachear resultados cuando sea posible

### 2. Rendimiento

#### 🔴 Problemas Críticos

**Memory Leaks**
```jsx
// ❌ Subscripción sin cleanup
useEffect(() => {
  const subscription = subscribe()
  // Falta return cleanup
}, [])

// ✅ Cleanup apropiado
useEffect(() => {
  const subscription = subscribe()
  return () => subscription.unsubscribe()
}, [])
```

**Re-renders Innecesarios**
```jsx
// ❌ Objeto nuevo en cada render
<Component config={{ option: value }} />

// ✅ Memoizado
const config = useMemo(() => ({ option: value }), [value])
<Component config={config} />
```

**Bundle Size**
```javascript
// ❌ Importar librería completa
import _ from 'lodash'

// ✅ Importar solo lo necesario
import debounce from 'lodash/debounce'
```

**Monitoreo:**
- Usar React DevTools Profiler
- Configurar bundle analyzer
- Monitorear Core Web Vitals

```bash
# Analizar bundle
npm install --save-dev vite-plugin-bundle-visualizer
```

#### 🟡 Optimizaciones Recomendadas

**Image Optimization**
- Usar formatos modernos (WebP, AVIF)
- Implementar lazy loading
- Comprimir imágenes antes de subir
- Usar CDN para assets

**Code Splitting**
```jsx
// Por ruta
const AdminPanel = lazy(() => import('./AdminPanel'))

// Por feature
const HeavyComponent = lazy(() => import('./HeavyComponent'))
```

**Caching**
- Implementar service workers
- Usar React Query para cache de datos
- Aprovechar HTTP caching headers

### 3. Mantenibilidad

#### 🔴 Deuda Técnica

**Falta de Tests**
- **Riesgo:** Regresiones en producción
- **Solución:** Incrementar cobertura gradualmente
- **Prioridad:** Tests en lógica de negocio crítica

**Código Legacy**
- **Riesgo:** Dificultad para refactorizar
- **Solución:** Refactoring incremental
- **Estrategia:** Strangler Fig Pattern

**Dependencias Obsoletas**
```bash
# Revisar regularmente
npm outdated

# Actualizar con precaución
npm update --save
```

#### 🟡 Mejoras Necesarias

**Documentación Incompleta**
- Documentar APIs internas
- Mantener README actualizado
- Crear guías de contribución
- Documentar decisiones arquitectónicas (ADRs)

**Falta de Type Safety**
- **Actual:** JavaScript puro
- **Recomendado:** Migrar a TypeScript
- **Beneficios:** 
  - Detección temprana de errores
  - Mejor intellisense
  - Refactoring más seguro

**Monitoreo y Logging**
```javascript
// Implementar logging estructurado
const logger = {
  info: (msg, meta) => console.log('[INFO]', msg, meta),
  error: (msg, meta) => console.error('[ERROR]', msg, meta),
  warn: (msg, meta) => console.warn('[WARN]', msg, meta)
}

// Integrar con servicio de monitoreo
// Sentry, LogRocket, etc.
```

### 4. Escalabilidad

#### 🔴 Limitaciones Actuales

**Estado Global**
- **Problema:** Context API no escala bien con estado complejo
- **Solución:** Migrar a Redux Toolkit o Zustand
- **Cuándo:** Cuando el estado compartido crezca significativamente

**Fetching de Datos**
- **Problema:** Custom hooks básicos sin cache
- **Solución:** Implementar React Query o SWR
- **Beneficios:**
  - Cache automático
  - Revalidación
  - Optimistic updates
  - Retry logic

**Paginación**
```jsx
// ❌ Cargar todos los datos
const { artists } = useArtists() // 1000+ artistas

// ✅ Paginación
const { artists, page, nextPage } = useArtists({ 
  page: 1, 
  limit: 20 
})
```

#### 🟡 Preparación para Crecimiento

**Arquitectura Modular**
- Separar en módulos independientes
- Implementar micro-frontends si es necesario
- Considerar monorepo para múltiples apps

**Internacionalización (i18n)**
```jsx
// Preparar estructura para múltiples idiomas
import { useTranslation } from 'react-i18next'

function Component() {
  const { t } = useTranslation()
  return <h1>{t('welcome')}</h1>
}
```

**Feature Flags**
```javascript
const features = {
  newDesign: import.meta.env.VITE_FEATURE_NEW_DESIGN === 'true',
  betaFeature: import.meta.env.VITE_FEATURE_BETA === 'true'
}

if (features.newDesign) {
  return <NewDesignComponent />
}
```

### 5. UX y Accesibilidad

#### 🔴 Problemas a Resolver

**Falta de Loading States**
```jsx
// ✅ Implementar estados de carga consistentes
if (loading) return <Skeleton />
if (error) return <ErrorMessage error={error} />
if (!data) return <EmptyState />
```

**Feedback de Acciones**
- Toast notifications para operaciones
- Confirmaciones para acciones destructivas
- Progress indicators para procesos largos

**Accesibilidad**
- Auditar con Lighthouse
- Probar con lectores de pantalla
- Navegación completa por teclado
- Contraste de colores WCAG AA

#### 🟡 Mejoras de UX

**Optimistic Updates**
```jsx
// Actualizar UI antes de confirmación del servidor
const handleLike = async () => {
  setLiked(true) // Optimistic
  try {
    await api.like(id)
  } catch {
    setLiked(false) // Rollback
    showError('No se pudo guardar')
  }
}
```

**Offline Support**
- Service Workers para cache
- Detección de estado de red
- Sincronización cuando vuelva conexión

**Progressive Enhancement**
- Funcionalidad básica sin JavaScript
- Enriquecer con interactividad
- Graceful degradation

### 6. Compliance y Legal

#### 🔴 Requisitos Obligatorios

**GDPR / LOPD**
- Política de privacidad
- Consentimiento de cookies
- Derecho al olvido
- Portabilidad de datos
- Minimización de datos

**Cookies**
```jsx
// Implementar banner de consentimiento
<CookieConsent
  enableDeclineButton
  onAccept={() => initializeAnalytics()}
  onDecline={() => disableTracking()}
>
  Este sitio usa cookies...
</CookieConsent>
```

**Términos y Condiciones**
- Actualizar regularmente
- Versionar cambios importantes
- Notificar cambios a usuarios

**Procesamiento de Pagos (Stripe)**
- PCI DSS compliance
- Nunca almacenar datos de tarjetas
- Usar Stripe.js para tokenización
- Validar webhooks de Stripe

### Checklist de Pre-Producción

```
Seguridad:
□ Variables de entorno configuradas
□ Secrets no expuestos en código
□ Dependencias auditadas
□ HTTPS habilitado
□ CORS configurado correctamente

Performance:
□ Bundle size optimizado (<500KB)
□ Imágenes comprimidas
□ Lazy loading implementado
□ Cache headers configurados
□ Core Web Vitals en verde

Calidad:
□ Tests passing (>80% coverage)
□ Linter sin errores
□ Documentación actualizada
□ Error tracking configurado
□ Logs implementados

UX:
□ Loading states implementados
□ Error handling user-friendly
□ Responsive en todos los breakpoints
□ Accesibilidad auditada
□ Navegación por teclado funcional

Legal:
□ Política de privacidad
□ Términos y condiciones
□ Banner de cookies
□ GDPR compliance
□ PCI DSS (si aplica)
```

---

## 📚 Recursos y Referencias

### Documentación Oficial
- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide/)
- [React Router](https://reactrouter.com)
- [Auth0 React SDK](https://auth0.com/docs/quickstart/spa/react)

### Herramientas de Desarrollo
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Vite Plugin Inspect](https://github.com/antfu/vite-plugin-inspect)
- [Bundle Analyzer](https://www.npmjs.com/package/rollup-plugin-visualizer)

### Testing
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

### Seguridad
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Snyk](https://snyk.io/)

---

## 🔄 Versionado del Documento

**Versión:** 1.0  
**Última actualización:** Noviembre 2025  
**Autor:** Alex Alvarez Almendros
**Próxima revisión:** Cada 3 meses o con cambios arquitectónicos mayores

---
