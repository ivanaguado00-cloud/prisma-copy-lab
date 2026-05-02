# PROJECT_BRIEF.md

Resumen ejecutivo del producto. Sirve de referencia rápida para cualquier agente o persona que se incorpore al proyecto.

---

## Producto

**PRISMA Copy Lab.** Aplicación web interna para la creación, validación y trazabilidad de comunicaciones comerciales de Universidad Prisma (entorno ficticio académico).

## Problema que resuelve

Los equipos de marketing y comunicación comercial de Universidad Prisma dedican demasiado tiempo a crear, adaptar, revisar e iterar mensajes para WhatsApp y email. El proceso actual es manual, poco escalable y carece de trazabilidad: no queda registrado qué versión generó qué resultado, ni con qué criterios fue validada cada pieza.

## Para qué sirve

- Estructurar el briefing antes de generar un mensaje.
- Producir una propuesta de mensaje con IA respetando el tono institucional de Prisma.
- Evaluar la propuesta automáticamente contra los siete criterios internos de validación.
- Mantener un histórico consultable con briefing, mensaje generado, validación y metadatos.

## Para qué NO sirve

- No es un CRM ni gestiona contactos.
- No envía mensajes reales por WhatsApp ni por email.
- No automatiza campañas comerciales.
- No incluye autenticación, roles ni multiusuario.
- No reemplaza al equipo de marketing: lo asiste.

## Marco académico

Este proyecto se entrega como práctica final del módulo "Desarrollo Vibe Coding" del Máster en IA Generativa. Forma parte de una línea de trabajo más amplia sobre Universidad Prisma vinculada al TFM. La práctica anterior cubrió la pieza de automatización en n8n; esta práctica aporta lo que aquella no podía: código propio en repositorio Git, base de datos relacional propia, validador automático contra los siete bloques y trazabilidad histórica.

## Frase objetivo del MVP

PRISMA Copy Lab permite generar, validar y trazar mensajes comerciales de Universidad Prisma contra criterios internos de marca y calidad, sin enviar comunicaciones reales.

## Documentos relacionados

- Alcance funcional: `docs/SCOPE_MVP.md`.
- Caso de uso del cliente ficticio: `docs/PRISMA_CONTEXT.md`.
- Criterios del validador automático: `docs/VALIDATION_CRITERIA.md`.
