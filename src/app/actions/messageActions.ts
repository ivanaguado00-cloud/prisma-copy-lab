'use server'

import { redirect } from 'next/navigation'
import { auth } from '../../auth'
import { getBriefById } from '../../dao/briefDao'
import { getMessageVersionById } from '../../dao/messageVersionDao'
import { generateAndApprove } from '../../services/orchestrationService'

export async function generateMessageAction(briefId: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('No autenticado')
  }

  const brief = await getBriefById(briefId, session.user.id)

  if (!brief) {
    throw new Error('Briefing no encontrado o sin permisos')
  }

  await generateAndApprove(brief)

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

  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('No autenticado')
  }

  const brief = await getBriefById(briefId, session.user.id)

  if (!brief) {
    throw new Error('Briefing no encontrado o sin permisos')
  }

  const parentVersion = await getMessageVersionById(parentVersionId)
  if (!parentVersion || parentVersion.briefId !== brief.id) {
    throw new Error('Versión de origen no encontrada o sin permisos')
  }

  await generateAndApprove(brief, { userInstruction, parentVersionId })

  redirect(`/briefs/${briefId}`)
}
