import type { Brief } from '../generated/prisma/client'
import {
  createMessageVersion,
  getMessageVersionById,
  listVersionsByBrief,
} from '../dao/messageVersionDao'
import { getGenerationClient } from './llm/factory'
import { getModel } from './llm/client'
import { GENERATION_PROMPT_VERSION } from '../types/llm'

const GENERATION_SYSTEM_PROMPT = `Eres el asistente de redacción comercial de Universidad Prisma, una universidad
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
- Adapta longitud y estilo al canal indicado.

REGLAS POR CANAL
- whatsapp: una sola idea principal, frases cortas, una única CTA, sin recursos
  de presión. 60-200 caracteres aproximadamente.
- email: asunto + cuerpo escaneable + CTA final. Devuelve "Asunto: ..." en la
  primera línea y el cuerpo a continuación. 80-180 palabras aproximadamente.

DEVUELVE SOLO EL TEXTO DEL MENSAJE. SIN EXPLICACIONES, SIN COMILLAS, SIN
COMENTARIOS NI METADATOS.`

function buildUserPrompt(brief: Brief): string {
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

function buildIterationUserPrompt(params: {
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

interface GenerateOptions {
  userInstruction?: string
  parentVersionId?: string
}

export async function generateMessage(brief: Brief, options: GenerateOptions = {}) {
  const { userInstruction, parentVersionId } = options
  const client = getGenerationClient()

  const systemPrompt = GENERATION_SYSTEM_PROMPT
  let userPrompt = buildUserPrompt(brief)

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

  const content = await client.generate(systemPrompt, userPrompt)

  const existingVersions = await listVersionsByBrief(brief.id)
  const versionNumber = existingVersions.length + 1

  const llmModel = process.env.LLM_MOCK === 'true' ? 'mock' : getModel()

  return createMessageVersion({
    briefId: brief.id,
    versionNumber,
    content,
    llmProvider: 'openai',
    llmModel,
    generationPromptVersion: GENERATION_PROMPT_VERSION,
    userInstruction,
    parentVersionId,
  })
}

export { buildUserPrompt, buildIterationUserPrompt, GENERATION_SYSTEM_PROMPT }
