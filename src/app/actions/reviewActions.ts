'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '../../auth'
import { setReviewStatus } from '../../services/reviewService'
import { REVIEW_STATUS } from '../../types/domain'

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
    session.user.role ?? 'author',
    REVIEW_STATUS.approved,
    note,
  )

  if (result.success) revalidatePath(`/briefs/${briefId}`)
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
    session.user.role ?? 'author',
    REVIEW_STATUS.rejected,
    note,
  )

  if (result.success) revalidatePath(`/briefs/${briefId}`)
  return result
}
