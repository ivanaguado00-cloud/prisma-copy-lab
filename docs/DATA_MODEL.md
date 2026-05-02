# DATA_MODEL.md

Modelo de datos de PRISMA Copy Lab. Cuatro tablas, sin tabla de usuario en el MVP.

> ORM: Prisma. Base de datos: SQLite local (`prisma/dev.db`).

---

## 1. Vista general

```
briefs (1) ────< (N) message_versions (1) ────< (N) validation_runs (1) ────< (N) validation_scores
```

- Un `brief` puede tener varias `message_versions` (iteraciones).
- Una `message_version` puede tener varias `validation_runs` (re-validaciones), aunque en el MVP se espera una principal.
- Una `validation_run` tiene exactamente siete `validation_scores`, uno por bloque.

## 2. Tabla `briefs`

Información estructurada que el usuario rellena en el wizard.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | string (cuid) | PK |
| `title` | string | nombre o título de campaña |
| `programOrTitulation` | string? | titulación o programa referenciado, opcional |
| `objective` | string | objetivo único de la pieza |
| `audience` | string | descripción del público objetivo |
| `channel` | enum (`whatsapp`, `email`) | canal destino |
| `mode` | enum (`produccion`, `exploracion`) | tono de generación |
| `valueProposition` | string | palanca o propuesta de valor principal |
| `cta` | string | llamada a la acción esperada |
| `constraints` | string? | restricciones, tono específico, exclusiones |
| `createdAt` | datetime | timestamp de creación |
| `updatedAt` | datetime | timestamp de última edición |

Reglas:
- `title`, `objective`, `audience`, `channel`, `mode`, `valueProposition` y `cta` son obligatorios.
- `programOrTitulation` y `constraints` son opcionales.

## 3. Tabla `message_versions`

Cada versión de mensaje generada o iterada.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | string (cuid) | PK |
| `briefId` | string | FK → `briefs.id`, on delete cascade |
| `versionNumber` | int | empieza en 1, incrementa por brief |
| `content` | string (text) | texto generado |
| `llmProvider` | string | "openai" en MVP |
| `llmModel` | string | "gpt-4o-mini" en MVP |
| `generationPromptVersion` | string | "v1.0", "v1.1"... versionado de plantilla |
| `userInstruction` | string? | instrucción de iteración cuando aplica (F7) |
| `parentVersionId` | string? | FK → `message_versions.id`, opcional, autoreferencia para iteración |
| `createdAt` | datetime | |

Reglas:
- `versionNumber` empieza en 1 y es único dentro de un mismo `briefId`.
- Si `userInstruction` es null, es una generación inicial; si tiene valor, es una iteración (y `parentVersionId` debería estar relleno).

## 4. Tabla `validation_runs`

Validación global de una versión de mensaje.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | string (cuid) | PK |
| `messageVersionId` | string | FK → `message_versions.id`, on delete cascade |
| `overallVerdict` | enum (`aprobada`, `aprobada_con_ajustes`, `no_aprobada`) | calculado en código |
| `summary` | string (text) | resumen del LLM, máximo 3 frases |
| `suggestedRewrite` | string (text)? | reescritura sugerida, opcional |
| `validatorModel` | string | "gpt-4o-mini" en MVP |
| `validatorPromptVersion` | string | "v1.0"... |
| `criteriaVersion` | string | "v1.0"... corresponde a `docs/VALIDATION_CRITERIA.md` |
| `createdAt` | datetime | |

Reglas:
- `overallVerdict` se calcula aplicando la matriz definida en `docs/VALIDATION_CRITERIA.md` sección 6.
- `summary` y `suggestedRewrite` provienen del LLM.

## 5. Tabla `validation_scores`

Detalle por bloque dentro de una validación. Siete filas por `validationRunId`.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | string (cuid) | PK |
| `validationRunId` | string | FK → `validation_runs.id`, on delete cascade |
| `criterionKey` | enum | una de las siete claves técnicas |
| `criterionName` | string | nombre legible del bloque |
| `status` | enum (`bien`, `mejorable`, `critico`) | |
| `comment` | string (text) | explicación del LLM |
| `suggestedFix` | string (text)? | ajuste concreto sugerido, opcional |

Claves técnicas posibles para `criterionKey`:
- `alineacion_estrategica`
- `claridad_estructura`
- `tono_coherencia_marca`
- `calidad_argumental`
- `adaptacion_canal`
- `precision_fiabilidad`
- `calidad_ejecucion`

Reglas:
- Por cada `validation_run` deben existir exactamente siete `validation_scores`, uno por cada `criterionKey`. Esto se valida en `services/validationService.ts` antes de persistir.

## 6. Esquema Prisma sugerido

Borrador inicial para `prisma/schema.prisma` (orientativo, ajustar nomenclatura final en código):

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Brief {
  id                  String           @id @default(cuid())
  title               String
  programOrTitulation String?
  objective           String
  audience            String
  channel             String
  mode                String
  valueProposition    String
  cta                 String
  constraints         String?
  createdAt           DateTime         @default(now())
  updatedAt           DateTime         @updatedAt

  versions            MessageVersion[]
}

model MessageVersion {
  id                      String           @id @default(cuid())
  briefId                 String
  versionNumber           Int
  content                 String
  llmProvider             String
  llmModel                String
  generationPromptVersion String
  userInstruction         String?
  parentVersionId         String?
  createdAt               DateTime         @default(now())

  brief                   Brief            @relation(fields: [briefId], references: [id], onDelete: Cascade)
  validationRuns          ValidationRun[]
  parentVersion           MessageVersion?  @relation("Iteration", fields: [parentVersionId], references: [id])
  iterations              MessageVersion[] @relation("Iteration")

  @@unique([briefId, versionNumber])
}

model ValidationRun {
  id                     String             @id @default(cuid())
  messageVersionId       String
  overallVerdict         String
  summary                String
  suggestedRewrite       String?
  validatorModel         String
  validatorPromptVersion String
  criteriaVersion        String
  createdAt              DateTime           @default(now())

  messageVersion         MessageVersion     @relation(fields: [messageVersionId], references: [id], onDelete: Cascade)
  scores                 ValidationScore[]
}

model ValidationScore {
  id              String        @id @default(cuid())
  validationRunId String
  criterionKey    String
  criterionName   String
  status          String
  comment         String
  suggestedFix    String?

  validationRun   ValidationRun @relation(fields: [validationRunId], references: [id], onDelete: Cascade)

  @@index([validationRunId])
}
```

> Nota técnica: SQLite no admite enums nativos. Se modelan como `String` con validación en la capa DAO. La validación de valores válidos se hace en `services/` antes de persistir.

## 7. Datos seed

Desde la fase 2 del desarrollo se carga seed obligatorio mediante `prisma/seed.ts`:

- 3 briefings de ejemplo (uno WhatsApp captación, uno email reactivación, uno WhatsApp matrícula).
- 3-5 mensajes generados, uno por brief mínimo.
- 3-5 validaciones, una por mensaje generado.

Esto garantiza que el vídeo demostrativo nunca dependa de la red en directo.
