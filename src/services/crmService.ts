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
  // Datos extra para enriquecer el correo CRM de WhatsApp
  authorName?: string
  reviewerName?: string
  validationSummary?: string
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
  const { brief, messageContent, emailSubject, emailPreheader, crmNotes, sentByUserId,
    authorName, reviewerName, validationSummary } = input

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
  const crmEmailHtml = buildCrmNotificationHtml(brief, proposal, crmNotes, { authorName, reviewerName, validationSummary })
  const crmEmailPlainText = buildCrmNotificationPlainText(brief, proposal, crmNotes, { authorName, reviewerName, validationSummary })

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

interface TraceabilityMeta {
  authorName?: string
  reviewerName?: string
  validationSummary?: string
}

function buildCrmNotificationHtml(
  brief: Brief,
  proposal: CrmProposal,
  crmNotes?: string,
  meta: TraceabilityMeta = {},
): string {
  const row = (label: string, value: string | null | undefined) =>
    value
      ? `<tr>
          <td style="padding:6px 12px 6px 0;font-size:12px;color:#4c4546;width:150px;vertical-align:top;font-weight:600;white-space:nowrap;">${escapeHtml(label)}</td>
          <td style="padding:6px 0;font-size:13px;color:#1b1c1c;line-height:1.5;">${escapeHtml(value)}</td>
        </tr>`
      : ''

  const section = (title: string, content: string) =>
    `<div style="margin-bottom:24px;">
      <p style="font-size:11px;font-weight:700;color:#7e7576;text-transform:uppercase;letter-spacing:.08em;margin:0 0 10px;">${escapeHtml(title)}</p>
      ${content}
    </div>`

  const isWa = brief.channel === 'whatsapp'
  const channelLabel = isWa ? 'WhatsApp' : 'Email'
  const briefRef = `BR-${brief.briefNumber.toString().padStart(3, '0')}`
  const sentAt = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })

  // WhatsApp message rendered in a phone-style bubble
  const messageBubble = isWa
    ? `<div style="background:#e3f5e1;border-radius:12px 12px 4px 12px;padding:14px 18px;font-size:14px;line-height:1.6;color:#1b1c1c;white-space:pre-wrap;font-family:'Helvetica Neue',Arial,sans-serif;max-width:520px;">${escapeHtml(proposal.plainText)}</div>`
    : `<div style="border:1px solid #cfc4c5;border-radius:6px;overflow:hidden;">${proposal.html}</div>`

  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>${escapeHtml(proposal.internalSubject)}</title></head>
<body style="font-family:'Inter',Arial,sans-serif;margin:0;padding:24px;background:#efeded;">
<div style="max-width:680px;margin:0 auto;">

  <!-- Header -->
  <div style="background:#1b1c1c;border-radius:8px 8px 0 0;padding:20px 28px;display:flex;align-items:center;justify-content:space-between;">
    <div>
      <p style="font-size:11px;font-weight:700;color:#7e7576;text-transform:uppercase;letter-spacing:.08em;margin:0 0 4px;">Solicitud CRM · ${escapeHtml(channelLabel)} aprobado</p>
      <p style="font-size:18px;font-weight:700;color:#ffffff;margin:0;">${escapeHtml(brief.title)}</p>
    </div>
    <span style="font-size:12px;font-weight:600;color:#7e7576;background:#2c2d2d;border-radius:4px;padding:4px 8px;">${briefRef}</span>
  </div>

  <!-- Body -->
  <div style="background:#ffffff;border-radius:0 0 8px 8px;padding:28px;box-shadow:0 1px 4px rgba(0,0,0,.08);">

    ${section('Petición', `
      <table cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">
        ${row('Programa', brief.programOrTitulation)}
        ${row('Objetivo', brief.objective)}
        ${row('Audiencia', brief.audience)}
        ${row('Push / CTA', brief.cta)}
        ${brief.constraints ? row('Restricciones CRM', brief.constraints) : ''}
        ${crmNotes ? row('Notas del revisor', crmNotes) : ''}
      </table>
    `)}

    ${section(`Mensaje ${channelLabel}`, messageBubble)}

    ${meta.validationSummary ? section('Validación automática', `
      <div style="border-left:3px solid #1b1c1c;padding:10px 14px;background:#f5f3f3;border-radius:0 4px 4px 0;">
        <p style="font-size:13px;color:#1b1c1c;margin:0;line-height:1.6;">${escapeHtml(meta.validationSummary)}</p>
      </div>
    `) : ''}

    ${section('Trazabilidad', `
      <table cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">
        ${row('Referencia', briefRef)}
        ${row('Canal', channelLabel)}
        ${meta.authorName ? row('Autor', meta.authorName) : ''}
        ${meta.reviewerName ? row('Revisor (PM)', meta.reviewerName) : ''}
        ${row('Fecha de envío', sentAt)}
      </table>
    `)}

  </div>

  <p style="text-align:center;font-size:11px;color:#7e7576;margin-top:16px;">PRISMA Copy Lab · Uso interno · Universidad Prisma</p>
</div>
</body></html>`
}

function buildCrmNotificationPlainText(
  brief: Brief,
  proposal: CrmProposal,
  crmNotes?: string,
  meta: TraceabilityMeta = {},
): string {
  const channelLabel = brief.channel === 'whatsapp' ? 'WhatsApp' : 'Email'
  const briefRef = `BR-${brief.briefNumber.toString().padStart(3, '0')}`
  const sentAt = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })

  const lines: string[] = [
    `SOLICITUD CRM · ${channelLabel.toUpperCase()} APROBADO`,
    `${briefRef} — ${brief.title}`,
    '═'.repeat(50),
    '',
    '── PETICIÓN ────────────────────────────────',
  ]

  if (brief.programOrTitulation) lines.push(`Programa:     ${brief.programOrTitulation}`)
  lines.push(`Objetivo:     ${brief.objective}`)
  lines.push(`Audiencia:    ${brief.audience}`)
  lines.push(`Push / CTA:   ${brief.cta}`)
  if (brief.constraints) lines.push(`Restricciones: ${brief.constraints}`)
  if (crmNotes) lines.push(`Notas PM:     ${crmNotes}`)

  lines.push('')
  lines.push(`── MENSAJE ${channelLabel.toUpperCase()} ────────────────────────────`)
  lines.push('')
  lines.push(proposal.plainText)

  if (meta.validationSummary) {
    lines.push('')
    lines.push('── VALIDACIÓN AUTOMÁTICA ──────────────────────')
    lines.push(meta.validationSummary)
  }

  lines.push('')
  lines.push('── TRAZABILIDAD ────────────────────────────────')
  lines.push(`Referencia: ${briefRef}`)
  lines.push(`Canal:      ${channelLabel}`)
  if (meta.authorName) lines.push(`Autor:      ${meta.authorName}`)
  if (meta.reviewerName) lines.push(`Revisor PM: ${meta.reviewerName}`)
  lines.push(`Fecha:      ${sentAt}`)
  lines.push('')
  lines.push('PRISMA Copy Lab · Uso interno · Universidad Prisma')

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
