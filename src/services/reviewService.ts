import { getBriefById, updateBriefReview } from '../dao/briefDao'
import { getUserById } from '../dao/userDao'
import { sendEmail } from './emailService'
import { REVIEW_STATUS, USER_ROLE, type ReviewStatus } from '../types/domain'

export interface ReviewResult {
  success: boolean
  error?: string
}

export async function setReviewStatus(
  briefId: string,
  reviewerId: string,
  reviewerRole: string,
  status: ReviewStatus,
  note?: string,
): Promise<ReviewResult> {
  if (reviewerRole !== USER_ROLE.reviewer) {
    return { success: false, error: 'Solo los revisores pueden cambiar el estado de revisión.' }
  }

  if (!Object.values(REVIEW_STATUS).includes(status)) {
    return { success: false, error: `Estado de revisión inválido: ${status}` }
  }

  const brief = await getBriefById(briefId)
  if (!brief) {
    return { success: false, error: 'Brief no encontrado.' }
  }

  await updateBriefReview(briefId, {
    reviewStatus: status,
    reviewedBy: reviewerId,
    reviewedAt: new Date(),
    reviewNote: note ?? null,
  })

  await notifyAuthor(brief.userId, brief.title, briefId, status, note)

  return { success: true }
}

async function notifyAuthor(
  authorId: string,
  briefTitle: string,
  briefId: string,
  status: ReviewStatus,
  note?: string,
): Promise<void> {
  const author = await getUserById(authorId)
  if (!author?.email) return

  const statusLabel =
    status === REVIEW_STATUS.approved ? 'aprobado'
    : status === REVIEW_STATUS.rejected ? 'rechazado'
    : 'marcado como pendiente'

  const subject = `Brief "${briefTitle}" ha sido ${statusLabel}`

  const noteBlock = note
    ? `<p style="margin-top:12px"><strong>Nota del revisor:</strong> ${note}</p>`
    : ''

  const html = `
    <p>Hola${author.name ? ` ${author.name}` : ''},</p>
    <p>Tu brief <strong>"${briefTitle}"</strong> ha sido <strong>${statusLabel}</strong> por el equipo de revisión.</p>
    ${noteBlock}
    <p><a href="${process.env.AUTH_URL ?? 'http://localhost:3000'}/briefs/${briefId}">Ver brief</a></p>
  `.trim()

  const text = [
    `Tu brief "${briefTitle}" ha sido ${statusLabel}.`,
    note ? `Nota del revisor: ${note}` : '',
    `Ver brief: ${process.env.AUTH_URL ?? 'http://localhost:3000'}/briefs/${briefId}`,
  ].filter(Boolean).join('\n\n')

  await sendEmail({ to: author.email, subject, html, text })
}
