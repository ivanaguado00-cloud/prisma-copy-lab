# contexto_proyecto.md

Estado funcional y operativo de PRISMA Copy Lab.

Este archivo describe **qué hace el sistema, qué módulos lo componen, qué flujos cubre y qué restricciones aplican**. No contiene reglas globales de código (esas están en `AGENTS.md`) ni reglas locales de carpeta (esas viven en cada subcarpeta).

---

## 1. Qué es PRISMA Copy Lab

Aplicación web interna que permite a un equipo de marketing y comunicación comercial de Universidad Prisma:

- registrar un briefing comercial estructurado
- generar una propuesta de mensaje comercial con IA para WhatsApp o email
- validar automáticamente la propuesta contra los siete criterios internos de la universidad
- consultar el histórico de generaciones con su trazabilidad

No envía mensajes reales, no gestiona contactos y no automatiza campañas. Es un entorno controlado de creación, validación y trazabilidad.

## 2. Módulos del sistema

### 2.1 Briefing
Captura la información mínima para generar un mensaje. Implementado como wizard de varios pasos.

### 2.2 Generación
Convierte un briefing en una propuesta de mensaje mediante una llamada a un proveedor LLM. Cada generación se guarda como una versión vinculada al briefing original.

### 2.3 Validación
Evalúa una versión de mensaje contra los siete bloques de criterios internos de Prisma y produce un veredicto global. La validación se persiste como un registro independiente con detalle por bloque.

### 2.4 Histórico
Lista cronológica de briefings con sus versiones y validaciones. Permite acceder al detalle de cada caso.

### 2.5 Detalle de caso
Vista que muestra briefing, versiones generadas, validaciones por bloque, veredicto global y metadatos de modelo y fecha.

## 3. Flujo principal de usuario

1. Crear briefing comercial.
2. Generar primera versión de mensaje.
3. Lanzar validación automática.
4. Consultar veredicto global y detalle por bloque.
5. (Opcional) Crear nueva versión a partir de una instrucción de ajuste.
6. Acceder al histórico para revisar casos anteriores.

## 4. Estado actual

### Fase completada: `feature/project-setup`

Esqueleto técnico funcional. `npm run dev` arranca sin errores y sirve la página de bienvenida en `localhost:3000`.

Lo que está en marcha:

- Next.js 16.2.4 (App Router, Turbopack) con TypeScript estricto (`strict`, `noUncheckedIndexedAccess`).
- Tailwind CSS v4, shadcn/ui v4.6 con tema neutro. Componente `Button` disponible en `src/components/ui/`.
- ESLint (flat config) + Prettier configurados. Scripts `lint` y `format` en `package.json`.
- Estructura de carpetas creada según `docs/ARCHITECTURE.md`: `src/services/`, `src/services/llm/`, `src/dao/`, `src/lib/`, `src/types/`, `src/components/briefing|messaging|validation/`, `src/app/api/`, `src/app/actions/`, `tests/unit/`, `tests/integration/`.
- `README.md` con instrucciones reales de instalación y ejecución.

### Fase completada: `feature/database-prisma`

Capa de persistencia completa y verificada.

Lo que está en marcha:

- Prisma 7 instalado con `@prisma/adapter-better-sqlite3` (v7 exige driver adapter; no existe cliente por defecto sin él).
- `prisma/schema.prisma` con 4 modelos: `Briefing`, `MessageVersion`, `ValidationRun`, `ValidationScore`. Primera migración (`init`) aplicada.
- Singleton del cliente Prisma con adapter en `src/lib/prisma.ts`.
- `prisma.config.ts` en raíz: configura la ruta del seed (reemplaza el bloque `"prisma": { "seed": ... }` de versiones anteriores de Prisma).
- Tipos de dominio en `src/types/domain.ts`: enums literales TypeScript para `Channel`, `Mode`, `OverallVerdict`, `ScoreStatus` y `CriterionKey` (SQLite no admite enums nativos; los valores se validan en servicios antes de persistir).
- 4 DAOs base en `src/dao/` con operaciones mínimas: `create`, `getById`, `list` (y variantes por relación cuando procede).
- `prisma/seed.ts` con 3 briefings, 3 versiones de mensaje, 3 validaciones y 21 scores. Cubre los tres veredictos posibles: aprobada, aprobada_con_ajustes y no_aprobada. Verificado con `npx prisma studio`.
- Script `db:seed` en `package.json` operativo. El cliente generado vive en `src/generated/prisma/` (en `.gitignore`).

Aviso operativo: en `migrate reset`, Prisma 7 no siempre lanza el seed automáticamente. Ejecutar `npm run db:seed` manualmente tras el reset.

### Fase completada: `feature/briefing-crud`

Primera funcionalidad visible al usuario: crear, listar y ver el detalle de briefings.

Lo que está en marcha:

- `src/services/briefService.ts`: valida los 7 campos obligatorios (`title`, `objective`, `audience`, `channel`, `mode`, `valueProposition`, `cta`) con mensajes de error por campo, verifica que `channel` y `mode` sean valores del enum, normaliza espacios en todos los campos de texto y convierte opcionales vacíos a `undefined`. Delega la persistencia en `briefDao.createBrief`.
- `src/app/actions/briefActions.ts`: Server Action `createBriefAction`. Extrae FormData, llama a `briefService` y, en caso de éxito, ejecuta `redirect('/briefs/[id]')` desde el servidor (patrón idiomático React 19 + Next.js App Router). En caso de error devuelve el estado de errores al formulario vía `useActionState`.
- `src/components/briefing/BriefingForm.tsx`: Client Component con `useActionState`. Muestra errores por campo. No contiene lógica de negocio.
- `src/app/briefs/new/page.tsx`: Server Component que renderiza `BriefingForm`.
- `src/app/briefs/page.tsx`: Server Component con listado cronológico inverso de briefings (título, canal, fecha, enlace al detalle). Muestra los datos del seed de la fase anterior.
- `src/app/briefs/[id]/page.tsx`: Server Component con detalle completo del briefing. Llama a `notFound()` si el ID no existe.
- `src/app/page.tsx`: landing del proyecto (reemplaza la plantilla stock de Next.js). Accesos directos a `/briefs/new` y `/briefs`.
- shadcn/ui adicionales instalados: `input`, `textarea`, `select`, `label`, `card`, `separator`.
- Vitest (`vitest`, `@vitest/coverage-v8`) instalado como devDependency. Scripts `test` y `test:watch` en `package.json`. 13 tests unitarios en `tests/unit/briefService.test.ts` cubriendo todos los campos obligatorios, enums inválidos, normalización de espacios y caso feliz.

Nota técnica: el componente `Button` de este proyecto usa `@base-ui/react`, que no soporta la prop `asChild`. Para renderizar un `Link` con estilos de botón se usa `buttonVariants` directamente sobre el `<Link>` (`import { buttonVariants } from '…/button'`).

### Fase completada: `feature/llm-generation`

Generación de mensajes con LLM. F2 del MVP operativa.

Lo que está en marcha:

- `src/types/llm.ts`: interfaz `GenerationClient { generate(system, user): Promise<string> }` + constante `GENERATION_PROMPT_VERSION = "v1.0"`. Contrato del patrón Adapter compartido por cliente real y mock.
- `src/services/llm/client.ts`: `OpenAIGenerationClient`. Usa SDK `openai` v4. Lee `OPENAI_API_KEY` y `OPENAI_MODEL` del entorno. Temperatura: 0.4 (producción) / 0.7 (exploración).
- `src/services/llm/mockClient.ts`: `MockGenerationClient`. Devuelve respuestas pregrabadas por canal (whatsapp / email). Activo cuando `LLM_MOCK=true`.
- `src/services/llm/factory.ts`: `getGenerationClient()`. Selecciona el cliente real o el mock según `process.env.LLM_MOCK`.
- `src/services/generationService.ts`: `generateMessage(brief)`. Construye system prompt y user prompt (plantilla v1.0 de `docs/PROMPTS.md`), llama al cliente LLM, asigna `versionNumber` incremental y persiste `MessageVersion` con metadatos (`llmProvider`, `llmModel`, `generationPromptVersion`).
- `src/app/actions/messageActions.ts`: Server Action `generateMessageAction(briefId)`. Recupera el briefing, delega en `generateMessage` y redirige a `/briefs/[id]` tras éxito.
- `src/components/messaging/MessageVersionView.tsx`: Server Component que renderiza una `MessageVersion` (número de versión, fecha, contenido, modelo, versión de prompt).
- `src/app/briefs/[id]/page.tsx` ampliada: carga versiones en paralelo con el briefing; botón "Generar mensaje" prominente si no hay versiones, secundario ("+ Nueva versión") si ya existen; lista cada versión con `MessageVersionView`.
- Dependencia `openai` (SDK v4) añadida como runtime.
- 11 tests unitarios en `tests/unit/generationService.test.ts`: construcción del prompt, `versionNumber` incremental, metadatos persistidos, `llmModel = "mock"` cuando `LLM_MOCK=true`.

Lo que está completado en fases siguientes:

- Fase 5: validación automática. Ver sección siguiente.

Lo que falta (próximas fases):

- Iteración de versiones (F7): nueva versión a partir de instrucción del usuario.
- Búsqueda y filtros (F6): filtrar briefings por canal, modo o veredicto.

### Fase completada: `feature/validation-engine`

Validación automática de mensajes. F3 del MVP operativa.

Lo que está en marcha:

- `src/types/llm.ts` ampliado: interfaz `ValidationClient { validate(system, user): Promise<string> }` + constante `VALIDATOR_PROMPT_VERSION = "v1.0"`. Separada de `GenerationClient` porque usa parámetros LLM distintos (temperatura fija 0.0, response_format json_object).
- `src/services/llm/client.ts`: `OpenAIValidationClient`. Llama con `temperature: 0.0` y `response_format: { type: "json_object" }` para garantizar determinismo.
- `src/services/llm/mockClient.ts`: `MockValidationClient`. Devuelve JSON pregrabado con 7 scores (5 `bien`, 2 `mejorable`), veredicto calculado `aprobada_con_ajustes`. Activo cuando `LLM_MOCK=true`.
- `src/services/llm/factory.ts`: `getValidationClient()` análogo a `getGenerationClient()`.
- `src/services/validationService.ts`: `calculateOverallVerdict(scores)` — función pura que aplica la matriz determinista de `docs/VALIDATION_CRITERIA.md` sección 6 (cualquier `critico` → `no_aprobada`; 2+ `mejorable` → `aprobada_con_ajustes`; resto → `aprobada`). `parseValidatorResponse(raw)` — parser estricto que rechaza JSON con menos de 7 scores, claves renombradas, duplicados, status fuera de los tres permitidos o comment vacío. `validateMessage(messageVersionId)` — orquestador: carga `MessageVersion` + `Brief`, llama al `ValidationClient`, reintenta hasta 3 veces si el parser rechaza, calcula el veredicto en código, persiste `ValidationRun` + 7 `ValidationScore`. `criteriaVersion = "v1.0"` se persiste en cada run.
- `src/app/actions/validationActions.ts`: Server Action `validateMessageAction(messageVersionId)`. Delega en `validationService` y redirige a `/briefs/[id]`.
- `src/components/validation/ValidationView.tsx`: Server Component. Muestra badge de veredicto coloreado (verde/amarillo/rojo), resumen, 7 bloques con nombre legible + badge de status + comentario + `suggestedFix` opcional, y bloque de `suggestedRewrite` si existe.
- `src/app/briefs/[id]/page.tsx` ampliada: carga `validation_runs` en paralelo para todas las versiones; muestra `ValidationView` si existe run, botón "Validar mensaje" si no.
- System prompt del validador: replica la plantilla de `docs/PROMPTS.md` sección 4 `v1.0`. Incluye instrucción explícita de no devolver el `overallVerdict`.
- 21 tests unitarios nuevos en `tests/unit/validationService.test.ts`. Total suite: 48 tests. Cubren las 3 ramas de `calculateOverallVerdict` con casos límite y el parser con casos válidos e inválidos.

El alcance del MVP está definido en `docs/SCOPE_MVP.md` (F1-F5 obligatorias, F6-F9 recomendables, F10+ excluidas).

## 5. Restricciones funcionales

- Sin login ni autenticación en MVP. Usuario implícito mock.
- Sin envío real por WhatsApp ni email.
- Sin CRM, contactos ni campañas reales.
- Sin RAG con embeddings: el corpus de Prisma se carga como `.md` resumidos en `data/corpus/`.
- Sin métricas avanzadas, A/B testing ni dashboards.
- Sin integración con n8n dentro del MVP.
- Sin despliegue a producción dentro del alcance evaluable; ejecución en local con SQLite.

## 6. Stack tecnológico (resumen)

Frontend y backend dentro de un solo proyecto Next.js (App Router) con TypeScript. Estilos con Tailwind y componentes de shadcn/ui. Persistencia con Prisma ORM sobre SQLite local. Generación y validación con OpenAI gpt-4o-mini. Detalles ampliados en `docs/ARCHITECTURE.md`.

## 7. Documentación complementaria

- Reglas globales de código y patrones obligatorios: `AGENTS.md`.
- Decisiones de producto: `docs/PROJECT_BRIEF.md`, `docs/SCOPE_MVP.md`.
- Contexto de Universidad Prisma: `docs/PRISMA_CONTEXT.md`, `data/corpus/`.
- Validador automático: `docs/VALIDATION_CRITERIA.md`.
- Modelo de datos: `docs/DATA_MODEL.md`.
- Arquitectura aplicada: `docs/ARCHITECTURE.md`.
- Plantillas de prompts: `docs/PROMPTS.md`.
- Estrategia Git: `docs/GIT_WORKFLOW.md`.
- Guion del vídeo demostrativo: `docs/DEMO_SCRIPT.md`.

## 8. Convenciones documentales

- `AGENTS.md` raíz contiene las reglas globales del proyecto.
- `CLAUDE.md` y `CODEX.md` son puentes que importan `@AGENTS.md`. No deben duplicar contenido.
- `contexto_proyecto.md` (este archivo) describe el estado funcional del sistema.
- `docs/` agrupa la documentación de producto, arquitectura, datos, prompts y proceso.
- Los archivos `AGENTS.md` o `CLAUDE.md` dentro de subcarpetas aplican únicamente a esa zona del proyecto.
- Los archivos `.override` solo deben crearse para sobrescribir reglas heredadas; deben evitarse salvo necesidad real.

## 9. Mantenimiento de este archivo

Cualquier cambio funcional relevante debe reflejarse aquí. La skill `update-project-context` (en `.claude/skills/`) describe el procedimiento esperado.
