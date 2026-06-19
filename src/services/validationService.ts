import { getBriefById } from '../dao/briefDao'
import { getMessageVersionById } from '../dao/messageVersionDao'
import { createValidationRun } from '../dao/validationRunDao'
import { createValidationScores } from '../dao/validationScoreDao'
import { getValidationClient } from './llm/factory'
import { getModel } from './llm/client'
import { VALIDATOR_PROMPT_VERSION } from '../types/llm'
import {
  CRITERION_KEY,
  SCORE_STATUS,
  OVERALL_VERDICT,
  type CriterionKey,
  type ScoreStatus,
  type OverallVerdict,
  type CreateValidationScoreInput,
} from '../types/domain'

// ── Constants ─────────────────────────────────────────────────────────────────

const CRITERIA_VERSION = 'v1.0'
const MAX_VALIDATION_ATTEMPTS = 3

const CRITERION_NAMES: Record<CriterionKey, string> = {
  alineacion_estrategica: 'Alineación estratégica',
  claridad_estructura: 'Claridad y estructura',
  tono_coherencia_marca: 'Tono y coherencia de marca',
  calidad_argumental: 'Calidad argumental y propuesta de valor',
  adaptacion_canal: 'Adaptación al canal',
  precision_fiabilidad: 'Precisión y fiabilidad del contenido',
  calidad_ejecucion: 'Calidad final de ejecución',
}

const ORDERED_CRITERION_KEYS: CriterionKey[] = [
  CRITERION_KEY.alineacion_estrategica,
  CRITERION_KEY.claridad_estructura,
  CRITERION_KEY.tono_coherencia_marca,
  CRITERION_KEY.calidad_argumental,
  CRITERION_KEY.adaptacion_canal,
  CRITERION_KEY.precision_fiabilidad,
  CRITERION_KEY.calidad_ejecucion,
]

const VALID_STATUSES = new Set<string>(Object.values(SCORE_STATUS))

// ── Prompt templates (replicate docs/PROMPTS.md section 4 v1.0) ──────────────

const VALIDATOR_SYSTEM_PROMPT = `Eres un validador automático de comunicaciones comerciales de Universidad Prisma. Tu única tarea es evaluar un mensaje comercial contra los siete bloques internos de validación de Prisma.

DEVUELVE EXCLUSIVAMENTE UN OBJETO JSON con esta estructura exacta:

{
  "scores": [
    {
      "criterionKey": "alineacion_estrategica",
      "status": "bien" | "mejorable" | "critico",
      "comment": "explicación breve, una o dos frases",
      "suggestedFix": "ajuste concreto o null"
    },
    {
      "criterionKey": "claridad_estructura",
      "status": "bien" | "mejorable" | "critico",
      "comment": "...",
      "suggestedFix": "... o null"
    },
    {
      "criterionKey": "tono_coherencia_marca",
      "status": "bien" | "mejorable" | "critico",
      "comment": "...",
      "suggestedFix": "... o null"
    },
    {
      "criterionKey": "calidad_argumental",
      "status": "bien" | "mejorable" | "critico",
      "comment": "...",
      "suggestedFix": "... o null"
    },
    {
      "criterionKey": "adaptacion_canal",
      "status": "bien" | "mejorable" | "critico",
      "comment": "...",
      "suggestedFix": "... o null"
    },
    {
      "criterionKey": "precision_fiabilidad",
      "status": "bien" | "mejorable" | "critico",
      "comment": "...",
      "suggestedFix": "... o null"
    },
    {
      "criterionKey": "calidad_ejecucion",
      "status": "bien" | "mejorable" | "critico",
      "comment": "...",
      "suggestedFix": "... o null"
    }
  ],
  "summary": "resumen global, máximo tres frases",
  "suggestedRewrite": "texto reescrito si crees que el veredicto sería 'aprobada con ajustes', o null"
}

NUNCA devuelvas el veredicto global ('aprobada', 'aprobada_con_ajustes', 'no_aprobada'). El veredicto se calcula fuera de ti.

NUNCA añadas texto antes o después del JSON.

CRITERIOS DE EVALUACIÓN

1. alineacion_estrategica: ¿el mensaje responde al objetivo declarado?, ¿está enfocado al público correcto?, ¿prioriza el argumento adecuado?
   Señales críticas: mezcla de objetivos, enfoque desalineado con el segmento, información secundaria por delante.

2. claridad_estructura: ¿se entiende en una sola lectura?, ¿la estructura es ordenada?, ¿la longitud está justificada?, ¿hay ambigüedades?
   Señales críticas: confusión, frases largas y densas, repeticiones, cierre sin conexión.

3. tono_coherencia_marca: ¿suena cercano + profesional + institucional?, ¿hay exceso promocional o rigidez?, ¿es reconocible como Prisma?
   Señales críticas: agresividad, frialdad, exageraciones, voz genérica.

4. calidad_argumental: ¿la propuesta de valor es visible?, ¿el beneficio está priorizado?, ¿conecta con el destinatario?
   Señales críticas: descripción sin persuasión, características sin valor, beneficio diluido, mensaje centrado en la institución y no en la persona.

5. adaptacion_canal: ¿la longitud y estructura encajan con el canal indicado?
   - whatsapp: breve, una idea, una CTA, sin presión.
   - email: asunto + cuerpo escaneable + CTA, coherente y ordenado.
   Señales críticas: WhatsApp con aspecto de email o viceversa, CTA inadecuada al canal.

6. precision_fiabilidad: ¿hay datos que no se pueden verificar?, ¿hay promesas absolutas?, ¿hay nombres de programas o fechas dudosas?
   Señales críticas: información inventada, promesas no sostenibles, claims sin respaldo.

7. calidad_ejecucion: ¿hay errores ortográficos o gramaticales?, ¿la puntuación favorece la lectura?, ¿el texto fluye con naturalidad?
   Señales críticas: faltas, errores de concordancia, repeticiones, sintaxis forzada.

Sé estricto pero justo. No marques 'critico' por matices menores. No marques 'bien' si hay incumplimiento real.`

function buildValidatorUserPrompt(params: {
  channel: string
  mode: string
  objective: string
  audience: string
  valueProposition: string
  cta: string
  constraints: string | null
  messageContent: string
}): string {
  return `CANAL: ${params.channel}
MODO: ${params.mode}
BRIEFING:
- objetivo: ${params.objective}
- público: ${params.audience}
- propuesta de valor: ${params.valueProposition}
- CTA esperada: ${params.cta}
- restricciones: ${params.constraints ?? 'ninguna'}

MENSAJE A EVALUAR:
"""
${params.messageContent}
"""

Evalúa este mensaje contra los siete bloques y devuelve el JSON exigido.`
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ParsedScore {
  criterionKey: CriterionKey
  status: ScoreStatus
  comment: string
  suggestedFix: string | null
}

interface ParsedValidatorResponse {
  scores: ParsedScore[]
  summary: string
  suggestedRewrite: string | null
}

// ── Parser ────────────────────────────────────────────────────────────────────

export function parseValidatorResponse(raw: string): ParsedValidatorResponse {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('La respuesta del validador no es JSON válido')
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('La respuesta del validador no es un objeto JSON')
  }

  const obj = parsed as Record<string, unknown>

  if (!Array.isArray(obj['scores'])) {
    throw new Error('La respuesta del validador no contiene el campo "scores" como array')
  }

  const rawScores = obj['scores'] as unknown[]

  if (rawScores.length !== 7) {
    throw new Error(
      `La respuesta del validador contiene ${rawScores.length} scores; se esperan exactamente 7`,
    )
  }

  const seenKeys = new Set<string>()
  const scores: ParsedScore[] = []

  for (let i = 0; i < rawScores.length; i++) {
    const item = rawScores[i]
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      throw new Error(`El score en posición ${i} no es un objeto`)
    }

    const score = item as Record<string, unknown>
    const criterionKey = score['criterionKey']
    const status = score['status']
    const comment = score['comment']
    const suggestedFix = score['suggestedFix']

    if (typeof criterionKey !== 'string' || !ORDERED_CRITERION_KEYS.includes(criterionKey as CriterionKey)) {
      throw new Error(
        `El score en posición ${i} tiene criterionKey inválido: "${criterionKey}". Claves válidas: ${ORDERED_CRITERION_KEYS.join(', ')}`,
      )
    }

    if (seenKeys.has(criterionKey)) {
      throw new Error(`criterionKey duplicado en la respuesta del validador: "${criterionKey}"`)
    }
    seenKeys.add(criterionKey)

    if (typeof status !== 'string' || !VALID_STATUSES.has(status)) {
      throw new Error(
        `El score "${criterionKey}" tiene status inválido: "${status}". Valores válidos: bien, mejorable, critico`,
      )
    }

    if (typeof comment !== 'string' || comment.trim() === '') {
      throw new Error(`El score "${criterionKey}" tiene comment vacío o ausente`)
    }

    if (suggestedFix !== null && typeof suggestedFix !== 'string') {
      throw new Error(
        `El score "${criterionKey}" tiene suggestedFix inválido: debe ser string o null`,
      )
    }

    scores.push({
      criterionKey: criterionKey as CriterionKey,
      status: status as ScoreStatus,
      comment: comment.trim(),
      suggestedFix: typeof suggestedFix === 'string' ? suggestedFix : null,
    })
  }

  for (const key of ORDERED_CRITERION_KEYS) {
    if (!seenKeys.has(key)) {
      throw new Error(`Falta el criterionKey "${key}" en la respuesta del validador`)
    }
  }

  const summary =
    typeof obj['summary'] === 'string' && obj['summary'].trim() !== ''
      ? obj['summary'].trim()
      : 'Sin resumen disponible.'

  const suggestedRewrite =
    typeof obj['suggestedRewrite'] === 'string' ? obj['suggestedRewrite'] : null

  return { scores, summary, suggestedRewrite }
}

// ── Verdict matrix (VALIDATION_CRITERIA.md section 6) ────────────────────────

export function calculateOverallVerdict(
  scores: { criterionKey: CriterionKey; status: ScoreStatus }[],
): OverallVerdict {
  if (scores.some((s) => s.status === SCORE_STATUS.critico)) {
    return OVERALL_VERDICT.no_aprobada
  }
  if (scores.filter((s) => s.status === SCORE_STATUS.mejorable).length >= 2) {
    return OVERALL_VERDICT.aprobada_con_ajustes
  }
  return OVERALL_VERDICT.aprobada
}

// ── Entry point ───────────────────────────────────────────────────────────────

export async function validateMessage(messageVersionId: string) {
  const version = await getMessageVersionById(messageVersionId)
  if (!version) {
    throw new Error(`MessageVersion no encontrada: ${messageVersionId}`)
  }

  const brief = await getBriefById(version.briefId)
  if (!brief) {
    throw new Error(`Brief no encontrado para la versión: ${messageVersionId}`)
  }

  const client = getValidationClient()
  const systemPrompt = VALIDATOR_SYSTEM_PROMPT
  const userPrompt = buildValidatorUserPrompt({
    channel: brief.channel,
    mode: brief.mode,
    objective: brief.objective,
    audience: brief.audience,
    valueProposition: brief.valueProposition,
    cta: brief.cta,
    constraints: brief.constraints,
    messageContent: version.content,
  })

  let lastError: Error | null = null
  let parsed: ParsedValidatorResponse | null = null

  for (let attempt = 0; attempt < MAX_VALIDATION_ATTEMPTS; attempt++) {
    try {
      const raw = await client.validate(systemPrompt, userPrompt)
      parsed = parseValidatorResponse(raw)
      break
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
    }
  }

  if (!parsed) {
    throw new Error(
      `Validación fallida tras ${MAX_VALIDATION_ATTEMPTS} intentos: ${lastError?.message}`,
    )
  }

  const overallVerdict = calculateOverallVerdict(parsed.scores)
  const validatorModel = process.env.LLM_MOCK === 'true' ? 'mock' : getModel()

  const run = await createValidationRun({
    messageVersionId,
    overallVerdict,
    summary: parsed.summary,
    suggestedRewrite: parsed.suggestedRewrite ?? undefined,
    validatorModel,
    validatorPromptVersion: VALIDATOR_PROMPT_VERSION,
    criteriaVersion: CRITERIA_VERSION,
  })

  const scoreInputs: CreateValidationScoreInput[] = parsed.scores.map((s) => ({
    validationRunId: run.id,
    criterionKey: s.criterionKey,
    criterionName: CRITERION_NAMES[s.criterionKey],
    status: s.status,
    comment: s.comment,
    suggestedFix: s.suggestedFix ?? undefined,
  }))

  await createValidationScores(scoreInputs)

  return run
}
