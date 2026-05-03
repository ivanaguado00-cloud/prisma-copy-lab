'use server'

import { redirect } from 'next/navigation'
import { getBriefById } from '../../dao/briefDao'
import { generateMessage } from '../../services/generationService'

export async function generateMessageAction(briefId: string): Promise<void> {
  const brief = await getBriefById(briefId)

  if (!brief) {
    throw new Error('Briefing no encontrado')
  }

  await generateMessage(brief)

  redirect(`/briefs/${briefId}`)
}
