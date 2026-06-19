# Estilo Evolve — Guía de diseño de PRISMA Copy Lab

Este documento captura el sistema de diseño activo del proyecto. Sirve como referencia canónica para mantener consistencia visual en cualquier nuevo componente, plantilla o página.

---

## Identidad de marca

| Token            | Valor                                      |
|------------------|--------------------------------------------|
| Nombre           | Universidad Prisma                         |
| Claim            | Impulsa tu futuro, desde donde estés       |
| Website          | https://universidadprisma.es               |
| Nombre interno   | PRISMA Copy Lab                            |

---

## Paleta de colores

### Superficies (escala neutra cálida)

| Nombre                     | Valor     | Uso                              |
|----------------------------|-----------|----------------------------------|
| surface-bright             | `#fbf9f8` | Fondo base del body              |
| surface-container-lowest   | `#ffffff` | Cards, inputs, contenido puro    |
| surface-container-low      | `#f5f3f3` | Fondos de sección, sidebars      |
| surface-container          | `#efeded` | Fondo wrapper exterior (emails)  |
| surface-container-high     | `#e9e8e7` | Headers de cards, chips, tracks  |
| surface-container-highest  | `#e4e2e2` | Avatares, elementos de mayor contraste |

### Texto

| Nombre              | Valor     | Uso                          |
|---------------------|-----------|------------------------------|
| on-surface          | `#1b1c1c` | Texto principal              |
| on-surface-variant  | `#4c4546` | Texto secundario / labels    |
| outline             | `#7e7576` | Texto muted / placeholders   |
| outline-variant     | `#cfc4c5` | Bordes, separadores          |

### Marca

| Nombre          | Valor     | Uso                                         |
|-----------------|-----------|---------------------------------------------|
| brand-primary   | `#1b1c1c` | Acciones principales, CTAs y énfasis de marca |
| brand-secondary | `#4c4546` | Hover, textos secundarios y apoyos visuales |
| on-brand        | `#ffffff` | Texto sobre fondos de marca oscuros        |

### Estados semánticos

| Nombre                  | Valor     | Uso                        |
|-------------------------|-----------|----------------------------|
| success-container       | `#e3f5ec` | Badge aprobada             |
| on-success-container    | `#1a6639` | Texto en badge aprobada    |
| warning-container       | `#fef3cd` | Badge con ajustes          |
| on-warning-container    | `#7c5c0a` | Texto en badge con ajustes |
| error-container         | `#ffdad6` | Badge no aprobada          |
| on-error-container      | `#93000a` | Texto en badge no aprobada |
| error-cp                | `#ba1a1a` | Texto de error en formularios |

---

## Tipografía

- **Sans principal:** `Inter`, fallback `Helvetica Neue`, `Arial`, `sans-serif`
- **Heading (display):** variable CSS `--font-heading` (aplicada con `style={{ fontFamily: 'var(--font-heading)' }}`)
- **Mono:** `--font-geist-mono` (metadatos técnicos, números de brief `BR-000`)

### Escala de texto frecuente

| Uso                        | Clase Tailwind              |
|----------------------------|-----------------------------|
| H1 hero                    | `text-5xl sm:text-6xl font-bold tracking-tight` |
| H1 de página interior      | `text-2xl font-bold`        |
| H2 de sección / card       | `text-lg sm:text-xl font-bold` |
| Body                       | `text-sm` o `text-base leading-relaxed` |
| Label de campo             | `text-sm font-medium`       |
| Metadata / micro           | `text-xs text-on-surface-variant` |
| Chip / badge uppercase     | `text-xs font-semibold uppercase tracking-widest` |

---

## Bordes y radio

- **Radio base:** `0.25rem` (4px) — estilo cuadrado/minimalista
- Clases: `rounded` (4px), `rounded-lg` (cards grandes), `rounded-full` (pills y badges)
- **Border color estándar:** `border-outline-variant` / `#cfc4c5`

---

## Espaciado y layout

- **Max-width contenido:** `max-w-[1280px]` con `mx-auto`
- **Padding horizontal:** `px-6 md:px-16` (páginas públicas) / `px-6 md:px-10` (interiores)
- **Navbar height:** `h-16`, sticky, `bg-surface-bright`, `border-b border-outline-variant`
- **Gap de grids:** `gap-3` (denso) a `gap-6` (cómodo)

---

## Componentes clave

### Botón CTA principal (conversión)
```
rounded px-6 py-3 text-sm font-semibold bg-[#1b1c1c] text-white
hover:bg-[#4c4546] transition-colors disabled:opacity-50
```
Color de acción: `#1b1c1c`

### Botón primario oscuro (acción de página)
```
rounded px-6 py-3 text-sm font-semibold bg-[#1b1c1c] text-white
hover:bg-[#4c4546] transition-colors
```

### Botón secundario / outline
```
rounded px-4 py-2 text-sm font-medium border border-[#1b1c1c] text-[#1b1c1c]
hover:bg-[#e9e8e7] transition-colors
```

### Botón ghost / texto
```
text-xs font-medium text-on-surface-variant hover:text-on-surface
border border-outline-variant hover:border-on-surface rounded px-3 py-1.5 transition-all
```

### Inputs y Textareas
```
bg-transparent border-[#cfc4c5] text-[#1b1c1c] placeholder:text-[#7e7576]
focus-visible:ring-0 focus-visible:border-[#1b1c1c]
```

### Card estándar
```
bg-white border border-[#cfc4c5] rounded-lg
```
Con header interno: `px-6 py-4 border-b border-[#e9e8e7]`

### Badge / pill de estado
```
inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full
```
Colores: usar containers semánticos (success / warning / error).

### Filter pill (navegación)
- Activo: `bg-secondary-container text-on-surface font-semibold rounded-full`
- Inactivo: `border border-outline-variant text-on-surface-variant hover:bg-surface-container-high rounded-full`

### Borde de acento lateral (reminder)
```
border-left: 4px solid #1b1c1c
```

---

## Plantillas de email

Las plantillas HTML de email replican la identidad visual con inline styles para máxima compatibilidad con clientes de correo. Cuatro layouts disponibles:

| ID            | Nombre                  | Uso recomendado                             |
|---------------|-------------------------|---------------------------------------------|
| `standard`    | Email informativo       | Comunicaciones explicativas o de presentación |
| `promotional` | Email comercial         | Captación, conversión, reactivación         |
| `reminder`    | Email recordatorio      | Fechas, convocatorias, seguimiento          |
| `newsletter`  | Email visual destacado  | Campañas con fuerte peso visual             |

**Estructura común:**
- Wrapper 600px, `border-radius: 8px`, fondo `#ffffff`, fondo exterior `#efeded`
- Header: fondo `#f5f3f3` con borde inferior negro `3px solid #1b1c1c`
- CTA button: `background-color: #1b1c1c`, texto `#ffffff`, `border-radius: 6px`, `padding: 12px 28px`
- Footer: fondo `#f5f3f3`, texto `#4c4546`, tamaño 11-12px

---

## Scrollbar personalizada

```css
width: 6px; height: 6px;
track: #f5f3f3;
thumb: #cfc4c5 → hover #7e7576;
border-radius: 3px;
```

---

## Reglas generales

1. **Sin modo oscuro.** El sistema es exclusivamente light.
2. **El negro `#1b1c1c` es el color de acción y conversión** en páginas públicas, flujos internos y emails.
3. **No usar verde lima como color de marca o CTA.** Los verdes quedan limitados a estados semánticos de éxito cuando aplique.
4. **Sin sombras fuertes.** Máximo `box-shadow: 0 1px 4px rgba(0,0,0,.08)`.
5. **Bordes finos, cuadrados.** Preferir `rounded` sobre `rounded-lg` en elementos pequeños.
6. **Tipografía compacta.** `tracking-tight` en headings, `tracking-widest` solo en labels uppercase micro.
