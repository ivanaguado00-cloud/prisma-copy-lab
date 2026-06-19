'use server'

// @deprecated — El refinamiento autónomo es ahora interno a orchestrationService.
// Esta acción ya no se usa desde la UI (Phase 11).

import { redirect } from 'next/navigation'
import { getBriefById } from '../../dao/briefDao'
import { autoRefine } from '../../services/agentService'

export async function autoRefineAction(
  briefId: string,
  messageVersionId: string,
): Promise<void> {
  const brief = await getBriefById(briefId)

  if (!brief) {
    throw new Error('Briefing no encontrado')
  }

  await autoRefine(messageVersionId, brief)

  redirect(`/briefs/${briefId}`)
}
