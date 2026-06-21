'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '../../auth'
import { setReviewStatus, submitBriefForReview, notifyBriefApproval } from '../../services/reviewService'
import { getBriefById } from '../../dao/briefDao'
import { getUserById } from '../../dao/userDao'
import { listVersionsByBrief } from '../../dao/messageVersionDao'
import { listValidationRunsByMessage } from '../../dao/validationRunDao'
import { sendToCrm } from '../../services/crmService'
import { REVIEW_STATUS, OVERALL_VERDICT } from '../../types/domain'

export interface ReviewActionResult {
  success: boolean
  error?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

type MessageVersion = {
  id: string
  content: string
  emailSubject: string | null
  emailPreheader: string | null
}

/**
 * Recorre las versiones del brief de más nueva a más antigua y devuelve
 * la primera que tenga una validación con veredicto aprobable.
 * Devuelve null si ninguna versión cumple la condición.
 */
async function findVersionWithValidVerdict(
  versions: MessageVersion[],
): Promise<MessageVersion | null> {
  for (const version of [...versions].reverse()) {
    const runs = await listValidationRunsByMessage(version.id)
    const latestRun = runs[0]
    if (
      latestRun &&
      (latestRun.overallVerdict === OVERALL_VERDICT.aprobada ||
        latestRun.overallVerdict === OVERALL_VERDICT.aprobada_con_ajustes)
    ) {
      return version
    }
  }
  return null
}

// ── Actions ───────────────────────────────────────────────────────────────────

export async function approveBriefAction(
  briefId: string,
  note?: string,
): Promise<ReviewActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'No autenticado.' }

  // 1. Cargar brief para pre-validaciones y envío a CRM.
  const brief = await getBriefById(briefId)
  if (!brief) return { success: false, error: 'Brief no encontrado.' }

  // 2. Verificar que existe una versión con veredicto válido antes de aprobar.
  //    Sin esta condición el brief no debería poder enviarse a CRM.
  const versions = await listVersionsByBrief(briefId)
  const approvableVersion = await findVersionWithValidVerdict(versions)
  if (!approvableVersion) {
    return {
      success: false,
      error:
        'No se puede aprobar: ninguna versión tiene un veredicto aprobado. ' +
        'El brief debe tener al menos una versión con veredicto "aprobada" o "aprobada_con_ajustes".',
    }
  }

  // 3. Aprobar en base de datos. El servicio también bloquea aprobaciones duplicadas.
  const result = await setReviewStatus(
    briefId,
    session.user.id,
    session.user.role ?? 'redactor',
    REVIEW_STATUS.approved,
    note,
  )
  if (!result.success) return result

  // 4. Envío automático a CRM (solo si aún no fue enviado con éxito anteriormente).
  let crmSent = brief.crmStatus === 'sent_to_crm'
  if (!crmSent) {
    // Obtener nombre del autor para enriquecer el correo CRM
    const authorUser = await getUserById(brief.userId).catch(() => null)
    const authorName = authorUser?.name ?? authorUser?.email ?? undefined

    // Obtener resumen de validación de la versión aprobable
    const validationRuns = await listValidationRunsByMessage(approvableVersion.id).catch(() => [])
    const validationSummary = validationRuns[0]?.summary ?? undefined

    const crmResult = await sendToCrm({
      brief,
      messageContent: approvableVersion.content,
      emailSubject: approvableVersion.emailSubject ?? null,
      emailPreheader: approvableVersion.emailPreheader ?? null,
      crmNotes: note,
      sentByUserId: session.user.id,
      authorName,
      reviewerName: session.user.name ?? session.user.email ?? undefined,
      validationSummary,
    })
    crmSent = crmResult.success
  }

  // 5. Notificar al autor con el resultado real del envío al CRM.
  //    La notificación es veraz: solo afirma "enviado al CRM" si crmSent es true.
  await notifyBriefApproval(brief.userId, brief.title, briefId, crmSent, note)

  revalidatePath(`/briefs/${briefId}`)
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
