# DEMO_SCRIPT.md

Guion del vídeo demostrativo. Loom o herramienta equivalente. Duración objetivo: 5-6 minutos.

> Antes de grabar, ejecutar la app con `LLM_MOCK=true` o con datos seed previamente cargados, para que la demo no dependa de respuestas en directo.
>
> Tener abiertos en pestañas: la app local, el repositorio en GitHub, el README, y opcionalmente Prisma Studio (`npx prisma studio`) para mostrar la BD.

---

## Estructura

| Bloque | Tiempo | Contenido |
|---|---|---|
| Intro y problema | 0:00 - 0:30 | Presentación de PRISMA Copy Lab y el problema que resuelve. |
| Repositorio y buenas prácticas | 0:30 - 1:15 | GitHub, ramas, commits, tags, README, estructura de carpetas. |
| Briefing | 1:15 - 2:00 | Crear un briefing nuevo desde el wizard. |
| Generación | 2:00 - 2:45 | Generar mensaje con IA y ver el resultado. |
| Validación automática | 2:45 - 3:45 | Lanzar validador y ver los siete bloques + veredicto. |
| Histórico y detalle | 3:45 - 4:30 | Recorrido por casos guardados. |
| Iteración (si F7 está implementada) | 4:30 - 5:15 | Crear nueva versión a partir de una instrucción. |
| Cierre | 5:15 - 6:00 | Base de datos, trazabilidad, qué NO hace la app, conexión TFM. |

## Guion narrado

### 0:00 - 0:30 — Intro y problema

> "Hola. Soy Iván Aguado y esto es PRISMA Copy Lab, la práctica final del módulo de Desarrollo Vibe Coding. La aplicación resuelve un problema concreto del TFM en el que estoy trabajando: en Universidad Prisma, una universidad ficticia, los equipos de marketing dedican demasiado tiempo a crear, validar e iterar mensajes comerciales para WhatsApp y email. PRISMA Copy Lab estructura ese proceso, lo conecta con un modelo de IA y deja registro de todo."

### 0:30 - 1:15 — Repositorio y buenas prácticas

> "Empezamos por el repositorio en GitHub. Veis que hay ramas por funcionalidad: project-setup, database-prisma, llm-generation, validation-engine, history-detail. Cada una mergeada vía pull request a main. Aquí están los tags por hito: v0.1-setup, v0.2-database, v0.3-generation, v0.4-validation, hasta v1.0-mvp. Los commits siguen Conventional Commits."
>
> [Mostrar README, estructura de carpetas en VS Code o GitHub]
>
> "El repositorio sigue una estructura MVC con DAO. La carpeta `src/app` es la vista y los controladores; `src/services` es la lógica de negocio; `src/dao` aísla el acceso a base de datos."

### 1:15 - 2:00 — Briefing

> "Voy a crear un briefing comercial. El wizard recoge título de campaña, programa o titulación, objetivo único, público, canal —en este caso WhatsApp—, modo de generación —Producción—, propuesta de valor, llamada a la acción y restricciones. Estos campos no son aleatorios: corresponden a las buenas prácticas de comunicación comercial de Prisma."
>
> [Rellenar el wizard con un caso real: por ejemplo "Captación Máster Ciberseguridad" para profesionales en activo]

### 2:00 - 2:45 — Generación

> "Al guardar el briefing, la app llama a OpenAI gpt-4o-mini con un prompt que combina la guía de tono y voz de Prisma con los campos que acabo de rellenar. Esto es lo que devuelve."
>
> [Mostrar el mensaje generado en pantalla]
>
> "Veis que respeta el formato WhatsApp: una idea principal, frases cortas, una sola CTA. Si abriera Prisma Studio, vería que ya hay una entrada en la tabla `message_versions`."

### 2:45 - 3:45 — Validación automática

> "El siguiente paso: validar el mensaje. La app envía el mensaje al validador, que evalúa los siete bloques internos de Prisma: alineación estratégica, claridad y estructura, tono y coherencia de marca, calidad argumental, adaptación al canal, precisión y fiabilidad, y calidad final de ejecución. Cada bloque devuelve un estado, un comentario y, cuando aplica, un ajuste sugerido."
>
> [Mostrar la pantalla de validación con los siete bloques desplegados]
>
> "El veredicto global —aprobada, aprobada con ajustes o no aprobada— no lo decide el modelo: lo calcula el código aplicando una matriz documentada en docs/VALIDATION_CRITERIA.md. Esto reduce subjetividad y hace el resultado replicable."

### 3:45 - 4:30 — Histórico y detalle

> "Todo queda guardado. En el histórico veo la lista de casos por fecha, con su canal y veredicto. Si entro en el detalle, veo briefing, mensaje, los siete bloques, el modelo y la versión del prompt usados, y el timestamp."
>
> [Click en un caso del histórico, recorrido por el detalle]

### 4:30 - 5:15 — Iteración

> [Solo si F7 está implementada]
>
> "Si quiero iterar, escribo una instrucción breve, por ejemplo 'hazlo más directo' o 'reduce el tono promocional', y la app genera una nueva versión vinculada al briefing original. Las dos versiones quedan trazadas, una con `versionNumber` 1 y la siguiente con 2."

### 5:15 - 6:00 — Cierre

> "Resumen: la app conecta con base de datos real —SQLite con Prisma—, genera con un LLM —OpenAI gpt-4o-mini—, valida contra criterios reales documentados, y mantiene trazabilidad completa. Lo que NO hace y dejo claro: no envía mensajes, no es un CRM, no automatiza campañas. Es una herramienta de creación, validación y trazabilidad, alineada con el caso de uso de Universidad Prisma de mi TFM."
>
> "Las herramientas vibe coding usadas: Antigravity como IDE agente con context programming basado en archivos `.md`; Claude Code y Codex como apoyo de desarrollo; GPTs especializados —CTO para no técnicos, generador de archivos `.md`, ayudante programador— como soporte metodológico antes y durante la implementación. La metodología completa, las decisiones técnicas y las alternativas valoradas están en el PDF que acompaña la entrega. Gracias."

## Lista de comprobación pre-grabación

- [ ] App ejecuta sin errores en `npm run dev`.
- [ ] Datos seed cargados (`npx prisma db seed`).
- [ ] Variable `LLM_MOCK=true` activada o conexión a OpenAI verificada.
- [ ] README actualizado con instrucciones de ejecución.
- [ ] Repositorio público o con visibilidad correcta para entrega.
- [ ] Prisma Studio listo en pestaña abierta (opcional).
- [ ] Audio probado con grabación de 30 segundos.
- [ ] Resolución de pantalla limpia (sin notificaciones, sin pestañas privadas).

## Plan B si algo falla en directo

- Si el LLM no responde: cambiar a `LLM_MOCK=true` y reiniciar la app.
- Si Prisma Studio falla: omitir esa pestaña, mencionar la BD verbalmente.
- Si la grabación se corta: dividir en dos clips y editarlos con `ffmpeg` o iMovie/CapCut.
- Si Loom falla por duración: usar OBS Studio (gratis, sin límite).
