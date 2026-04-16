# Copilot Instructions - ReactOtpWeb

## Project Overview
This is **Other People Records** landing page - a React 19 SPA for a music label, migrated from .NET/Blazor. The app manages artists, releases, events, and studios with Auth0 authentication, Spotify integration, and Stripe payments.

**Tech Stack:** React 19 + Vite 7 + React Router 7 + Auth0 + Spotify API + Stripe  
**Backend API:** Separate REST API at `VITE_API_URL` (not in this repo)

## Architecture Patterns

### Custom Hooks for Data Fetching
All API interactions use custom hooks following this pattern:

```javascript
const API_URL = import.meta.env.VITE_API_URL
const ENDPOINT = `${API_URL}/resource`

export function useResource(options = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { getToken } = useAuth() // if auth required
  
  const fetchData = useCallback(async (signal) => {
    setLoading(true)
    setError(null)
    const response = await fetch(ENDPOINT, { signal })
    if (!response.ok) throw new Error(`Error: ${response.statusText}`)
    const result = await response.json()
    setData(result.data || result)
  }, [])
  
  useEffect(() => {
    const controller = new AbortController()
    fetchData(controller.signal)
    return () => controller.abort()
  }, [fetchData])
  
  return { data, loading, error, refetch: fetchData }
}
```

**Key examples:** `useEvents.js`, `useArtists.js`, `useReleases.js`, `useStudios.js`

### Component Structure
- **Presentational:** Pure UI components receiving props (`ArtistCard`, `EventsCard`)
- **Container:** Pages that orchestrate data fetching (`Artistas.jsx`, `Eventos.jsx`)
- **Layout:** `RootLayout` wraps all pages with `Header`, `Footer`, and `<Outlet />`

**Card pattern:**
```jsx
// CardList renders different card types via lookup object
const cardComponents = { artist: ArtistCard, release: ReleaseCard, event: EventsCard }
const CardComponent = cardComponents[type]
```

### Authentication & Authorization
**Auth Flow:**
1. `Auth0Provider` wraps entire app in `main.jsx`
2. `useAuth()` hook provides `{ user, isAuthenticated, login, logout, getToken }`
3. `usePermissions()` checks RBAC permissions from Auth0 custom claims

**Roles:** Admin, Editor, Artist/Artista, User  
**Permissions format:** `read:events`, `write:releases`, `delete:artists`, `admin:all`

**Custom claims in JWT:**
```javascript
user['https://otp-records.com/roles'] // array of roles
user['https://otp-records.com/permissions'] // array of permissions
```

**Permission check pattern:**
```javascript
const { canEdit, canDelete, isAdmin } = usePermissions()
if (canEdit('events')) { /* show edit button */ }
```

### API Integration

**Backend endpoints:**
- `/artists`, `/events`, `/releases`, `/studios` - CRUD operations
- `/spotify/artist-info`, `/spotify/release-info` - Spotify imports
- `/tickets/create-checkout-session` - Stripe integration
- `/contact`, `/newsletter` - Form submissions

**All custom hooks support advanced filtering:**
```javascript
useEvents({
  type: 'Concert',
  location: 'Madrid',
  dateMin: '2025-01-01',
  page: 1,
  count: 20,
  sortBy: 'date',
  sortOrder: 'asc'
})
```

See `API_FILTERS.md` for complete filter documentation.

### Spotify Integration
**File structure:** `components/SpotifyImport/`, `hooks/useSpotifyImport.js`, `utils/spotifyHelpers.js`

**URL validation pattern:**
```javascript
// spotifyHelpers.js exports:
isValidSpotifyUrl(url)
getSpotifyUrlType(url) // 'artist' | 'album' | 'track'
extractSpotifyId(url)
```

**Import flow:**
1. User pastes Spotify URL
2. Frontend validates with `spotifyHelpers`
3. Backend fetches from Spotify API
4. Data prepopulates form fields
5. History saved to localStorage (max 10 items)

## Development Workflow

### Commands
```bash
npm run dev          # Start dev server (Vite)
npm run build        # Production build
npm test             # Run Jest tests
npm test:coverage    # Coverage report
```

### Environment Variables (`.env`)
```bash
VITE_API_URL=https://api.otp-records.com
VITE_AUTH0_DOMAIN=tenant.auth0.com
VITE_AUTH0_CLIENT_ID=client_id
VITE_AUTH0_AUDIENCE=https://api.otp-records.com
VITE_AUTH0_REDIRECT_URI=http://localhost:5173
```

**CRITICAL:** Only `VITE_` prefixed vars are exposed to client.

### ESLint Configuration
Uses **Standard** style with Jest overrides. All code must follow Standard conventions:
- No semicolons
- Single quotes
- 2 space indentation
- Trailing commas in multiline

### File Naming
- Components: PascalCase (`ArtistCard.jsx`)
- Hooks: camelCase with `use` prefix (`useAuth.js`)
- Utils: camelCase (`spotifyHelpers.js`)
- CSS: Same name as component (`ArtistCard.css`)
- Tests: Same name + `.test.js` (`spotifyHelpers.test.js`)

## Critical Patterns to Follow

### 1. Memoization in Hooks
Both `useAuth` and `usePermissions` use **global log tracking** to prevent duplicate console logs:

```javascript
const globalLogTracker = { lastUserId: null, hasLogged: false }
const shouldLog = useMemo(() => {
  if (globalLogTracker.lastUserId === user.sub && globalLogTracker.hasLogged) {
    return false
  }
  globalLogTracker.lastUserId = user.sub
  globalLogTracker.hasLogged = true
  return true
}, [user?.sub])
```

Always memoize callbacks with `useCallback` when passing to child components.

### 2. Error Handling
Provide user-friendly error messages:

```javascript
// ✅ Good
throw new Error('No se pudo conectar con Spotify')

// ❌ Bad  
throw new Error('ERR_CONNECTION_REFUSED')
```

### 3. Loading States
Every data fetch must have loading, error, and empty states:

```jsx
if (loading) return <LoadingSpinner />
if (error) return <ErrorMessage error={error} />
if (!data?.length) return <EmptyState />
return <CardList cards={data} type="artist" />
```

### 4. AbortController for Cleanup
Always abort fetch requests on unmount:

```javascript
useEffect(() => {
  const controller = new AbortController()
  fetchData(controller.signal)
  return () => controller.abort()
}, [fetchData])
```

### 5. Dynamic Routing
Use React Router v7 patterns:

```javascript
// Get route params
const { id } = useParams()

// Navigate programmatically
const navigate = useNavigate()
navigate('/artistas')

// Access location state
const location = useLocation()
const fromPath = location.state?.from
```

## Testing Approach

**Current coverage:** 100% on Spotify utilities, expanding to other areas.

**Test structure:**
```javascript
describe('spotifyHelpers', () => {
  it('should validate correct URLs', () => {
    expect(isValidSpotifyUrl('https://open.spotify.com/artist/123')).toBe(true)
  })
})
```

**When writing tests:**
- Utilities: Unit tests with 100% coverage
- Hooks: `renderHook` from `@testing-library/react`
- Components: `render` from `@testing-library/react` with user interactions
- Mock `useAuth0` for auth-dependent tests

## Common Pitfalls

❌ **Don't create new objects in render:**
```jsx
<Component config={{ option: value }} /> // New object every render
```

✅ **Memoize objects:**
```javascript
const config = useMemo(() => ({ option: value }), [value])
<Component config={config} />
```

❌ **Don't hardcode API URLs:**
```javascript
const url = 'https://api.otp-records.com/events'
```

✅ **Use env vars:**
```javascript
const API_URL = import.meta.env.VITE_API_URL
const url = `${API_URL}/events`
```

❌ **Don't expose secrets:**
```javascript
const API_KEY = "sk_live_secret123" // Never!
```

✅ **Use environment variables** and never commit `.env`.

## UI/UX Conventions

- **Mobile-first:** All components must be responsive
- **Spanish language:** All user-facing text in Spanish
- **FontAwesome icons:** Configured in `fontawesome.js`
- **CSS Modules:** Each component has its own CSS file
- **Lazy loading:** Use `React.lazy()` for heavy components
- **Error boundaries:** Wrap critical sections with `ErrorBoundary`

## Integration Points

### Spotify
- **Backend handles auth:** Frontend only sends URLs
- **Validation client-side:** Check URL format before API call
- **History persistence:** localStorage key `spotify_history`

### Stripe
- **Hook:** `useStripe()` creates checkout sessions
- **Flow:** Frontend → Backend `/tickets/create-checkout-session` → Stripe redirect
- **Webhook validation:** Backend responsibility

### Vercel
- **Deployment:** Auto-deploy from GitHub
- **Rewrites:** All routes serve `index.html` (see `vercel.json`)
- **Analytics:** `@vercel/analytics` and `@vercel/speed-insights` wrapped in Suspense

## Performance Optimizations

1. **SWC compiler:** Faster than Babel (~20x)
2. **Code splitting:** Vendor chunks for React, Auth0
3. **Lazy routes:** Heavy pages loaded on-demand
4. **Memoization:** Strategic use of `useMemo`/`useCallback`
5. **AbortController:** Cancel pending requests on unmount

## When to Ask for Clarification

- **Backend API changes:** Check with backend team if endpoint structure differs
- **Permission scope:** Confirm with product owner for new roles/permissions
- **Spotify API limits:** Rate limits and quota are backend concerns
- **Design system:** Reference `docs/DESIGN_SYSTEM.md` for UI patterns

## Quick Reference

**Find examples of:**
- Custom hook pattern → `src/hooks/useEvents.js`
- Auth integration → `src/hooks/useAuth.js`
- Permissions checking → `src/hooks/usePermissions.js`
- Card components → `src/components/CardList/CardList.jsx`
- Spotify import → `src/components/SpotifyImport/`
- Form handling → `src/components/Forms/`
- Routing setup → `src/main.jsx`
- Layout structure → `src/layouts/RootLayout.jsx`

**Documentation:**
- Technical architecture → `docs/TECHNICAL_ARCHITECTURE.md`
- API filters → `API_FILTERS.md`
- Spotify integration → `SPOTIFY_INTEGRATION_FRONTEND.md`
- Project README → `README.md`
