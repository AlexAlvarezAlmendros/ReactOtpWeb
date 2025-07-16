# Copilot Instructions for React OTP Web

## Project Overview
React OTP Web is a migration of an existing .NET/Blazor application to a React-based stack. The goal is to create a modern, responsive landing page for Other People Records, a local record label. This project emphasizes React hooks, state management, and API integration.

## Architecture
- **Components**: Located in `src/components/`, each folder represents a distinct UI element (e.g., `ArtistCard`, `Footer`). Components follow a modular structure with separate `.jsx` and `.css` files.
- **Pages**: Found in `src/pages/`, these represent individual views of the application (e.g., `Inicio.jsx`, `Artistas.jsx`). Pages often utilize hooks and components.
- **Hooks**: Custom hooks are stored in `src/hooks/` (e.g., `useReleases.js`, `useArtists.js`) to encapsulate logic for fetching and managing data.
- **Layouts**: The `src/layouts/` directory contains layout components like `RootLayout.jsx` for consistent page structure.
- **Mocks**: Static JSON data for development is stored in `src/mocks/`.

## Developer Workflows
### Build and Run
1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`

### Debugging
- Use browser developer tools to inspect React components and network requests.
- Check console logs for errors during API calls.

### Testing
- No explicit testing framework is set up yet. Consider adding Jest or React Testing Library for unit tests.

## Patterns and Conventions
- **Code Style**: The project strictly follows **JavaScript Standard** linting rules - 100% compliance is required.
- **Component Communication**: Props are used for passing data between components.
- **State Management**: Local state is managed using React hooks (`useState`, `useEffect`).
- **Error Handling**: Components display error messages when API calls fail (e.g., `Inicio.jsx`).
- **Styling**: CSS files are colocated with their respective components.

## External Dependencies
- **Vite**: Used for fast development builds.
- **FontAwesome**: Icons are managed via `src/fontawesome.js`.

## Integration Points
- **API Calls**: Custom hooks like `useReleases.js` fetch data from external APIs.
- **Static Assets**: Images are stored in `public/img/`.

## Examples
### Fetching Data with Hooks
```jsx
import { useReleases } from '../hooks/useReleases';

function Inicio() {
  const { releases, loading, error } = useReleases();

  return (
    <>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && <Cards cards={releases} type="release" />}
    </>
  );
}
```

### Component Structure
```jsx
// src/components/ArtistCard/ArtistCard.jsx
function ArtistCard({ artist }) {
  return (
    <div className="artist-card">
      <h3>{artist.name}</h3>
      <p>{artist.bio}</p>
    </div>
  );
}

export default ArtistCard;
```

## Future Improvements
- Add unit tests for components and hooks.
- Implement global state management using Context API or Redux.
- Enhance error handling with user-friendly messages.

---
Feel free to update this document as the project evolves.
