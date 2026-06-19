# VALIDATION_CRITERIA.md

Documento operativo del validador automático de PRISMA Copy Lab. Es una adaptación operativa fiel de los criterios oficiales de Universidad Prisma, convertida a un formato consumible por el sistema.

> Fuente corporativa: `data/corpus/criterios_validacion.md`. Si hay discrepancia de criterio de marca o validación, prevalece la fuente. Las reglas deterministas descritas aquí son decisiones de implementación derivadas de esa fuente para garantizar trazabilidad y comportamiento estable.

---

## 1. Versionado

- `criteriaVersion`: `v1.0` (corresponde a la versión inicial cargada del documento corporativo).
- Cualquier cambio sustancial obliga a incrementar la versión y a registrarla en cada `validation_runs.criteriaVersion` y `validation_scores.criteriaVersion`.

## 2. Niveles de resultado de validación

Tres veredictos posibles, **literales**:

- `aprobada`: la pieza cumple los criterios esenciales y puede activarse sin modificaciones relevantes.
- `aprobada_con_ajustes`: la pieza es válida en su base, pero requiere cambios menores antes de su activación.
- `no_aprobada`: la pieza presenta problemas de fondo y debe rehacerse total o parcialmente.

## 3. Bloques de validación

Siete bloques, **en este orden**:

| Clave técnica | Nombre |
|---|---|
| `alineacion_estrategica` | Alineación estratégica |
| `claridad_estructura` | Claridad y estructura |
| `tono_coherencia_marca` | Tono y coherencia de marca |
| `calidad_argumental` | Calidad argumental y propuesta de valor |
| `adaptacion_canal` | Adaptación al canal |
| `precision_fiabilidad` | Precisión y fiabilidad del contenido |
| `calidad_ejecucion` | Calidad final de ejecución |

### 3.1 Alineación estratégica (`alineacion_estrategica`)
**Evalúa:** si la pieza responde realmente a la necesidad que motiva la comunicación.

Criterios:
- el objetivo principal del mensaje está claro
- la pieza responde a una necesidad real de campaña, seguimiento o activación
- el mensaje está alineado con el momento del funnel
- el enfoque es adecuado para el público al que se dirige
- la comunicación prioriza el argumento correcto según contexto y objetivo

Señales de no conformidad:
- el mensaje no deja claro qué se busca conseguir
- mezcla varios objetivos en una sola pieza
- no se entiende por qué se envía en este momento
- el enfoque no encaja con el segmento o la fase del proceso
- se prioriza información secundaria frente al argumento principal

### 3.2 Claridad y estructura (`claridad_estructura`)
**Evalúa:** si la pieza se entiende con facilidad y si su construcción facilita la lectura.

Criterios:
- la idea principal se comprende en una sola lectura
- la pieza tiene una estructura ordenada y lógica
- no contiene ambigüedades relevantes
- la longitud está justificada
- el texto evita repeticiones innecesarias
- el cierre conduce con claridad al siguiente paso

Señales de no conformidad:
- el texto resulta confuso o difuso
- cuesta identificar qué se quiere comunicar
- la pieza incluye demasiada información a la vez
- hay frases largas, densas o poco naturales
- el cierre no conecta con el resto del mensaje

### 3.3 Tono y coherencia de marca (`tono_coherencia_marca`)
**Evalúa:** si el mensaje está alineado con la identidad verbal de Universidad Prisma.

Criterios:
- el tono es cercano, profesional e institucional
- el mensaje suena coherente con la marca
- la redacción mantiene credibilidad y naturalidad
- no hay excesos promocionales ni rigidez innecesaria
- el lenguaje está alineado con la narrativa institucional

Señales de no conformidad:
- el mensaje suena demasiado agresivo o vendedor
- el tono resulta frío, burocrático o artificial
- hay expresiones exageradas o grandilocuentes
- la pieza parece genérica y no reconocible como propia de la marca
- el lenguaje pierde equilibrio entre cercanía y rigor

### 3.4 Calidad argumental y propuesta de valor (`calidad_argumental`)
**Evalúa:** si el mensaje comunica valor de forma relevante y convincente.

Criterios:
- la propuesta de valor es visible
- el mensaje expresa con claridad por qué la información es relevante para el usuario
- el beneficio principal está bien priorizado
- los argumentos utilizados son pertinentes para el objetivo
- la pieza evita hablar solo desde la institución y conecta con el usuario

Señales de no conformidad:
- no se entiende qué aporta realmente el mensaje
- el texto es descriptivo, pero no persuasivo
- se enumeran características sin traducirlas a valor
- el beneficio queda diluido o mal priorizado
- el mensaje está centrado en la universidad y no en el destinatario

### 3.5 Adaptación al canal (`adaptacion_canal`)
**Evalúa:** si la pieza está correctamente ajustada al formato, dinámica y expectativa del canal.

Criterios:
- la longitud es adecuada al canal
- la estructura responde al comportamiento esperado del usuario en ese entorno
- la redacción está adaptada al nivel de inmediatez o profundidad del canal
- el mensaje aprovecha correctamente el formato
- la CTA es adecuada al tipo de interacción esperada

Señales de no conformidad:
- un WhatsApp parece un email
- un email resulta excesivamente escueto o desordenado
- la longitud dificulta la lectura
- el estilo no encaja con el entorno
- la CTA no responde a la lógica del canal

### 3.6 Precisión y fiabilidad del contenido (`precision_fiabilidad`)
**Evalúa:** la exactitud de la información contenida en la pieza.

Criterios:
- los nombres de programas, convocatorias y áreas son correctos
- las fechas, plazos y condiciones están verificadas
- las cifras o claims utilizados son precisos y validados
- no hay promesas que no puedan sostenerse
- el contenido no introduce información inventada, dudosa o no confirmada

Señales de no conformidad:
- errores de nombres o titulaciones
- fechas incorrectas o ambiguas
- condiciones comerciales no confirmadas
- cifras sin validar
- afirmaciones que podrían inducir a error
- información añadida sin respaldo

### 3.7 Calidad final de ejecución (`calidad_ejecucion`)
**Evalúa:** la calidad superficial y final del mensaje antes de su salida.

Criterios:
- no hay errores ortográficos ni gramaticales
- la puntuación es correcta y favorece la lectura
- el texto fluye con naturalidad
- no hay repeticiones, cortes extraños ni construcciones forzadas
- el resultado final es profesional y publicable

Señales de no conformidad:
- faltas ortográficas
- errores de concordancia
- sintaxis artificial
- repeticiones visibles
- frases mal resueltas
- sensación de texto poco pulido

## 4. Estado por bloque

Cada bloque devuelve un estado, **literal**:

- `bien`: el bloque cumple sus criterios sin observaciones relevantes.
- `mejorable`: hay observaciones de baja gravedad que el revisor puede atender o no.
- `critico`: hay incumplimiento serio del bloque; bloquea la aprobación si afecta a un criterio crítico.

## 5. Criterios críticos vs criterios ajustables

Mapeo extraído del documento corporativo (sección 7).

### Críticos (si fallan, la pieza no puede aprobarse)
- precisión de la información (`precision_fiabilidad`)
- claridad mínima del mensaje (`claridad_estructura`)
- alineación básica con la marca (`tono_coherencia_marca`)
- adecuación estratégica (`alineacion_estrategica`)
- ausencia de errores graves de redacción (`calidad_ejecucion`)
- coherencia de la CTA con el objetivo (`alineacion_estrategica` / `adaptacion_canal`)

### Ajustables (si fallan de forma leve, la pieza puede pasar a "aprobada con ajustes")
- mejora de estilo
- optimización de longitud
- reformulación de una frase
- matiz de tono
- refuerzo de propuesta de valor
- orden interno de argumentos

## 6. Matriz de decisión del veredicto global

El documento corporativo define tres resultados posibles y distingue criterios críticos frente a criterios ajustables. PRISMA Copy Lab traduce esa lógica a una matriz determinista de implementación para evitar que el veredicto dependa de la interpretación variable del LLM.

El sistema decide el veredicto global de cada validación según esta matriz, en este orden:

1. Si **algún bloque crítico está en estado `critico`** → `no_aprobada`.
2. Si **dos o más bloques** están en estado `mejorable` o `critico` → `aprobada_con_ajustes`.
3. Si **uno o cero bloques** están en estado `mejorable` y ninguno en `critico` → `aprobada`.

Esta matriz no es una copia literal del texto corporativo: es la formalización técnica aplicada por el producto a partir de sus principios. Prevalece sobre cualquier valoración subjetiva del LLM. El LLM puede razonar sobre los bloques, pero el cálculo final es determinista y se hace en código a partir del detalle por bloque.

## 7. Salida estructurada esperada del LLM evaluador

El validador debe pedir y parsear estrictamente este JSON:

```json
{
  "scores": [
    {
      "criterionKey": "alineacion_estrategica",
      "status": "bien | mejorable | critico",
      "comment": "explicación breve, una o dos frases",
      "suggestedFix": "ajuste concreto si aplica, null si no aplica"
    }
    // ... seis bloques más, uno por cada criterionKey
  ],
  "summary": "resumen global breve, máximo tres frases",
  "suggestedRewrite": "texto reescrito si el veredicto previsto sería 'aprobada_con_ajustes', null en caso contrario"
}
```

El veredicto global (`overallVerdict`) **no** se solicita al LLM; se calcula en `services/validationService.ts` aplicando la matriz de la sección 6.

## 8. Pruebas mínimas del validador

Antes de dar el validador por bueno, se prueban manualmente al menos cinco mensajes que cubran los tres veredictos. Los ejemplos del documento corporativo (sección 10) sirven de baseline:

- Mensaje claro y bien adaptado → debe devolver `aprobada`.
- Mensaje con frase larga y CTA ausente → debe devolver `aprobada_con_ajustes`.
- Mensaje con tono agresivo y promesa exagerada → debe devolver `no_aprobada`.

Las pruebas se registran en el commit que cierre la fase de validador.
