# Sistema de Diseño - ReactOtpWeb

## 📋 Índice
1. [Paleta de Colores](#paleta-de-colores)
2. [Tipografía](#tipografía)
3. [Componentes](#componentes)
4. [Espaciado y Layout](#espaciado-y-layout)
5. [Efectos y Animaciones](#efectos-y-animaciones)
6. [Responsive Design](#responsive-design)
7. [Estética y Feel](#estética-y-feel)

---

## 🎨 Paleta de Colores

### Colores Principales

```css
/* Color de marca/acento principal */
--primary-red: #ff003c
--primary-red-dark: #cc0030
--primary-red-darker: #e6003a

/* Fondos */
--background-black: #000000
--background-dark-1: #0a0a0a
--background-dark-2: #0e0e0e
--background-dark-3: #1a1a1a
--background-dark-4: #2a2a2a
--background-dark-5: #2b2b2b (con transparencia: #2b2b2bce)
--background-card: #363636
```

### Colores de Texto

```css
--text-white: #ffffff
--text-light-gray: #cccccc
--text-medium-gray: #999999
--text-dark-gray: #666666
--text-darker-gray: #888888
```

### Colores de Bordes y Divisores

```css
--border-dark-1: #1b1b1b
--border-dark-2: #333333
--border-dark-3: #444444
--border-medium: #495057
--border-light: #666666
```

### Colores de Estado

```css
/* Éxito */
--success-green: #22c55e
--success-green-light: #4ade80
--success-bg: rgba(34, 197, 94, 0.1)
--success-border: rgba(34, 197, 94, 0.3)

/* Error */
--error-red: #ef4444
--error-bg: rgba(239, 68, 68, 0.1)
--error-border: rgba(239, 68, 68, 0.3)

/* Warning */
--warning-orange: #f59e0b
--warning-bg: rgba(245, 158, 11, 0.1)
--warning-border: rgba(245, 158, 11, 0.3)
```

### Gradientes

```css
/* Gradiente principal de footer */
background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);

/* Gradiente de botón principal */
background: linear-gradient(135deg, #ff003c 0%, #cc0030 100%);

/* Gradiente de newsletter */
background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);

/* Gradiente decorativo */
background: linear-gradient(90deg, transparent, #ff003c, transparent);
```

---

## 📝 Tipografía

### Fuente Principal

```css
font-family: 'Montserrat', sans-serif;
```

### Jerarquía de Tamaños

#### Títulos de Página
```css
/* H1 - Títulos principales de página */
font-size: 3.5rem;        /* Desktop */
font-size: 3rem;          /* 900px */
font-size: 2.5rem;        /* Tablet */
font-size: 2rem;          /* 600px */
font-size: 1.75rem;       /* Mobile */
font-weight: 700;
text-transform: uppercase;
letter-spacing: 0.02em;
```

#### Títulos de Sección
```css
/* H2 - Títulos de sección */
font-size: 2rem;
font-weight: 100;

/* Títulos de subsección */
font-size: 1.5rem;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.5px;
```

#### Texto de Contenido
```css
/* Texto normal */
font-size: 1rem;
font-weight: 100-400;
line-height: 1.6;

/* Texto grande/destacado */
font-size: 1.125rem;
line-height: 1.7;
color: #cccccc;
```

#### Texto Pequeño
```css
/* Metadatos y texto secundario */
font-size: 0.875rem;
color: #999999;

/* Texto muy pequeño */
font-size: 0.75rem;
color: #999999;
```

---

## 🧩 Componentes

### Cards (Tarjetas)

**Estructura básica:**
```css
background-color: #0e0e0e;
border-radius: 8px;
border: 1px solid #1b1b1b;
padding: 1rem;
```

**Características:**
- Bordes redondeados de 8px
- Fondo oscuro (#0e0e0e)
- Borde sutil (#1b1b1b)
- Imágenes con aspect-ratio 1:1
- Hover: saturación y brillo aumentados

### Botones

#### Botón Principal (CTA)
```css
/* Botón de comprar entradas */
background: linear-gradient(135deg, #ff003c 0%, #cc0030 100%);
color: white;
border-radius: 12px;
font-size: 1.125rem;
font-weight: 700;
padding: 16px;
box-shadow: 0 4px 20px rgba(255, 0, 60, 0.4);

/* Hover */
transform: translateY(-4px);
box-shadow: 0 8px 30px rgba(255, 0, 60, 0.6);
```

#### Botón Secundario (Login)
```css
background-color: #00000069;
border: solid 1px #808080b7;
color: white;
padding: 10px 20px;
border-radius: 5px;

/* Hover */
background-color: #000000b9;
```

#### Botón Sutil (Back)
```css
background: transparent;
color: #999;
border: 1px solid #333;
border-radius: 6px;
padding: 8px 12px;

/* Hover */
color: #fff;
background: rgba(255, 255, 255, 0.05);
border-color: #666;
```

### Header (Cabecera)

**Estilo:**
```css
position: sticky;
top: 0;
background: #2b2b2bce;
backdrop-filter: blur(8px);
box-shadow: 0 0px 20px rgba(14, 14, 14, 0.63);
z-index: 15;
```

**Navegación:**
- Links transparentes por defecto
- Hover/Active: `background: rgba(255, 255, 255, 0.1)`
- Border-radius: 8px
- Logo rotado -10deg

### Footer (Pie de página)

**Estilo:**
```css
background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
border-top: 3px solid #ff003c;
padding: 48px 24px 24px;
```

**Características:**
- Grid de 4 columnas en desktop
- Enlaces con hover que desplazan hacia la derecha
- Iconos sociales circulares con hover que eleva
- Línea decorativa superior roja (#ff003c)

### Formularios

**Inputs:**
```css
background-color: #1a1a1a;
border: 2px solid #333;
border-radius: 8px;
padding: 12px 16px;
color: white;

/* Focus */
border-color: #ff003c;
box-shadow: 0 0 0 3px rgba(255, 0, 60, 0.1);
```

**Selects y Textareas:**
- Mismo estilo que inputs
- Textarea: min-height: 120px, resize: vertical

**Botón de envío:**
```css
background-color: #ff003c;
color: white;
border-radius: 12px;
padding: 16px 24px;
font-weight: 700;
text-transform: uppercase;

/* Hover */
background-color: #e6003a;
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(255, 0, 60, 0.3);
```

### Rich Text Editor

**Estilos de contenido:**
```css
font-size: 1.125rem;
line-height: 1.7;
color: #cccccc;

/* Headings */
color: white;
margin-top: 1.5rem;

/* Links */
color: #ff003c;
text-decoration: underline;

/* Blockquote */
border-left: 4px solid #ff003c;
padding-left: 1rem;
font-style: italic;
color: #999;
```

---

## 📏 Espaciado y Layout

### Márgenes y Padding Comunes

```css
/* Spacing scale */
--space-xs: 4px
--space-sm: 8px
--space-md: 12px
--space-lg: 16px
--space-xl: 20px
--space-2xl: 24px
--space-3xl: 32px
--space-4xl: 48px
--space-5xl: 64px
--space-6xl: 96px
```

### Contenedores

```css
/* Contenedor principal */
max-width: 1200px;
margin: 0 auto;
padding: 0 24px;

/* Contenedor extra ancho */
max-width: 1400px;
```

### Gaps y Grids

```css
/* Cards Grid */
display: grid;
grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
gap: 24px;

/* Footer Grid */
grid-template-columns: 2fr 1fr 1fr 1.5fr;
gap: 48px;

/* Social Links Grid */
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
gap: 16px;
```

---

## ✨ Efectos y Animaciones

### Transiciones Comunes

```css
/* Transición estándar */
transition: all 0.3s ease;

/* Transición suave */
transition: background-color 0.3s ease;

/* Transición de color */
transition: color 0.3s ease;
```

### Efectos Hover

#### Cards
```css
/* Imagen de card */
filter: saturate(1.5) brightness(1.2) contrast(1.2);
```

#### Botones
```css
/* Elevación */
transform: translateY(-2px) / translateY(-4px);

/* Sombra aumentada */
box-shadow: 0 8px 30px rgba(255, 0, 60, 0.6);
```

#### Links
```css
/* Padding lateral */
padding-left: 8px;

/* Color change */
color: #ff003c;
```

### Animaciones con Keyframes

#### Slide Down
```css
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Shimmer (efecto brillante)
```css
@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}
```

#### Spin (carga)
```css
@keyframes spin {
  to {
    transform: translateY(-50%) rotate(360deg);
  }
}
```

### Efectos de Pseudo-elementos

#### Efecto de onda en botón
```css
.btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn:hover::before {
  width: 300px;
  height: 300px;
}
```

#### Línea decorativa bajo títulos
```css
.section-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 30px;
  height: 2px;
  background-color: #ff003c;
}
```

### Backdrop Filter

```css
/* Header con blur */
backdrop-filter: blur(8px);
-webkit-backdrop-filter: blur(8px);
```

---

## 📱 Responsive Design

### Breakpoints

```css
/* Extra Large Desktop */
@media (min-width: 1400px) { }

/* Desktop */
@media (max-width: 1200px) { }

/* Large Tablet */
@media (max-width: 1024px) { }

/* Tablet */
@media (max-width: 900px) { }

/* Mobile Large */
@media (max-width: 768px) { }

/* Mobile Medium */
@media (max-width: 600px) { }

/* Mobile Small */
@media (max-width: 480px) { }

/* Mobile Extra Small */
@media (max-width: 360px) { }

/* Landscape Mobile */
@media (max-width: 768px) and (orientation: landscape) { }
```

### Adaptaciones Mobile

#### Header
- Logo centrado en mobile
- Navegación oculta, reemplazada por MobileNav
- Logo desaparece en tablets (921px)

#### Footer
- 4 columnas → 2 columnas (1024px)
- 2 columnas → 1 columna (768px)
- Elementos centrados en mobile
- Iconos más pequeños (40px → 36px)

#### Cards
- Grid adaptativo con minmax(280px, 1fr)
- En mobile: 1 columna fija

#### Formularios
- 2 columnas → 1 columna en 768px
- Newsletter input stacked en mobile

---

## 🎭 Estética y Feel

### Concepto General

**Tema:** Oscuro y minimalista con acentos rojos vibrantes

**Características:**
- **Fondo negro puro** (#000000) como base
- **Contraste fuerte** entre elementos oscuros y texto blanco
- **Acento rojo (#ff003c)** como color de marca dominante
- **Tipografía ligera** (font-weight: 100-400) para la mayoría del texto
- **Títulos en mayúsculas** para dar impacto
- **Bordes sutiles** en grises oscuros para separar secciones

### Jerarquía Visual

1. **Rojo (#ff003c):** Elementos interactivos principales, CTAs, iconos importantes
2. **Blanco (#ffffff):** Títulos principales, texto destacado
3. **Gris claro (#cccccc):** Texto de contenido normal
4. **Gris medio (#999):** Metadatos, información secundaria
5. **Gris oscuro (#333-#666):** Bordes, divisores, elementos de fondo

### Interacciones

**Principios:**
- **Feedback inmediato:** Todos los elementos interactivos tienen hover states
- **Elevación sutil:** Los elementos se elevan ligeramente (translateY) al hacer hover
- **Cambio de color:** Los enlaces y botones cambian a tonos rojos
- **Sombras aumentadas:** Los elementos activos tienen sombras más prominentes
- **Transiciones suaves:** 0.3s ease para la mayoría de transiciones

### Espaciado

**Aire respirable:**
- Padding generoso en secciones (48px-64px)
- Gaps consistentes en grids (16px-48px)
- Línea de altura cómoda para lectura (1.6-1.7)

### Bordes y Esquinas

**Redondeados suaves:**
- Cards: 8px-12px
- Botones: 5px-12px
- Inputs: 8px
- Iconos sociales: 50% (círculo) u 8px

### Sombras

**Sutiles pero presentes:**
```css
/* Card shadow */
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

/* Header shadow */
box-shadow: 0 0px 20px rgba(14, 14, 14, 0.63);

/* Button shadow */
box-shadow: 0 4px 20px rgba(255, 0, 60, 0.4);

/* Hover button shadow */
box-shadow: 0 8px 30px rgba(255, 0, 60, 0.6);
```

### Iconografía

- **FontAwesome** para todos los iconos
- Iconos de ubicación, calendario, redes sociales
- Color consistente con el esquema (rojo para destacar, gris para información)

### Imágenes

- **Aspect ratio 1:1** para consistencia en cards
- **Border-radius** aplicado para suavizar
- **Object-fit: cover** para mantener proporciones
- **Efectos hover:** Saturación y brillo aumentados

---

## 🎨 Mood y Personalidad

### Palabras Clave

- **Moderno**
- **Minimalista**
- **Elegante**
- **Energético** (por el rojo vibrante)
- **Profesional**
- **Musical/Artístico**

### Inspiración

El diseño evoca:
- Plataformas de streaming musical (Spotify, Apple Music)
- Sitios de eventos nocturnos y clubes
- Portafolios de artistas contemporáneos
- Diseño de ticketing moderno

### Accesibilidad

```css
/* Reducción de movimiento para usuarios con preferencias */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none;
    animation: none;
  }
}

/* Focus visible para navegación por teclado */
:focus-visible {
  outline: 2px solid #ff003c;
  outline-offset: 2px;
}
```

### Targets táctiles (Mobile)

```css
/* Mínimo 44px para elementos tocables */
min-height: 44px;
display: flex;
align-items: center;
justify-content: center;
```

---

## 📋 Checklist de Diseño

Al crear nuevos componentes, asegúrate de:

- [ ] Usar la paleta de colores establecida
- [ ] Implementar estados hover/focus/active
- [ ] Añadir transiciones suaves (0.3s ease)
- [ ] Usar border-radius consistente (8px-12px)
- [ ] Implementar diseño responsive
- [ ] Probar en móvil (mínimo 320px)
- [ ] Añadir sombras apropiadas
- [ ] Usar Montserrat como fuente
- [ ] Mantener contraste adecuado
- [ ] Implementar focus-visible para accesibilidad
- [ ] Respetar los breakpoints establecidos
- [ ] Usar el sistema de espaciado consistente

---

## 🔄 Versionado

**Versión:** 1.0  
**Última actualización:** Noviembre 2025  
**Mantenedor:** Alex Alvarez Almendros

---

## 📚 Referencias

- Fuente: [Google Fonts - Montserrat](https://fonts.google.com/specimen/Montserrat)
- Iconos: [FontAwesome](https://fontawesome.com/)
- Paleta: Personalizada con base en #ff003c

