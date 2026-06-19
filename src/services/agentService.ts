import type { Brief } from '../generated/prisma/client'
import { listValidationRunsByMessage } from '../dao/validationRunDao'
import { generateMessage } from './generationService'
import { getGenerationClient } from './llm/factory'
import { OVERALL_VERDICT } from '../types/domain'

// ── Prompt templates ──────────────────────────────────────────────────────────

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

// ── Service ───────────────────────────────────────────────────────────────────

export async function autoRefine(messageVersionId: string, brief: Brief) {
  const runs = await listValidationRunsByMessage(messageVersionId)
  const latestRun = runs[0] ?? null

  if (!latestRun) {
    throw new Error(`No hay validación disponible para la versión: ${messageVersionId}`)
  }

  if (latestRun.overallVerdict === OVERALL_VERDICT.aprobada) {
    throw new Error('El mensaje ya está aprobado. No es necesario refinar.')
  }

  const failingScores = latestRun.scores.filter((s) => s.status !== 'bien')

  const client = getGenerationClient()
  const rawInstruction = await client.generate(
    INSTRUCTION_SYSTEM_PROMPT,
    buildInstructionUserPrompt(failingScores, latestRun.summary),
  )

  const userInstruction = rawInstruction.body.trim()

  return generateMessage(brief, {
    userInstruction,
    parentVersionId: messageVersionId,
  })
}
