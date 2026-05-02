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

Versión inicial en construcción. El alcance del MVP está definido en `docs/SCOPE_MVP.md` (F1-F5 obligatorias, F6-F9 recomendables, F10+ excluidas).

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
