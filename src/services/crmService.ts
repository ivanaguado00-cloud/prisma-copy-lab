import type { Brief } from '../generated/prisma/client'
import {
  EMAIL_TEMPLATES,
  PRISMA_BRAND_KIT,
  renderEmailHtml,
  renderEmailPlainText,
  type EmailContent,
  type EmailTemplate,
} from '../lib/emailTemplates'
import { sendEmail } from './emailService'
import { updateBriefCrm } from '../dao/briefDao'
import { CRM_STATUS } from '../types/domain'

// ── Constants ─────────────────────────────────────────────────────────────────

// El destinatario CRM se configura por variable de entorno. En entorno de prueba
// apunta a ivan.aguado00@gmail.com como correo de verificación interna.
const CRM_RECIPIENT_EMAIL = process.env.CRM_RECIPIENT_EMAIL ?? 'ivan.aguado00@gmail.com'

// ── Public API ────────────────────────────────────────────────────────────────

export interface CrmPreviewData {
  template: EmailTemplate
  content: EmailContent
  html: string
  plainText: string
  internalSubject: string
  recipientEmail: string
}

export interface SendToCrmInput {
  brief: Brief
  messageContent: string
  emailSubject?: string | null
  emailPreheader?: string | null
  crmNotes?: string
  sentByUserId: string
}

export interface SendToCrmResult {
  success: boolean
  error?: string
  mock?: boolean
}

/**
 * Construye la previsualización del email maquetado usando la plantilla del brief.
 * No envía nada — solo genera los datos de preview para que el usuario confirme.
 */
export function buildCrmPreview(
  brief: Brief,
  emailBody: string,
  emailSubject?: string | null,
  emailPreheader?: string | null,
): CrmPreviewData {
  const templateId = brief.emailTemplate ?? 'standard'
  const template = EMAIL_TEMPLATES.find((t) => t.templateId === templateId) ?? EMAIL_TEMPLATES[0]!

  const content: EmailContent = {
    subject: emailSubject ?? buildSubject(brief),
    preheader: emailPreheader ?? buildPreheader(brief),
    body: emailBody,
    cta: brief.cta,
    programOrTitulation: brief.programOrTitulation ?? undefined,
  }

  const html = renderEmailHtml(content, template, PRISMA_BRAND_KIT)
  const plainText = renderEmailPlainText(content, PRISMA_BRAND_KIT)
  const internalSubject = buildInternalSubject(brief, template)

  return {
    template,
    content,
    html,
    plainText,
    internalSubject,
    recipientEmail: CRM_RECIPIENT_EMAIL,
  }
}

/**
 * Envía una propuesta aprobada de email o WhatsApp al equipo de CRM
 * y actualiza el estado del brief.
 */
export async function sendToCrm(input: SendToCrmInput): Promise<SendToCrmResult> {
  const { brief, messageContent, emailSubject, emailPreheader, crmNotes, sentByUserId } = input

  // Validaciones de seguridad antes de enviar
  if (brief.channel !== 'email' && brief.channel !== 'whatsapp') {
    return { success: false, error: 'El canal del brief no es compatible con el flujo CRM.' }
  }
  if (!messageContent?.trim()) {
    return { success: false, error: 'No hay contenido de mensaje generado.' }
  }
  if (!CRM_RECIPIENT_EMAIL) {
    return { success: false, error: 'No hay destinatario CRM configurado.' }
  }

  const proposal = buildCrmProposal(brief, messageContent, emailSubject, emailPreheader)
  const crmEmailHtml = buildCrmNotificationHtml(brief, proposal, crmNotes)
  const crmEmailPlainText = buildCrmNotificationPlainText(brief, proposal, crmNotes)

  const sendResult = await sendEmail({
    to: CRM_RECIPIENT_EMAIL,
    subject: proposal.internalSubject,
    html: crmEmailHtml,
    text: crmEmailPlainText,
  })

  if (!sendResult.success) {
    return { success: false, error: sendResult.error ?? 'Error desconocido al enviar el email.' }
  }

  // Solo actualizamos el estado si el envío fue exitoso
  await updateBriefCrm(brief.id, {
    crmStatus: CRM_STATUS.sent_to_crm,
    crmSentAt: new Date(),
    crmSentBy: sentByUserId,
    crmEmailHtml: proposal.html,
    crmEmailPlainText: proposal.plainText,
    crmInternalSubject: proposal.internalSubject,
    crmNotes: crmNotes ?? null,
  })

  return { success: true, mock: sendResult.mock }
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function buildSubject(brief: Brief): string {
  return brief.title
}

function buildPreheader(brief: Brief): string {
  if (brief.programOrTitulation) {
    return `${brief.programOrTitulation} · ${brief.objective.slice(0, 80)}`
  }
  return brief.objective.slice(0, 100)
}

function buildInternalSubject(brief: Brief, template: EmailTemplate): string {
  const parts = ['Solicitud CRM · Email aprobado']
  if (brief.programOrTitulation) parts.push(brief.programOrTitulation)
  parts.push(template.name)
  return parts.join(' · ')
}

interface CrmProposal {
  html: string
  plainText: string
  internalSubject: string
  subject?: string
  preheader?: string
}

function buildCrmProposal(
  brief: Brief,
  messageContent: string,
  emailSubject?: string | null,
  emailPreheader?: string | null,
): CrmProposal {
  if (brief.channel === 'whatsapp') {
    const parts = ['Solicitud CRM · WhatsApp aprobado']
    if (brief.programOrTitulation) parts.push(brief.programOrTitulation)

    return {
      html: `<div style="white-space:pre-wrap;font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#1b1c1c;">${escapeHtml(messageContent)}</div>`,
      plainText: messageContent,
      internalSubject: parts.join(' · '),
    }
  }

  const templateId = brief.emailTemplate ?? 'standard'
  const template =
    EMAIL_TEMPLATES.find((item) => item.templateId === templateId) ?? EMAIL_TEMPLATES[0]!
  const content: EmailContent = {
    subject: emailSubject ?? buildSubject(brief),
    preheader: emailPreheader ?? buildPreheader(brief),
    body: messageContent,
    cta: brief.cta,
    programOrTitulation: brief.programOrTitulation ?? undefined,
  }

  return {
    html: renderEmailHtml(content, template, PRISMA_BRAND_KIT),
    plainText: renderEmailPlainText(content, PRISMA_BRAND_KIT),
    internalSubject: buildInternalSubject(brief, template),
    subject: content.subject,
    preheader: content.preheader,
  }
}

function buildCrmNotificationHtml(brief: Brief, proposal: CrmProposal, crmNotes?: string): string {
  const row = (label: string, value: string | null | undefined) =>
    value
      ? `<tr><td style="padding:6px 0;font-size:13px;color:#4c4546;width:160px;vertical-align:top;">${label}</td><td style="padding:6px 0;font-size:13px;color:#1b1c1c;">${value}</td></tr>`
      : ''

  const channelLabel = brief.channel === 'whatsapp' ? 'WhatsApp' : 'email'

  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>${proposal.internalSubject}</title></head>
<body style="font-family:Inter,Arial,sans-serif;margin:0;padding:24px;background:#efeded;">
<div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:8px;padding:32px;box-shadow:0 1px 4px rgba(0,0,0,.08);">
  <p style="font-size:15px;color:#1b1c1c;margin:0 0 24px;">Hola equipo,</p>
  <p style="font-size:15px;color:#1b1c1c;margin:0 0 24px;">
    Se ha preparado una nueva propuesta de ${channelLabel} lista para trabajar desde CRM.
  </p>

  <table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-bottom:24px;border-collapse:collapse;">
    ${row('Canal', channelLabel)}
    ${row('Programa', brief.programOrTitulation)}
    ${row('Objetivo', brief.objective)}
    ${row('Público objetivo', brief.audience)}
    ${row('Asunto propuesto', proposal.subject)}
    ${row('Preheader', proposal.preheader)}
    ${row('CTA', brief.cta)}
    ${row('Restricciones', brief.constraints)}
    ${row('Notas para CRM', crmNotes)}
  </table>

  <p style="font-size:14px;font-weight:600;color:#1b1c1c;margin:0 0 12px;">Propuesta aprobada:</p>
  <div style="border:1px solid #cfc4c5;border-radius:6px;overflow:hidden;">
    ${proposal.html}
  </div>
</div>
</body></html>`
}

function buildCrmNotificationPlainText(
  brief: Brief,
  proposal: CrmProposal,
  crmNotes?: string,
): string {
  const channelLabel = brief.channel === 'whatsapp' ? 'WhatsApp' : 'email'
  const lines = [
    'Hola equipo,',
    '',
    `Se ha preparado una nueva propuesta de ${channelLabel} lista para trabajar desde CRM.`,
    '',
    '─'.repeat(40),
    `Canal: ${channelLabel}`,
  ]

  if (brief.programOrTitulation) lines.push(`Programa: ${brief.programOrTitulation}`)
  lines.push(`Objetivo: ${brief.objective}`)
  lines.push(`Público objetivo: ${brief.audience}`)
  if (proposal.subject) lines.push(`Asunto propuesto: ${proposal.subject}`)
  if (proposal.preheader) lines.push(`Preheader: ${proposal.preheader}`)
  lines.push(`CTA: ${brief.cta}`)
  if (brief.constraints) lines.push(`Restricciones: ${brief.constraints}`)
  if (crmNotes) lines.push(`Notas para CRM: ${crmNotes}`)

  lines.push('')
  lines.push('─'.repeat(40))
  lines.push('Propuesta aprobada:')
  lines.push('')
  lines.push(proposal.plainText)

  return lines.join('\n')
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
