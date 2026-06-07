import type { Brief, MessageVersion } from '../generated/prisma/client'
import { generateMessage } from './generationService'
import { validateMessage } from './validationService'
import { listValidationRunsByMessage } from '../dao/validationRunDao'
import { getGenerationClient } from './llm/factory'
import { OVERALL_VERDICT } from '../types/domain'

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_ATTEMPTS = 3

// ── Refinement instruction generation ────────────────────────────────────────

const INSTRUCTION_SYSTEM_PROMPT = `Eres un experto en comunicación comercial. Tu única tarea es generar UNA instrucción de mejora concisa, en lenguaje natural, para un redactor que va a reescribir un mensaje comercial de Universidad Prisma.

REGLAS:
- Máximo 2 frases.
- Específica y accionable: indica QUÉ mejorar y CÓMO.
- Sintetiza los problemas detectados en una sola instrucción útil.
- Devuelve SOLO la instrucción. Sin explicaciones, sin prefijos, sin comillas.`

const CRITERION_NAMES: Record<string, string> = {
  alineacion_estrategica: 'Alineación estratégica',
  claridad_estructura: 'Claridad y estructura',
  tono_coherencia_marca: 'Tono y coherencia de marca',
  calidad_argumental: 'Calidad argumental y propuesta de valor',
  adaptacion_canal: 'Adaptación al canal',
  precision_fiabilidad: 'Precisión y fiabilidad del contenido',
  calidad_ejecucion: 'Calidad final de ejecución',
}

function buildInstructionUserPrompt(
  failingScores: Array<{
    criterionKey: string
    status: string
    comment: string
    suggestedFix: string | null
  }>,
  summary: string,
): string {
  const lines = failingScores.map((s) => {
    const name = CRITERION_NAMES[s.criterionKey] ?? s.criterionKey
    const fix = s.suggestedFix ? ` Sugerencia: ${s.suggestedFix}` : ''
    return `- ${name} [${s.status}]: ${s.comment}${fix}`
  })

  return `El siguiente mensaje ha sido evaluado y presenta problemas en estos bloques:

${lines.join('\n')}

Resumen global: ${summary}

Genera UNA instrucción de mejora concisa (máximo 2 frases) para corregir los problemas más importantes.`
}

async function generateRefinementInstruction(
  failingScores: Array<{
    criterionKey: string
    status: string
    comment: string
    suggestedFix: string | null
  }>,
  summary: string,
): Promise<string> {
  const client = getGenerationClient()
  const raw = await client.generate(
    INSTRUCTION_SYSTEM_PROMPT,
    buildInstructionUserPrompt(failingScores, summary),
  )
  return raw.trim()
}

// ── Orchestration ─────────────────────────────────────────────────────────────

interface GenerateAndApproveOptions {
  userInstruction?: string
  parentVersionId?: string
}

interface AttemptResult {
  version: MessageVersion
  criticalCount: number
}

export async function generateAndApprove(
  brief: Brief,
  options: GenerateAndApproveOptions = {},
): Promise<MessageVersion> {
  const attempts: AttemptResult[] = []
  let currentOptions = { ...options }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const version = await generateMessage(brief, currentOptions)
    await validateMessage(version.id)

    const runs = await listValidationRunsByMessage(version.id)
    const latestRun = runs[0]
    if (!latestRun) throw new Error(`Sin resultado de validación para la versión ${version.id}`)

    const criticalCount = latestRun.scores.filter((s) => s.status === 'critico').length

    console.log(
      `[orchestration] Intento ${attempt}/${MAX_ATTEMPTS} — veredicto: ${latestRun.overallVerdict} (${criticalCount} críticos)`,
    )

    attempts.push({ version, criticalCount })

    if (latestRun.overallVerdict === OVERALL_VERDICT.aprobada) {
      return version
    }

    if (attempt < MAX_ATTEMPTS) {
      const failingScores = latestRun.scores.filter((s) => s.status !== 'bien')
      const instruction = await generateRefinementInstruction(failingScores, latestRun.summary)
      currentOptions = { userInstruction: instruction, parentVersionId: version.id }
    }
  }

  const best = attempts.reduce((a, b) => (a.criticalCount <= b.criticalCount ? a : b))
  console.log(
    `[orchestration] Sin aprobación tras ${MAX_ATTEMPTS} intentos. Devolviendo mejor versión (${best.criticalCount} críticos).`,
  )
  return best.version
}

// ── Single-attempt generation (for user-initiated refinements) ────────────────

export async function generateSingle(
  brief: Brief,
  options: GenerateAndApproveOptions = {},
): Promise<MessageVersion> {
  const version = await generateMessage(brief, options)
  await validateMessage(version.id)
  return version
}
