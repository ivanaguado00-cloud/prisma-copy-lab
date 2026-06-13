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
const CRM_RECIPIENT_EMAIL =
  process.env.CRM_RECIPIENT_EMAIL ?? 'ivan.aguado00@gmail.com'

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
  emailContent: string
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
export function buildCrmPreview(brief: Brief, emailBody: string): CrmPreviewData {
  const templateId = brief.emailTemplate ?? 'standard'
  const template = EMAIL_TEMPLATES.find((t) => t.templateId === templateId) ?? EMAIL_TEMPLATES[0]!


  const content: EmailContent = {
    subject: buildSubject(brief),
    preheader: buildPreheader(brief),
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
 * Envía la propuesta maquetada al equipo de CRM y actualiza el estado del brief.
 * Solo debe llamarse tras confirmación explícita del usuario.
 */
export async function sendToCrm(input: SendToCrmInput): Promise<SendToCrmResult> {
  const { brief, emailContent, crmNotes, sentByUserId } = input

  // Validaciones de seguridad antes de enviar
  if (brief.channel !== 'email') {
    return { success: false, error: 'Solo se pueden preparar para CRM briefs de canal email.' }
  }
  if (!emailContent?.trim()) {
    return { success: false, error: 'No hay contenido de email generado.' }
  }
  if (!CRM_RECIPIENT_EMAIL) {
    return { success: false, error: 'No hay destinatario CRM configurado.' }
  }

  const templateId = brief.emailTemplate ?? 'standard'
  const template = EMAIL_TEMPLATES.find((t) => t.templateId === templateId) ?? EMAIL_TEMPLATES[0]!


  const content: EmailContent = {
    subject: buildSubject(brief),
    preheader: buildPreheader(brief),
    body: emailContent,
    cta: brief.cta,
    programOrTitulation: brief.programOrTitulation ?? undefined,
  }

  const html = renderEmailHtml(content, template, PRISMA_BRAND_KIT)
  const plainText = renderEmailPlainText(content, PRISMA_BRAND_KIT)
  const internalSubject = buildInternalSubject(brief, template)
  const crmEmailHtml = buildCrmEmailHtml(brief, html, content, crmNotes)
  const crmEmailPlainText = buildCrmEmailPlainText(brief, plainText, content, crmNotes)

  const sendResult = await sendEmail({
    to: CRM_RECIPIENT_EMAIL,
    subject: internalSubject,
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
    crmEmailHtml: html,
    crmEmailPlainText: plainText,
    crmInternalSubject: internalSubject,
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

function buildCrmEmailHtml(
  brief: Brief,
  proposalHtml: string,
  content: EmailContent,
  crmNotes?: string,
): string {
  const row = (label: string, value: string | null | undefined) =>
    value
      ? `<tr><td style="padding:6px 0;font-size:13px;color:#6b7280;width:160px;vertical-align:top;">${label}</td><td style="padding:6px 0;font-size:13px;color:#1a1a1a;">${value}</td></tr>`
      : ''

  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>${content.subject}</title></head>
<body style="font-family:Inter,Arial,sans-serif;margin:0;padding:24px;background:#f5f5f5;">
<div style="max-width:680px;margin:0 auto;background:#fff;border-radius:8px;padding:32px;box-shadow:0 1px 4px rgba(0,0,0,.08);">
  <p style="font-size:15px;color:#1a1a1a;margin:0 0 24px;">Hola equipo,</p>
  <p style="font-size:15px;color:#1a1a1a;margin:0 0 24px;">
    Se ha preparado una nueva propuesta de email lista para trabajar desde CRM.
  </p>

  <table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-bottom:24px;border-collapse:collapse;">
    ${row('Programa', brief.programOrTitulation)}
    ${row('Objetivo', brief.objective)}
    ${row('Público objetivo', brief.audience)}
    ${row('Asunto propuesto', content.subject)}
    ${row('Preheader', content.preheader)}
    ${row('CTA', brief.cta)}
    ${row('Restricciones', brief.constraints)}
    ${row('Notas para CRM', crmNotes)}
  </table>

  <p style="font-size:14px;font-weight:600;color:#1a1a1a;margin:0 0 12px;">Propuesta maquetada:</p>
  <div style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;">
    ${proposalHtml}
  </div>
</div>
</body></html>`
}

function buildCrmEmailPlainText(
  brief: Brief,
  proposalPlainText: string,
  content: EmailContent,
  crmNotes?: string,
): string {
  const lines = [
    'Hola equipo,',
    '',
    'Se ha preparado una nueva propuesta de email lista para trabajar desde CRM.',
    '',
    '─'.repeat(40),
  ]

  if (brief.programOrTitulation) lines.push(`Programa: ${brief.programOrTitulation}`)
  lines.push(`Objetivo: ${brief.objective}`)
  lines.push(`Público objetivo: ${brief.audience}`)
  lines.push(`Asunto propuesto: ${content.subject}`)
  lines.push(`Preheader: ${content.preheader}`)
  lines.push(`CTA: ${brief.cta}`)
  if (brief.constraints) lines.push(`Restricciones: ${brief.constraints}`)
  if (crmNotes) lines.push(`Notas para CRM: ${crmNotes}`)

  lines.push('')
  lines.push('─'.repeat(40))
  lines.push('Propuesta maquetada:')
  lines.push('')
  lines.push(proposalPlainText)

  return lines.join('\n')
}
