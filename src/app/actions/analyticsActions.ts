'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '../../auth'
import { canAccessAnalytics } from '../../types/domain'
import { toggleSuccessCase } from '../../dao/sendMetricsDao'

/**
 * Toggles the isSuccessCase flag on a SendMetrics record.
 * Requires coordinador, pm, or admin role.
 */
export async function toggleSuccessCaseAction(
  sendMetricsId: string,
  currentValue: boolean,
): Promise<{ ok: boolean; isSuccessCase?: boolean; error?: string }> {
  const session = await auth()

  if (!session?.user?.id) {
    return { ok: false, error: 'No autenticado' }
  }

  if (!canAccessAnalytics(session.user.role)) {
    return { ok: false, error: 'Sin permiso' }
  }

  const updated = await toggleSuccessCase(sendMetricsId, !currentValue)
  revalidatePath('/analisis')

  return { ok: true, isSuccessCase: updated.isSuccessCase }
}
