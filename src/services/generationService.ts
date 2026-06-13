import type { Brief } from '../generated/prisma/client'
import {
  createMessageVersion,
  getMessageVersionById,
  listVersionsByBrief,
} from '../dao/messageVersionDao'
import { getGenerationClient } from './llm/factory'
import { getModel } from './llm/client'
import { GENERATION_PROMPT_VERSION } from '../types/llm'

// ── System prompts ────────────────────────────────────────────────────────────

const SHARED_IDENTITY = `Eres el asistente de redacción comercial de Universidad Prisma, una universidad
privada española 100% online.

IDENTIDAD VERBAL DE PRISMA
- Voz: cercana, profesional, inspiradora, clara, actual.
- Tono: cercano + institucional + claro + orientado a la acción.
- Suena: confiable, ordenada, comprensible, útil, amable, motivadora.
- NUNCA suena: agresiva, grandilocuente, vacía, demasiado promocional, rígida,
  burocrática o fría.

PILARES NARRATIVOS (apóyate al menos en uno)
flexibilidad, progreso profesional, acompañamiento, actualización, accesibilidad.

REGLAS DE PRODUCTO
- No prometas resultados absolutos.
- No exageres ("la mejor", "oportunidad única", "no dejes pasar...").
- No reproches al destinatario su falta de respuesta.
- Mantén un único objetivo por mensaje.
- Adapta longitud y estilo al canal indicado.`

export const GENERATION_SYSTEM_PROMPT = `${SHARED_IDENTITY}

REGLAS POR CANAL
- whatsapp: una sola idea principal, frases cortas, una única CTA, sin recursos
  de presión. 60-200 caracteres aproximadamente.
- email: asunto + cuerpo escaneable + CTA final. Devuelve "Asunto: ..." en la
  primera línea y el cuerpo a continuación. 80-180 palabras aproximadamente.

DEVUELVE SOLO EL TEXTO DEL MENSAJE. SIN EXPLICACIONES, SIN COMILLAS, SIN
COMENTARIOS NI METADATOS.`

export const EMAIL_GENERATION_SYSTEM_PROMPT = `${SHARED_IDENTITY}

FORMATO DE SALIDA — OBLIGATORIO
Devuelve ÚNICAMENTE un objeto JSON con exactamente estos tres campos:
{
  "emailSubject": "línea de asunto (máximo 60 caracteres, sin punto final)",
  "emailPreheader": "texto de vista previa en bandeja de entrada (40-90 caracteres)",
  "body": "cuerpo del email con párrafo de apertura, propuesta de valor y CTA final (80-180 palabras, párrafos cortos y escaneables)"
}
SIN TEXTO ADICIONAL. SIN EXPLICACIONES. SIN MARKDOWN. SOLO EL JSON.`

// ── Template hints para el prompt de email ───────────────────────────────────

const EMAIL_TEMPLATE_HINTS: Record<string, string> = {
  standard:    'Estándar: estructura clásica, encabezado narrativo y CTA al final.',
  promotional: 'Promocional: headline directo, beneficios destacados, CTA prominente.',
  newsletter:  'Informativo/Newsletter: tono divulgativo, párrafos cortos, CTA invitacional.',
  reminder:    'Recordatorio/Seguimiento: breve y directo, énfasis en la acción pendiente.',
}

// ── User prompts ──────────────────────────────────────────────────────────────

export function buildUserPrompt(brief: Brief): string {
  const modeNote =
    brief.mode === 'exploracion'
      ? 'Modo: EXPLORACIÓN. Puedes proponer enfoques creativos o estructuras menos\nconvencionales, siempre dentro de las reglas de marca y sin romper tono.'
      : 'Modo: PRODUCCIÓN. Mantén ortodoxia respecto a tono y reglas de marca.'

  return `Genera una propuesta de mensaje comercial con los siguientes datos:

- campaña: ${brief.title}
- programa o titulación: ${brief.programOrTitulation ?? 'no especificado'}
- objetivo único: ${brief.objective}
- público: ${brief.audience}
- canal: ${brief.channel}
- propuesta de valor o palanca principal: ${brief.valueProposition}
- llamada a la acción esperada: ${brief.cta}
- restricciones específicas: ${brief.constraints ?? 'ninguna'}

${modeNote}`
}

function buildEmailUserPrompt(brief: Brief): string {
  const templateHint = brief.emailTemplate
    ? (EMAIL_TEMPLATE_HINTS[brief.emailTemplate] ?? '')
    : ''
  const templateLine = brief.emailTemplate
    ? `- plantilla: ${brief.emailTemplate}${templateHint ? ` — ${templateHint}` : ''}`
    : ''

  const modeNote =
    brief.mode === 'exploracion'
      ? 'Modo: EXPLORACIÓN. Puedes proponer enfoques creativos o estructuras menos\nconvencionales, siempre dentro de las reglas de marca y sin romper tono.'
      : 'Modo: PRODUCCIÓN. Mantén ortodoxia respecto a tono y reglas de marca.'

  return `Genera un email comercial con los siguientes datos:

- campaña: ${brief.title}
- programa o titulación: ${brief.programOrTitulation ?? 'no especificado'}
- objetivo único: ${brief.objective}
- público: ${brief.audience}
- propuesta de valor o palanca principal: ${brief.valueProposition}
- llamada a la acción esperada: ${brief.cta}
- restricciones específicas: ${brief.constraints ?? 'ninguna'}
${templateLine ? `${templateLine}\n` : ''}
${modeNote}`
}

export function buildIterationUserPrompt(params: {
  brief: Brief
  previousContent: string
  userInstruction: string
}): string {
  const { brief, previousContent, userInstruction } = params

  return `Aquí tienes una versión previa de un mensaje comercial generado para Universidad Prisma:

VERSIÓN ANTERIOR:
${previousContent}

BRIEFING ORIGINAL:
- campaña: ${brief.title}
- programa o titulación: ${brief.programOrTitulation ?? 'no especificado'}
- objetivo único: ${brief.objective}
- público: ${brief.audience}
- canal: ${brief.channel}
- propuesta de valor: ${brief.valueProposition}
- CTA: ${brief.cta}
- restricciones específicas: ${brief.constraints ?? 'ninguna'}

INSTRUCCIÓN DEL USUARIO PARA LA NUEVA VERSIÓN:
${userInstruction}

Aplica la instrucción del usuario siempre que sea compatible con los criterios institucionales. Si la instrucción entra en conflicto con tono, canal, precisión o fiabilidad, prioriza esos criterios y conserva una versión segura.

Devuelve solo la nueva versión final del mensaje, sin explicaciones ni alternativas.`
}

// ── generateMessage ───────────────────────────────────────────────────────────

interface GenerateOptions {
  userInstruction?: string
  parentVersionId?: string
}

export async function generateMessage(brief: Brief, options: GenerateOptions = {}) {
  const { userInstruction, parentVersionId } = options
  const client = getGenerationClient()
  const isEmail = brief.channel === 'email'

  const systemPrompt = isEmail ? EMAIL_GENERATION_SYSTEM_PROMPT : GENERATION_SYSTEM_PROMPT
  let userPrompt = isEmail ? buildEmailUserPrompt(brief) : buildUserPrompt(brief)

  if (userInstruction) {
    if (!parentVersionId) {
      throw new Error('La iteración con instrucción de usuario requiere una versión de origen')
    }

    const parentVersion = await getMessageVersionById(parentVersionId)
    if (!parentVersion || parentVersion.briefId !== brief.id) {
      throw new Error('Versión de origen no encontrada para este briefing')
    }

    userPrompt = buildIterationUserPrompt({
      brief,
      previousContent: parentVersion.content,
      userInstruction,
    })
  }

  const generated = await client.generate(systemPrompt, userPrompt, { jsonOutput: isEmail })

  const existingVersions = await listVersionsByBrief(brief.id)
  const versionNumber = existingVersions.length + 1

  const llmModel = process.env.LLM_MOCK === 'true' ? 'mock' : getModel()

  return createMessageVersion({
    briefId: brief.id,
    versionNumber,
    content: generated.body,
    emailSubject: generated.emailSubject,
    emailPreheader: generated.emailPreheader,
    llmProvider: 'openai',
    llmModel,
    generationPromptVersion: GENERATION_PROMPT_VERSION,
    userInstruction,
    parentVersionId,
  })
}

export { buildEmailUserPrompt, GENERATION_SYSTEM_PROMPT as WHATSAPP_GENERATION_SYSTEM_PROMPT }
