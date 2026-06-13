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
- preparar emails aprobados como propuesta maquetada y enviarla internamente al equipo de CRM

No envía mensajes reales a destinatarios finales, no gestiona contactos y no automatiza campañas. El flujo "Preparar para CRM" envía únicamente una propuesta interna al equipo de CRM para revisión humana previa. Es un entorno controlado de creación, validación, trazabilidad y preparación de materiales.

## 2. Módulos del sistema

### 2.1 Briefing
Captura la información mínima para generar un mensaje. El campo "Titulación o programa" es un Select agrupado por escuela (5 escuelas, 23 programas de Universidad Prisma). El campo "CTA" es un Select con 7 opciones predefinidas más la opción "Otro" que despliega un input personalizado. Constantes de opciones en `src/lib/briefingOptions.ts`.

Para briefs de canal email, el usuario selecciona la **Plantilla** (`emailTemplate`: Estándar, Promocional, Informativo/Newsletter, Recordatorio/Seguimiento). El asunto (`emailSubject`) y el preheader (`emailPreheader`) **no son campos del formulario**: los genera la IA como parte del output estructurado de la generación y se persisten en `MessageVersion`.

### 2.2 Generación
Convierte un briefing en una propuesta de mensaje mediante una llamada a un proveedor LLM. Cada generación se guarda como una versión vinculada al briefing original.

Para canal **whatsapp** el LLM devuelve texto plano (el cuerpo del mensaje). Para canal **email** el LLM devuelve JSON estructurado `{ body, emailSubject, emailPreheader }` usando `response_format: json_object`; el prompt incluye la plantilla seleccionada en el brief para condicionar tono y estructura. Los tres campos se persisten en `MessageVersion` (`content` = body, más `emailSubject` y `emailPreheader` como columnas propias). El tipo de retorno del cliente LLM es `Promise<GeneratedMessage>` (en `src/types/domain.ts`).

### 2.3 Validación
Evalúa una versión de mensaje contra los siete bloques de criterios internos de Prisma y produce un veredicto global. La validación se persiste como un registro independiente con detalle por bloque.

### 2.4 Histórico
Lista cronológica de briefings con sus versiones y validaciones. Permite acceder al detalle de cada caso.

### 2.5 Detalle de caso
Vista que muestra briefing, versiones generadas, validaciones por bloque, veredicto global y metadatos de modelo y fecha. Incluye el botón "Preparar para CRM" cuando el brief es de canal email y la versión más reciente está validada como `aprobada` o `aprobada_con_ajustes`.

Para canal **whatsapp**, la vista previa del mensaje muestra dos vistas alternables mediante tabs: notificación push (tarjeta simulada con icono verde de WhatsApp, nombre del brief y texto truncado) y burbuja de chat (interfaz de conversación WhatsApp con fondo oscuro y burbuja verde).

### 2.6 Preparar para CRM
Flujo de preparación de emails aprobados para el equipo de CRM. Solo aplica a briefs de canal email con validación aprobada. El flujo tiene dos pasos: (1) previsualización automática del email maquetado con la plantilla fijada en el brief, (2) aprobación y envío al correo interno de CRM (`CRM_RECIPIENT_EMAIL`). No hay selector de plantilla en este paso: la plantilla se elige al crear el brief (`emailTemplate`) y se usa directamente.

El email enviado a CRM contiene: la propuesta maquetada en HTML y texto plano, todos los datos relevantes del brief, asunto interno, preheader, CTA y notas opcionales para el equipo.

Tras el envío exitoso, el estado del brief pasa a `sent_to_crm`. Sin SMTP configurado, el sistema opera en modo mock y registra el envío en consola.

La identidad visual está separada de la lógica de contenido en `src/lib/emailTemplates.ts` (brand kit + templates). Las plantillas disponibles y sus `templateId` (alineados con el enum de dominio) son: `standard` (informativo), `promotional` (comercial), `reminder` (recordatorio), `newsletter` (visual destacado).

## 3. Flujo principal de usuario

1. Crear briefing comercial (seleccionar programa del catálogo y CTA predefinida o personalizada).
2. Generar primera versión de mensaje.
3. Lanzar validación automática.
4. Consultar veredicto global y detalle por bloque.
5. (Opcional) Crear nueva versión a partir de una instrucción de ajuste.
6. Si el brief es email y la validación es aprobada: "Preparar para CRM" → revisar previsualización con la plantilla del brief → aprobar y enviar al equipo de CRM.
7. Acceder al histórico para revisar casos anteriores.

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

- `src/types/llm.ts`: interfaz `GenerationClient { generate(system, user): Promise<string> }` + constante `GENERATION_PROMPT_VERSION = "v1.1"`. Contrato del patrón Adapter compartido por cliente real y mock.
- `src/services/llm/client.ts`: `OpenAIGenerationClient`. Usa SDK `openai` v4. Lee `OPENAI_API_KEY` y `OPENAI_MODEL` del entorno. Temperatura: 0.4 (producción) / 0.7 (exploración).
- `src/services/llm/mockClient.ts`: `MockGenerationClient`. Devuelve respuestas pregrabadas por canal (whatsapp / email). Activo cuando `LLM_MOCK=true`.
- `src/services/llm/factory.ts`: `getGenerationClient()`. Selecciona el cliente real o el mock según `process.env.LLM_MOCK`.
- `src/services/generationService.ts`: `generateMessage(brief)`. Construye system prompt y user prompt (plantilla v1.1 de `docs/PROMPTS.md`), llama al cliente LLM, asigna `versionNumber` incremental y persiste `MessageVersion` con metadatos (`llmProvider`, `llmModel`, `generationPromptVersion`). En iteraciones con `userInstruction`, carga la versión padre y genera una única versión final a partir de versión anterior + briefing + ajuste.
- `src/app/actions/messageActions.ts`: Server Action `generateMessageAction(briefId)`. Recupera el briefing, delega en `generateSingle` y redirige a `/briefs/[id]` tras éxito. Cada acción explícita del usuario crea como máximo una versión visible.
- `Brief.briefNumber`: número secuencial por usuario, visible como `BR-001`, `BR-002`... en listado, detalle, dashboard y exportación.
- `src/components/messaging/MessageVersionView.tsx`: Server Component que renderiza una `MessageVersion` (número de versión, fecha, contenido, modelo, versión de prompt).
- `src/app/briefs/[id]/page.tsx` ampliada: carga versiones en paralelo con el briefing; botón "Generar mensaje" prominente si no hay versiones, secundario ("+ Nueva versión") si ya existen; lista cada versión con `MessageVersionView`.
- Dependencia `openai` (SDK v4) añadida como runtime.
- 11 tests unitarios en `tests/unit/generationService.test.ts`: construcción del prompt, `versionNumber` incremental, metadatos persistidos, `llmModel = "mock"` cuando `LLM_MOCK=true`.

Lo que está completado en fases siguientes:

- Fase 5: validación automática. Ver sección siguiente.

Lo que falta (próximas fases):

- Iteración de versiones (F7): nueva versión a partir de instrucción del usuario, sin publicar intentos internos automáticos.
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

### Fase completada: mejoras al formulario de briefing

- `programOrTitulation`: Select agrupado por escuela con los 23 programas oficiales de Universidad Prisma (5 escuelas). Opciones en `src/lib/briefingOptions.ts`.
- `cta`: Select con 7 opciones predefinidas + opción "Otro" que despliega un input obligatorio para CTA personalizada. El Server Action y el servicio no requirieron cambios: el campo `cta` recibe siempre el valor final.

### Fase completada: `feature/crm-flow`

Funcionalidad "Preparar para CRM". Solo para briefs de canal email con validación aprobada.

Lo que está en marcha:

- `prisma/schema.prisma` ampliado en `Brief`: `crmStatus`, `crmSentAt`, `crmSentBy`, `crmEmailHtml`, `crmEmailPlainText`, `crmInternalSubject`, `crmNotes`. `selectedTemplateId` eliminado en migración `20260613140000_remove_selected_template_id` (la plantilla queda en `emailTemplate`).
- `src/types/domain.ts`: enum `CRM_STATUS` con valores `ready_for_crm` y `sent_to_crm`.
- `src/lib/emailTemplates.ts`: brand kit centralizado (`PRISMA_BRAND_KIT`) + 4 plantillas (`EMAIL_TEMPLATES`) con `templateId`/`layout` alineados con el enum de dominio: `standard`, `promotional`, `reminder`, `newsletter`. Renderizadores `renderEmailHtml` y `renderEmailPlainText`.
- `src/services/emailService.ts`: abstracción `sendEmail(payload)`. Sin `SMTP_HOST`, opera en modo mock. Con `SMTP_HOST`, usa nodemailer.
- `src/services/crmService.ts`: `buildCrmPreview(brief, emailBody)` y `sendToCrm(input)`. La plantilla se deriva de `brief.emailTemplate` (fallback: `standard`). No acepta `templateId` como parámetro externo.
- `src/dao/briefDao.ts`: método `updateBriefCrm`. `UpdateBriefCrmInput` ya no incluye `selectedTemplateId`.
- `src/app/actions/crmActions.ts`: Server Actions `previewCrmEmailAction(briefId)` y `sendToCrmAction(briefId, crmNotes?)`. Sin parámetro `templateId`.
- `src/components/crm/CrmFlow.tsx`: orquestador del flujo modal con estados `loading_preview`, `previewing`, `sent`, `error`. Carga la preview automáticamente al montar, sin paso de selección de plantilla.
- `src/components/crm/CrmEmailPreview.tsx`: iframe con el HTML maquetado + panel lateral con datos del brief + campo de notas CRM + botón de confirmación.
- `src/components/crm/PrepareCrmButton.tsx`: botón cliente que abre el flujo. Muestra "Enviado a CRM" si ya se envió.
- Variables de entorno nuevas en `.env.example`: `CRM_RECIPIENT_EMAIL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.

### Fase completada: `feature/fase-a-navegacion-ui`

Navegación y panel lateral con estado activo, sistema de tokens y sidebar colapsable.

Lo que está en marcha:

- `src/components/layout/NavLinks.tsx`: Client Component (`'use client'`) con `usePathname()`. Estado activo por ruta exacta (`/`) o prefijo (`/briefs`, `/dashboard`). Activo: `font-semibold text-on-surface`; inactivo: `text-on-surface-variant hover:text-on-surface`.
- `src/components/layout/Navbar.tsx`: conserva Server Component async con `await auth()`; delega la lista de links a `NavLinks`. Cero hex hardcodeados: usa tokens `bg-surface-bright`, `border-outline-variant`, `text-on-surface`, `text-on-surface-variant`, `bg-surface-container-highest`.
- `src/components/layout/Sidebar.tsx`: tokenización completa (todos los hex reemplazados por tokens del sistema); canal activo por `useSearchParams().get('channel')` comparado contra `channelKey` del item; colapsado (w-14, solo iconos con tooltip) / expandido (w-64, labels); botón toggle en el fondo con chevron; transición `transition-[width] duration-200`.
- `src/components/layout/SidebarContext.tsx`: Context + Provider con estado `collapsed` (default `false`); lee y persiste en `localStorage('prisma-sidebar-collapsed')` dentro de `useEffect` para evitar hydration mismatch; expone `useSidebar()` hook.
- `src/components/layout/MainShell.tsx`: Client Component que consume `useSidebar()` y aplica `md:ml-64` (expandido) o `md:ml-14` (colapsado) con `transition-[margin] duration-200`.
- `src/app/(app)/layout.tsx`: envuelve en `SidebarProvider`; `<Sidebar>` dentro de `<Suspense>` (requerido por `useSearchParams`); `<MainShell>` sustituye al `<main>` anterior.

Tokens migrados en esta fase (hex → token): `#fbf9f8`→`surface-bright`, `#cfc4c5`→`outline-variant`, `#4c4546`→`on-surface-variant`, `#1b1c1c`→`on-surface`, `#e4e2e2`→`surface-container-highest`, `#f5f3f3`→`surface-container-low`, `#e3e2e2`→`secondary-container`, `#e9e8e7`→`surface-container-high`.

Decisiones de diseño: `Navbar` permanece Server Component para conservar `await auth()` en servidor; el estado activo se resuelve en un Client Component hoja (`NavLinks`) que no arrastra lógica de sesión. El colapsado usa un Context de React con `localStorage` (no cookies) porque es una preferencia de UI local sin necesidad de SSR.

### Fase completada: `feature/fase-b-canal-crm-ui`

Diferenciación visual por canal, migración de tema oscuro heredado a Corporate Precision light y filtrado real por canal.

Lo que está en marcha:

**Bloque 1 — Tokens y schema:**
- `src/app/globals.css`: 7 nuevos tokens en `@theme inline`: `brand-lime` (#c3f400), `brand-lime-dim` (#abd600), `on-brand-lime` (#283500), `success-container` (#e3f5ec), `on-success-container` (#1a6639), `warning-container` (#fef3cd), `on-warning-container` (#7c5c0a). Utility `prisma-gradient-bg` definida con `@utility`.
- `prisma/schema.prisma`: `channel String @default("whatsapp")`. Migración `add_channel_default` aplicada.
- `src/lib/channelUtils.ts`: helpers `isWhatsApp(channel)` e `isEmail(channel)` para eliminar comparaciones string dispersas.

**Bloque 2 — CRM components (dark → Corporate Precision light):**
- `PrepareCrmButton.tsx`, `CrmFlow.tsx`, `CrmTemplateSelector.tsx`, `CrmEmailPreview.tsx`: todos los hex del tema oscuro heredado (`#0d0e10`, `#1b1c1e`, `#1f2022`, `#444933`, `#e3e2e5`, `#c4c9ac` y colores brand lime inline) sustituidos por tokens CP. JS `onMouseEnter/onMouseLeave` en `CrmTemplateSelector` eliminado a favor de clases CSS puras. El `background: '#fff'` del iframe de previsualización de email se preserva como requisito funcional del renderizado HTML.

**Bloque 3 — MessageVersionView + WhatsAppPreview:**
- `src/components/messaging/WhatsAppPreview.tsx` (nuevo, Server Component): burbuja de chat con topbar, área de chat y burbuja de mensaje. Colores externos de WhatsApp (`#075E54`, `#dcf8c6`, `#111b21`, `#667781`) preservados como literales (no son tokens CP; son marca externa). Contenedor usa tokens CP.
- `src/components/messaging/MessageVersionView.tsx`: preview WhatsApp reemplazado por `<WhatsAppPreview>`; `VERDICT_BADGE` migrado de inline styles con hex oscuros a clases `success/warning/error-container`; resto de hex tokenizados.
- `src/app/(app)/briefs/[id]/page.tsx`: `OverallVerdictBadge` y `STATUS_META` migrados a tokens `success/warning-container`; todos los hex del archivo tokenizados.

**Bloque 4 — Filtro de canal real y botón contextual:**
- `src/dao/briefDao.ts`: `listBriefs(userId, channel?)` acepta canal opcional para filtrar en base de datos.
- `src/app/(app)/briefs/page.tsx`: lee `searchParams.channel` (Promise en Next.js 15); filtra `displayedBriefs` por canal activo; KPIs globales se calculan siempre sobre `allBriefs`; botón "Nuevo briefing" lleva a `/briefs/new?channel=<canal>` cuando hay filtro activo; todos los hex tokenizados.
- `src/components/briefing/BriefingForm.tsx`: acepta prop `defaultChannel?: string`; preselecciona el Select de canal con `defaultValue`.
- `src/app/(app)/briefs/new/page.tsx`: lee `searchParams.channel` y lo pasa a `BriefingForm`; todos los hex tokenizados.
- `src/components/layout/Sidebar.tsx`: botones "Create New Brief" (collapsed y expanded) contextuales con `newBriefHref = channel ? /briefs/new?channel=<canal> : /briefs/new`.

**PASO 0 (hallazgo):** `/briefs/page.tsx` no filtraba por canal antes de esta fase — mostraba todos los briefs del usuario independientemente del filtro del sidebar. Corregido en este bloque.

### Fase completada: `feature/fase-c-revision-flow`

Flujo de revisión humana sobre briefs: roles de usuario, estado de revisión, panel de acción para revisores y notificación al autor.

Lo que está en marcha:

**Bloque 1 — Schema + tipos:**
- `prisma/schema.prisma`: `role String @default("author")` en `User`; `reviewStatus String @default("pending")`, `reviewedBy String?`, `reviewedAt DateTime?`, `reviewNote String?` en `Brief`. Migración `add_review_fields` aplicada.
- `src/types/domain.ts`: enums `USER_ROLE` (`author`, `reviewer`) y `REVIEW_STATUS` (`pending`, `approved`, `rejected`).
- `src/types/next-auth.d.ts`: augmentación de tipos para exponer `role` en `JWT`, `User` y `Session`.
- `prisma/seed.ts`: `admin@prisma.es` creado/actualizado con `role: 'reviewer'`.

**Bloque 2 — Auth:**
- `src/auth.ts`: `authorize` devuelve `role` junto a `id`/`email`/`name`; callbacks `jwt` y `session` propagan `role` al token JWT y a `session.user.role`.

**Bloque 3 — DAO + servicio + acciones:**
- `src/dao/briefDao.ts`: `updateBriefReview(id, data)` para actualizar los 4 campos de revisión.
- `src/dao/userDao.ts` (nuevo): `getUserById(id)` para lookup de email del autor.
- `src/services/reviewService.ts` (nuevo): `setReviewStatus` valida rol, actualiza Brief vía DAO y notifica al autor vía `emailService` (mock por defecto, SMTP real si configurado).
- `src/app/actions/reviewActions.ts` (nuevo): Server Actions `approveBriefAction` y `rejectBriefAction`; verifican sesión, delegan en `reviewService`, revalidan la ruta.

**Bloque 4 — UI:**
- `src/components/review/ReviewPanel.tsx` (nuevo, Client Component): formulario con nota opcional, botones Aprobar/Rechazar, deshabilita el estado ya activo, muestra error inline.
- `src/app/(app)/briefs/[id]/page.tsx`: `ReviewStatusBadge` visible para todos los usuarios (pending/approved/rejected con nota); `ReviewPanel` montado solo para revisores; revisores acceden a cualquier brief (`getBriefById` sin filtro de userId).

**Restricción activa:** el mismatch label/enum de los estados del sidebar (Pendiente/Rechazada vs valores reales) se deja para una fase posterior.

### En curso: `feature/email-preview-refactor` — Cambios 1 y 2 completados

Refactorización de previsualizaciones y generación estructurada de email.

**Cambio 1 — Output estructurado del LLM para email (completado):**
- `emailSubject` y `emailPreheader` eliminados del modelo `Brief` (migración `20260613120000_move_email_fields_to_message_version`).
- Añadidos a `MessageVersion` como columnas propias (`emailSubject String?`, `emailPreheader String?`).
- `GenerationClient.generate()` retorna `Promise<GeneratedMessage>` en vez de `Promise<string>`.
- Para email: `response_format: json_object`, prompt específico con hint de plantilla, parser de JSON en el cliente.
- Para whatsapp: retorno envuelto como `{ body: content }`, sin cambio en el prompt.
- `BriefingForm` ya no muestra inputs de Asunto ni Preheader para email; solo el selector de Plantilla.
- `briefService` ya no valida emailSubject/emailPreheader como campos obligatorios.

**Cambio 2 — Unificación de plantillas y flujo CRM sin selector (completado):**
- Nombres de plantillas en `emailTemplates.ts` migrados a los mismos valores que el enum de dominio: `standard`, `promotional`, `reminder`, `newsletter`. Eliminado el doble sistema de nombres.
- `selectedTemplateId` eliminado de `Brief` (migración `20260613140000_remove_selected_template_id`). La plantilla se deriva directamente de `brief.emailTemplate`.
- `buildCrmPreview` y `sendToCrm` ya no aceptan `templateId` como parámetro: lo derivan del brief.
- `CrmFlow` arranca directamente en `loading_preview` al abrir; ya no tiene paso de selección de plantilla.
- `CrmTemplateSelector` eliminado.

**Cambio 3 — Previsualización dual WhatsApp: push notification + burbuja de chat (completado):**
- `WhatsAppPreview.tsx` renombrado a `WhatsAppChatBubble.tsx` (misma UI, nombre explícito).
- Nuevo `WhatsAppPushNotification.tsx`: simula tarjeta de notificación push Android/iOS con icono verde de WhatsApp, nombre de contacto, texto truncado a 2 líneas y marca "ahora". Usa tokens del sistema para el contenedor exterior; colores de WhatsApp hardcoded en la tarjeta.
- Nuevo `WhatsAppPreviewTabs.tsx` (Client Component): tabs "Notificación push" / "Burbuja de chat" con chips de marca lima. Recibe `content` y `contactName` opcional.
- `MessageVersionView.tsx`: usa `WhatsAppPreviewTabs` en lugar de `WhatsAppChatBubble` directamente; acepta nueva prop `briefTitle` que se pasa como `contactName`.
- `briefs/[id]/page.tsx`: `MessagePreviewCard` actualizado para renderizar `WhatsAppPreviewTabs` en canal whatsapp; recibe `briefTitle={brief.title}` como nombre de contacto en la notificación push.

La rama `feature/email-preview-refactor` contiene los tres cambios completados. Pendiente: apertura de PR hacia `main`.

## 5. Restricciones funcionales

- Autenticación básica implementada con NextAuth v5 (credentials). No hay roles ni permisos granulares.
- Sin envío real por WhatsApp ni email.
- Sin envío de mensajes a destinatarios finales (leads/alumnos). El flujo CRM solo envía propuestas internas al equipo de CRM para revisión humana previa.
- Sin integración con CRM real, segmentación automática ni gestión de contactos.
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
