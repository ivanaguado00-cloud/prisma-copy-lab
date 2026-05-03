import { createBrief } from '../dao/briefDao'
import { CHANNEL, MODE, type Channel, type Mode, type CreateBriefInput } from '../types/domain'

interface FieldError {
  field: string
  message: string
}

export interface BriefServiceResult {
  success: boolean
  briefId?: string
  errors?: FieldError[]
}

type RawBriefInput = {
  title?: string
  programOrTitulation?: string
  objective?: string
  audience?: string
  channel?: string
  mode?: string
  valueProposition?: string
  cta?: string
  constraints?: string
}

export async function createBriefService(input: RawBriefInput): Promise<BriefServiceResult> {
  const errors: FieldError[] = []

  if (!input.title?.trim()) {
    errors.push({ field: 'title', message: 'El título es obligatorio' })
  }
  if (!input.objective?.trim()) {
    errors.push({ field: 'objective', message: 'El objetivo es obligatorio' })
  }
  if (!input.audience?.trim()) {
    errors.push({ field: 'audience', message: 'La audiencia es obligatoria' })
  }
  if (!input.channel) {
    errors.push({ field: 'channel', message: 'El canal es obligatorio' })
  } else if (!Object.values(CHANNEL).includes(input.channel as Channel)) {
    errors.push({ field: 'channel', message: `Canal no válido. Valores permitidos: ${Object.values(CHANNEL).join(', ')}` })
  }
  if (!input.mode) {
    errors.push({ field: 'mode', message: 'El modo es obligatorio' })
  } else if (!Object.values(MODE).includes(input.mode as Mode)) {
    errors.push({ field: 'mode', message: `Modo no válido. Valores permitidos: ${Object.values(MODE).join(', ')}` })
  }
  if (!input.valueProposition?.trim()) {
    errors.push({ field: 'valueProposition', message: 'La propuesta de valor es obligatoria' })
  }
  if (!input.cta?.trim()) {
    errors.push({ field: 'cta', message: 'El CTA es obligatorio' })
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  const normalized: CreateBriefInput = {
    title: input.title!.trim(),
    programOrTitulation: input.programOrTitulation?.trim() || undefined,
    objective: input.objective!.trim(),
    audience: input.audience!.trim(),
    channel: input.channel as Channel,
    mode: input.mode as Mode,
    valueProposition: input.valueProposition!.trim(),
    cta: input.cta!.trim(),
    constraints: input.constraints?.trim() || undefined,
  }

  const brief = await createBrief(normalized)
  return { success: true, briefId: brief.id }
}
