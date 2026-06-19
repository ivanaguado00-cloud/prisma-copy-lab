import { getBriefById, updateBriefReview } from '../dao/briefDao'
import { getUserById, getUsersByRole } from '../dao/userDao'
import { sendEmail } from './emailService'
import { REVIEW_STATUS, USER_ROLE, isAdmin, type ReviewStatus } from '../types/domain'

export interface ReviewResult {
  success: boolean
  error?: string
}

export async function submitBriefForReview(
  briefId: string,
  authorId: string,
  authorRole: string,
): Promise<ReviewResult> {
  const canSubmit =
    authorRole === USER_ROLE.redactor ||
    authorRole === USER_ROLE.coordinador ||
    isAdmin(authorRole)

  if (!canSubmit) {
    return { success: false, error: 'No tienes permiso para enviar este brief a revisión.' }
  }

  const brief = await getBriefById(briefId)
  if (!brief) return { success: false, error: 'Brief no encontrado.' }
  if (brief.userId !== authorId && !isAdmin(authorRole)) {
    return { success: false, error: 'Solo el autor del brief puede enviarlo a revisión.' }
  }

  await updateBriefReview(briefId, {
    reviewStatus: REVIEW_STATUS.submitted,
    reviewedBy: null,
    reviewedAt: null,
    reviewNote: null,
  })

  await notifyReviewers(brief.title, briefId)

  return { success: true }
}

export async function setReviewStatus(
  briefId: string,
  reviewerId: string,
  reviewerRole: string,
  status: ReviewStatus,
  note?: string,
): Promise<ReviewResult> {
  if (reviewerRole !== USER_ROLE.pm && !isAdmin(reviewerRole)) {
    return { success: false, error: 'Solo los revisores pueden cambiar el estado de revisión.' }
  }

  if (!Object.values(REVIEW_STATUS).includes(status)) {
    return { success: false, error: `Estado de revisión inválido: ${status}` }
  }

  const brief = await getBriefById(briefId)
  if (!brief) {
    return { success: false, error: 'Brief no encontrado.' }
  }

  // Guard: impedir aprobaciones duplicadas sin modificar reviewedAt ni reviewedBy.
  if (brief.reviewStatus === REVIEW_STATUS.approved && status === REVIEW_STATUS.approved) {
    return { success: false, error: 'Este brief ya fue aprobado anteriormente.' }
  }

  await updateBriefReview(briefId, {
    reviewStatus: status,
    reviewedBy: reviewerId,
    reviewedAt: new Date(),
    reviewNote: note ?? null,
  })

  // Para 'approved': la notificación la gestiona el flujo de aprobación en la action,
  // que conoce el resultado real del envío al CRM — ver notifyBriefApproval().
  // Para 'rejected': notificamos directamente desde aquí.
  if (status === REVIEW_STATUS.rejected) {
    await notifyAuthor(brief.userId, brief.title, briefId, status, note)
  }

  return { success: true }
}

// ── Notificación de aprobación (exportada para el flujo de acción) ────────────

/**
 * Envía la notificación al autor tras una aprobación, reflejando el resultado
 * real del envío al CRM. Debe llamarse desde la action de aprobación, una vez
 * que se conoce si `sendToCrm` tuvo éxito o no.
 */
export async function notifyBriefApproval(
  authorId: string,
  briefTitle: string,
  briefId: string,
  crmSent: boolean,
  note?: string,
): Promise<void> {
  const author = await getUserById(authorId)
  if (!author?.email) return

  const baseUrl = process.env.AUTH_URL ?? 'http://localhost:3000'
  const briefUrl = `${baseUrl}/briefs/${briefId}`
  const greeting = `Hola${author.name ? ` ${author.name}` : ''}`
  const subject = `[Aprobado] Tu brief "${briefTitle}" ha sido aprobado`

  const crmBlock = crmSent
    ? `
      <div style="background:#f0faf4;border:1px solid #c3e6cb;border-radius:8px;padding:16px 20px;margin:20px 0;">
        <p style="margin:0;font-size:13px;color:#2d6a4f;font-weight:600;">✓ Enviado al equipo de CRM</p>
        <p style="margin:4px 0 0;font-size:13px;color:#555;">
          El equipo de CRM gestionará el envío del mensaje a través de sus herramientas habituales.
        </p>
      </div>`
    : `
      <div style="background:#fffbf0;border:1px solid #f0d080;border-radius:8px;padding:16px 20px;margin:20px 0;">
        <p style="margin:0;font-size:13px;color:#7a5c00;font-weight:600;">⚠ Pendiente de envío al equipo de CRM</p>
        <p style="margin:4px 0 0;font-size:13px;color:#555;">
          El brief ha sido aprobado, pero el envío automático al equipo de CRM no pudo completarse.
          Un responsable deberá gestionarlo manualmente desde la plataforma.
        </p>
      </div>`

  const body = `
    <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1b1c1c;line-height:1.3;">
      ¡Brief aprobado! 🎉
    </p>
    <p style="margin:0 0 24px;font-size:14px;color:#555;">${greeting},</p>
    <p style="margin:0 0 16px;font-size:15px;color:#1b1c1c;line-height:1.6;">
      Tu brief <strong>"${briefTitle}"</strong> ha sido revisado y aprobado por el PM.
    </p>
    ${crmBlock}
    ${note ? `
    <div style="border-left:3px solid #1b1c1c;padding:12px 16px;background:#f8f7f6;border-radius:0 6px 6px 0;margin:20px 0;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#888;">Nota del revisor</p>
      <p style="margin:0;font-size:14px;color:#1b1c1c;line-height:1.5;">${note}</p>
    </div>` : ''}
    <p style="margin:24px 0 0;">${ctaButton(briefUrl, 'Ver brief')}</p>
  `

  const html = emailShell('#2a7d4f', 'Aprobado', body)
  const text = [
    `¡Brief aprobado! ${greeting},`,
    `Tu brief "${briefTitle}" ha sido aprobado.`,
    crmSent
      ? 'El contenido ha sido enviado al equipo de CRM.'
      : 'El brief ha sido aprobado, pero el envío al equipo de CRM no pudo completarse automáticamente.',
    note ? `Nota del revisor: ${note}` : '',
    `Ver brief: ${briefUrl}`,
  ].filter(Boolean).join('\n\n')

  await sendEmail({ to: author.email, subject, html, text })
}

// ── Email templates ───────────────────────────────────────────────────────────

function emailShell(accentColor: string, accentLabel: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f5f3f0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3f0;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="background:#1b1c1c;border-radius:12px 12px 0 0;padding:24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="color:#ffffff;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
                      PRISMA Copy Lab
                    </span>
                  </td>
                  <td align="right">
                    <span style="background:${accentColor};color:#fff;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:4px 10px;border-radius:20px;">
                      ${accentLabel}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:32px;border-left:1px solid #e8e4e1;border-right:1px solid #e8e4e1;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f0eeeb;border:1px solid #e8e4e1;border-top:none;border-radius:0 0 12px 12px;padding:16px 32px;">
              <p style="margin:0;font-size:11px;color:#888;text-align:center;">
                Este mensaje ha sido generado automáticamente por PRISMA Copy Lab.<br/>
                Universidad Prisma · Equipo de Marketing Digital
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function ctaButton(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#1b1c1c;color:#ffffff;font-size:13px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:6px;margin-top:8px;">${label} →</a>`
}

// ── Notificaciones ────────────────────────────────────────────────────────────

async function notifyAuthor(
  authorId: string,
  briefTitle: string,
  briefId: string,
  status: ReviewStatus,
  note?: string,
): Promise<void> {
  const author = await getUserById(authorId)
  if (!author?.email) return

  const baseUrl = process.env.AUTH_URL ?? 'http://localhost:3000'
  const briefUrl = `${baseUrl}/briefs/${briefId}`
  const greeting = `Hola${author.name ? ` ${author.name}` : ''}`

  if (status === REVIEW_STATUS.approved) {
    const subject = `[Aprobado] Tu brief "${briefTitle}" ha sido aprobado`

    const body = `
      <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1b1c1c;line-height:1.3;">
        ¡Brief aprobado! 🎉
      </p>
      <p style="margin:0 0 24px;font-size:14px;color:#555;">${greeting},</p>
      <p style="margin:0 0 16px;font-size:15px;color:#1b1c1c;line-height:1.6;">
        Tu brief <strong>"${briefTitle}"</strong> ha sido revisado y aprobado por el PM.
        El contenido ha sido enviado automáticamente al equipo de CRM para su ejecución.
      </p>
      <div style="background:#f0faf4;border:1px solid #c3e6cb;border-radius:8px;padding:16px 20px;margin:20px 0;">
        <p style="margin:0;font-size:13px;color:#2d6a4f;font-weight:600;">✓ Enviado al equipo de CRM</p>
        <p style="margin:4px 0 0;font-size:13px;color:#555;">
          El equipo de CRM gestionará el envío del mensaje a través de sus herramientas habituales.
        </p>
      </div>
      ${note ? `
      <div style="border-left:3px solid #1b1c1c;padding:12px 16px;background:#f8f7f6;border-radius:0 6px 6px 0;margin:20px 0;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#888;">Nota del revisor</p>
        <p style="margin:0;font-size:14px;color:#1b1c1c;line-height:1.5;">${note}</p>
      </div>` : ''}
      <p style="margin:24px 0 0;">${ctaButton(briefUrl, 'Ver brief')}</p>
    `

    const html = emailShell('#2a7d4f', 'Aprobado', body)
    const text = [
      `¡Brief aprobado! ${greeting},`,
      `Tu brief "${briefTitle}" ha sido aprobado y enviado al equipo de CRM.`,
      note ? `Nota del revisor: ${note}` : '',
      `Ver brief: ${briefUrl}`,
    ].filter(Boolean).join('\n\n')

    await sendEmail({ to: author.email, subject, html, text })

  } else if (status === REVIEW_STATUS.rejected) {
    const subject = `[Acción requerida] Tu brief "${briefTitle}" necesita revisión`

    const body = `
      <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1b1c1c;line-height:1.3;">
        Brief devuelto para revisión
      </p>
      <p style="margin:0 0 24px;font-size:14px;color:#555;">${greeting},</p>
      <p style="margin:0 0 16px;font-size:15px;color:#1b1c1c;line-height:1.6;">
        El PM ha revisado tu brief <strong>"${briefTitle}"</strong> y lo ha devuelto con indicaciones
        para que puedas mejorarlo antes de un nuevo envío.
      </p>
      ${note ? `
      <div style="border-left:3px solid #c0392b;padding:16px 20px;background:#fdf3f2;border-radius:0 8px 8px 0;margin:20px 0;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#c0392b;">
          Indicaciones del revisor
        </p>
        <p style="margin:0;font-size:14px;color:#1b1c1c;line-height:1.6;">${note}</p>
      </div>` : `
      <div style="border-left:3px solid #c0392b;padding:16px 20px;background:#fdf3f2;border-radius:0 8px 8px 0;margin:20px 0;">
        <p style="margin:0;font-size:14px;color:#555;font-style:italic;">El revisor no ha dejado nota adicional.</p>
      </div>`}
      <p style="margin:16px 0;font-size:14px;color:#555;line-height:1.6;">
        Accede al brief para revisar el análisis de calidad, refinar el mensaje y reenviarlo a revisión cuando esté listo.
      </p>
      <p style="margin:24px 0 0;">${ctaButton(briefUrl, 'Revisar y reenviar')}</p>
    `

    const html = emailShell('#c0392b', 'Revisión requerida', body)
    const text = [
      `Brief devuelto para revisión. ${greeting},`,
      `Tu brief "${briefTitle}" ha sido devuelto por el PM.`,
      note ? `Indicaciones del revisor: ${note}` : 'El revisor no ha dejado nota adicional.',
      `Accede al brief para revisarlo y reenviarlo: ${briefUrl}`,
    ].filter(Boolean).join('\n\n')

    await sendEmail({ to: author.email, subject, html, text })
  }
}

async function notifyReviewers(briefTitle: string, briefId: string): Promise<void> {
  const baseUrl = process.env.AUTH_URL ?? 'http://localhost:3000'
  const briefUrl = `${baseUrl}/briefs/${briefId}`

  const [pms, admins] = await Promise.all([
    getUsersByRole(USER_ROLE.pm),
    getUsersByRole(USER_ROLE.admin),
  ])
  const reviewersByEmail = new Map(
    [...pms, ...admins]
      .filter((reviewer) => reviewer.email)
      .map((reviewer) => [reviewer.email.toLowerCase(), reviewer]),
  )
  const reviewers = [...reviewersByEmail.values()]
  if (reviewers.length === 0) return

  const subject = `[Pendiente de revisión] Brief "${briefTitle}"`

  for (const reviewer of reviewers) {
    const greeting = `Hola${reviewer.name ? ` ${reviewer.name}` : ''}`

    const body = `
      <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1b1c1c;line-height:1.3;">
        Nuevo brief para revisar
      </p>
      <p style="margin:0 0 24px;font-size:14px;color:#555;">${greeting},</p>
      <p style="margin:0 0 16px;font-size:15px;color:#1b1c1c;line-height:1.6;">
        El equipo de redacción ha enviado un nuevo brief a revisión y está esperando tu validación.
      </p>
      <div style="background:#f8f7f6;border:1px solid #e8e4e1;border-radius:8px;padding:16px 20px;margin:20px 0;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#888;">Brief</p>
        <p style="margin:0;font-size:15px;font-weight:600;color:#1b1c1c;">${briefTitle}</p>
      </div>
      <p style="margin:0 0 24px;font-size:14px;color:#555;line-height:1.6;">
        Revisa el contenido generado, el análisis de calidad y decide si aprobarlo o devolverlo con indicaciones.
      </p>
      <p style="margin:0;">${ctaButton(briefUrl, 'Revisar brief')}</p>
    `

    const html = emailShell('#1b1c1c', 'Pendiente de revisión', body)
    const text = [
      `Nuevo brief para revisar. ${greeting},`,
      `El brief "${briefTitle}" está listo y esperando tu revisión.`,
      `Revisar brief: ${briefUrl}`,
    ].join('\n\n')

    await sendEmail({ to: reviewer.email, subject, html, text })
  }
}
