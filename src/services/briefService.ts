import { createBrief } from '../dao/briefDao'
import {
  CHANNEL, MODE, EMAIL_TEMPLATE,
  type Channel, type Mode, type EmailTemplate, type CreateBriefInput,
} from '../types/domain'

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
  emailSubject?:   string
  emailPreheader?: string
  emailTemplate?:  string
}

export async function createBriefService(input: RawBriefInput, userId: string): Promise<BriefServiceResult> {
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

  if (input.channel === CHANNEL.email) {
    if (!input.emailSubject?.trim()) {
      errors.push({ field: 'emailSubject', message: 'El asunto es obligatorio para email' })
    }
    if (!input.emailPreheader?.trim()) {
      errors.push({ field: 'emailPreheader', message: 'El preheader es obligatorio para email' })
    }
    if (!input.emailTemplate || !Object.values(EMAIL_TEMPLATE).includes(input.emailTemplate as EmailTemplate)) {
      errors.push({ field: 'emailTemplate', message: 'Selecciona una plantilla de email' })
    }
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  const isEmail = input.channel === CHANNEL.email

  const normalized: CreateBriefInput = {
    userId,
    title: input.title!.trim(),
    programOrTitulation: input.programOrTitulation?.trim() || undefined,
    objective: input.objective!.trim(),
    audience: input.audience!.trim(),
    channel: input.channel as Channel,
    mode: input.mode as Mode,
    valueProposition: input.valueProposition!.trim(),
    cta: input.cta!.trim(),
    constraints: input.constraints?.trim() || undefined,
    emailSubject:   isEmail ? input.emailSubject!.trim()          : undefined,
    emailPreheader: isEmail ? input.emailPreheader!.trim()        : undefined,
    emailTemplate:  isEmail ? input.emailTemplate as EmailTemplate : undefined,
  }

  const brief = await createBrief(normalized)
  return { success: true, briefId: brief.id }
}
