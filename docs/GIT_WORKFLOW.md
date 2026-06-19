# GIT_WORKFLOW.md

Estrategia de control de versiones para PRISMA Copy Lab. Diseñada para evidenciar el "uso correcto del control de versiones" que exige el enunciado.

> Modelo: GitHub Flow simplificado. `main` siempre desplegable. Una rama por funcionalidad. Pull requests incluso siendo trabajo individual.

---

## 1. Ramas

### `main`
- Siempre estable y ejecutable.
- Solo se mergea desde PRs aprobadas y verde local.
- Se etiqueta con tags por hito.

### Ramas de trabajo (`feature/*`)

Una rama por bloque del plan de fases:

| Rama | Contenido |
|---|---|
| `feature/project-setup` | Inicialización Next.js, TypeScript, Tailwind, shadcn/ui, estructura de carpetas, lint, primer commit con docs. |
| `feature/database-prisma` | `schema.prisma`, migración inicial, cliente Prisma, primer DAO de prueba. |
| `feature/briefing-crud` | Wizard de briefing, server actions, briefDao, listado y detalle. |
| `feature/llm-generation` | `services/llm/`, `generationService`, persistencia de `message_versions`. |
| `feature/validation-engine` | `validationService`, parsing de JSON, cálculo de veredicto, persistencia. |
| `feature/history-detail` | Histórico cronológico, vista detalle de caso, mejoras UX mínimas. |
| `feature/iteration-versioning` | F7: nueva versión desde instrucción de ajuste (recomendable). |
| `feature/search-filters` | F6: filtros básicos en histórico (recomendable). |
| `feature/seed-and-mock` | Seed de datos, cliente LLM mock activable por env. |
| `feature/docs-demo` | README final, `.env.example`, capturas, contenido del PDF. |

Convención: `feature/` siempre en inglés, kebab-case.

## 2. Conventional Commits

Sigue [Conventional Commits 1.0](https://www.conventionalcommits.org/). Tipos usados en este proyecto:

- `feat:` nueva funcionalidad
- `fix:` corrección de bug
- `docs:` cambios solo en documentación
- `refactor:` cambio interno sin alterar comportamiento
- `chore:` mantenimiento, configuración, dependencias
- `test:` cambios en tests
- `style:` cambios cosméticos

Ejemplos válidos:
```
feat(briefing): añadir validación de campo objetivo único
fix(validator): manejar respuesta JSON malformada del LLM
docs(architecture): documentar uso de Server Actions
refactor(dao): extraer query de listVersionsByBrief
chore(deps): actualizar prisma a 5.x
test(validation): añadir caso para mensaje no aprobado
```

## 3. Pull Requests

Aunque el repositorio sea individual, **toda integración a `main` pasa por PR**. Esto evidencia uso correcto y deja traza histórica.

Plantilla mínima de descripción:

```
## Cambios
- ...

## Cómo probarlo
1. ...
2. ...

## Patrones aplicados
- MVC: ...
- DAO: ...
- (otros si aplica)

## Checklist
- [ ] El código respeta AGENTS.md
- [ ] Hay tests del caso feliz y al menos un caso límite
- [ ] No hay credenciales en el código
- [ ] La documentación afectada está actualizada
```

Los PRs se cierran con merge tradicional (no squash) para preservar historia, **salvo** cuando la rama tenga commits intermedios sucios; en ese caso, squash justificado en la descripción.

## 4. Tags

Tags semánticos por hito completado y verificado:

| Tag | Cuándo |
|---|---|
| `v0.1-setup` | Proyecto Next.js inicial mergeado en `main`, ejecutable, con README mínimo. |
| `v0.2-database` | Esquema Prisma + migración aplicada + DAOs base + datos seed. |
| `v0.3-generation` | Generación funcional de mensajes con LLM real (o mock). |
| `v0.4-validation` | Validador funcionando, veredicto calculado, scores persistidos. |
| `v0.5-history` | Histórico y detalle completos. |
| `v1.0-mvp` | MVP cerrado: F1-F5 funcionales, README final, PDF y vídeo grabados. |
| `v1.1-recommended` | Si se cierran F6/F7/F8 en plazo. |

Comando de referencia:
```bash
git tag -a v0.1-setup -m "Setup inicial Next.js + estructura"
git push origin v0.1-setup
```

## 5. .gitignore mínimo

```
node_modules/
.next/
dist/
build/
.env
.env.local
prisma/dev.db
prisma/dev.db-journal
.DS_Store
.vscode/
.idea/
coverage/
```

## 6. Configuración inicial recomendada

Después de `git init` y antes del primer commit:

```bash
git config user.name "Iván Aguado"
git config user.email "<email-académico-o-personal>"

# Crear .gitignore antes del primer add
# Crear README.md mínimo antes del primer commit
```

## 7. Flujo típico por feature

```bash
git checkout main
git pull origin main
git checkout -b feature/llm-generation

# trabajo iterativo con commits pequeños y específicos
git add src/services/llm/client.ts
git commit -m "feat(llm): añadir cliente OpenAI con manejo de errores"

git add src/services/generationService.ts
git commit -m "feat(generation): orquestar generación con persistencia"

git add tests/unit/generationService.test.ts
git commit -m "test(generation): cubrir caso feliz y error de LLM"

git push -u origin feature/llm-generation
# abrir PR en GitHub, completar plantilla
# merge a main
git tag -a v0.3-generation -m "Generación funcional con LLM"
git push origin v0.3-generation
```

## 8. Evidencia para la nota

En el PDF y en la defensa:

- Capturas del grafo de commits (`git log --graph --oneline --all`).
- Lista de PRs cerradas con sus descripciones.
- Lista de tags con sus mensajes.
- README con instrucciones de ejecución reproducibles.
- `.env.example` presente; `.env` ignorado.

## 9. Antipatrones a evitar

- Un único commit gigante con toda la app.
- Commits con mensajes tipo `wip`, `fix`, `cambios`.
- `main` rota durante varios commits seguidos.
- PRs sin descripción.
- Subir `.env` o claves API.
- Borrar tags por error de cierre y no recrearlos.
