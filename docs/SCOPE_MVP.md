# SCOPE_MVP.md

Alcance funcional del MVP. Documento anti-desviación: cualquier funcionalidad no listada aquí queda fuera salvo decisión explícita.

---

## Categorías

- **Obligatorias (F1-F5)**: el MVP no se considera entregable sin ellas.
- **Recomendables (F6-F9)**: solo se implementan si F1-F5 cierran con holgura. No bloquean la entrega.
- **Excluidas**: fuera del alcance del MVP. Algunas pasan a la lista de mejoras futuras.

## Funcionalidades obligatorias (F1-F5)

### F1. Wizard de briefing comercial
Captura estructurada de la información mínima necesaria para generar un mensaje. Campos previstos:

- nombre o título de campaña
- programa o titulación referida (cuando aplique)
- objetivo único de la pieza
- público objetivo
- canal: `whatsapp` o `email`
- modo: `produccion` o `exploracion`
- propuesta de valor o palanca principal
- llamada a la acción (CTA)
- restricciones o tono específico solicitado

Justificación: conecta directamente con el documento de buenas prácticas de Prisma y con la sección "Reglas básicas de contenido".

### F2. Generación de mensaje con LLM
Convierte el briefing en una propuesta de mensaje. Llamada al proveedor configurado mediante variable de entorno. La generación se persiste como `message_versions`.

Justificación: corazón del caso de uso. Demuestra el uso aplicado de IA generativa.

### F3. Validador automático contra los siete bloques
Cada mensaje generado debe poder evaluarse automáticamente. La validación produce un veredicto global y un detalle por bloque, conforme a `docs/VALIDATION_CRITERIA.md`.

Justificación: aportación más diferencial respecto a la práctica anterior con n8n. No solo genera, también revisa con criterios trazables.

### F4. Histórico cronológico
Lista de briefings con sus generaciones y validaciones, ordenada por fecha más reciente.

Justificación: aporta trazabilidad y demuestra base de datos real funcionando.

### F5. Vista detalle de caso
Pantalla que muestra briefing completo, versión de mensaje, validación con sus siete bloques, veredicto global, modelo usado, fecha y, si aplica, instrucción de iteración.

Justificación: imprescindible para defender el funcionamiento completo en el vídeo y en el PDF.

## Funcionalidades recomendables (F6-F9)

### F6. Búsqueda y filtros básicos en el histórico
Filtros simples por canal, fecha y veredicto. Búsqueda por título de campaña.

### F7. Crear nueva versión a partir de una instrucción de ajuste
Permite escribir una instrucción breve ("hazlo más directo", "reduce tono promocional") y generar una nueva versión vinculada al briefing original. Implementado como `versionNumber` incremental sobre el mismo `briefId`.

### F8. Diferenciación visible Producción / Exploración
Más allá de un campo en el wizard, mostrar la diferencia en el resultado: temperatura distinta del modelo, tag visible en histórico y detalle.

### F9. Exportar mensaje aprobado
Acción de copiar al portapapeles o descargar como `.txt`. Solo activa cuando el veredicto es "aprobada" o "aprobada con ajustes".

## Funcionalidades excluidas

- Envío real por WhatsApp o email.
- CRM, gestión de contactos, leads o campañas reales.
- Autenticación, roles, multiusuario.
- RAG con embeddings o búsqueda semántica.
- A/B testing y métricas avanzadas.
- Dashboard de KPIs.
- Edición colaborativa o flujos de aprobación por roles.
- Integración de n8n dentro de la app.
- Despliegue a producción (Vercel, etc.) como parte del entregable evaluable.

## Reglas de promoción y degradación

- Una funcionalidad **solo** se promueve a obligatoria si una decisión explícita lo justifica y queda registrada aquí y en el commit correspondiente.
- F1-F5 **no** se degradan. Si alguna se vuelve inviable durante el desarrollo, se documenta el motivo y se busca alternativa antes de descartarla.
- F6-F9 se evalúan al cerrar F5. Si el calendario está justo, se renuncia a ellas sin afectar al MVP.

## Referencias cruzadas

- Criterios del validador: `docs/VALIDATION_CRITERIA.md`.
- Modelo de datos: `docs/DATA_MODEL.md`.
- Plantillas de prompts: `docs/PROMPTS.md`.
- Plan Git por fases: `docs/GIT_WORKFLOW.md`.
