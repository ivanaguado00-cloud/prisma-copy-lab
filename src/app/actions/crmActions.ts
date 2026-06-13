'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '../../auth'
import { getBriefById } from '../../dao/briefDao'
import { listVersionsByBrief } from '../../dao/messageVersionDao'
import { listValidationRunsByMessage } from '../../dao/validationRunDao'
import { buildCrmPreview, sendToCrm } from '../../services/crmService'
import { OVERALL_VERDICT } from '../../types/domain'

export interface CrmActionResult {
  success: boolean
  error?: string
  mock?: boolean
}

export interface CrmPreviewResult {
  success: boolean
  error?: string
  html?: string
  plainText?: string
  internalSubject?: string
  recipientEmail?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getApprovedEmailContent(briefId: string): Promise<string | null> {
  const versions = await listVersionsByBrief(briefId)
  if (versions.length === 0) return null

  // Busca la versión más reciente con validación aprobada
  for (const version of [...versions].reverse()) {
    const runs = await listValidationRunsByMessage(version.id)
    const latestRun = runs[0]
    if (
      latestRun &&
      (latestRun.overallVerdict === OVERALL_VERDICT.aprobada ||
        latestRun.overallVerdict === OVERALL_VERDICT.aprobada_con_ajustes)
    ) {
      return version.content
    }
  }

  return null
}

// ── Actions ───────────────────────────────────────────────────────────────────

/**
 * Genera la previsualización del email maquetado para una plantilla dada.
 * No envía nada — solo construye el HTML de preview para confirmación del usuario.
 */
export async function previewCrmEmailAction(briefId: string): Promise<CrmPreviewResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'No autenticado' }

  const brief = await getBriefById(briefId, session.user.id)
  if (!brief) return { success: false, error: 'Briefing no encontrado' }
  if (brief.channel !== 'email') {
    return { success: false, error: 'Solo se puede preparar para CRM un brief de canal email.' }
  }

  const emailContent = await getApprovedEmailContent(briefId)
  if (!emailContent) {
    return {
      success: false,
      error: 'No hay mensaje aprobado. El email debe estar validado y aprobado antes de prepararlo para CRM.',
    }
  }

  try {
    const preview = buildCrmPreview(brief, emailContent)
    return {
      success: true,
      html: preview.html,
      plainText: preview.plainText,
      internalSubject: preview.internalSubject,
      recipientEmail: preview.recipientEmail,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al generar la previsualización'
    return { success: false, error: message }
  }
}

/**
 * Envía la propuesta maquetada al equipo de CRM y actualiza el estado del brief.
 * Solo debe llamarse tras confirmación explícita del usuario.
 */
export async function sendToCrmAction(briefId: string, crmNotes?: string): Promise<CrmActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'No autenticado' }

  const brief = await getBriefById(briefId, session.user.id)
  if (!brief) return { success: false, error: 'Briefing no encontrado' }
  if (brief.channel !== 'email') {
    return { success: false, error: 'Solo se puede preparar para CRM un brief de canal email.' }
  }
  if (brief.crmStatus === 'sent_to_crm') {
    return { success: false, error: 'Este brief ya fue enviado a CRM.' }
  }

  const emailContent = await getApprovedEmailContent(briefId)
  if (!emailContent) {
    return {
      success: false,
      error: 'No hay mensaje aprobado. El email debe estar validado y aprobado antes de enviarlo a CRM.',
    }
  }

  const result = await sendToCrm({
    brief,
    emailContent,
    crmNotes,
    sentByUserId: session.user.id,
  })

  if (result.success) {
    revalidatePath(`/briefs/${briefId}`)
  }

  return result
}
