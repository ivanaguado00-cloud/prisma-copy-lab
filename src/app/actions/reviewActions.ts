'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '../../auth'
import { setReviewStatus, submitBriefForReview } from '../../services/reviewService'
import { getBriefById } from '../../dao/briefDao'
import { listVersionsByBrief } from '../../dao/messageVersionDao'
import { listValidationRunsByMessage } from '../../dao/validationRunDao'
import { sendToCrm } from '../../services/crmService'
import { REVIEW_STATUS, OVERALL_VERDICT } from '../../types/domain'

export interface ReviewActionResult {
  success: boolean
  error?: string
}

export async function approveBriefAction(
  briefId: string,
  note?: string,
): Promise<ReviewActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'No autenticado.' }

  const result = await setReviewStatus(
    briefId,
    session.user.id,
    session.user.role ?? 'redactor',
    REVIEW_STATUS.approved,
    note,
  )

  if (result.success) {
    // Envío automático a CRM al aprobar, tanto para email como para WhatsApp.
    const brief = await getBriefById(briefId)
    if (brief && brief.crmStatus !== 'sent_to_crm') {
      const versions = await listVersionsByBrief(briefId)
      for (const version of [...versions].reverse()) {
        const runs = await listValidationRunsByMessage(version.id)
        const latestRun = runs[0]
        if (
          latestRun &&
          (latestRun.overallVerdict === OVERALL_VERDICT.aprobada ||
            latestRun.overallVerdict === OVERALL_VERDICT.aprobada_con_ajustes)
        ) {
          await sendToCrm({
            brief,
            messageContent: version.content,
            emailSubject: version.emailSubject ?? null,
            emailPreheader: version.emailPreheader ?? null,
            crmNotes: note,
            sentByUserId: session.user.id,
          })
          break
        }
      }
    }

    revalidatePath(`/briefs/${briefId}`)
  }

  return result
}

export async function rejectBriefAction(
  briefId: string,
  note?: string,
): Promise<ReviewActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'No autenticado.' }

  const result = await setReviewStatus(
    briefId,
    session.user.id,
    session.user.role ?? 'redactor',
    REVIEW_STATUS.rejected,
    note,
  )

  if (result.success) revalidatePath(`/briefs/${briefId}`)
  return result
}

export async function submitBriefForReviewAction(briefId: string): Promise<ReviewActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'No autenticado.' }

  const result = await submitBriefForReview(
    briefId,
    session.user.id,
    session.user.role ?? 'redactor',
  )

  if (result.success) revalidatePath(`/briefs/${briefId}`)
  return result
}
