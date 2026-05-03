# AGENTS.md

## Propósito de este archivo

Este es el archivo principal de contexto global para agentes de IA que trabajen en el repositorio `PRISMA Copy Lab`.

Todo agente debe leer y respetar este archivo antes de modificar código, documentación, prompts, modelo de datos o configuración del proyecto.

`CLAUDE.md` y `CODEX.md` son archivos puente de compatibilidad y remiten a este documento para evitar duplicación.

El contexto funcional del producto (qué hace, qué módulos lo componen, qué flujos cubre, qué alcance tiene el MVP, qué restricciones funcionales aplican) **no vive aquí**. Vive en `contexto_proyecto.md` en la raíz y en los documentos de `docs/`. Este archivo describe únicamente las reglas globales de código, arquitectura y proceso que el agente debe respetar.

---

## Stack tecnológico cerrado

El stack del proyecto está cerrado y no debe modificarse sin justificación explícita y registro de la decisión.

- Framework: Next.js con App Router
- Lenguaje: TypeScript
- UI: React
- Estilos: Tailwind CSS
- Componentes: shadcn/ui
- Backend: Server Actions y, solo si es necesario, Route Handlers
- Base de datos: SQLite local en MVP (mejora futura: Postgres)
- ORM: Prisma
- LLM: OpenAI `gpt-4o-mini`
- Cliente LLM mock: activable con la variable de entorno `LLM_MOCK=true`
- Repositorio: GitHub
- IDE agente principal: Antigravity

Ningún cambio de stack se hace en silencio. Cualquier sustitución obliga a documentarla en `docs/ARCHITECTURE.md` con motivo, alternativas valoradas y consecuencias.

---

## Objetivo de trabajo

Toda contribución debe priorizar:

- claridad de lectura
- mantenibilidad
- bajo acoplamiento
- seguridad al modificar
- facilidad de testeo
- consistencia estructural
- control de regresiones

No se considera terminado un cambio solo porque funcione en el caso feliz. El resultado debe ser comprensible, testeable y seguro de evolucionar.

---

## Reglas globales de diseño y código

### 1. Priorizar código mantenible

Escribe código fácil de entender, cambiar, probar y ampliar. Evita soluciones ingeniosas si reducen claridad. Prefiere la opción más simple que resuelva correctamente el problema.

### 2. Funciones con una sola responsabilidad

Cada función debe hacer una sola cosa y hacerla bien.

Reglas:

- una función no debe mezclar validación, transformación, acceso a datos, efectos laterales y render
- divide funciones largas en piezas pequeñas con nombres explícitos
- si una función necesita explicar demasiados pasos internos, probablemente está haciendo demasiado

### 3. Separación de responsabilidades

Mantén separadas estas capas cuando aplique:

- interfaz de usuario
- lógica de presentación
- lógica de negocio
- validación
- acceso a datos
- integración con servicios externos

No mezcles en el mismo bloque de código responsabilidades de UI, reglas de negocio y persistencia.

### 4. Evitar duplicación

No copies lógica de negocio, validaciones, transformaciones ni estructuras equivalentes en varios puntos del proyecto.

Antes de duplicar:

- busca una abstracción existente
- extrae una utilidad reutilizable
- mueve la lógica al nivel adecuado

No abstraigas prematuramente, pero no aceptes duplicación evidente de lógica estable.

### 5. Minimizar efectos secundarios

Una función debe hacer lo que su nombre promete.

Reglas:

- una función de cálculo no debe mutar estado externo
- evita modificar variables compartidas desde utilidades
- los efectos secundarios deben ser visibles y deliberados
- el nombre de la función debe reflejar si produce efectos externos

### 6. Nombres explícitos

Usa nombres que expresen intención real.

Reglas:

- variables: describen contenido o propósito
- funciones: expresan acción + objeto de la acción
- componentes React: describen claramente su responsabilidad visual o funcional
- tipos e interfaces: describen dominio, no detalles accidentales

Evitar:

- `data`, `item`, `temp`, `value`, `handleStuff`, `utils`, `helper`, `manager`
- abreviaturas no estándar
- nombres genéricos para módulos con lógica específica

### 7. Comentarios con propósito

Los comentarios deben explicar:

- decisiones no obvias
- restricciones
- contexto de negocio
- motivos de una solución no evidente

No uses comentarios para traducir literalmente el código. Si el comentario sustituye a un mal naming, corrige el código.

### 8. Consistencia de estilo

Problemas parecidos deben resolverse de formas parecidas dentro del repositorio.

Reglas:

- mantener convenciones homogéneas de nombres y estructura
- no introducir patrones alternativos sin justificación clara
- reutilizar la misma estrategia para casos equivalentes

### 9. Refactorización continua

Cada intervención debe dejar el código igual o mejor que antes.

Aplicar cuando detectes:

- funciones demasiado largas
- nombres poco claros
- lógica mezclada
- duplicación
- ramas complejas innecesarias
- archivos con responsabilidad difusa

No hagas refactorizaciones amplias no solicitadas. Si el cambio funcional y el refactor son grandes, sepáralos cuando sea posible.

---

## Patrones de diseño innegociables

### 1. MVC obligatorio

La arquitectura debe respetar separación clara entre:

- modelo
- vista
- control o capa equivalente de orquestación

Regla: no mezclar en el mismo módulo render de interfaz, reglas de negocio, acceso a datos y coordinación de flujo.

En el contexto de Next.js y React, esta separación se materializa con nombres y capas adaptadas al framework, pero la responsabilidad equivalente a MVC debe mantenerse. La estructura concreta de carpetas está definida en `docs/ARCHITECTURE.md`.

### 2. DAO obligatorio

El acceso a base de datos debe encapsularse mediante una capa DAO claramente dedicada a persistencia.

Reglas:

- la UI no accede directamente a base de datos
- la lógica de negocio no debe quedar acoplada a queries o detalles del ORM
- las operaciones de persistencia deben estar centralizadas en una capa explícita
- los cambios de almacenamiento no deben propagarse innecesariamente al resto del sistema
- las Server Actions no sustituyen la capa DAO; solo actúan como punto de entrada de la mutación y deben delegar la persistencia en servicios y DAO

### 3. Otros patrones cuando proceda

Además de MVC y DAO, deben aplicarse otros patrones cuando mejoren claramente:

- separación de responsabilidades
- desacoplamiento
- extensibilidad
- testabilidad
- legibilidad
- control de complejidad

Ejemplos habituales: Factory, Strategy, Adapter, Facade, Observer, Dependency Injection, Repository sobre DAO si la implementación lo requiere, Service Layer, composición sobre herencia.

Regla: no se introducen patrones por formalismo o sobreingeniería. Cada patrón adicional debe resolver un problema real del diseño.

### 4. Obligación de informar y justificar patrones aplicados

Cuando se realice una implementación, refactor o propuesta arquitectónica, se debe informar explícitamente al usuario:

- qué patrones se han aplicado
- en qué partes del sistema
- por qué se han aplicado
- qué problema concreto resuelven

Formato esperado en la explicación:

- patrón aplicado
- ubicación o capa afectada
- motivo técnico
- beneficio esperado

Ejemplo de justificación válida:

- `MVC` para separar interfaz, flujo y dominio
- `DAO` para aislar persistencia y evitar acoplamiento al ORM
- `Strategy` para encapsular variantes de cálculo y evitar condicionales dispersos
- `Adapter` para que el cliente LLM real y el cliente mock compartan interfaz

---

## Reglas específicas del stack

### Next.js

- respeta la separación entre código de servidor y cliente
- prioriza Server Components por defecto y usa Client Components solo cuando haya interactividad real, estado local de UI o APIs del navegador
- no muevas lógica al cliente si puede resolverse en servidor
- evita acoplar componentes de UI a acceso directo a datos cuando pueda aislarse mejor
- conserva rutas, estructuras y convenciones del framework de forma predecible
- usa la estructura del framework de manera compatible con la separación de responsabilidades exigida por MVC

#### Server Actions

Las mutaciones propias de la aplicación deben resolverse preferentemente con **Server Actions** cuando encajen de forma natural en el flujo de Next.js.

Usarlas para:

- formularios
- mutaciones simples o medias ligadas a la UI
- operaciones que deban ejecutarse en servidor y devolver revalidación o actualización de estado visible
- casos donde evitar un endpoint adicional reduzca complejidad

No usarlas como sustituto universal. Mantén Route Handlers o APIs dedicadas cuando exista alguno de estos casos:

- webhooks
- endpoints públicos o consumidos por terceros
- contratos HTTP explícitos
- integraciones externas desacopladas de la UI
- necesidades de middleware, versionado o superficie API independiente

Reglas:

- la lógica sensible y las mutaciones deben permanecer en servidor
- no expongas al cliente lógica de negocio o persistencia que pueda ejecutarse mediante Server Actions
- una Server Action no debe contener responsabilidades mezcladas; debe delegar en servicios y DAO cuando corresponda
- si una acción modifica datos, debe validar entrada, gestionar errores y revalidar o refrescar de forma explícita cuando aplique
- si se usa Server Action, hay que justificar por qué es mejor opción que un Route Handler en ese caso

### React

- crea componentes pequeños y enfocados
- evita componentes con demasiadas responsabilidades
- extrae lógica compleja a hooks o utilidades cuando mejore claridad
- no introduzcas props ambiguas o excesivamente polimórficas
- prioriza composición sobre condicionales complejos dentro del render
- los componentes de vista no deben asumir responsabilidades de persistencia ni reglas de negocio pesadas

### TypeScript

- evita `any` salvo justificación explícita
- usa tipos explícitos en fronteras del sistema
- modela el dominio con tipos legibles
- valida datos externos antes de tratarlos como confiables
- no ocultes problemas de tipos con coerciones innecesarias
- tipa claramente contratos entre vista, servicios y capa de acceso a datos

### Tailwind CSS

- usa utilidades de forma consistente y legible
- evita listas de clases caóticas sin estructura
- extrae patrones repetidos cuando la repetición empiece a dificultar mantenimiento
- no mezcles decisiones visuales inconsistentes entre pantallas equivalentes

### shadcn/ui

- úsalo como base de componentes reutilizables
- no dupliques componentes existentes con pequeñas variaciones evitables
- personaliza con criterio, manteniendo consistencia en variantes, tamaños y estados
- si un patrón visual se repite, consolídalo en un componente compartido

### Prisma y SQLite

- todo acceso a base de datos pasa por la capa DAO
- los DAOs no exponen el `PrismaClient` al exterior
- los DAOs reciben tipos de dominio explícitos, no `any`
- SQLite no admite enums nativos: los valores enumerables se modelan como `String` con validación en la capa de servicios antes de persistir
- las migraciones se generan con Prisma Migrate y se versionan en el repositorio
- Prisma 7 requiere driver adapter obligatorio: el cliente Prisma se instancia siempre con `@prisma/adapter-better-sqlite3`; no existe cliente por defecto sin él
- la configuración del seed vive en `prisma.config.ts` (raíz), no en el bloque `"prisma"` de `package.json`
- el cliente generado reside en `src/generated/prisma/` y está en `.gitignore`; regenerar con `npx prisma generate` tras clonar o migrar

### Cliente LLM

- el cliente real y el cliente mock comparten una interfaz común (patrón Adapter)
- el cliente mock se activa con `LLM_MOCK=true` y devuelve respuestas pregrabadas
- ningún test golpea la API real; los tests usan siempre el mock
- las claves de API nunca se commitean; viven en `.env`, ignorado por Git
- el modelo, la temperatura y los parámetros de cada llamada deben ser explícitos y trazables

---

## Estructura del repositorio

Estructura esperada del proyecto:

```
prisma-copy-lab/
├── AGENTS.md                       Este archivo
├── CLAUDE.md                       Puente, importa @AGENTS.md
├── CODEX.md                        Puente, importa @AGENTS.md
├── README.md                       Instrucciones de ejecución
├── contexto_proyecto.md            Estado funcional del sistema
├── .env.example                    Plantilla de variables de entorno
├── .gitignore
├── package.json
├── tsconfig.json
├── docs/                           Documentación técnica, funcional y académica
├── data/
│   └── corpus/                     Corpus de Universidad Prisma como .md
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/
├── src/
│   ├── app/                        Rutas, páginas y Server Actions
│   ├── components/                 Componentes reutilizables de interfaz
│   ├── services/                   Lógica de negocio y orquestación
│   ├── services/llm/               Cliente LLM real y mock bajo interfaz común
│   ├── dao/                        Acceso a base de datos mediante Prisma
│   ├── lib/                        Utilidades compartidas
│   └── types/                      Tipos TypeScript compartidos
├── tests/
│   ├── unit/
│   └── integration/
└── .claude/
    └── skills/                     Skills reutilizables
```

El detalle de subcarpetas y de la separación MVC + DAO está documentado en `docs/ARCHITECTURE.md`.

---

## Testing y calidad

### Regla general

Todo cambio debe validarse. No basta con comprobar que parece funcionar.

### Cobertura mínima esperada

Cada cambio debe considerar, según aplique:

- caso válido
- caso inválido
- errores esperables
- casos límite
- regresiones sobre comportamiento existente

### Tipos de pruebas

**Unitarias:** para funciones, validaciones, cálculos, parsers, transformaciones y lógica aislable.

**Integración:** para flujos donde colaboran varias piezas: UI, lógica, persistencia, APIs, autenticación y similares.

**UI:** cuando el cambio afecta comportamiento visible o interacción del usuario, valida también la experiencia final. La revisión manual de UI sigue siendo obligatoria cuando haya impacto visual o de usabilidad.

### Reglas de testing

- no añadas una funcionalidad crítica sin tests
- no modifiques comportamiento existente sin revisar o ajustar tests afectados
- un test debe verificar comportamiento, no implementación accidental
- prueba ramas condicionales y errores, no solo el camino feliz
- incluye casos límite cuando haya inputs propensos a romperse
- si un test falla tras un cambio, determina si cambió el comportamiento o si el test quedó obsoleto; no ajustes el test a ciegas
- valida especialmente la interacción entre controladores, servicios y capa DAO cuando exista persistencia

### Zonas críticas

La columna vertebral del sistema y las funciones críticas deben quedar protegidas por tests. Si falta cobertura en una zona crítica tocada por un cambio, esa cobertura debe añadirse como parte del trabajo.

En este proyecto se consideran zonas críticas:

- el cálculo del veredicto global del validador (matriz determinista)
- el parseo de la respuesta JSON del LLM evaluador
- la persistencia de las siete `validation_scores` por cada `validation_run`
- la validación de input del briefing antes de persistir

---

## Límites de edición

Cuando trabajes en este repositorio:

- no hagas cambios amplios no solicitados
- no mezcles refactor masivo con feature nueva sin necesidad
- no renombres archivos, símbolos o rutas globales sin revisar impacto completo
- no introduzcas dependencias nuevas sin necesidad clara
- no cambies convenciones del proyecto de forma oportunista en un cambio aislado
- no fuerces patrones de diseño sin necesidad técnica real
- no corrijas estilo rompiendo historial o difuminando cambios funcionales

---

## Criterios de done

Un cambio se considera listo cuando cumple todo lo siguiente:

- resuelve el objetivo solicitado
- mantiene o mejora claridad estructural
- no introduce duplicación evitable
- no mezcla responsabilidades sin justificación
- no deja naming ambiguo
- valida casos relevantes, incluidos errores y bordes cuando aplique
- mantiene consistencia con el stack y con el resto del repositorio
- respeta MVC y DAO cuando aplique
- informa qué patrones de diseño se han aplicado y por qué
- deja el código más fácil de modificar que antes, o al menos no peor

---

## Checklist operativo para cualquier cambio

Antes de cerrar un cambio, verifica:

- ¿la responsabilidad del código añadido está clara?
- ¿hay mezcla de capas o responsabilidades?
- ¿se respeta MVC en la solución propuesta?
- ¿el acceso a base de datos pasa por la capa DAO?
- ¿hay otros patrones necesarios para reducir acoplamiento o complejidad?
- ¿he duplicado lógica ya existente?
- ¿los nombres explican intención real?
- ¿hay efectos secundarios ocultos?
- ¿el cambio cubre caso feliz, error y bordes relevantes?
- ¿he revisado impacto visual si toca UI?
- ¿he validado que no se rompen comportamientos previos?
- ¿la solución sigue las convenciones existentes del repositorio?
- ¿he informado al usuario de los patrones aplicados y su justificación?
- ¿la documentación afectada (`contexto_proyecto.md`, `docs/*.md`) está actualizada?

---

## Convenciones documentales del repositorio

Para que el contexto se mantenga útil a lo largo del proyecto:

- `AGENTS.md` (este archivo) contiene reglas globales de código, arquitectura y proceso. **No** contiene contexto funcional del producto.
- `CLAUDE.md` y `CODEX.md` son puentes que importan `@AGENTS.md`. No deben duplicar contenido.
- `contexto_proyecto.md` describe el estado funcional del sistema: módulos, flujos, alcance del MVP, restricciones funcionales.
- `docs/` agrupa documentación de producto, arquitectura, datos, prompts y proceso.
- Los archivos `AGENTS.md` o `CLAUDE.md` dentro de subcarpetas aplican únicamente a esa zona del proyecto.
- Los archivos `.override` solo deben crearse para sobrescribir reglas heredadas; deben evitarse salvo necesidad real.

La skill `update-project-context` (en `.claude/skills/`) describe el procedimiento esperado cuando termine una tarea o cambie una parte relevante del sistema.
