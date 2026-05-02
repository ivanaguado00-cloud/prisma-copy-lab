# ARCHITECTURE.md

Arquitectura aplicada en PRISMA Copy Lab. Adaptación pragmática de MVC + DAO al stack Next.js App Router.

> Reglas globales obligatorias (responsabilidad única, no duplicación, naming, MVC, DAO) están definidas en `AGENTS.md`. Este documento traduce esas reglas a la estructura concreta del repositorio.

---

## 1. Estructura de carpetas

```
prisma-copy-lab/
├── AGENTS.md
├── CLAUDE.md
├── CODEX.md
├── README.md
├── contexto_proyecto.md
├── docs/
│   ├── PROJECT_BRIEF.md
│   ├── SCOPE_MVP.md
│   ├── PRISMA_CONTEXT.md
│   ├── VALIDATION_CRITERIA.md
│   ├── DATA_MODEL.md
│   ├── ARCHITECTURE.md
│   ├── PROMPTS.md
│   ├── GIT_WORKFLOW.md
│   └── DEMO_SCRIPT.md
├── data/
│   └── corpus/
│       ├── dosier.md
│       ├── guia_narrativa.md
│       ├── buenas_practicas.md
│       └── criterios_validacion.md
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/
├── src/
│   ├── app/                       # rutas Next.js (Vista + Controlador)
│   │   ├── layout.tsx
│   │   ├── page.tsx               # inicio
│   │   ├── briefs/
│   │   │   ├── new/page.tsx       # wizard de briefing
│   │   │   ├── [id]/page.tsx      # detalle de caso
│   │   │   └── page.tsx           # histórico
│   │   ├── api/                   # route handlers cuando proceda
│   │   │   ├── briefs/route.ts
│   │   │   ├── messages/route.ts
│   │   │   └── validations/route.ts
│   │   └── actions/               # server actions
│   │       ├── briefActions.ts
│   │       ├── messageActions.ts
│   │       └── validationActions.ts
│   ├── components/                # presentación reutilizable
│   │   ├── ui/                    # componentes shadcn/ui
│   │   ├── briefing/
│   │   ├── messaging/
│   │   └── validation/
│   ├── services/                  # lógica de negocio
│   │   ├── briefService.ts
│   │   ├── generationService.ts
│   │   ├── validationService.ts
│   │   └── llm/
│   │       ├── client.ts          # cliente OpenAI
│   │       └── mockClient.ts      # mock activable por env
│   ├── dao/                       # acceso a datos
│   │   ├── briefDao.ts
│   │   ├── messageVersionDao.ts
│   │   ├── validationRunDao.ts
│   │   └── validationScoreDao.ts
│   ├── lib/
│   │   ├── prisma.ts              # cliente Prisma singleton
│   │   ├── corpus.ts              # carga lazy de data/corpus
│   │   └── utils.ts
│   └── types/
│       ├── domain.ts
│       └── llm.ts
├── tests/
│   ├── unit/
│   └── integration/
├── .claude/
│   └── skills/
│       ├── prisma-validation-criteria/SKILL.md
│       └── update-project-context/SKILL.md
├── .env.example
├── package.json
└── tsconfig.json
```

## 2. MVC aplicado

| Capa MVC | Realización en Next.js |
|---|---|
| **Vista (V)** | Componentes en `src/components/` y archivos `page.tsx` cuando solo presentan. Server Components por defecto, Client Components solo cuando hay interactividad real. |
| **Controlador (C)** | Server Actions en `src/app/actions/` y Route Handlers en `src/app/api/` cuando aporten. Reciben petición, validan input, delegan en services. |
| **Modelo (M)** | DAOs en `src/dao/` + esquema `prisma/schema.prisma` + tipos de dominio en `src/types/domain.ts`. |

Ningún componente React debe llamar directamente a Prisma. Ningún DAO debe contener lógica de negocio. Ningún servicio debe construir HTML.

## 3. DAO obligatorio

Todo acceso a base de datos pasa por `src/dao/`. Cada tabla principal tiene su DAO:

- `briefDao.ts`: `createBrief`, `getBriefById`, `listBriefs`, `updateBrief`, `deleteBrief`.
- `messageVersionDao.ts`: `createMessageVersion`, `getMessageVersionById`, `listVersionsByBrief`.
- `validationRunDao.ts`: `createValidationRun`, `getValidationRunById`, `listValidationRunsByMessage`.
- `validationScoreDao.ts`: `createValidationScores` (en bloque, los siete a la vez).

Reglas:
- Los DAOs **no** validan reglas de negocio. Solo persisten o leen.
- Los DAOs reciben tipos de dominio explícitos, no `any`.
- Los DAOs no exponen el `PrismaClient` al exterior.

## 4. Capa de servicios

`src/services/` contiene la lógica de negocio. Cada servicio coordina DAOs y, cuando aplica, el cliente LLM.

- **`briefService.ts`**: validación de campos del briefing, normalización antes de persistir.
- **`generationService.ts`**: prepara el prompt de generación combinando `PRISMA_CONTEXT` + briefing + canal + modo, llama al cliente LLM, persiste resultado como `message_versions`.
- **`validationService.ts`**: prepara el prompt del validador, parsea la salida JSON, calcula el `overallVerdict` aplicando la matriz de `VALIDATION_CRITERIA.md`, persiste `validation_runs` + siete `validation_scores`.
- **`llm/client.ts`**: encapsula la llamada a OpenAI gpt-4o-mini con parámetros (temperatura, response_format) y manejo de errores.
- **`llm/mockClient.ts`**: devuelve respuestas pregrabadas. Se activa con la variable de entorno `LLM_MOCK=true`.

## 5. Server Actions vs Route Handlers

Decisión por defecto, alineada con `AGENTS.md`:

- **Server Actions** para mutaciones disparadas desde formularios del propio app (crear briefing, generar versión, lanzar validación, iterar).
- **Route Handlers** solo si surgiera necesidad de endpoint público o consumido por terceros, lo cual no ocurre en el MVP. Si en algún momento se decide exponer una API, se documenta el motivo en este archivo.

## 6. Carga del corpus de Prisma

Para evitar inflar el contexto en cada llamada al LLM:

- `src/lib/corpus.ts` carga los `.md` de `data/corpus/` solo cuando se solicitan, mediante funciones `getNarrativeGuide()`, `getBestPractices()`, `getValidationCriteria()`, `getDossier()`.
- En cada generación se inyecta **únicamente** la sección operativa correspondiente (resumen ya definido en `docs/PRISMA_CONTEXT.md`), no el documento entero.
- En cada validación se inyectan los siete bloques tal como aparecen en `VALIDATION_CRITERIA.md` y, cuando el bloque lo requiere, los pasajes específicos del corpus.

## 7. Manejo de errores y fallback

- Si la llamada al LLM falla, el servicio devuelve un error estructurado y la UI muestra mensaje accionable (sin stack traces).
- El cliente mock activable por env permite continuar la demo en grabación si la API tuviera caída.
- Los errores de validación de input (campos del briefing) se devuelven al formulario, no se persisten.

## 8. Patrones aplicados (resumen para documentación de PR)

Cada PR que toque estructura debe declarar, según el formato de `AGENTS.md`:

- **MVC**: separación entre `app/` (vista + controlador), `services/` (negocio) y `dao/` (datos). Motivo: contrato académico y mantenibilidad.
- **DAO**: aislar Prisma del resto del sistema. Motivo: evitar acoplamiento al ORM y permitir cambios futuros (Postgres, Supabase) sin tocar negocio.
- **Service Layer**: orquestar DAOs + cliente LLM en una sola capa. Motivo: que los Route Handlers / Server Actions queden delgados.
- **Adapter** (en `services/llm/`): el cliente real y el cliente mock comparten interfaz. Motivo: poder grabar el vídeo sin depender de red real.
- **Strategy** (suave) en `generationService.ts`: el modo `produccion` o `exploracion` cambia parámetros del prompt. Motivo: encapsular la variación sin condicionales dispersos.

## 9. Testing

Cobertura mínima descrita en `AGENTS.md`. En este proyecto se prioriza:

- **Unit**: validación del input del briefing, parsing de la salida JSON del validador, cálculo del `overallVerdict` aplicando la matriz.
- **Integración**: flujo completo crear brief → generar mensaje → validar → leer detalle.
- **Mock del LLM en tests**: nunca golpear la API real en CI.

## 10. Variables de entorno

| Variable | Uso |
|---|---|
| `DATABASE_URL` | Ruta SQLite (`file:./prisma/dev.db`) |
| `OPENAI_API_KEY` | Clave API de OpenAI |
| `OPENAI_MODEL` | Modelo a usar (default `gpt-4o-mini`) |
| `LLM_MOCK` | `true` activa el cliente mock |

Plantilla en `.env.example`. Las claves reales nunca deben subirse al repositorio.
