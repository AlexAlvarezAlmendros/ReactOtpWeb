# Ejemplos Prácticos del Sistema de Filtros - OtpWebBack API

## Ejemplos de Uso Real

### 1. Paginación Básica
```bash
# Obtener los primeros 20 elementos
GET /api/releases?count=20&page=1

# Obtener la segunda página con 10 elementos
GET /api/releases?count=10&page=2
```

### 2. Filtros por Tipo
```bash
# Releases de tipo "Album"
GET /api/releases?type=Album

# Artists de tipo "Producer"
GET /api/artists?type=Producer

# Events de tipo "Festival"
GET /api/events?type=Festival

# Studios de tipo "Recording"
GET /api/studios?type=Recording
```

### 3. Filtros de Fecha
```bash
# Releases del último mes
GET /api/releases?dateMin=2024-12-01&dateMax=2024-12-31

# Events futuros (desde hoy)
GET /api/events?dateMin=2025-01-19

# Releases anteriores a una fecha específica
GET /api/releases?dateMax=2024-06-01
```

### 4. Filtros Específicos por Recurso

#### Releases - Filtro por Subtitle
```bash
# Buscar releases que contengan "deluxe" en el subtitle
GET /api/releases?subtitle=deluxe

# Buscar releases con subtitle que contenga "remix"
GET /api/releases?subtitle=remix
```

#### Artists - Filtro por Genre
```bash
# Buscar artists de género "Pop"
GET /api/artists?genre=pop

# Buscar artists que tengan "electronic" en el género
GET /api/artists?genre=electronic
```

#### Events - Filtro por Location
```bash
# Events en Madrid
GET /api/events?location=madrid

# Events que contengan "stadium" en la ubicación
GET /api/events?location=stadium
```

#### Studios - Filtro por Location
```bash
# Studios en Barcelona
GET /api/studios?location=barcelona

# Studios que contengan "downtown" en la ubicación
GET /api/studios?location=downtown
```

### 5. Filtros por Usuario
```bash
# Todos los releases de un usuario específico
GET /api/releases?userId=google-oauth2|114646649793532911906

# Artists creados por un usuario específico
GET /api/artists?userId=user123
```

### 6. Ordenamiento
```bash
# Ordenar por fecha ascendente (más antiguos primero)
GET /api/releases?sortBy=date&sortOrder=asc

# Ordenar por fecha de creación descendente (más recientes primero)
GET /api/artists?sortBy=createdAt&sortOrder=desc

# Ordenar artists por nombre ascendente
GET /api/artists?sortBy=name&sortOrder=asc
```

### 7. Filtros Combinados (Casos de Uso Complejos)
```bash
# Releases de tipo "Song" del usuario específico, del último mes, ordenados por fecha
GET /api/releases?type=Song&userId=user123&dateMin=2024-12-01&sortBy=date&sortOrder=desc

# Artists de género "Pop" con paginación y ordenamiento
GET /api/artists?genre=pop&count=15&page=1&sortBy=name&sortOrder=asc

# Events tipo "Concert" en Madrid, de los próximos 30 días
GET /api/events?type=Concert&location=madrid&dateMin=2025-01-19&dateMax=2025-02-19

# Releases con subtitle "deluxe" de tipo "Album", limitados a 5 resultados
GET /api/releases?subtitle=deluxe&type=Album&count=5
```

### 8. Casos de Uso Frontend

#### Dashboard de Usuario
```javascript
// Obtener todas las creaciones del usuario actual
const userReleases = await fetch('/api/releases?userId=currentUserId&count=50');
const userArtists = await fetch('/api/artists?userId=currentUserId&count=50');
const userEvents = await fetch('/api/events?userId=currentUserId&count=50');
```

#### Búsqueda Avanzada
```javascript
// Búsqueda de releases con múltiples filtros
const searchReleases = async (filters) => {
  const params = new URLSearchParams();
  
  if (filters.type) params.append('type', filters.type);
  if (filters.subtitle) params.append('subtitle', filters.subtitle);
  if (filters.dateFrom) params.append('dateMin', filters.dateFrom);
  if (filters.dateTo) params.append('dateMax', filters.dateTo);
  
  const response = await fetch(`/api/releases?${params.toString()}`);
  return response.json();
};
```

#### Paginación en Frontend
```javascript
// Implementar paginación con botones anterior/siguiente
const loadPage = async (page, count = 10) => {
  const response = await fetch(`/api/releases?page=${page}&count=${count}`);
  const data = await response.json();
  
  // data.pagination.page - página actual
  // data.pagination.pages - total de páginas
  // data.pagination.total - total de elementos
  
  return data;
};
```

### 9. Validación de Errores

#### Parámetros Inválidos
```bash
# Esto devuelve error 400
GET /api/releases?count=invalid&page=-1

# Respuesta:
{
  "error": "Invalid filter parameters",
  "details": [
    "count must be a positive number",
    "page must be a positive number"
  ]
}
```

#### Fechas Inválidas
```bash
# Esto devuelve error 400
GET /api/releases?dateMin=invalid-date&dateMax=2024-01-01

# Respuesta:
{
  "error": "Invalid filter parameters",
  "details": [
    "dateMin must be a valid date",
    "dateMin cannot be greater than dateMax"
  ]
}
```

### 10. Límites y Recomendaciones

- **Máximo count**: 100 elementos por solicitud
- **Default count**: 10 elementos
- **Búsquedas de texto**: Insensibles a mayúsculas, permiten búsquedas parciales
- **Fechas**: Formato ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`)
- **Performance**: Usa paginación para grandes conjuntos de datos

### 11. Estructura de Respuesta Completa
```json
{
  "data": [
    // Array de elementos
  ],
  "pagination": {
    "page": 1,           // Página actual
    "count": 10,         // Elementos por página
    "total": 156,        // Total de elementos que coinciden con los filtros
    "pages": 16          // Total de páginas disponibles
  },
  "filters": {
    "releaseType": "Song",  // Filtros aplicados
    "dateMin": "2024-01-01T00:00:00.000Z"
  }
}
```

Este sistema de filtros proporciona una API robusta y flexible para el frontend, permitiendo implementar búsquedas avanzadas, paginación eficiente y una experiencia de usuario rica.
