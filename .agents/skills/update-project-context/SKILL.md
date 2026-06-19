---
name: update-project-context
description: Mantiene actualizada la documentación viva de PRISMA Copy Lab cuando termina una tarea o cambia una parte relevante del sistema, respetando la jerarquía documental basada en `AGENTS.md`, `AGENTS.md`, `CODEX.md` y `contexto_proyecto.md`. Úsala después de implementar una feature, corregir un bug relevante, hacer un refactor importante, cambiar arquitectura o contratos, añadir o eliminar un módulo, o modificar reglas locales de una subcarpeta. No la uses para cambios en el validador automático: en ese caso, usa la skill `prisma-validation-criteria`.
---

# update-project-context

## Propósito

Mantener la coherencia de la documentación viva del proyecto cuando termina una tarea o cambia una parte relevante del sistema. Esta skill evita que la documentación se desalinee del código, que el contenido se duplique entre archivos y que el contexto funcional del sistema deje de ser fiable.

## Cuándo usarla

Usa esta skill después de:

- implementar una feature
- corregir un bug relevante
- hacer un refactor importante
- cambiar arquitectura, contratos, scripts o workflows
- añadir o eliminar un módulo o sección relevante del sistema
- modificar reglas locales de una subcarpeta concreta
- detectar desalineamiento entre comportamiento real del sistema y documentación

No la uses para cambios en el validador automático. En ese caso, la skill que aplica es `prisma-validation-criteria`.

## Jerarquía documental del proyecto

Esta es la jerarquía que la skill protege. Antes de actualizar nada, identifica el nivel correcto.

### Nivel 1. Raíz `AGENTS.md`

Archivo principal del proyecto.

Contiene:

- instrucciones globales para agentes
- stack tecnológico cerrado
- reglas globales de diseño y código
- patrones obligatorios (MVC, DAO, etc.)
- reglas específicas de cada tecnología del stack
- testing, criterios de done, checklist operativo

No contiene contexto funcional del producto.

### Nivel 2. Raíz `AGENTS.md` y `CODEX.md`

Archivos puente de compatibilidad.

Contienen:

- importación o referencia a `@AGENTS.md`
- ajustes mínimos específicos del entorno solo cuando sean estrictamente necesarios

No deben duplicar contenido de `AGENTS.md`. Si lo hacen, se simplifican.

### Nivel 3. Raíz `contexto_proyecto.md`

Archivo de estado funcional y operativo del sistema.

Contiene:

- qué es el sistema
- módulos del sistema
- flujos principales de usuario
- alcance del MVP (funcionalidades obligatorias, recomendables y excluidas)
- restricciones funcionales
- estado actual de la implementación
- decisiones sobre qué hace cada parte del sistema

No contiene reglas globales de código ni convenciones de proceso.

### Nivel 4. Subcarpetas con `AGENTS.md`, `AGENTS.md` o `CODEX.md`

Archivos de contexto local.

Contienen reglas o contexto que aplican únicamente a esa zona del proyecto:

- arquitectura local
- convenciones locales
- detalles de stack específicos de esa carpeta
- restricciones locales
- relaciones con otras capas o módulos

No contienen reglas globales que ya estén en raíz.

### Nivel 5. Archivos `*.override`

Archivos de excepción explícita.

Solo deben existir cuando sea necesario sobrescribir reglas heredadas de niveles superiores. Cada archivo `*.override` debe incluir:

- la regla heredada que se sobrescribe
- la regla local de reemplazo
- el motivo por el que la sobrescritura es necesaria
- el alcance al que aplica la sobrescritura

No se usan como contexto local normal.

## Criterio de actualización por archivo

### Para `AGENTS.md` raíz

Actualizar solo cuando el cambio afecte al **proceso o disciplina de código** que aplica a todo el repositorio:

- nuevas reglas globales
- cambios en el stack
- nuevos patrones obligatorios
- cambios en convenciones de testing o de PRs

No mover aquí estado funcional ni descripciones del producto.

### Para `AGENTS.md` y `CODEX.md` raíz

En condiciones normales no se actualizan. Solo se tocan si:

- algún ajuste mínimo específico del entorno se vuelve estrictamente necesario
- se detecta duplicación con `AGENTS.md` y hay que reducir el archivo a su función de puente

### Para `contexto_proyecto.md`

Actualizar cuando cambie el **comportamiento funcional** del sistema:

- nuevo módulo
- cambio en el flujo principal
- promoción de una funcionalidad recomendable a obligatoria
- nueva restricción funcional
- cambio en el alcance del MVP

No introducir aquí reglas de código.

### Para archivos de subcarpeta

Actualizar cuando el cambio aplique solo a esa zona:

- reglas locales de arquitectura
- convenciones específicas de esa carpeta
- restricciones internas de un módulo

No mover aquí reglas globales del repositorio.

### Para archivos `*.override`

Crear solo cuando se identifique una regla heredada que debe sobrescribirse de forma local y explícita. Si una mera adaptación basta, no se crea override.

## Procedimiento

Cuando se invoca esta skill:

1. Resumir qué cambió realmente en el código. Nada de comportamiento futuro o intencionado.
2. Identificar el tipo de impacto: `global`, `funcional`, `local` o `override`.
3. Localizar el archivo documental correcto según la jerarquía.
4. Actualizar solo la documentación necesaria.
5. Evitar duplicar información si ya existe una única fuente de verdad.
6. Si falta un documento clave, proponer crearlo en lugar de dispersar contexto.
7. Si `AGENTS.md` o `CODEX.md` raíz duplican contenido de `AGENTS.md`, proponer reducirlos a archivos puente.

## Reglas no negociables

- No inventar comportamiento que no esté verificado en el código.
- No documentar intenciones futuras como si ya estuvieran implementadas.
- No duplicar en `AGENTS.md` o `CODEX.md` raíz lo que pertenece a `AGENTS.md` raíz.
- No poner contexto funcional del sistema en `AGENTS.md` raíz si pertenece a `contexto_proyecto.md`.
- No usar archivos `*.override` salvo necesidad real de sobrescritura.
- Si una regla aplica solo a una subcarpeta, documentarla en esa zona y no en la raíz.
- Si la documentación ya está correcta, indicar explícitamente que no es necesaria actualización.

## Inputs requeridos antes de aplicar la skill

Recopilar o inferir antes de empezar:

- resumen del cambio de código completado
- archivos o carpetas modificados
- naturaleza del cambio (global, funcional, local o sobrescritura excepcional)
- archivos de documentación existentes relacionados
- cualquier duplicación o conflicto detectado en la documentación actual

## Salida esperada cuando se invoca

La respuesta debe seguir esta estructura, con seis secciones numeradas:

**1. Resumen del cambio.** Describe qué cambió en el código. Solo comportamiento verificado.

**2. Tipo de impacto.** Clasifícalo como uno o varios de: `global`, `funcional`, `local`, `override`. Explica brevemente la clasificación.

**3. Archivos de contexto que conviene actualizar.** Lista cada archivo de documentación afectado y el tipo de acción recomendada para cada uno: `crear`, `actualizar`, `simplificar` o `dejar sin cambios`.

**4. Propuesta concreta de actualización por archivo.** Para cada archivo afectado, proporciona el contenido Markdown propuesto o el cambio a nivel de patch.

**5. Riesgos, inconsistencias o duplicidades detectadas.** Lista cualquier riesgo, conflicto, sección obsoleta, contenido duplicado o error de alcance encontrado durante la revisión.

**6. Propuesta de reorganización documental, si aplica.** Explica cómo mover o consolidar contenido entre `AGENTS.md`, `AGENTS.md`, `CODEX.md`, `contexto_proyecto.md`, archivos de subcarpeta y archivos `*.override`.

## Criterios de done

La skill se considera aplicada correctamente cuando:

- el cambio real de código ha sido resumido sin invenciones
- el impacto documental ha sido clasificado
- los archivos correctos han sido identificados según la jerarquía
- las actualizaciones se proponen solo para archivos que las necesitan
- no se introduce ninguna fuente de verdad duplicada
- los archivos puente raíz siguen siendo mínimos
- el contexto funcional permanece en `contexto_proyecto.md`
- las reglas locales permanecen locales
- los archivos `*.override` se usan solo para excepciones explícitas a reglas heredadas

## Lo que esta skill NO debe hacer

- no debe activarse para cambios en el validador automático (usar `prisma-validation-criteria`)
- no debe proponer crear documentación nueva si la existente cubre el cambio
- no debe inventar contenido para "rellenar" archivos que no necesitan actualización
- no debe sustituir la decisión humana sobre qué información es relevante documentar

## Riesgos que esta skill mitiga

- duplicación de contenido entre `AGENTS.md`, `AGENTS.md` y `CODEX.md`
- mezcla de reglas globales de código con contexto funcional del producto
- documentación de reglas locales en la raíz del proyecto
- uso indebido de archivos `*.override` como contexto local normal
- registro de funcionalidades futuras o deseadas como si ya estuvieran implementadas
- desalineamiento entre el comportamiento real del sistema y la documentación que lo describe

## Relación con otras skills

Esta skill convive con `prisma-validation-criteria`. Reparto:

- cambios que tocan `src/services/validationService.ts`, el system prompt del validador o cualquier valor de `criterionKey`, `status` u `overallVerdict`: usa **`prisma-validation-criteria`**
- cualquier otro cambio funcional, refactor, nueva feature, bug fix o cambio arquitectónico que requiera revisar documentación: usa **`update-project-context`**

Si un cambio toca el validador y además requiere actualizar documentación general, primero se aplica `prisma-validation-criteria` para validar el cambio del validador, y después `update-project-context` para revisar el impacto documental.

## Ubicación en el repositorio

Esta skill se coloca en la siguiente ruta exacta:

```
.Codex/skills/update-project-context/SKILL.md
```
