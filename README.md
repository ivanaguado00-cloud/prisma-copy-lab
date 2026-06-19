# PRISMA Copy Lab

Aplicación web interna para crear, generar, validar y trazar mensajes
comerciales de Universidad Prisma (caso académico ficticio).

Práctica final del módulo "Desarrollo Vibe Coding" del Máster en IA
Generativa, conectada con el TFM del autor.

---

## Requisitos

- Node.js 20 o superior
- npm 10 o superior

---

## Instalación

```bash
git clone <url-del-repositorio>
cd prisma-copy-lab
npm install
```

---

## Variables de entorno

Copia el archivo de plantilla y rellena los valores:

```bash
cp .env.example .env
```

Variables necesarias (ver `.env.example` para la plantilla completa):

| Variable         | Descripción                                      |
|------------------|--------------------------------------------------|
| `DATABASE_URL`   | Ruta SQLite, p.ej. `file:./prisma/dev.db`        |
| `OPENAI_API_KEY` | Clave de API de OpenAI                           |
| `OPENAI_MODEL`   | Modelo a usar (por defecto `gpt-4o-mini`)        |
| `LLM_MOCK`       | `true` activa el cliente mock sin llamadas reales |

---

## Ejecución

### Modo desarrollo

```bash
npm run dev
```

El comando de desarrollo usa Webpack, vigilancia por sondeo y un límite de
2 GB para el heap de Node. La raíz de trabajo de Next.js está fijada al
repositorio para impedir que un `package-lock.json` situado en una carpeta
superior haga que Next vigile archivos ajenos al proyecto.

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

### Modo desarrollo con LLM mock (sin llamadas a OpenAI)

```bash
LLM_MOCK=true npm run dev
```

En Windows (PowerShell):

```powershell
$env:LLM_MOCK="true"; npm run dev
```

### Recuperar el entorno de desarrollo

Si el servidor empieza a consumir memoria de forma anormal, detén el proceso y
regenera la caché de Next.js:

```bash
npm run app:reset
```

Turbopack queda disponible únicamente para pruebas explícitas:

```bash
npm run dev:turbopack
```

### Build de producción

```bash
npm run build
npm run start
```

---

## Otros comandos útiles

```bash
npm run lint      # Ejecuta ESLint
npm run format    # Formatea el código con Prettier
```

---

## Documentación

- Reglas globales de código y patrones: `AGENTS.md`
- Estado funcional del sistema: `contexto_proyecto.md`
- Arquitectura aplicada: `docs/ARCHITECTURE.md`
- Documentación técnica y de producto: `docs/`
- Corpus de Universidad Prisma: `data/corpus/`

## Autor

Iván Aguado.
