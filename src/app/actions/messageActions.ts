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

export async function refineMessageAction(
  briefId: string,
  parentVersionId: string,
  formData: FormData,
): Promise<void> {
  const raw = formData.get('userInstruction')
  const userInstruction = typeof raw === 'string' ? raw.trim() : ''

  if (!userInstruction) {
    throw new Error('La instrucción de ajuste no puede estar vacía')
  }

  const brief = await getBriefById(briefId)

  if (!brief) {
    throw new Error('Briefing no encontrado')
  }

  await generateMessage(brief, { userInstruction, parentVersionId })

  redirect(`/briefs/${briefId}`)
}
