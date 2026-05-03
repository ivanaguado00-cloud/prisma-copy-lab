'use server'

import { redirect } from 'next/navigation'
import { getBriefById } from '../../dao/briefDao'
import { generateMessage } from '../../services/generationService'

export async function generateMessageAction(briefId: string): Promise<{ error: string } | never> {
  const brief = await getBriefById(briefId)

  if (!brief) {
    return { error: 'Briefing no encontrado' }
  }

  try {
    await generateMessage(brief)
  } catch {
    return { error: 'Error al generar el mensaje. Inténtalo de nuevo.' }
  }

  redirect(`/briefs/${briefId}`)
}
