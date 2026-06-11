# ARCHITECTURE.md

Arquitectura vigente de PRISMA Copy Lab. Adaptación pragmática de MVC + DAO al stack Next.js App Router.

> Reglas globales obligatorias (responsabilidad única, no duplicación, naming, MVC, DAO) están definidas en `AGENTS.md`. Este documento traduce esas reglas a la estructura real del repositorio.

---

## 1. Estructura de carpetas

Estructura relevante comprobada en el repo actual:

```text
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
├── prisma.config.ts
├── src/
│   ├── app/
│   │   ├── actions/
│   │   │   ├── agentActions.ts
│   │   │   ├── authActions.ts
│   │   │   ├── briefActions.ts
│   │   │   ├── crmActions.ts
│   │   │   ├── messageActions.ts
│   │   │   └── validationActions.ts
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   └── export/[briefId]/route.ts
│   │   ├── briefs/
│   │   │   ├── [id]/page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── login/page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── auth.ts
│   ├── components/
│   │   ├── briefing/BriefingForm.tsx
│   │   ├── crm/
│   │   │   ├── CrmFlow.tsx
│   │   │   ├── CrmTemplateSelector.tsx
│   │   │   ├── CrmEmailPreview.tsx
│   │   │   └── PrepareCrmButton.tsx
│   │   ├── layout/Navbar.tsx
│   │   ├── messaging/MessageVersionView.tsx
│   │   ├── messaging/VersionTree.tsx
│   │   ├── ui/
│   │   └── validation/ValidationView.tsx
│   ├── dao/
│   │   ├── briefDao.ts
│   │   ├── messageVersionDao.ts
│   │   ├── validationRunDao.ts
│   │   └── validationScoreDao.ts
│   ├── generated/prisma/
│   ├── lib/
│   │   ├── briefingOptions.ts
│   │   ├── emailTemplates.ts
│   │   ├── prisma.ts
│   │   ├── utils.ts
│   │   └── versionTreeUtils.ts
│   ├── services/
│   │   ├── agentService.ts
│   │   ├── briefService.ts
│   │   ├── crmService.ts
│   │   ├── emailService.ts
│   │   ├── exportService.ts
│   │   ├── generationService.ts
│   │   ├── orchestrationService.ts
│   │   ├── validationService.ts
│   │   └── llm/
│   │       ├── client.ts
│   │       ├── factory.ts
│   │       └── mockClient.ts
│   └── types/
├── middleware.ts
├── package.json
└── tests/
```

`src/generated/prisma/` contiene el cliente generado por Prisma y no debe editarse manualmente.

## 2. MVC aplicado

| Capa MVC | Realización en Next.js |
|---|---|
| **Vista (V)** | Componentes en `src/components/` y páginas en `src/app/**/page.tsx` cuando presentan estado o datos. Server Components por defecto; Client Components solo cuando hay interactividad real. |
| **Controlador (C)** | Server Actions en `src/app/actions/`, Route Handlers en `src/app/api/`, `middleware.ts` para control de acceso y `src/auth.ts` para configuración de autenticación. |
| **Modelo (M)** | DAOs en `src/dao/`, esquema `prisma/schema.prisma`, cliente Prisma en `src/lib/prisma.ts` y tipos de dominio en `src/types/`. |

Ningún componente React debe llamar directamente a Prisma. Ningún DAO debe contener lógica de negocio. Ningún servicio debe construir HTML.

## 3. DAO obligatorio

Todo acceso de dominio a base de datos pasa por `src/dao/`. Cada tabla principal del flujo de copy tiene su DAO:

- `briefDao.ts`: operaciones de persistencia y lectura de briefings; incluye `updateBriefCrm` para actualizar el estado y datos del flujo CRM.
- `messageVersionDao.ts`: operaciones sobre versiones de mensajes.
- `validationRunDao.ts`: operaciones sobre ejecuciones de validación.
- `validationScoreDao.ts`: persistencia de scores por bloque.

Reglas:

- Los DAOs no validan reglas de negocio. Solo persisten o leen.
- Los DAOs reciben tipos explícitos.
- Los DAOs no exponen el `PrismaClient` al exterior.

## 4. Modelo de datos vigente

El esquema Prisma incluye dos grupos:

- **Auth**: `User`, `Account`, `Session`, `VerificationToken`.
- **Dominio**: `Brief`, `MessageVersion`, `ValidationRun`, `ValidationScore`.

Relaciones relevantes:

- Un `User` tiene muchos `Brief`.
- Un `Brief` tiene muchas `MessageVersion`.
- Cada `Brief` tiene `briefNumber`, un número secuencial visible y único por usuario.
- Un `Brief` puede tener campos CRM opcionales: `crmStatus`, `selectedTemplateId`, `crmSentAt`, `crmSentBy`, `crmEmailHtml`, `crmEmailPlainText`, `crmInternalSubject`, `crmNotes`. Estos campos se rellenan cuando se completa el flujo "Preparar para CRM".
- Una `MessageVersion` puede tener `parentVersionId` y `userInstruction`, lo que permite representar iteraciones y árboles de versiones.
- Una `MessageVersion` tiene muchas `ValidationRun`.
- Una `ValidationRun` tiene siete `ValidationScore`.

SQLite no usa enums nativos; los valores de dominio se modelan como `String` y se validan en servicios/tipos.

## 5. Capa de servicios

`src/services/` contiene la lógica de negocio y orquestación:

- `briefService.ts`: validación y normalización del briefing antes de persistir.
- `generationService.ts`: construcción de prompts, llamada al cliente LLM y persistencia de `MessageVersion`.
- `validationService.ts`: llamada al validador, parseo estricto de JSON, cálculo determinista del veredicto y persistencia de `ValidationRun` + `ValidationScore`.
- `exportService.ts`: construcción de una exportación `.txt` con briefing, versiones y validaciones.
- `agentService.ts`: genera instrucciones de mejora a partir de validaciones no aprobadas y crea una nueva versión.
- `orchestrationService.ts`: coordina generación y validación en un único intento visible por petición de usuario.
- `emailService.ts`: abstracción de envío de email. En modo mock (sin `SMTP_HOST`) registra el envío en consola. Con `SMTP_HOST` configurado usa nodemailer (dependencia opcional).
- `crmService.ts`: `buildCrmPreview` y `sendToCrm`. Construye el HTML y texto plano del email maquetado usando `emailTemplates.ts`, compone el correo interno para CRM, delega el envío en `emailService` y actualiza el estado del brief.
- `services/llm/client.ts`: clientes OpenAI reales para generación y validación.
- `services/llm/mockClient.ts`: clientes mock activables con `LLM_MOCK=true`.
- `services/llm/factory.ts`: selección de cliente real o mock.

## 6. Autenticación y control de acceso

El repo actual incorpora autenticación básica:

- `src/auth.ts` configura NextAuth/Auth.js con proveedor Credentials y `PrismaAdapter`.
- `src/app/api/auth/[...nextauth]/route.ts` expone los handlers de autenticación.
- `src/app/login/page.tsx` contiene la pantalla de login.
- `src/app/actions/authActions.ts` gestiona acciones de autenticación.
- `middleware.ts` protege las rutas de la aplicación y redirige a `/login` cuando no hay sesión.
- `prisma/schema.prisma` contiene modelos `User`, `Account`, `Session` y `VerificationToken`.

Alcance: autenticación básica y asociación de briefings a usuario. No documenta roles, permisos granulares ni administración avanzada de usuarios.

## 7. Server Actions vs Route Handlers

Decisión vigente:

- **Server Actions** para mutaciones ligadas a UI: autenticación, crear briefing, generar mensaje, validar mensaje, acciones de agente/refinamiento y flujo CRM (`previewCrmEmailAction`, `sendToCrmAction`).
- **Route Handlers** cuando existe una superficie HTTP concreta:
  - `src/app/api/auth/[...nextauth]/route.ts`: contrato requerido por NextAuth/Auth.js.
  - `src/app/api/export/[briefId]/route.ts`: descarga `.txt` de un caso exportado.

No existen Route Handlers propios para `briefs`, `messages` o `validations`; esas mutaciones viven en Server Actions y servicios.

## 8. Contexto de Prisma y corpus

La documentación corporativa completa vive en `data/corpus/`:

- `dosier.md`
- `guia_narrativa.md`
- `buenas_practicas.md`
- `criterios_validacion.md`

`docs/PRISMA_CONTEXT.md` funciona como resumen operativo para generación y validación. `docs/VALIDATION_CRITERIA.md` adapta los criterios corporativos a una matriz determinista consumible por el validador.

En el repo actual no existe `src/lib/corpus.ts`; por tanto, cualquier carga o inyección de contexto debe comprobarse en los servicios y prompts vigentes antes de documentarse como implementada.

## 16. Flujo CRM

El flujo "Preparar para CRM" es exclusivo de briefs de canal email con validación aprobada:

1. `PrepareCrmButton` (Client Component) comprueba las condiciones en render y abre el modal `CrmFlow`.
2. `CrmFlow` gestiona los pasos del flujo con estado local: selección → preview → enviando → éxito/error.
3. `CrmTemplateSelector` muestra 4 cards con las plantillas disponibles.
4. Al seleccionar, `previewCrmEmailAction` (Server Action) llama a `crmService.buildCrmPreview` y devuelve el HTML al cliente sin persistir ni enviar nada.
5. `CrmEmailPreview` renderiza el HTML en un iframe y muestra el panel de brief. El usuario puede añadir notas.
6. Al confirmar, `sendToCrmAction` (Server Action) llama a `crmService.sendToCrm`: genera el HTML final, construye el correo interno, delega en `emailService`, actualiza el brief en BD.
7. Tras envío exitoso, el brief queda con `crmStatus = 'sent_to_crm'`.

Separación en `src/lib/emailTemplates.ts`:
- `PRISMA_BRAND_KIT`: colores, logo, tipografía, footer. Cambiar aquí afecta todos los emails.
- `EMAIL_TEMPLATES`: definición de 4 plantillas (id, nombre, descripción, layout).
- `renderEmailHtml`: genera el HTML del email. Cuatro layouts: informative, commercial, reminder, visual.
- `renderEmailPlainText`: genera la versión texto plano.

Restricciones de seguridad del flujo:
- El destinatario CRM es fijo (variable de entorno); el usuario no puede escribir destinatarios arbitrarios.
- Ninguna credencial de email se expone al cliente.
- El estado del brief no se actualiza si el envío falla.

## 9. Exportación

La exportación está implementada como descarga de texto:

- `src/services/exportService.ts` compone un `.txt` con datos del briefing, versiones, validaciones, scores y reescrituras sugeridas.
- `src/app/api/export/[briefId]/route.ts` devuelve `text/plain; charset=utf-8` con `Content-Disposition` de descarga.

No envía comunicaciones reales ni integra canales externos.

## 10. Árbol de versiones

El producto permite representar iteraciones mediante:

- `MessageVersion.parentVersionId`
- `MessageVersion.userInstruction`
- relación Prisma `Iteration`
- `src/components/messaging/VersionTree.tsx`
- `src/lib/versionTreeUtils.ts`

Esto soporta trazabilidad de versiones derivadas sin introducir un sistema colaborativo completo.

Regla de producto vigente: una acción explícita del usuario crea como máximo una `MessageVersion` visible. No se persisten como versiones públicas los intentos internos o ajustes automáticos derivados de validación.

## 11. Cliente LLM

El repo usa el paquete `openai` declarado en `package.json` (`^6.35.0`). La selección de cliente se encapsula en `services/llm/factory.ts`.

Reglas:

- El cliente real y el mock comparten interfaces de generación/validación.
- `LLM_MOCK=true` activa respuestas pregrabadas.
- Los tests no deben golpear la API real.
- Los parámetros de modelo, temperatura y formato de respuesta deben ser explícitos y trazables.

## 12. n8n como antecedente histórico

n8n forma parte del trabajo previo del TFM y sirvió como prototipo funcional para explorar el flujo de solicitud, generación y registro. No forma parte de la arquitectura vigente de PRISMA Copy Lab.

En este repositorio:

- no se ejecuta n8n
- no hay dependencia de n8n
- no hay webhooks n8n como superficie de producto
- el flujo vigente se implementa con Next.js, Server Actions/Route Handlers, servicios TypeScript, Prisma y OpenAI/mock

Cualquier documento o ZIP de n8n debe tratarse como referencia histórica, no como fuente arquitectónica activa.

## 13. Manejo de errores y fallback

- Los errores de validación de input se devuelven al formulario o a la acción correspondiente.
- Los errores de LLM deben manejarse en servicios y exponerse a UI sin stack traces.
- El cliente mock permite continuar desarrollo, tests y demo sin depender de red real.
- El validador parsea de forma estricta la salida JSON y recalcula el veredicto en código.

## 14. Patrones aplicados

- **MVC**: `app/` y `components/` para vista/control superficial, `services/` para negocio, `dao/` para datos.
- **DAO**: aísla Prisma del resto del sistema.
- **Service Layer**: centraliza reglas de negocio y orquestación.
- **Adapter**: clientes LLM real/mock bajo contrato común.
- **Strategy suave**: modo `produccion`/`exploracion` y flujos de refinamiento cambian comportamiento sin dispersar reglas.
- **Orchestration**: `orchestrationService.ts` coordina generación y validación posterior sin crear versiones intermedias automáticas.

## 15. Testing

Cobertura prioritaria:

- validación del briefing
- generación y metadatos de versiones
- parseo JSON del validador
- cálculo determinista del `overallVerdict`
- persistencia de `ValidationRun` y `ValidationScore`
- exportación de caso
- árbol de versiones
- servicios de agente/orquestación

## 16. Variables de entorno

| Variable | Uso |
|---|---|
| `DATABASE_URL` | Ruta SQLite |
| `OPENAI_API_KEY` | Clave API de OpenAI |
| `OPENAI_MODEL` | Modelo a usar |
| `LLM_MOCK` | `true` activa clientes mock |
| `AUTH_SECRET` | Secreto de autenticación |
| `CRM_RECIPIENT_EMAIL` | Destinatario fijo del correo interno CRM (por defecto: `ivan.aguado00@gmail.com`) |
| `SMTP_HOST` | Servidor SMTP para envío real (si no está presente, opera en modo mock) |
| `SMTP_PORT` | Puerto SMTP (por defecto: 587) |
| `SMTP_USER` | Usuario SMTP |
| `SMTP_PASS` | Contraseña SMTP |
| `SMTP_FROM` | Dirección de remitente para envíos reales |

Plantilla en `.env.example`. Las claves reales nunca deben subirse al repositorio.
