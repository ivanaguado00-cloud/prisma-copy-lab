# PRISMA_CONTEXT.md

Resumen operativo de Universidad Prisma. Este documento extrae los pasajes que afectan directamente a la generación y validación de mensajes en la app. La documentación corporativa íntegra vive en `data/corpus/` para uso del LLM como contexto.

---

## 1. Identidad

**Nombre:** Universidad Prisma.
**Naturaleza:** universidad privada española.
**Modalidad:** 100% online.
**Ámbito:** España y mercados hispanohablantes.
**Tipología de oferta:** grados, másteres universitarios, títulos propios, formación permanente y programas executive.
**Claim institucional:** *Impulsa tu futuro, desde donde estés*.

## 2. Posicionamiento verbal

Prisma debe expresarse como una institución:

- cercana, pero solvente
- moderna, pero rigurosa
- aspiracional, pero creíble
- profesional, pero humana
- comercial, pero no agresiva

No suena ni excesivamente publicitaria ni excesivamente burocrática. Su lugar natural es el equilibrio entre institución académica, acompañamiento profesional y orientación a resultados.

## 3. Voz de marca

Cinco atributos no negociables:

- **Cercana**: lenguaje accesible y directo, naturalidad, sin caer en lo coloquial.
- **Profesional**: rigor, credibilidad, confianza, consistencia.
- **Inspiradora**: ambición de mejora desde una visión positiva, sin grandilocuencia.
- **Clara**: estructura ordenada, una idea principal, sin complejidad innecesaria.
- **Actual**: conexión con la transformación del mercado y con nuevas formas de aprender.

## 4. Tono

**Cercano + institucional + claro + orientado a la acción.**

### Cómo debe sonar
Confiable, ordenada, comprensible, útil, amable, motivadora.

### Cómo no debe sonar
Agresiva, grandilocuente, vacía, demasiado promocional, rígida, burocrática, fría.

## 5. Pilares narrativos

Toda comunicación debe apoyarse en al menos uno de estos cinco ejes:

- **Flexibilidad** (estudiar desde cualquier lugar y al propio ritmo).
- **Progreso profesional** (avanzar, especializarse, mejorar empleabilidad).
- **Acompañamiento** (no estás solo, hay equipo y método).
- **Actualización** (formación conectada con la realidad del mercado).
- **Accesibilidad** (la formación al alcance de quien la necesita).

## 6. Público objetivo

- Jóvenes titulados que buscan especialización para mejorar empleabilidad.
- Profesionales en activo entre 25 y 45 años que quieren actualizarse o ascender.
- Perfiles en reconversión que cambian de sector y necesitan nuevas competencias.
- Estudiantes internacionales hispanohablantes.

## 7. Reglas operativas para la app

### En el prompt de generación
- El sistema debe inyectar el bloque "tono", "voz" y "cómo no debe sonar".
- Debe respetar al menos uno de los cinco pilares narrativos en la salida.
- Debe usar el claim solo cuando el contexto lo pida explícitamente, no por defecto.
- Debe adaptar la longitud al canal (`whatsapp` exige brevedad; `email` permite más desarrollo).

### En el prompt del validador
- El bloque "tono y coherencia de marca" se evalúa contra esta guía narrativa.
- El bloque "alineación estratégica" se evalúa contra los pilares narrativos y el público objetivo.
- El bloque "calidad argumental y propuesta de valor" se apoya en la sección "qué debe transmitir una comunicación comercial".

## 8. Reglas por canal

### WhatsApp
- Una sola idea principal.
- Frases cortas, tono cercano y respetuoso.
- Una única CTA sencilla.
- Evitar textos extensos, exceso de signos y mensajes con aspecto de automatismo frío.

### Email
- Asunto claro y atractivo.
- Apertura conectada con el interés del usuario.
- Cuerpo escaneable, beneficios visibles.
- CTA final clara.
- Coherencia entre asunto, cuerpo y cierre.

## 9. Lo que el sistema nunca debe producir

- Promesas absolutas sobre resultados ("garantizamos que...").
- Tono agresivo, alarmista o de presión.
- Exageraciones grandilocuentes ("la mejor universidad", "oportunidad única").
- Información inventada sobre programas, fechas o condiciones.
- Mensajes que reprochen al destinatario su falta de respuesta.

## 10. Documentos completos en el corpus

La documentación íntegra del caso ficticio se conserva en `data/corpus/`:

- `data/corpus/dosier.md`: dossier institucional completo.
- `data/corpus/guia_narrativa.md`: guía narrativa y de estilo verbal.
- `data/corpus/buenas_practicas.md`: buenas prácticas de comunicación comercial.
- `data/corpus/criterios_validacion.md`: criterios internos de validación (también referenciado por `docs/VALIDATION_CRITERIA.md`).

El sistema **no debe inyectar estos documentos íntegros** en cada llamada al LLM. Debe usar este resumen operativo (`PRISMA_CONTEXT.md`) y, si necesita más detalle puntual, recurrir al pasaje correspondiente. La gestión de contexto de prompts está documentada en `docs/PROMPTS.md`.
