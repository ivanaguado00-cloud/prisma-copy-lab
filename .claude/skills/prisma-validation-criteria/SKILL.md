---
name: prisma-validation-criteria
description: Asegura que cualquier modificación del validador automático de PRISMA Copy Lab respete los siete bloques internos de validación de Universidad Prisma. Úsala antes de tocar `src/services/validationService.ts`, antes de modificar el system prompt del validador en `docs/PROMPTS.md`, antes de cambiar valores de `criterionKey`, `status` u `overallVerdict`, antes de añadir o eliminar bloques, y antes de cerrar la rama `feature/validation-engine`.
---

# prisma-validation-criteria

## Propósito

Mantener la integridad académica y funcional del validador automático de PRISMA Copy Lab. Esta skill evita que un agente o cualquier desarrollo posterior introduzca desviaciones respecto a la documentación corporativa de Universidad Prisma, definida literalmente en `docs/VALIDATION_CRITERIA.md`.

La skill no sustituye la lectura de `docs/VALIDATION_CRITERIA.md`. La refuerza, la recuerda al agente y exige una confirmación explícita antes de cerrar cualquier cambio relacionado con validación.

## Cuándo usarla

Usa esta skill antes de:

- modificar `src/services/validationService.ts`
- modificar el system prompt del validador en `docs/PROMPTS.md`
- cambiar cualquier valor de `criterionKey`, `status` u `overallVerdict`
- añadir o eliminar bloques de validación
- cerrar una rama relacionada con `feature/validation-engine`
- revisar código generado por un IDE agente que toque la lógica de validación
- promover una nueva versión del validador a `main`

## Autoridad principal

Fuente de verdad: `docs/VALIDATION_CRITERIA.md`.

Fuente literal secundaria: `data/corpus/criterios_validacion.md`.

En caso de discrepancia entre ambas, prevalece `docs/VALIDATION_CRITERIA.md` por ser el documento operativo del sistema.

## Relación jerárquica

Esta skill no sustituye a `docs/VALIDATION_CRITERIA.md`. La documentación corporativa sigue siendo la autoridad principal; la skill actúa como guardarraíl operativo que se invoca cuando el agente toca el validador.

## Bloques de validación fijos

El validador debe usar siempre estos siete `criterionKey`, ni uno más, ni uno menos:

| criterionKey | Nombre legible |
|---|---|
| `alineacion_estrategica` | Alineación estratégica |
| `claridad_estructura` | Claridad y estructura |
| `tono_coherencia_marca` | Tono y coherencia de marca |
| `calidad_argumental` | Calidad argumental y propuesta de valor |
| `adaptacion_canal` | Adaptación al canal |
| `precision_fiabilidad` | Precisión y fiabilidad del contenido |
| `calidad_ejecucion` | Calidad final de ejecución |

No renombrar, fusionar, dividir, añadir ni eliminar estas claves salvo que el documento corporativo cambie y se incremente la `criteriaVersion` antes del despliegue.

## Estados por bloque fijos

Cada `validation_score` debe usar exactamente uno de estos `status`:

| status | Nombre legible |
|---|---|
| `bien` | Bien |
| `mejorable` | Mejorable |
| `critico` | Crítico |

No se admiten sinónimos, traducciones, alias ni estados adicionales.

## Veredictos globales fijos

El campo `overallVerdict` debe usar exactamente uno de estos valores:

| overallVerdict | Nombre legible |
|---|---|
| `aprobada` | Aprobada |
| `aprobada_con_ajustes` | Aprobada con ajustes |
| `no_aprobada` | No aprobada |

No se admiten nombres alternativos.

## Reglas no negociables

1. Los siete `criterionKey` son fijos y deben coincidir literalmente con la lista anterior.
2. Los tres `status` por bloque son fijos y deben coincidir literalmente.
3. Los tres `overallVerdict` son fijos y deben coincidir literalmente.
4. El `overallVerdict` se calcula en código aplicando la matriz documentada en `docs/VALIDATION_CRITERIA.md` sección 6. **No** lo decide el LLM.
5. El validador devuelve siempre exactamente siete `scores`, uno por cada `criterionKey`.
6. Si la respuesta del LLM tiene scores faltantes, duplicados, renombrados o inválidos, debe rechazarse y reintentarse.
7. La versión de criterios usada debe persistirse en `validation_runs.criteriaVersion` para trazabilidad.
8. Si los siete bloques cambian, la `criteriaVersion` debe incrementarse antes del siguiente despliegue y registrarse en el commit que introduce el cambio.
9. La temperatura del LLM evaluador debe permanecer en `0.0` (determinismo).
10. La respuesta del LLM debe pedirse siempre con `response_format: { type: "json_object" }`.

## Confirmación obligatoria del agente

Antes de cerrar cualquier cambio relacionado con validación, el agente debe responder explícitamente con esta confirmación:

```text
Confirmo que he revisado docs/VALIDATION_CRITERIA.md y que este cambio:
- mantiene exactamente los siete criterionKey documentados
- mantiene exactamente los tres status permitidos
- mantiene exactamente los tres overallVerdict permitidos
- calcula el veredicto global en código, no mediante el LLM
- conserva la persistencia de validation_runs.criteriaVersion
- no introduce criterios, nombres ni estados nuevos
```

Si el agente no puede confirmar todos los puntos, debe detenerse y explicar qué es inconsistente. El cambio no se cierra hasta resolver la inconsistencia.

## Salida esperada cuando se invoca

Cuando se invoca esta skill, el agente debe producir, en este orden:

1. Confirmación de que `docs/VALIDATION_CRITERIA.md` ha sido revisado.
2. Lista de archivos afectados por el cambio en curso.
3. Evaluación del alcance del cambio dentro del módulo de validación.
4. Bloque de confirmación obligatoria (sección anterior).
5. Pre-merge checklist completo (sección siguiente).
6. Listado de cualquier desviación detectada respecto a los criterios documentados.

## Pre-merge checklist

Antes de cerrar un cambio relacionado con validación, verificar:

- ¿se respetan los nombres exactos de los siete `criterionKey`?
- ¿se respetan los nombres exactos de los tres `status`?
- ¿se respetan los nombres exactos de los tres `overallVerdict`?
- ¿el veredicto global se calcula en código y no en el LLM?
- ¿se piden exactamente siete scores al modelo?
- ¿el parser rechaza respuestas con scores faltantes, duplicados o renombrados?
- ¿se persiste la `criteriaVersion` correcta en cada `validation_run`?
- ¿la temperatura del LLM evaluador sigue siendo `0.0`?
- ¿la respuesta sigue solicitándose con `response_format: { type: "json_object" }`?
- ¿se ha probado el validador contra los tres ejemplos del documento corporativo (sección 10 de `data/corpus/criterios_validacion.md`)?
- ¿los tests unitarios cubren el cálculo del `overallVerdict` en sus tres ramas?
- ¿cualquier cambio en los siete bloques incluye un incremento de `criteriaVersion` antes del despliegue?
- ¿el cambio de versión queda registrado en el commit?

## Lo que esta skill NO debe hacer

- no debe proponer nuevos criterios
- no debe sugerir cambios de nomenclatura
- no debe permitir que el LLM decida el veredicto global
- no debe ofrecerse como sustituto de leer `docs/VALIDATION_CRITERIA.md`
- no debe activarse para cambios que no afecten al validador
- no debe admitir valores extra, traducidos o aliasados de `criterionKey`, `status` u `overallVerdict`

## Riesgos que esta skill mitiga

- criterios inventados que rompan la coherencia con el documento corporativo
- renombrado accidental de claves técnicas que rompa contratos persistidos en base de datos
- veredicto global decidido por el LLM (pérdida de determinismo y replicabilidad)
- pérdida de trazabilidad por no persistir la `criteriaVersion`
- duplicación de la lógica de validación fuera de la documentación oficial
- cambios en parámetros del LLM (temperatura, formato de respuesta) que rompan el determinismo del validador

## Referencias

- `docs/VALIDATION_CRITERIA.md` (autoridad principal del proyecto).
- `data/corpus/criterios_validacion.md` (fuente literal de Universidad Prisma).
- `docs/PROMPTS.md` (system prompt del validador, sección 4).
- `src/services/validationService.ts` (cálculo del veredicto global, persistencia de scores).

## Ubicación en el repositorio

Esta skill se coloca en la siguiente ruta exacta:

```
.claude/skills/prisma-validation-criteria/SKILL.md
```
